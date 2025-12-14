#!/usr/bin/env node

/**
 * Fix duplicate questions with wrong channel assignments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const questionsDir = path.join(__dirname, '..', 'client', 'src', 'lib', 'questions');

console.log('🔍 Scanning for duplicate questions...\n');

// Process each JSON file
const files = fs.readdirSync(questionsDir).filter(f => f.endsWith('.json') && !f.includes('.backup'));

let totalRemoved = 0;

for (const file of files) {
  const filePath = path.join(questionsDir, file);
  console.log(`Checking ${file}...`);
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const originalCount = data.length;
  
  // Track seen IDs and keep only the correct version
  const seen = new Map();
  const cleaned = [];
  
  for (const item of data) {
    const id = item.id;
    
    if (seen.has(id)) {
      // We have a duplicate - decide which to keep
      const existing = seen.get(id);
      
      // Determine which channel is correct based on file name
      const correctChannel = file.replace('.json', '');
      
      // Keep the one with correct channel
      if (item.channel === correctChannel && existing.channel !== correctChannel) {
        // Replace existing with current (correct channel)
        console.log(`  ⚠️  Found duplicate ${id}: keeping '${item.channel}', removing '${existing.channel}'`);
        const index = cleaned.indexOf(existing);
        cleaned[index] = item;
        seen.set(id, item);
      } else if (existing.channel === correctChannel && item.channel !== correctChannel) {
        // Keep existing (correct channel), skip current
        console.log(`  ⚠️  Found duplicate ${id}: keeping '${existing.channel}', removing '${item.channel}'`);
        totalRemoved++;
      } else {
        // Both have same channel or both wrong - keep first, log warning
        console.log(`  ⚠️  Found duplicate ${id}: both have channel '${item.channel}', keeping first`);
        totalRemoved++;
      }
    } else {
      // First time seeing this ID
      seen.set(id, item);
      cleaned.push(item);
    }
  }
  
  if (cleaned.length < originalCount) {
    console.log(`  ✅ Removed ${originalCount - cleaned.length} duplicate(s)`);
    
    // Backup original
    fs.writeFileSync(filePath + '.backup', JSON.stringify(data, null, 2));
    
    // Write cleaned data
    fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2));
  } else {
    console.log(`  ✓ No duplicates found`);
  }
  
  console.log('');
}

console.log(`\n✅ Done! Removed ${totalRemoved} duplicate question(s) total.`);

if (totalRemoved > 0) {
  console.log('\n📝 Backups created with .backup extension');
  console.log('💡 Run the app to verify everything works correctly');
}
