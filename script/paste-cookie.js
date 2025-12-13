#!/usr/bin/env node

/**
 * Simple script - just paste your cookie and press Enter
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

console.log('\n🍪 Quick Cookie Setup\n');
console.log('Steps:');
console.log('1. Open https://openrouter.ai in your browser');
console.log('2. Open Console (F12 → Console tab)');
console.log('3. Type: document.cookie');
console.log('4. Copy the output');
console.log('5. Paste it below\n');

rl.question('Paste cookie here: ', async (cookie) => {
  if (!cookie || cookie.trim().length === 0) {
    console.log('\n❌ No cookie provided!\n');
    rl.close();
    return;
  }

  const cleanCookie = cookie.trim();
  const envPath = path.join(__dirname, '..', '.env');
  
  // Save to .env
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else {
    envContent = '# OpenRouter Cookie Authentication\n';
  }
  
  if (envContent.includes('VITE_OPENROUTER_COOKIE=')) {
    envContent = envContent.replace(
      /VITE_OPENROUTER_COOKIE="[^"]*"/,
      `VITE_OPENROUTER_COOKIE="${cleanCookie}"`
    );
  } else {
    envContent += `\nVITE_OPENROUTER_COOKIE="${cleanCookie}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('\n✅ Cookie saved to .env!\n');
  
  // Test it
  console.log('🧪 Testing cookie...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5001',
        'X-Title': 'Learn Reels',
        'Cookie': cleanCookie,
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct:free',
        messages: [{ role: 'user', content: 'Say "Hello!"' }],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Cookie works!\n');
      console.log('Response:', data.choices[0]?.message?.content);
      console.log('\n📝 Next steps:');
      console.log('1. Restart dev server: pnpm dev');
      console.log('2. Visit: http://localhost:5001/test/cookie');
      console.log('3. Try AI chat!\n');
    } else {
      console.log('❌ Cookie test failed:', response.status);
      console.log('Try extracting a fresh cookie.\n');
    }
  } catch (error) {
    console.log('❌ Error:', error.message, '\n');
  }
  
  rl.close();
});
