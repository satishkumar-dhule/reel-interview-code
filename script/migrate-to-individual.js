// Migration script: Split all-questions.json into individual files
import fs from 'fs';
import path from 'path';
import {
  QUESTIONS_DIR,
  INDIVIDUAL_DIR,
  saveQuestion,
  generateClientIndex,
  loadChannelMappings
} from './lib/storage.js';

const ALL_QUESTIONS_FILE = `${QUESTIONS_DIR}/all-questions.json`;

async function migrate() {
  console.log('=== Migrating to Individual Question Files ===\n');
  
  // Load existing questions
  let questions = {};
  try {
    const data = JSON.parse(fs.readFileSync(ALL_QUESTIONS_FILE, 'utf8'));
    questions = data.questions || {};
  } catch (err) {
    console.error('Failed to load all-questions.json:', err.message);
    process.exit(1);
  }
  
  const count = Object.keys(questions).length;
  console.log(`Found ${count} questions to migrate\n`);
  
  // Create individual directory
  fs.mkdirSync(INDIVIDUAL_DIR, { recursive: true });
  
  // Migrate each question
  let migrated = 0;
  let failed = 0;
  
  for (const [id, question] of Object.entries(questions)) {
    try {
      const filename = saveQuestion({ ...question, id });
      migrated++;
      
      if (migrated % 50 === 0) {
        console.log(`Progress: ${migrated}/${count}`);
      }
    } catch (err) {
      console.error(`Failed to migrate ${id}:`, err.message);
      failed++;
    }
  }
  
  // Generate client index
  console.log('\nGenerating client index...');
  generateClientIndex();
  
  // Summary
  console.log('\n=== Migration Complete ===');
  console.log(`Migrated: ${migrated}`);
  console.log(`Failed: ${failed}`);
  console.log(`\nIndividual files: ${INDIVIDUAL_DIR}/`);
  console.log(`Index file: ${QUESTIONS_DIR}/questions-index.json`);
  console.log(`Client index: ${QUESTIONS_DIR}/index.ts`);
  
  // Verify
  const files = fs.readdirSync(INDIVIDUAL_DIR).filter(f => f.endsWith('.json'));
  console.log(`\nVerification: ${files.length} files created`);
  
  // Show sample filenames
  console.log('\nSample filenames:');
  files.slice(0, 5).forEach(f => console.log(`  ${f}`));
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
