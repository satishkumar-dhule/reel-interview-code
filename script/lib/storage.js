// Unified storage management for questions
// Supports both single-file and split-file storage
import fs from 'fs';
import path from 'path';

export const QUESTIONS_DIR = 'client/src/lib/questions';
export const INDIVIDUAL_DIR = `${QUESTIONS_DIR}/individual`;
export const INDEX_FILE = `${QUESTIONS_DIR}/questions-index.json`;
export const MAPPINGS_FILE = `${QUESTIONS_DIR}/channel-mappings.json`;
export const CHANGELOG_FILE = `${QUESTIONS_DIR}/changelog.json`;

// ============================================
// INDIVIDUAL QUESTION FILES
// ============================================

// Generate intelligent filename from question
export function generateQuestionFilename(question) {
  const id = question.id;
  const channel = question.tags?.[0] || 'general';
  
  // Create slug from question (first 5 words)
  const slug = question.question
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .slice(0, 5)
    .join('-')
    .substring(0, 40);
  
  return `${channel}--${id}--${slug}.json`;
}

// Save individual question file
export function saveQuestionFile(question) {
  fs.mkdirSync(INDIVIDUAL_DIR, { recursive: true });
  const filename = generateQuestionFilename(question);
  const filepath = path.join(INDIVIDUAL_DIR, filename);
  fs.writeFileSync(filepath, JSON.stringify(question, null, 2));
  return filename;
}

// Load individual question by ID
export function loadQuestionById(id) {
  const index = loadQuestionsIndex();
  const filename = index.files[id];
  if (!filename) return null;
  
  try {
    const filepath = path.join(INDIVIDUAL_DIR, filename);
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

// Load all questions from individual files
export function loadAllQuestionsFromFiles() {
  const questions = {};
  try {
    const files = fs.readdirSync(INDIVIDUAL_DIR).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const q = JSON.parse(fs.readFileSync(path.join(INDIVIDUAL_DIR, file), 'utf8'));
        if (q.id) questions[q.id] = q;
      } catch {}
    }
  } catch {}
  return questions;
}

// ============================================
// QUESTIONS INDEX (lightweight metadata)
// ============================================

export function loadQuestionsIndex() {
  try {
    return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf8'));
  } catch {
    return { files: {}, metadata: {}, lastUpdated: null };
  }
}

export function saveQuestionsIndex(index) {
  index.lastUpdated = new Date().toISOString();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

// Update index when question is saved
export function updateQuestionIndex(question, filename) {
  const index = loadQuestionsIndex();
  
  index.files[question.id] = filename;
  index.metadata[question.id] = {
    question: question.question.substring(0, 100),
    channel: question.tags?.[0] || 'general',
    difficulty: question.difficulty,
    hasVideo: !!(question.videos?.shortVideo || question.videos?.longVideo),
    hasDiagram: !!(question.diagram && question.diagram.length > 30),
    companies: question.companies?.length || 0,
    lastUpdated: question.lastUpdated
  };
  
  saveQuestionsIndex(index);
}

// ============================================
// CHANNEL MAPPINGS
// ============================================

export function loadChannelMappings() {
  try {
    const data = JSON.parse(fs.readFileSync(MAPPINGS_FILE, 'utf8'));
    return data.channels || {};
  } catch {
    return {};
  }
}

export function saveChannelMappings(mappings) {
  fs.mkdirSync(QUESTIONS_DIR, { recursive: true });
  fs.writeFileSync(MAPPINGS_FILE, JSON.stringify({
    channels: mappings,
    lastUpdated: new Date().toISOString()
  }, null, 2));
}

// ============================================
// UNIFIED QUESTION OPERATIONS
// ============================================

// Save question (both individual file and index)
export function saveQuestion(question) {
  const filename = saveQuestionFile(question);
  updateQuestionIndex(question, filename);
  return filename;
}

// Get all questions as array
export function getAllQuestions() {
  const questions = loadAllQuestionsFromFiles();
  return Object.values(questions);
}

// Get questions by channel
export function getQuestionsByChannel(channel) {
  const mappings = loadChannelMappings();
  const channelMapping = mappings[channel];
  if (!channelMapping) return [];
  
  const ids = new Set();
  Object.values(channelMapping.subChannels || {}).forEach(subIds => {
    subIds.forEach(id => ids.add(id));
  });
  
  return Array.from(ids).map(id => loadQuestionById(id)).filter(q => q != null);
}

// Add question with channel mapping
export function addQuestion(question, channels) {
  // Save question file
  saveQuestion(question);
  
  // Update channel mappings
  const mappings = loadChannelMappings();
  channels.forEach(({ channel, subChannel }) => {
    if (!mappings[channel]) mappings[channel] = { subChannels: {} };
    if (!mappings[channel].subChannels[subChannel]) mappings[channel].subChannels[subChannel] = [];
    if (!mappings[channel].subChannels[subChannel].includes(question.id)) {
      mappings[channel].subChannels[subChannel].push(question.id);
    }
  });
  saveChannelMappings(mappings);
}

// Generate unique ID
export function generateQuestionId() {
  const index = loadQuestionsIndex();
  const existingIds = new Set(Object.keys(index.files));
  let counter = Object.keys(index.files).length + 1;
  let id;
  do {
    id = `q-${counter++}`;
  } while (existingIds.has(id));
  return id;
}

// ============================================
// GITHUB OUTPUT
// ============================================

export function writeGitHubOutput(data) {
  const out = process.env.GITHUB_OUTPUT;
  if (out) {
    Object.entries(data).forEach(([key, value]) => {
      fs.appendFileSync(out, `${key}=${value}\n`);
    });
  }
}

// ============================================
// MIGRATION: Split existing all-questions.json
// ============================================

export async function migrateToIndividualFiles() {
  const ALL_QUESTIONS_FILE = `${QUESTIONS_DIR}/all-questions.json`;
  
  try {
    const data = JSON.parse(fs.readFileSync(ALL_QUESTIONS_FILE, 'utf8'));
    const questions = data.questions || {};
    
    console.log(`Migrating ${Object.keys(questions).length} questions to individual files...`);
    
    fs.mkdirSync(INDIVIDUAL_DIR, { recursive: true });
    
    for (const [id, question] of Object.entries(questions)) {
      saveQuestion({ ...question, id });
    }
    
    console.log('Migration complete!');
    return true;
  } catch (err) {
    console.error('Migration failed:', err.message);
    return false;
  }
}

// ============================================
// CLIENT-SIDE: Generate TypeScript index
// ============================================

export function generateClientIndex() {
  const content = `// Auto-generated - DO NOT EDIT
// Questions are loaded individually for better performance

import indexData from "./questions-index.json";
import mappingsData from "./channel-mappings.json";

export const questionsIndex = indexData;
export const channelMappings = mappingsData.channels || {};

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
  Object.values(mapping.subChannels || {}).forEach((subIds: any) => {
    (subIds as string[]).forEach(id => ids.add(id));
  });
  return Array.from(ids);
}

// Lazy load individual question (for client-side)
export async function loadQuestion(id: string): Promise<any | null> {
  const filename = questionsIndex.files[id];
  if (!filename) return null;
  
  try {
    const module = await import(\`./individual/\${filename}\`);
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
`;
  
  fs.writeFileSync(`${QUESTIONS_DIR}/index.ts`, content);
}
