#!/usr/bin/env node

/**
 * Validate questions for common issues:
 * - Duplicate IDs
 * - Wrong channel assignments
 * - Missing required fields
 * - Invalid difficulty levels
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsDir = path.join(__dirname, '..', 'client', 'src', 'lib', 'questions');

const VALID_DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];
const REQUIRED_FIELDS = ['id', 'question', 'answer', 'explanation', 'tags', 'difficulty', 'channel', 'subChannel'];

console.log('🔍 Validating questions...\n');

let hasErrors = false;
const allIds = new Set();
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json') && !f.includes('.backup'));

for (const file of files) {
  const filePath = path.join(questionsDir, file);
  const expectedChannel = file.replace('.json', '');
  
  console.log(`Checking ${file}...`);
  
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    
    if (!Array.isArray(data)) {
      console.log(`  ❌ ERROR: File is not an array`);
      hasErrors = true;
      continue;
    }
    
    for (let i = 0; i < data.length; i++) {
      const q = data[i];
      const prefix = `  Question ${i + 1} (${q.id || 'NO_ID'})`;
      
      // Check required fields
      for (const field of REQUIRED_FIELDS) {
        if (!q[field]) {
          console.log(`${prefix}: ❌ Missing required field '${field}'`);
          hasErrors = true;
        }
      }
      
      // Check duplicate IDs
      if (q.id) {
        if (allIds.has(q.id)) {
          console.log(`${prefix}: ❌ Duplicate ID '${q.id}'`);
          hasErrors = true;
        }
        allIds.add(q.id);
      }
      
      // Check channel matches file
      if (q.channel && q.channel !== expectedChannel) {
        console.log(`${prefix}: ❌ Wrong channel '${q.channel}' (expected '${expectedChannel}')`);
        hasErrors = true;
      }
      
      // Check difficulty
      if (q.difficulty && !VALID_DIFFICULTIES.includes(q.difficulty)) {
        console.log(`${prefix}: ❌ Invalid difficulty '${q.difficulty}'`);
        hasErrors = true;
      }
      
      // Check tags
      if (q.tags && !Array.isArray(q.tags)) {
        console.log(`${prefix}: ❌ Tags must be an array`);
        hasErrors = true;
      }
      
      // Check for empty strings
      if (q.question && q.question.trim().length === 0) {
        console.log(`${prefix}: ❌ Empty question`);
        hasErrors = true;
      }
      
      if (q.answer && q.answer.trim().length === 0) {
        console.log(`${prefix}: ❌ Empty answer`);
        hasErrors = true;
      }
    }
    
    if (!hasErrors) {
      console.log(`  ✅ ${data.length} questions validated`);
    }
    
  } catch (error) {
    console.log(`  ❌ ERROR: ${error.message}`);
    hasErrors = true;
  }
  
  console.log('');
}

console.log(`\nTotal questions: ${allIds.size}`);

if (hasErrors) {
  console.log('\n❌ Validation failed! Please fix the errors above.');
  process.exit(1);
} else {
  console.log('\n✅ All questions validated successfully!');
  process.exit(0);
}
