// DEPRECATED: This file has been moved to script/bots/video-bot.js
// This wrapper exists for backwards compatibility with existing workflows
// Consider updating your workflows to use the new location

console.log('⚠️  NOTICE: script/add-videos.js is deprecated');
console.log('   Please use: script/bots/video-bot.js');
console.log('   Or use the unified: script/bots/enrichment-bot.js\n');

// Import and run the new video bot
import('./bots/video-bot.js').catch(err => {
  console.error('Failed to load new video bot:', err.message);
  process.exit(1);
});
