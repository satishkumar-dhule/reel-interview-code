#!/usr/bin/env node
/**
 * Database Migration Runner
 * 
 * Runs SQL migrations against the Turso database.
 * Usage: node script/db/run-migration.js [migration-file]
 */

import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('❌ Missing TURSO_DATABASE_URL environment variable');
  process.exit(1);
}

const db = createClient({ url, authToken });

async function runMigration(migrationFile) {
  console.log('\n' + '═'.repeat(60));
  console.log('🗄️  DATABASE MIGRATION RUNNER');
  console.log('═'.repeat(60));
  console.log(`Migration: ${migrationFile}`);
  console.log(`Database: ${url.substring(0, 30)}...`);
  
  const migrationPath = path.join(__dirname, 'migrations', migrationFile);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split by semicolons and filter empty statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`\n📝 Found ${statements.length} SQL statements\n`);
  
  let success = 0;
  let skipped = 0;
  let failed = 0;
  
  for (const statement of statements) {
    const shortStmt = statement.substring(0, 60).replace(/\n/g, ' ');
    
    try {
      await db.execute(statement);
      console.log(`   ✅ ${shortStmt}...`);
      success++;
    } catch (error) {
      // Check if it's a "already exists" error (which is fine for IF NOT EXISTS)
      if (error.message?.includes('already exists') || 
          error.message?.includes('no such table')) {
        console.log(`   ⏭️  ${shortStmt}... (skipped)`);
        skipped++;
      } else {
        console.log(`   ❌ ${shortStmt}...`);
        console.log(`      Error: ${error.message}`);
        failed++;
      }
    }
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('📊 MIGRATION RESULTS');
  console.log('═'.repeat(60));
  console.log(`   Success: ${success}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed:  ${failed}`);
  console.log('═'.repeat(60) + '\n');
  
  if (failed > 0) {
    process.exit(1);
  }
}

// Get migration file from args or default to latest
const migrationFile = process.argv[2] || '001_add_indexes.sql';
runMigration(migrationFile);
