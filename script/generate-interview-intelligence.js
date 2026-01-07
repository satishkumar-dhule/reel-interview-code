#!/usr/bin/env node
/**
 * Generate Interview Intelligence Data
 * 
 * Pre-computes intelligence data for static site deployment:
 * - Cognitive pattern mapping for all questions
 * - Company readiness weights
 * - Knowledge DNA templates
 * - Mock interview question sets
 * 
 * Run: node script/generate-interview-intelligence.js
 */

import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { generateInterviewIntelligence } from './ai/graphs/interview-intelligence-graph.js';

const DATA_DIR = 'client/public/data';
const OUTPUT_DIR = 'client/public/data/intelligence';

async function loadQuestions() {
  console.log('📚 Loading questions from data files...');
  
  const questions = [];
  
  try {
    // Load from channels directory
    const channelsDir = path.join(DATA_DIR, 'channels');
    const channels = await fs.readdir(channelsDir).catch(() => []);
    
    for (const channelFile of channels) {
      if (!channelFile.endsWith('.json')) continue;
      
      const channelPath = path.join(channelsDir, channelFile);
      const data = JSON.parse(await fs.readFile(channelPath, 'utf-8'));
      
      if (Array.isArray(data)) {
        questions.push(...data);
      } else if (data.questions) {
        questions.push(...data.questions);
      }
    }
    
    // Also try loading from questions.json if it exists
    const questionsPath = path.join(DATA_DIR, 'questions.json');
    try {
      const data = JSON.parse(await fs.readFile(questionsPath, 'utf-8'));
      if (Array.isArray(data)) {
        questions.push(...data);
      }
    } catch {
      // File doesn't exist, that's fine
    }
    
  } catch (error) {
    console.error('Error loading questions:', error.message);
  }
  
  // Deduplicate by ID
  const seen = new Set();
  const unique = questions.filter(q => {
    if (!q.id || seen.has(q.id)) return false;
    seen.add(q.id);
    return true;
  });
  
  console.log(`   Loaded ${unique.length} unique questions`);
  return unique;
}


async function main() {
  console.log('\n' + '═'.repeat(60));
  console.log('🧠 INTERVIEW INTELLIGENCE GENERATOR');
  console.log('═'.repeat(60));
  console.log('Generating pre-computed intelligence data for static site...\n');
  
  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  
  // Load all questions
  const questions = await loadQuestions();
  
  if (questions.length === 0) {
    console.log('⚠️  No questions found. Creating sample intelligence data...');
    
    // Create sample data for development
    const sampleData = {
      generated: new Date().toISOString(),
      data: {}
    };
    
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'cognitive-map.json'),
      JSON.stringify(sampleData, null, 2)
    );
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'company-weights.json'),
      JSON.stringify(sampleData, null, 2)
    );
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'company-profiles.json'),
      JSON.stringify({
        generated: new Date().toISOString(),
        data: {
          google: { name: 'Google', values: ['algorithms', 'system-design'], interviewStyle: 'whiteboard-heavy', cognitiveEmphasis: ['analytical'], weight: {} },
          meta: { name: 'Meta', values: ['algorithms', 'frontend'], interviewStyle: 'balanced', cognitiveEmphasis: ['speed'], weight: {} },
          amazon: { name: 'Amazon', values: ['system-design', 'leadership'], interviewStyle: 'behavioral-heavy', cognitiveEmphasis: ['ownership'], weight: {} },
          microsoft: { name: 'Microsoft', values: ['system-design', 'collaboration'], interviewStyle: 'conversational', cognitiveEmphasis: ['clarity'], weight: {} },
          apple: { name: 'Apple', values: ['performance', 'attention-to-detail'], interviewStyle: 'detail-oriented', cognitiveEmphasis: ['perfectionism'], weight: {} },
          startup: { name: 'Startups', values: ['full-stack', 'speed'], interviewStyle: 'practical', cognitiveEmphasis: ['pragmatic'], weight: {} }
        }
      }, null, 2)
    );
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'knowledge-dna.json'),
      JSON.stringify({ generated: new Date().toISOString(), data: { channels: {}, topSkills: [] } }, null, 2)
    );
    await fs.writeFile(
      path.join(OUTPUT_DIR, 'mock-interviews.json'),
      JSON.stringify(sampleData, null, 2)
    );
    
    console.log('✅ Sample intelligence data created');
    return;
  }
  
  // Run the intelligence pipeline
  const result = await generateInterviewIntelligence(questions, {
    outputDir: OUTPUT_DIR
  });
  
  if (result.success) {
    console.log('\n✅ Intelligence data generated successfully!');
    console.log(`   Output: ${OUTPUT_DIR}/`);
    
    // List generated files
    const files = await fs.readdir(OUTPUT_DIR);
    console.log('   Files:');
    for (const file of files) {
      const stat = await fs.stat(path.join(OUTPUT_DIR, file));
      console.log(`   - ${file} (${Math.round(stat.size / 1024)}KB)`);
    }
  } else {
    console.error('\n❌ Intelligence generation failed:', result.error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
