import {
  getAllUnifiedQuestions,
  addUnifiedQuestion,
  generateUnifiedId,
  isDuplicateUnified,
  runWithRetries,
  parseJson,
  updateUnifiedIndexFile,
  writeGitHubOutput,
  logQuestionsAdded
} from './utils.js';

// Use centralized libs
import { CHANNEL_CONFIGS, getAllChannels, getRandomSubChannel } from './lib/channel-config.js';
import { validateQuestion, validateYouTubeVideos, normalizeCompanies } from './lib/validators.js';

// Use centralized channel configs
const channelConfigs = CHANNEL_CONFIGS;

const difficulties = ['beginner', 'intermediate', 'advanced'];

async function main() {
  console.log('=== Daily Question Generator (Unified Storage) ===\n');
  console.log('Mode: 1 question per channel (can map to multiple channels)\n');

  const inputDifficulty = process.env.INPUT_DIFFICULTY || 'random';
  // Limit number of questions to generate (0 = all channels)
  const inputLimit = parseInt(process.env.INPUT_LIMIT || '0', 10);
  
  // Get all channels from config
  let channels = getAllChannels();
  
  // Apply limit if specified
  if (inputLimit > 0) {
    // Shuffle channels to get random selection
    channels = channels.sort(() => Math.random() - 0.5).slice(0, inputLimit);
    console.log(`Limited to ${inputLimit} channel(s): ${channels.join(', ')}\n`);
  } else {
    console.log(`Found ${channels.length} channels: ${channels.join(', ')}\n`);
  }

  const allQuestions = getAllUnifiedQuestions();
  console.log(`Loaded ${allQuestions.length} existing questions`);
  console.log(`Target: Generate 1 question per channel (${channels.length} total)\n`);

  const addedQuestions = [];
  const failedAttempts = [];

  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const subChannelConfig = getRandomSubChannel(channel);
    
    console.log(`\n--- Channel ${i + 1}/${channels.length}: ${channel} ---`);
    
    const difficulty = inputDifficulty === 'random'
      ? difficulties[Math.floor(Math.random() * difficulties.length)]
      : inputDifficulty;

    console.log(`Sub-channel: ${subChannelConfig.subChannel}`);
    console.log(`Difficulty: ${difficulty}`);

    // Optimized prompt - concise but clear
    const prompt = `Generate ${difficulty} ${channel}/${subChannelConfig.subChannel} interview question.
Topics: ${subChannelConfig.tags.join(', ')}

Return valid JSON:
{
  "question": "specific technical question ending with ?",
  "answer": "concise answer under 150 chars",
  "explanation": "## Why Asked\\nInterview context\\n## Key Concepts\\nCore knowledge\\n## Code Example\\n\`\`\`\\nImplementation\\n\`\`\`\\n## Follow-up Questions\\nCommon follow-ups",
  "diagram": "flowchart TD\\n  A[Start] --> B[End]",
  "companies": ["Google", "Amazon", "Meta"],
  "sourceUrl": "https://docs.example.com or null",
  "videos": {"shortVideo": null, "longVideo": null}
}`;

    // Log the prompt
    console.log('\n📝 PROMPT:');
    console.log('─'.repeat(50));
    console.log(prompt);
    console.log('─'.repeat(50));

    const response = await runWithRetries(prompt);
    
    if (!response) {
      console.log('❌ OpenCode failed after all retries.');
      failedAttempts.push({ channel, reason: 'OpenCode timeout' });
      continue;
    }

    const data = parseJson(response);
    
    if (!validateQuestion(data)) {
      console.log('❌ Invalid response format.');
      failedAttempts.push({ channel, reason: 'Invalid JSON format' });
      continue;
    }

    if (isDuplicateUnified(data.question)) {
      console.log('❌ Duplicate question detected.');
      failedAttempts.push({ channel, reason: 'Duplicate detected' });
      continue;
    }

    // Validate YouTube videos if provided
    console.log('🎬 Validating YouTube videos...');
    const validatedVideos = await validateYouTubeVideos(data.videos);

    const newQuestion = {
      id: generateUnifiedId(),
      question: data.question,
      answer: data.answer.substring(0, 200),
      explanation: data.explanation,
      tags: subChannelConfig.tags,
      difficulty: difficulty,
      diagram: data.diagram || 'graph TD\n    A[Concept] --> B[Implementation]',
      sourceUrl: data.sourceUrl || null,
      videos: {
        shortVideo: validatedVideos.shortVideo,
        longVideo: validatedVideos.longVideo
      },
      companies: normalizeCompanies(data.companies),
      lastUpdated: new Date().toISOString()
    };

    // Build channel mappings - primary channel + any related channels
    const channelMappings = [{ channel, subChannel: subChannelConfig.subChannel }];
    
    // Add related channels if provided by AI and they exist in our config
    if (data.relatedChannels && Array.isArray(data.relatedChannels)) {
      data.relatedChannels.forEach(relatedChannel => {
        if (channelConfigs[relatedChannel] && relatedChannel !== channel) {
          // Pick a relevant subchannel for the related channel
          const relatedSubChannel = getRandomSubChannel(relatedChannel);
          channelMappings.push({ 
            channel: relatedChannel, 
            subChannel: relatedSubChannel.subChannel 
          });
        }
      });
    }

    // Add question to unified storage with all channel mappings
    addUnifiedQuestion(newQuestion, channelMappings);
    updateUnifiedIndexFile();
    
    addedQuestions.push({ ...newQuestion, mappedChannels: channelMappings });

    console.log(`✅ Added: ${newQuestion.id}`);
    console.log(`Q: ${newQuestion.question.substring(0, 60)}...`);
    if (channelMappings.length > 1) {
      console.log(`📎 Also mapped to: ${channelMappings.slice(1).map(m => m.channel).join(', ')}`);
    }
  }

  // Print summary
  const totalQuestions = getAllUnifiedQuestions().length;
  console.log('\n\n=== SUMMARY ===');
  console.log(`Total Questions Added: ${addedQuestions.length}/${channels.length}`);
  
  if (addedQuestions.length > 0) {
    console.log('\n✅ Successfully Added Questions:');
    addedQuestions.forEach((q, idx) => {
      const channels = q.mappedChannels.map(m => `${m.channel}/${m.subChannel}`).join(', ');
      console.log(`  ${idx + 1}. [${q.id}] (${q.difficulty})`);
      console.log(`     Q: ${q.question.substring(0, 70)}${q.question.length > 70 ? '...' : ''}`);
      console.log(`     Channels: ${channels}`);
    });
  }

  if (failedAttempts.length > 0) {
    console.log(`\n❌ Failed Attempts: ${failedAttempts.length}`);
    failedAttempts.forEach(f => {
      console.log(`  - ${f.channel}: ${f.reason}`);
    });
  }

  console.log(`\nTotal Questions in Database: ${totalQuestions}`);
  console.log('=== END SUMMARY ===\n');

  // Log to changelog
  if (addedQuestions.length > 0) {
    const channelsAffected = addedQuestions.flatMap(q => q.mappedChannels.map(m => m.channel));
    logQuestionsAdded(
      addedQuestions.length,
      channelsAffected,
      addedQuestions.map(q => q.id)
    );
    console.log('📝 Changelog updated with new questions');
  }

  writeGitHubOutput({
    added_count: addedQuestions.length,
    failed_count: failedAttempts.length,
    total_questions: totalQuestions,
    added_ids: addedQuestions.map(q => q.id).join(',')
  });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
