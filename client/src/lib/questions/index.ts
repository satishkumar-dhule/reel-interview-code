// Auto-generated - DO NOT EDIT
// Questions are loaded individually for better performance

import indexData from "./questions-index.json";
import mappingsData from "./channel-mappings.json";

// Type definitions for the JSON data
interface QuestionMetadata {
  question: string;
  channel: string;
  difficulty: string;
  hasVideo: boolean;
  hasDiagram: boolean;
  companies: number;
  lastUpdated: string;
}

interface ChannelMapping {
  subChannels: Record<string, string[]>;
}

interface QuestionsIndex {
  files: Record<string, string>;
  metadata: Record<string, QuestionMetadata>;
}

interface ChannelMappingsData {
  channels: Record<string, ChannelMapping>;
}

// Cast imported data with proper types
export const questionsIndex = indexData as QuestionsIndex;
export const channelMappings = (mappingsData as ChannelMappingsData).channels || {};

// Get question metadata (lightweight, no full content)
export function getQuestionMetadata(id: string) {
  return questionsIndex.metadata[id] || null;
}

// Get all question IDs
export function getAllQuestionIds(): string[] {
  return Object.keys(questionsIndex.files);
}

// Get question IDs for a channel
export function getQuestionIdsForChannel(channel: string): string[] {
  const mapping = channelMappings[channel];
  if (!mapping) return [];
  
  const ids = new Set<string>();
  Object.values(mapping.subChannels || {}).forEach((subIds) => {
    subIds.forEach(id => ids.add(id));
  });
  return Array.from(ids);
}

// Lazy load individual question (for client-side)
export async function loadQuestion(id: string): Promise<unknown | null> {
  const filename = questionsIndex.files[id];
  if (!filename) return null;
  
  try {
    const module = await import(`./individual/${filename}`);
    return module.default;
  } catch {
    return null;
  }
}

// Legacy compatibility
export const questionsByChannel: Record<string, string[]> = {};
Object.keys(channelMappings).forEach(channel => {
  questionsByChannel[channel] = getQuestionIdsForChannel(channel);
});
