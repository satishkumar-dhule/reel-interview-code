// DEPRECATED: This file has been moved to script/bots/company-bot.js
// This wrapper exists for backwards compatibility with existing workflows
// Consider updating your workflows to use the new location

console.log('⚠️  NOTICE: script/company-bot.js is deprecated');
console.log('   Please use: script/bots/company-bot.js');
console.log('   Or use the unified: script/bots/enrichment-bot.js\n');

// Import and run the new company bot
import('./bots/company-bot.js').catch(err => {
  console.error('Failed to load new company bot:', err.message);
  process.exit(1);
});
