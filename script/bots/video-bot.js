// Video Bot - Add/validate YouTube videos using the bot framework
// Uses AI verification to ensure videos are actually relevant to questions
import { BotFramework } from '../lib/bot-framework.js';
import { validateYouTubeVideos, validateVideoWithAI } from '../lib/validators.js';
import { getAllQuestions, saveQuestion } from '../lib/storage.js';
import { runWithRetries, parseJson } from '../utils.js';

// Check if question needs video work
function needsVideoWork(question) {
  const videos = question.videos || {};
  const hasShort = videos.shortVideo && videos.shortVideo.length > 10;
  const hasLong = videos.longVideo && videos.longVideo.length > 10;
  return !hasShort || !hasLong;
}

// Find videos using AI
async function findVideosForQuestion(question) {
  const prompt = `Find real YouTube videos for this interview question.

Question: "${question.question}"
Topic: ${question.tags?.slice(0, 3).join(', ') || 'technical interview'}

Search YouTube and return REAL video URLs that:
1. Actually exist and are educational
2. Are relevant to the question topic
3. shortVideo: Under 5 minutes (shorts, quick explanations)
4. longVideo: 10-60 minutes (deep dives, tutorials)

Use well-known channels: freeCodeCamp, Fireship, Traversy Media, TechWorld with Nana, Hussein Nasser, ByteByteGo

Return JSON:
{
  "shortVideo": "https://youtube.com/watch?v=REAL_ID or null",
  "longVideo": "https://youtube.com/watch?v=REAL_ID or null"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return null;
  
  const data = parseJson(response);
  return data ? { shortVideo: data.shortVideo, longVideo: data.longVideo } : null;
}

// Process single question
async function processQuestion(question) {
  const currentVideos = question.videos || {};
  const hasShort = currentVideos.shortVideo?.length > 10;
  const hasLong = currentVideos.longVideo?.length > 10;
  
  console.log(`Current: short=${hasShort ? '✓' : '✗'}, long=${hasLong ? '✓' : '✗'}`);
  
  // Validate existing videos with AI verification
  if (hasShort || hasLong) {
    console.log('🔍 Validating existing videos with AI...');
    
    // Use AI-powered validation for existing videos
    if (hasShort) {
      const shortCheck = await validateVideoWithAI(currentVideos.shortVideo, question.question);
      if (!shortCheck.valid) {
        console.log(`  ✗ Short video failed AI check: ${shortCheck.reason}`);
        currentVideos.shortVideo = null;
      }
    }
    if (hasLong) {
      const longCheck = await validateVideoWithAI(currentVideos.longVideo, question.question);
      if (!longCheck.valid) {
        console.log(`  ✗ Long video failed AI check: ${longCheck.reason}`);
        currentVideos.longVideo = null;
      }
    }
    
    // If both still valid after AI check, skip
    if (currentVideos.shortVideo && currentVideos.longVideo) {
      return { skipped: true, stats: { videosValidated: 1 } };
    }
  }
  
  // Find new videos if needed
  const needsShort = !currentVideos.shortVideo;
  const needsLong = !currentVideos.longVideo;
  
  if (!needsShort && !needsLong) {
    return { skipped: true };
  }
  
  console.log(`🔎 Searching (need: ${needsShort ? 'short ' : ''}${needsLong ? 'long' : ''})...`);
  
  const found = await findVideosForQuestion(question);
  if (!found) {
    return { failed: true, reason: 'AI search failed' };
  }
  
  // Validate found videos with AI verification
  let videosAdded = 0;
  
  if (needsShort && found.shortVideo) {
    const shortCheck = await validateVideoWithAI(found.shortVideo, question.question);
    if (shortCheck.valid) {
      currentVideos.shortVideo = found.shortVideo;
      videosAdded++;
      console.log(`  ✓ Short video AI-verified: ${shortCheck.title?.substring(0, 40)}...`);
    }
  }
  
  if (needsLong && found.longVideo) {
    const longCheck = await validateVideoWithAI(found.longVideo, question.question);
    if (longCheck.valid) {
      currentVideos.longVideo = found.longVideo;
      videosAdded++;
      console.log(`  ✓ Long video AI-verified: ${longCheck.title?.substring(0, 40)}...`);
    }
  }
  
  if (videosAdded === 0) {
    return { failed: true, reason: 'No videos passed AI verification' };
  }
  
  return {
    updated: true,
    data: {
      ...question,
      videos: currentVideos,
      lastVideoUpdate: new Date().toISOString()
    },
    stats: { videosAdded }
  };
}

// Main
async function main() {
  const bot = new BotFramework({
    name: 'video-bot',
    batchSize: 10,
    rateLimitMs: 2000,
    processQuestion
  });
  
  const questions = getAllQuestions();
  await bot.run(questions, (_id, data) => saveQuestion(data));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
