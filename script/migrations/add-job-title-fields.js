/**
 * Migration: Add Job Title Fields to Questions Table
 * Adds jobTitleRelevance and experienceLevelTags columns
 */

import { db } from '../../server/db.js';
import { sql } from 'drizzle-orm';

async function addJobTitleFields() {
  console.log('🔄 Adding job title fields to questions table...\n');
  
  try {
    // Check if columns already exist
    const tableInfo = await db.run(sql`PRAGMA table_info(questions)`);
    const columns = tableInfo.rows.map(row => row.name);
    
    const hasJobTitleRelevance = columns.includes('job_title_relevance');
    const hasExperienceLevelTags = columns.includes('experience_level_tags');
    
    if (hasJobTitleRelevance && hasExperienceLevelTags) {
      console.log('✅ Columns already exist. No migration needed.');
      return;
    }
    
    // Add jobTitleRelevance column if missing
    if (!hasJobTitleRelevance) {
      console.log('Adding job_title_relevance column...');
      await db.run(sql`
        ALTER TABLE questions 
        ADD COLUMN job_title_relevance TEXT
      `);
      console.log('✅ Added job_title_relevance column');
    }
    
    // Add experienceLevelTags column if missing
    if (!hasExperienceLevelTags) {
      console.log('Adding experience_level_tags column...');
      await db.run(sql`
        ALTER TABLE questions 
        ADD COLUMN experience_level_tags TEXT
      `);
      console.log('✅ Added experience_level_tags column');
    }
    
    console.log('\n✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run backfill:job-titles');
    console.log('2. This will populate the new fields for all existing questions');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addJobTitleFields();
