#!/usr/bin/env node

/**
 * Test OpenRouter cookie authentication
 * 
 * Usage:
 * 1. Set VITE_OPENROUTER_COOKIE in .env file
 * 2. Run: node script/test-openrouter-cookie.js
 */

const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  console.log('\nCreate a .env file with:');
  console.log('VITE_OPENROUTER_COOKIE="your_cookie_here"');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const cookieMatch = envContent.match(/VITE_OPENROUTER_COOKIE="([^"]*)"/);

if (!cookieMatch || !cookieMatch[1]) {
  console.error('❌ VITE_OPENROUTER_COOKIE not found in .env!');
  console.log('\nAdd this to your .env file:');
  console.log('VITE_OPENROUTER_COOKIE="your_cookie_here"');
  console.log('\nRun: node script/get-openrouter-cookie.js for help');
  process.exit(1);
}

const cookie = cookieMatch[1];

if (cookie.length === 0) {
  console.error('❌ VITE_OPENROUTER_COOKIE is empty!');
  console.log('\nRun: node script/get-openrouter-cookie.js to extract cookie');
  process.exit(1);
}

console.log('🧪 Testing OpenRouter Cookie Authentication\n');
console.log(`Cookie length: ${cookie.length} characters`);
console.log('Cookie preview:', cookie.substring(0, 50) + '...\n');

// Test the API
async function testAPI() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5001',
        'X-Title': 'Learn Reels - Test',
        'Cookie': cookie,
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct:free',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from Learn Reels!" if you can read this.',
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('\n❌ API Error:');
      console.error(JSON.stringify(error, null, 2));
      
      if (response.status === 401) {
        console.log('\n💡 Troubleshooting:');
        console.log('1. Cookie may have expired - extract a fresh one');
        console.log('2. Make sure you copied the entire cookie string');
        console.log('3. Try logging into https://openrouter.ai again');
        console.log('\nRun: node script/get-openrouter-cookie.js');
      }
      
      process.exit(1);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '';

    console.log('\n✅ Success! OpenRouter is working!\n');
    console.log('Response:');
    console.log('─'.repeat(50));
    console.log(content);
    console.log('─'.repeat(50));
    console.log('\n🎉 Your AI features are ready to use!');
    console.log('\nNext steps:');
    console.log('1. Start dev server: pnpm dev');
    console.log('2. Open any question page');
    console.log('3. Click the Sparkles icon (✨) to test AI chat');
    console.log('\nFor production, add OPENROUTER_COOKIE to GitHub Secrets');
    console.log('See OPENROUTER_SETUP.md for details');

  } catch (error) {
    console.error('\n❌ Network Error:');
    console.error(error.message);
    console.log('\n💡 Check your internet connection and try again');
    process.exit(1);
  }
}

testAPI();
