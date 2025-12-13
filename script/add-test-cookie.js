#!/usr/bin/env node

/**
 * Helper to add a test cookie to .env for testing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🍪 Add Cookie to .env\n');
console.log('Paste your OpenRouter cookie here.');
console.log('(The cookie from your browser DevTools)\n');

rl.question('Cookie: ', (cookie) => {
  if (!cookie || cookie.trim().length === 0) {
    console.log('\n❌ No cookie provided!');
    rl.close();
    return;
  }

  const cleanCookie = cookie.trim();
  const envPath = path.join(__dirname, '..', '.env');
  
  // Read current .env
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  // Replace or add cookie
  if (envContent.includes('VITE_OPENROUTER_COOKIE=')) {
    envContent = envContent.replace(
      /VITE_OPENROUTER_COOKIE="[^"]*"/,
      `VITE_OPENROUTER_COOKIE="${cleanCookie}"`
    );
  } else {
    envContent += `\nVITE_OPENROUTER_COOKIE="${cleanCookie}"\n`;
  }

  // Write back
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Cookie added to .env!\n');
  console.log('Next steps:');
  console.log('1. Test population: node script/test-cookie-population.js');
  console.log('2. Test API: node script/test-openrouter-cookie.js');
  console.log('3. Restart dev server: pnpm dev\n');

  rl.close();
});
