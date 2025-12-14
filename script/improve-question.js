import {
  loadUnifiedQuestions,
  saveUnifiedQuestions,
  loadChannelMappings,
  getAllUnifiedQuestions,
  runWithRetries,
  parseJson,
  validateQuestion,
  updateUnifiedIndexFile,
  writeGitHubOutput
} from './utils.js';

// Get all channels from mappings
function getAllChannels() {
  const mappings = loadChannelMappings();
  return Object.keys(mappings);
}

// Get questions that belong to a specific channel
function getQuestionsForChannel(channel) {
  const questions = loadUnifiedQuestions();
  const mappings = loadChannelMappings();
  
  const channelMapping = mappings[channel];
  if (!channelMapping) return [];
  
  const questionIds = new Set();
  Object.values(channelMapping.subChannels || {}).forEach(ids => {
    ids.forEach(id => questionIds.add(id));
  });
  
  return Array.from(questionIds)
    .map(id => ({ ...questions[id], _channel: channel }))
    .filter(q => q.id != null);
}

function needsImprovement(q) {
  const issues = [];
  if (!q.answer || q.answer.length < 20) issues.push('short_answer');
  if (!q.answer || q.answer.length > 300) issues.push('long_answer');
  if (!q.explanation || q.explanation.length < 50) issues.push('short_explanation');
  if (!q.diagram || q.diagram.length < 10) issues.push('no_diagram');
  if (q.explanation && q.explanation.includes('[truncated')) issues.push('truncated');
  if (!q.question.endsWith('?')) issues.push('no_question_mark');
  return issues;
}

async function main() {
  console.log('=== Question Improvement Bot (Unified Storage) ===\n');
  console.log('Mode: 1 question per channel\n');

  const channels = getAllChannels();
  const allQuestions = getAllUnifiedQuestions();
  
  console.log(`Loaded ${allQuestions.length} questions from ${channels.length} channels`);

  // Find improvable questions
  const improvableQuestions = allQuestions.filter(q => needsImprovement(q).length > 0);
  console.log(`Found ${improvableQuestions.length} questions needing improvement\n`);

  if (improvableQuestions.length === 0) {
    console.log('✅ All questions are in good shape!');
    writeGitHubOutput({
      improved_count: 0,
      failed_count: 0,
      total_questions: allQuestions.length
    });
    return;
  }

  // Sort by lastUpdated (oldest first)
  improvableQuestions.sort((a, b) => {
    const dateA = new Date(a.lastUpdated || 0).getTime();
    const dateB = new Date(b.lastUpdated || 0).getTime();
    return dateA - dateB;
  });

  const improvedQuestions = [];
  const failedAttempts = [];
  const processedIds = new Set();

  // Process 1 question per channel
  for (let i = 0; i < channels.length; i++) {
    const channel = channels[i];
    const channelQuestions = getQuestionsForChannel(channel);
    
    console.log(`\n--- Channel ${i + 1}/${channels.length}: ${channel} ---`);
    
    // Find improvable question for this channel that hasn't been processed
    const channelImprovable = channelQuestions
      .filter(q => needsImprovement(q).length > 0 && !processedIds.has(q.id))
      .sort((a, b) => new Date(a.lastUpdated || 0).getTime() - new Date(b.lastUpdated || 0).getTime());
    
    if (channelImprovable.length === 0) {
      console.log('✅ No questions need improvement in this channel');
      continue;
    }

    const question = channelImprovable[0];
    processedIds.add(question.id);
    const issues = needsImprovement(question);
    
    console.log(`ID: ${question.id}`);
    console.log(`Issues: ${issues.join(', ')}`);
    console.log(`Current Q: ${question.question.substring(0, 60)}...`);

    const prompt = `Improve this technical interview question. Current question: "${question.question}". Current answer: "${question.answer}". Current explanation: "${question.explanation}". Issues to fix: ${issues.join(', ')}. Return ONLY valid JSON: {"question": "improved question", "answer": "improved answer under 150 chars", "explanation": "detailed markdown explanation with examples", "diagram": "mermaid diagram if helpful"}`;

    const response = await runWithRetries(prompt);
    
    if (!response) {
      console.log('❌ OpenCode failed after retries.');
      failedAttempts.push({ id: question.id, channel, reason: 'OpenCode timeout' });
      continue;
    }

    const data = parseJson(response);
    
    if (!validateQuestion(data)) {
      console.log('❌ Invalid response format.');
      failedAttempts.push({ id: question.id, channel, reason: 'Invalid JSON' });
      continue;
    }

    // Update question in unified storage
    const questions = loadUnifiedQuestions();
    
    if (!questions[question.id]) {
      console.log('❌ Question not found in unified storage.');
      failedAttempts.push({ id: question.id, channel, reason: 'Not found' });
      continue;
    }

    questions[question.id] = {
      ...questions[question.id],
      question: data.question,
      answer: data.answer.substring(0, 200),
      explanation: data.explanation,
      diagram: data.diagram || questions[question.id].diagram,
      lastUpdated: new Date().toISOString()
    };

    saveUnifiedQuestions(questions);
    updateUnifiedIndexFile();
    
    improvedQuestions.push(questions[question.id]);
    console.log(`✅ Improved: ${question.id}`);
  }

  // Print summary
  const totalQuestions = getAllUnifiedQuestions().length;
  console.log('\n\n=== SUMMARY ===');
  console.log(`Channels Processed: ${channels.length}`);
  console.log(`Total Questions Improved: ${improvedQuestions.length}`);
  
  if (improvedQuestions.length > 0) {
    console.log('\n✅ Successfully Improved Questions:');
    improvedQuestions.forEach((q, idx) => {
      console.log(`  ${idx + 1}. [${q.id}]`);
      console.log(`     Q: ${q.question.substring(0, 70)}${q.question.length > 70 ? '...' : ''}`);
    });
  }

  if (failedAttempts.length > 0) {
    console.log(`\n❌ Failed Attempts: ${failedAttempts.length}`);
    failedAttempts.forEach(f => {
      console.log(`  - [${f.channel}] ${f.id}: ${f.reason}`);
    });
  }

  console.log(`\nTotal Questions in Database: ${totalQuestions}`);
  console.log('=== END SUMMARY ===\n');

  writeGitHubOutput({
    improved_count: improvedQuestions.length,
    failed_count: failedAttempts.length,
    total_questions: totalQuestions,
    improved_ids: improvedQuestions.map(q => q.id).join(',')
  });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
