#!/usr/bin/env node

/**
 * Interactive cookie setup script
 * Guides you through extracting and testing the cookie
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

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

console.log('\n' + '═'.repeat(70));
console.log('  OpenRouter Cookie Setup - Interactive Guide');
console.log('═'.repeat(70) + '\n');

async function main() {
  console.log('This script will help you set up OpenRouter cookie authentication.\n');
  
  // Step 1: Check if already configured
  const envPath = path.join(__dirname, '..', '.env');
  let currentCookie = '';
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/VITE_OPENROUTER_COOKIE="([^"]*)"/);
    if (match && match[1]) {
      currentCookie = match[1];
      console.log('✓ Found existing cookie in .env');
      console.log(`  Length: ${currentCookie.length} characters\n`);
      
      const replace = await question('Do you want to replace it? (y/n): ');
      if (replace.toLowerCase() !== 'y') {
        console.log('\nKeeping existing cookie. Run this script again if you change your mind.\n');
        rl.close();
        return;
      }
    }
  }
  
  // Step 2: Instructions
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 1: Open OpenRouter in Your Browser');
  console.log('─'.repeat(70));
  console.log('1. Go to: https://openrouter.ai');
  console.log('2. Log in (or create a free account if you haven\'t)');
  console.log('3. Make sure you\'re on the OpenRouter website\n');
  
  await question('Press Enter when you\'re logged into OpenRouter...');
  
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 2: Open Browser DevTools');
  console.log('─'.repeat(70));
  console.log('Mac:     Press Cmd + Option + I');
  console.log('Windows: Press F12');
  console.log('Linux:   Press F12\n');
  
  await question('Press Enter when DevTools is open...');
  
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 3: Navigate to Cookies');
  console.log('─'.repeat(70));
  console.log('Chrome/Edge:');
  console.log('  1. Click "Application" tab at the top');
  console.log('  2. Left sidebar: Expand "Cookies"');
  console.log('  3. Click "https://openrouter.ai"');
  console.log('');
  console.log('Firefox:');
  console.log('  1. Click "Storage" tab at the top');
  console.log('  2. Left sidebar: Expand "Cookies"');
  console.log('  3. Click "https://openrouter.ai"\n');
  
  await question('Press Enter when you can see the cookies...');
  
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 4: Copy Cookie String');
  console.log('─'.repeat(70));
  console.log('You should see a table with cookies. You need to copy them in this format:');
  console.log('  cookie1=value1; cookie2=value2; cookie3=value3');
  console.log('');
  console.log('Method 1 (Easiest):');
  console.log('  - In the Console tab, type: document.cookie');
  console.log('  - Copy the entire output');
  console.log('');
  console.log('Method 2 (Manual):');
  console.log('  - Look at the Name and Value columns');
  console.log('  - Copy each as: name=value');
  console.log('  - Separate with semicolon and space: ; ');
  console.log('');
  
  const cookie = await question('Paste your cookie string here: ');
  
  if (!cookie || cookie.trim().length === 0) {
    console.log('\n❌ No cookie provided. Exiting.\n');
    rl.close();
    return;
  }
  
  const cleanCookie = cookie.trim();
  
  // Step 3: Validate format
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 5: Validating Cookie');
  console.log('─'.repeat(70));
  console.log(`Cookie length: ${cleanCookie.length} characters`);
  console.log(`Cookie preview: ${cleanCookie.substring(0, 50)}...`);
  
  if (cleanCookie.length < 20) {
    console.log('\n⚠️  Warning: Cookie seems too short. Make sure you copied the entire string.\n');
    const proceed = await question('Continue anyway? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('\nExiting. Run the script again when ready.\n');
      rl.close();
      return;
    }
  }
  
  // Step 4: Save to .env
  console.log('\n' + '─'.repeat(70));
  console.log('STEP 6: Saving to .env');
  console.log('─'.repeat(70));
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else {
    envContent = '# OpenRouter Cookie Authentication\n';
    envContent += '# Get this from your browser after logging into https://openrouter.ai\n';
    envContent += '# Run: node script/setup-cookie-interactive.js for help\n';
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
  console.log('✓ Cookie saved to .env file\n');
  
  // Step 5: Test the cookie
  console.log('─'.repeat(70));
  console.log('STEP 7: Testing Cookie');
  console.log('─'.repeat(70));
  console.log('Testing connection to OpenRouter API...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5001',
        'X-Title': 'Learn Reels - Setup Test',
        'Cookie': cleanCookie,
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct:free',
        messages: [
          { role: 'user', content: 'Say "Hello!" if you can read this.' }
        ],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';
      
      console.log('✅ SUCCESS! Cookie is working!\n');
      console.log('API Response:');
      console.log('─'.repeat(70));
      console.log(content);
      console.log('─'.repeat(70));
      
      console.log('\n' + '═'.repeat(70));
      console.log('  Setup Complete! 🎉');
      console.log('═'.repeat(70));
      console.log('\nNext steps:');
      console.log('1. Restart your dev server:');
      console.log('   - Stop current server (Ctrl+C)');
      console.log('   - Run: pnpm dev');
      console.log('');
      console.log('2. Test in browser:');
      console.log('   - Visit: http://localhost:5001/test/cookie');
      console.log('   - Or try AI chat on any question page');
      console.log('');
      console.log('3. For production:');
      console.log('   - Add cookie to GitHub Secrets');
      console.log('   - Name: OPENROUTER_COOKIE');
      console.log('   - Value: (same cookie string)');
      console.log('');
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API Test Failed\n');
      console.log(`Status: ${response.status}`);
      console.log('Error:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 401) {
        console.log('\n💡 Troubleshooting:');
        console.log('- Cookie may be invalid or incomplete');
        console.log('- Make sure you copied ALL cookies from openrouter.ai');
        console.log('- Try logging out and back into OpenRouter');
        console.log('- Run this script again to try a fresh cookie');
      }
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    console.log('\n💡 Check your internet connection and try again');
  }
  
  console.log('\n');
  rl.close();
}

main().catch(console.error);
