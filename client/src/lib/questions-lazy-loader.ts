// Lazy question loader - loads questions on-demand from individual files
// Initial load is lightweight (just index), full content loaded when needed

import questionsIndex from './questions/questions-index.json';
import channelMappingsData from './questions/channel-mappings.json';

export interface QuestionMetadata {
  id: string;
  question: string;
  channel: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hasVideo: boolean;
  hasDiagram: boolean;
  companiesCount: number;
  lastUpdated?: string;
}

export interface Question extends Omit<QuestionMetadata, 'companiesCount'> {
  answer: string;
  explanation: string;
  diagram?: string;
  tags: string[];
  subChannel: string;
  sourceUrl?: string;
  videos?: {
    shortVideo?: string;
    longVideo?: string;
  };
  companies?: string[];
}

// Type definitions for imported JSON
interface IndexData {
  files: Record<string, string>;
  metadata: Record<string, {
    question: string;
    channel: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    hasVideo: boolean;
    hasDiagram: boolean;
    companies: number;
    lastUpdated?: string;
  }>;
}

interface ChannelMapping {
  subChannels: Record<string, string[]>;
}

// Cast imported data
const indexData = questionsIndex as IndexData;
const channelMappings = (channelMappingsData as { channels: Record<string, ChannelMapping> }).channels || {};

// Cache for loaded questions
const questionCache = new Map<string, Question>();

// Get all question IDs for a channel
function getQuestionIdsForChannel(channelId: string): string[] {
  const mapping = channelMappings[channelId];
  if (!mapping) return [];
  
  const ids = new Set<string>();
  Object.values(mapping.subChannels || {}).forEach(subIds => {
    subIds.forEach(id => ids.add(id));
  });
  return Array.from(ids);
}

// Get subchannel for a question in a channel
function getSubChannelForQuestion(channelId: string, questionId: string): string {
  const mapping = channelMappings[channelId];
  if (!mapping) return 'general';
  
  for (const [subChannel, ids] of Object.entries(mapping.subChannels || {})) {
    if (ids.includes(questionId)) return subChannel;
  }
  return 'general';
}

// Get metadata for a question (lightweight, no file load)
export function getQuestionMetadata(id: string): QuestionMetadata | null {
  const meta = indexData.metadata[id];
  if (!meta) return null;
  
  return {
    id,
    question: meta.question,
    channel: meta.channel,
    difficulty: meta.difficulty,
    hasVideo: meta.hasVideo,
    hasDiagram: meta.hasDiagram,
    companiesCount: meta.companies,
    lastUpdated: meta.lastUpdated
  };
}


// Dynamic import modules for individual questions
// Vite will bundle these as separate chunks
const questionModules = import.meta.glob('./questions/individual/*.json');

// Load a single question (async, from individual file)
export async function loadQuestion(id: string, channelId?: string): Promise<Question | null> {
  // Check cache first
  if (questionCache.has(id)) {
    return questionCache.get(id)!;
  }
  
  const filename = indexData.files[id];
  if (!filename) return null;
  
  try {
    // Use Vite's glob import for dynamic loading
    const modulePath = `./questions/individual/${filename}`;
    const loader = questionModules[modulePath];
    
    if (!loader) {
      console.warn(`No loader found for ${modulePath}`);
      return null;
    }
    
    // Define the shape of question data from JSON files
    interface QuestionData {
      id?: string;
      question: string;
      answer: string;
      explanation: string;
      diagram?: string;
      tags?: string[];
      difficulty?: 'beginner' | 'intermediate' | 'advanced';
      sourceUrl?: string;
      videos?: { shortVideo?: string; longVideo?: string };
      companies?: string[];
      lastUpdated?: string;
    }
    
    const module = await loader() as { default?: QuestionData };
    const data = (module.default || module) as QuestionData;
    
    // Determine channel and subchannel
    const tags = data.tags || [];
    const channel = channelId || tags[0] || 'general';
    const subChannel = getSubChannelForQuestion(channel, id);
    const videos = data.videos || {};
    const companies = data.companies || [];
    const diagram = data.diagram || '';
    
    const question: Question = {
      id: data.id || id,
      question: data.question,
      answer: data.answer,
      explanation: data.explanation,
      diagram: data.diagram,
      tags,
      difficulty: data.difficulty || 'intermediate',
      channel,
      subChannel,
      sourceUrl: data.sourceUrl,
      videos: data.videos,
      companies,
      hasVideo: !!(videos.shortVideo || videos.longVideo),
      hasDiagram: diagram.length > 30,
      lastUpdated: data.lastUpdated
    };
    
    // Cache it
    questionCache.set(id, question);
    return question;
  } catch (err) {
    console.warn(`Failed to load question ${id}:`, err);
    return null;
  }
}

// Load multiple questions (batch)
export async function loadQuestions(ids: string[], channelId?: string): Promise<Question[]> {
  const results = await Promise.all(ids.map(id => loadQuestion(id, channelId)));
  return results.filter((q): q is Question => q !== null);
}

// Get questions for a channel (loads on demand)
export async function getQuestionsForChannel(
  channelId: string,
  subChannel?: string,
  difficulty?: string,
  company?: string
): Promise<Question[]> {
  const ids = getQuestionIdsForChannel(channelId);
  
  // Filter by metadata first (before loading full content)
  let filteredIds = ids;
  
  if (difficulty && difficulty !== 'all') {
    filteredIds = filteredIds.filter(id => {
      const meta = indexData.metadata[id];
      return meta?.difficulty === difficulty;
    });
  }
  
  // Load the filtered questions
  const questions = await loadQuestions(filteredIds, channelId);
  
  // Apply remaining filters
  let result = questions;
  
  if (subChannel && subChannel !== 'all') {
    result = result.filter(q => q.subChannel === subChannel);
  }
  
  if (company && company !== 'all') {
    result = result.filter(q => q.companies?.includes(company));
  }
  
  return result;
}

// Get all questions (loads all - use sparingly)
export async function getAllQuestions(): Promise<Question[]> {
  const allIds = Object.keys(indexData.files);
  return loadQuestions(allIds);
}

// Get question by ID (async)
export async function getQuestionById(id: string): Promise<Question | null> {
  return loadQuestion(id);
}

// Sync functions using metadata only (no file loading)

// Get all question metadata (lightweight)
export function getAllQuestionMetadata(): QuestionMetadata[] {
  return Object.keys(indexData.metadata).map(id => getQuestionMetadata(id)!).filter(Boolean);
}

// Get metadata for channel questions
export function getChannelQuestionMetadata(channelId: string): QuestionMetadata[] {
  const ids = getQuestionIdsForChannel(channelId);
  return ids.map(id => getQuestionMetadata(id)!).filter(Boolean);
}

// Get subchannels for a channel (from mappings)
export function getSubChannels(channelId: string): string[] {
  const mapping = channelMappings[channelId];
  if (!mapping) return [];
  return Object.keys(mapping.subChannels || {}).sort();
}

// Get channel statistics (from metadata, no loading)
export function getChannelStats(): { id: string; total: number; beginner: number; intermediate: number; advanced: number }[] {
  const stats: Record<string, { total: number; beginner: number; intermediate: number; advanced: number }> = {};
  
  Object.keys(channelMappings).forEach(channelId => {
    const ids = getQuestionIdsForChannel(channelId);
    stats[channelId] = { total: 0, beginner: 0, intermediate: 0, advanced: 0 };
    
    ids.forEach(id => {
      const meta = indexData.metadata[id];
      if (meta) {
        stats[channelId].total++;
        stats[channelId][meta.difficulty]++;
      }
    });
  });
  
  return Object.entries(stats).map(([id, s]) => ({ id, ...s }));
}

// Get available channel IDs
export function getAvailableChannelIds(): string[] {
  return Object.keys(channelMappings);
}

// Check if channel has questions
export function channelHasQuestions(channelId: string): boolean {
  return getQuestionIdsForChannel(channelId).length > 0;
}

// Get companies for channel (requires loading questions)
export function getCompaniesForChannel(_channelId: string): string[] {
  // This requires loading questions to get company names
  // For now, return empty - will be populated after questions load
  return [];
}

// Preload questions for a channel (call this when entering a channel)
export async function preloadChannel(channelId: string): Promise<void> {
  const ids = getQuestionIdsForChannel(channelId);
  await loadQuestions(ids, channelId);
}

// Clear cache (useful for testing or memory management)
export function clearCache(): void {
  questionCache.clear();
}

// Get cache stats
export function getCacheStats(): { size: number; ids: string[] } {
  return {
    size: questionCache.size,
    ids: Array.from(questionCache.keys())
  };
}
