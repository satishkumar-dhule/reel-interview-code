// Base framework for all enrichment bots
// Handles state management, batch processing, rate limiting, and saves
import fs from 'fs';
import { writeGitHubOutput } from './storage.js';

const STATES_FILE = 'client/src/lib/questions/bot-states.json';

// ============================================
// UNIFIED STATE MANAGEMENT
// ============================================

export function loadBotStates() {
  try {
    return JSON.parse(fs.readFileSync(STATES_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function saveBotStates(states) {
  fs.writeFileSync(STATES_FILE, JSON.stringify(states, null, 2));
}

export function loadBotState(botName) {
  const states = loadBotStates();
  return states[botName] || {
    lastProcessedIndex: 0,
    lastRunDate: null,
    totalProcessed: 0,
    stats: {}
  };
}

export function saveBotState(botName, state) {
  const states = loadBotStates();
  states[botName] = { ...state, lastRunDate: new Date().toISOString() };
  saveBotStates(states);
}

// ============================================
// BOT FRAMEWORK CLASS
// ============================================

export class BotFramework {
  constructor(options) {
    this.name = options.name;
    this.batchSize = parseInt(process.env.BATCH_SIZE || options.batchSize || '5', 10);
    this.rateLimitMs = options.rateLimitMs || 2000;
    this.processQuestion = options.processQuestion; // async (question, index) => { updated, skipped, failed, stats }
    this.onComplete = options.onComplete || (() => {});
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  sortQuestions(questions) {
    return [...questions].sort((a, b) => {
      const numA = parseInt(a.id.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.id.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  }

  async run(allQuestions, saveQuestion) {
    console.log(`=== ${this.name} ===\n`);
    
    const state = loadBotState(this.name);
    const sorted = this.sortQuestions(allQuestions);
    
    console.log(`📊 Database: ${sorted.length} questions`);
    console.log(`📍 Last index: ${state.lastProcessedIndex}`);
    console.log(`📅 Last run: ${state.lastRunDate || 'Never'}`);
    console.log(`⚙️ Batch size: ${this.batchSize}\n`);
    
    // Calculate batch
    let startIndex = state.lastProcessedIndex;
    if (startIndex >= sorted.length) {
      startIndex = 0;
      console.log('🔄 Wrapped around to beginning\n');
    }
    
    const endIndex = Math.min(startIndex + this.batchSize, sorted.length);
    const batch = sorted.slice(startIndex, endIndex);
    
    console.log(`📦 Processing: ${startIndex + 1} to ${endIndex} of ${sorted.length}\n`);
    
    const results = { processed: 0, updated: 0, skipped: 0, failed: 0, stats: {} };
    
    for (let i = 0; i < batch.length; i++) {
      const question = batch[i];
      const globalIndex = startIndex + i + 1;
      
      console.log(`\n--- [${globalIndex}/${sorted.length}] ${question.id} ---`);
      console.log(`Q: ${question.question.substring(0, 50)}...`);
      
      // Rate limiting (skip first)
      if (i > 0) await this.sleep(this.rateLimitMs);
      
      try {
        const result = await this.processQuestion(question, globalIndex);
        
        if (result.skipped) {
          results.skipped++;
          console.log('✅ Skipped (already good)');
        } else if (result.updated) {
          results.updated++;
          // Save immediately
          saveQuestion(question.id, result.data);
          console.log('💾 Saved');
        } else if (result.failed) {
          results.failed++;
          console.log(`❌ Failed: ${result.reason || 'Unknown'}`);
        }
        
        // Merge stats
        Object.entries(result.stats || {}).forEach(([k, v]) => {
          results.stats[k] = (results.stats[k] || 0) + v;
        });
        
      } catch (err) {
        results.failed++;
        console.log(`❌ Error: ${err.message}`);
      }
      
      results.processed++;
      
      // Update state after each question
      saveBotState(this.name, {
        ...state,
        lastProcessedIndex: startIndex + i + 1,
        totalProcessed: state.totalProcessed + results.processed,
        stats: { ...state.stats, ...results.stats }
      });
    }
    
    // Final state update
    const newState = {
      lastProcessedIndex: endIndex >= sorted.length ? 0 : endIndex,
      totalProcessed: state.totalProcessed + results.processed,
      stats: { ...state.stats, ...results.stats }
    };
    saveBotState(this.name, newState);
    
    // Summary
    console.log('\n\n=== SUMMARY ===');
    console.log(`Processed: ${results.processed}`);
    console.log(`Updated: ${results.updated}`);
    console.log(`Skipped: ${results.skipped}`);
    console.log(`Failed: ${results.failed}`);
    Object.entries(results.stats).forEach(([k, v]) => console.log(`${k}: ${v}`));
    console.log(`\nNext index: ${newState.lastProcessedIndex}`);
    console.log('=== END ===\n');
    
    writeGitHubOutput({
      processed: results.processed,
      updated: results.updated,
      skipped: results.skipped,
      failed: results.failed,
      next_index: newState.lastProcessedIndex,
      ...results.stats
    });
    
    await this.onComplete(results);
    
    return results;
  }
}
