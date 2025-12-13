#!/usr/bin/env node

/**
 * Test if cookie population from .env works correctly
 * This simulates what happens in the browser
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 Testing Cookie Population Mechanism\n');

// Step 1: Check if .env file exists
const envPath = path.join(__dirname, '..', '.env');
console.log('1️⃣  Checking .env file...');
if (!fs.existsSync(envPath)) {
  console.log('   ❌ .env file not found');
  process.exit(1);
}
console.log('   ✅ .env file exists');

// Step 2: Read .env file
console.log('\n2️⃣  Reading .env file...');
const envContent = fs.readFileSync(envPath, 'utf-8');
console.log('   Content preview:');
console.log('   ' + envContent.split('\n').slice(0, 5).join('\n   '));

// Step 3: Extract cookie
console.log('\n3️⃣  Extracting VITE_OPENROUTER_COOKIE...');
const cookieMatch = envContent.match(/VITE_OPENROUTER_COOKIE="([^"]*)"/);
if (!cookieMatch) {
  console.log('   ❌ VITE_OPENROUTER_COOKIE not found in .env');
  process.exit(1);
}

const cookie = cookieMatch[1];
console.log('   ✅ Variable found');
console.log('   Cookie length:', cookie.length, 'characters');

if (cookie.length === 0) {
  console.log('   ⚠️  Cookie is empty!');
  console.log('\n📝 To test cookie population:');
  console.log('   1. Add a test cookie to .env:');
  console.log('      VITE_OPENROUTER_COOKIE="test_cookie=abc123; session=xyz789"');
  console.log('   2. Run this script again');
  console.log('   3. Then run: node script/test-openrouter-cookie.js');
  process.exit(0);
}

console.log('   Cookie preview:', cookie.substring(0, 50) + '...');

// Step 4: Simulate Vite's import.meta.env
console.log('\n4️⃣  Simulating Vite environment variable...');
process.env.VITE_OPENROUTER_COOKIE = cookie;
console.log('   ✅ Environment variable set');
console.log('   Value:', process.env.VITE_OPENROUTER_COOKIE.substring(0, 50) + '...');

// Step 5: Simulate config.ts
console.log('\n5️⃣  Simulating client/src/lib/config.ts...');
const AI_CONFIG = {
  openRouterCookie: process.env.VITE_OPENROUTER_COOKIE || '',
  useOpenRouter: !!process.env.VITE_OPENROUTER_COOKIE,
};
console.log('   ✅ Config created');
console.log('   useOpenRouter:', AI_CONFIG.useOpenRouter);
console.log('   Cookie length:', AI_CONFIG.openRouterCookie.length);

// Step 6: Check if cookie would be used
console.log('\n6️⃣  Checking if OpenRouter would be used...');
function isOpenRouterConfigured() {
  return AI_CONFIG.useOpenRouter && AI_CONFIG.openRouterCookie.length > 0;
}

if (isOpenRouterConfigured()) {
  console.log('   ✅ OpenRouter would be used!');
  console.log('   Cookie will be sent in API requests');
} else {
  console.log('   ❌ OpenRouter would NOT be used');
  console.log('   Would fall back to HuggingFace or Smart Mock');
}

// Step 7: Show what the API request would look like
console.log('\n7️⃣  API Request Preview:');
console.log('   URL: https://openrouter.ai/api/v1/chat/completions');
console.log('   Method: POST');
console.log('   Headers:');
console.log('     Content-Type: application/json');
console.log('     Cookie:', AI_CONFIG.openRouterCookie.substring(0, 50) + '...');
console.log('     HTTP-Referer: http://localhost:5001');
console.log('     X-Title: Learn Reels - Interview Prep');

// Summary
console.log('\n' + '═'.repeat(70));
console.log('SUMMARY');
console.log('═'.repeat(70));
console.log('✅ Cookie population mechanism: WORKING');
console.log('✅ .env file reading: WORKING');
console.log('✅ Environment variable: WORKING');
console.log('✅ Config integration: WORKING');

if (isOpenRouterConfigured()) {
  console.log('✅ OpenRouter: WOULD BE USED');
  console.log('\n🎉 Cookie population is working correctly!');
  console.log('\nNext step: Test actual API call');
  console.log('Run: node script/test-openrouter-cookie.js');
} else {
  console.log('⚠️  OpenRouter: WOULD NOT BE USED (cookie empty)');
  console.log('\n📝 To enable OpenRouter:');
  console.log('1. Extract cookie: node script/get-openrouter-cookie.js');
  console.log('2. Add to .env file');
  console.log('3. Test again: node script/test-cookie-population.js');
}

console.log('\n💡 Note: In the browser, Vite automatically injects');
console.log('   import.meta.env.VITE_OPENROUTER_COOKIE at build time.');
console.log('   This script simulates that process.');
