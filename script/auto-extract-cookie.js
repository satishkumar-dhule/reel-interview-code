#!/usr/bin/env node

/**
 * Automatically extract OpenRouter cookie using Puppeteer
 * Similar to how OpenCode CLI works - automated authentication
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🤖 Automatic Cookie Extraction for OpenRouter\n');
console.log('This script will attempt to extract the cookie automatically.\n');

// Check if puppeteer is installed
async function checkPuppeteer() {
  try {
    await import('puppeteer');
    return true;
  } catch (e) {
    return false;
  }
}

async function installPuppeteer() {
  console.log('📦 Installing Puppeteer (headless browser)...');
  console.log('This may take a minute...\n');
  
  return new Promise((resolve, reject) => {
    const proc = spawn('npm', ['install', 'puppeteer'], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Installation failed with code ${code}`));
      }
    });
  });
}

async function extractCookieWithPuppeteer() {
  const puppeteer = await import('puppeteer');
  
  console.log('🌐 Launching browser...');
  const browser = await puppeteer.default.launch({
    headless: false, // Show browser so user can log in
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  console.log('📱 Opening OpenRouter...');
  await page.goto('https://openrouter.ai', { waitUntil: 'networkidle2' });
  
  console.log('\n' + '═'.repeat(70));
  console.log('  PLEASE LOG IN TO OPENROUTER IN THE BROWSER WINDOW');
  console.log('═'.repeat(70));
  console.log('\nWaiting for you to log in...');
  console.log('(The script will automatically detect when you\'re logged in)\n');
  
  // Wait for user to log in - check for auth cookies
  let cookies = [];
  let attempts = 0;
  const maxAttempts = 120; // 2 minutes
  
  while (attempts < maxAttempts) {
    cookies = await page.cookies();
    
    // Check if we have authentication cookies
    const hasAuthCookie = cookies.some(c => 
      c.name.includes('session') || 
      c.name.includes('auth') || 
      c.name.includes('token') ||
      c.value.length > 50
    );
    
    if (hasAuthCookie && cookies.length > 0) {
      console.log('✓ Detected login! Extracting cookies...\n');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
    
    if (attempts % 10 === 0) {
      console.log(`Still waiting... (${attempts}s elapsed)`);
    }
  }
  
  if (attempts >= maxAttempts) {
    await browser.close();
    throw new Error('Timeout waiting for login');
  }
  
  // Format cookies
  const cookieString = cookies
    .map(c => `${c.name}=${c.value}`)
    .join('; ');
  
  console.log(`✓ Extracted ${cookies.length} cookies`);
  console.log(`Cookie length: ${cookieString.length} characters\n`);
  
  await browser.close();
  
  return cookieString;
}

async function saveCookieToEnv(cookie) {
  const envPath = path.join(__dirname, '..', '.env');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else {
    envContent = '# OpenRouter Cookie Authentication\n';
    envContent += '# Auto-extracted by script/auto-extract-cookie.js\n';
  }
  
  if (envContent.includes('VITE_OPENROUTER_COOKIE=')) {
    envContent = envContent.replace(
      /VITE_OPENROUTER_COOKIE="[^"]*"/,
      `VITE_OPENROUTER_COOKIE="${cookie}"`
    );
  } else {
    envContent += `\nVITE_OPENROUTER_COOKIE="${cookie}"\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('✓ Saved cookie to .env file\n');
}

async function testCookie(cookie) {
  console.log('🧪 Testing cookie with OpenRouter API...\n');
  
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5001',
        'X-Title': 'Learn Reels - Auto Setup',
        'Cookie': cookie,
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
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.log('❌ API Test Failed');
      console.log(`Status: ${response.status}`);
      console.log('Error:', JSON.stringify(errorData, null, 2));
      return false;
    }
  } catch (error) {
    console.log('❌ Network Error:', error.message);
    return false;
  }
}

async function main() {
  try {
    // Check if Puppeteer is installed
    const hasPuppeteer = await checkPuppeteer();
    
    if (!hasPuppeteer) {
      console.log('⚠️  Puppeteer not found. Installing...\n');
      await installPuppeteer();
      console.log('\n✓ Puppeteer installed!\n');
    }
    
    // Extract cookie
    const cookie = await extractCookieWithPuppeteer();
    
    // Save to .env
    await saveCookieToEnv(cookie);
    
    // Test the cookie
    const success = await testCookie(cookie);
    
    if (success) {
      console.log('\n' + '═'.repeat(70));
      console.log('  🎉 Setup Complete!');
      console.log('═'.repeat(70));
      console.log('\nNext steps:');
      console.log('1. Restart your dev server: pnpm dev');
      console.log('2. Visit: http://localhost:5001/test/cookie');
      console.log('3. Try AI chat on any question page\n');
    } else {
      console.log('\n⚠️  Cookie extracted but API test failed.');
      console.log('You may need to try again or check OpenRouter status.\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Fallback: Use manual extraction instead:');
    console.log('   node script/setup-cookie-interactive.js\n');
    process.exit(1);
  }
}

main();
