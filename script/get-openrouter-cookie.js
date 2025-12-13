#!/usr/bin/env node

/**
 * Script to help extract OpenRouter cookie from browser
 * 
 * Usage:
 * 1. Go to https://openrouter.ai in your browser
 * 2. Open DevTools (F12) → Application/Storage → Cookies
 * 3. Copy all cookies for openrouter.ai
 * 4. Run: node script/get-openrouter-cookie.js
 * 5. Paste the cookies when prompted
 * 6. Add the output to your .env file
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Show detailed instructions
function showInstructions() {
  const instructionsPath = path.join(__dirname, 'cookie-instructions.txt');
  if (fs.existsSync(instructionsPath)) {
    const instructions = fs.readFileSync(instructionsPath, 'utf-8');
    console.log(instructions);
  } else {
    console.log('\n🍪 OpenRouter Cookie Extractor\n');
    console.log('Instructions:');
    console.log('1. Go to https://openrouter.ai in your browser');
    console.log('2. Open DevTools (F12 or Cmd+Option+I)');
    console.log('3. Go to Application → Cookies → https://openrouter.ai');
    console.log('4. Copy ALL cookie values (you can right-click and copy)');
    console.log('5. Paste them below\n');
  }
}

// Ask if user wants to see detailed instructions
rl.question('Show detailed instructions? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    showInstructions();
    console.log('\n' + '═'.repeat(80) + '\n');
  }
  
  console.log('🍪 OpenRouter Cookie Extractor\n');

  rl.question('Paste your OpenRouter cookies here: ', (cookies) => {
    if (!cookies || cookies.trim().length === 0) {
      console.log('\n❌ No cookies provided!');
      rl.close();
      return;
    }

    // Clean up the cookie string
    const cleanCookies = cookies.trim();
    
    console.log('\n✅ Cookie extracted successfully!\n');
    console.log('Add this to your .env file:\n');
    console.log(`VITE_OPENROUTER_COOKIE="${cleanCookies}"`);
    console.log('\n📝 For GitHub Actions, add this as a repository secret:');
    console.log('   Name: OPENROUTER_COOKIE');
    console.log(`   Value: ${cleanCookies}`);
    console.log('\n⚠️  Keep this secret! Do not commit it to git.\n');
    console.log('Next steps:');
    console.log('1. Add the above line to your .env file');
    console.log('2. Test it: node script/test-openrouter-cookie.js');
    console.log('3. Start dev server: pnpm dev\n');
    
    rl.close();
  });
});
