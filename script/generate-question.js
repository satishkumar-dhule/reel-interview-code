import {
  getAllUnifiedQuestions,
  addUnifiedQuestion,
  generateUnifiedId,
  isDuplicateUnified,
  runWithRetries,
  parseJson,
  validateQuestion,
  updateUnifiedIndexFile,
  writeGitHubOutput
} from './utils.js';

// Complete channel configurations matching channels-config.ts
// Each channel has sub-channels and tags for question generation
const channelConfigs = {
  // Engineering Channels
  'system-design': [
    { subChannel: 'infrastructure', tags: ['infra', 'scale'] },
    { subChannel: 'distributed-systems', tags: ['dist-sys', 'architecture'] },
    { subChannel: 'api-design', tags: ['api', 'rest'] },
    { subChannel: 'caching', tags: ['cache', 'redis'] },
    { subChannel: 'load-balancing', tags: ['lb', 'traffic'] },
  ],
  'algorithms': [
    { subChannel: 'data-structures', tags: ['struct', 'basics'] },
    { subChannel: 'sorting', tags: ['sort', 'complexity'] },
    { subChannel: 'dynamic-programming', tags: ['dp', 'optimization'] },
    { subChannel: 'graphs', tags: ['graph', 'traversal'] },
    { subChannel: 'trees', tags: ['tree', 'binary'] },
  ],
  'frontend': [
    { subChannel: 'react', tags: ['react', 'hooks'] },
    { subChannel: 'javascript', tags: ['js', 'core'] },
    { subChannel: 'css', tags: ['css', 'styling'] },
    { subChannel: 'performance', tags: ['perf', 'optimization'] },
    { subChannel: 'web-apis', tags: ['browser', 'dom'] },
  ],
  'backend': [
    { subChannel: 'apis', tags: ['api', 'rest', 'graphql'] },
    { subChannel: 'microservices', tags: ['microservices', 'architecture'] },
    { subChannel: 'caching', tags: ['cache', 'redis'] },
    { subChannel: 'authentication', tags: ['auth', 'jwt', 'oauth'] },
    { subChannel: 'server-architecture', tags: ['server', 'scaling'] },
  ],
  'database': [
    { subChannel: 'sql', tags: ['sql', 'queries'] },
    { subChannel: 'nosql', tags: ['nosql', 'mongodb'] },
    { subChannel: 'indexing', tags: ['index', 'optimization'] },
    { subChannel: 'transactions', tags: ['acid', 'transactions'] },
    { subChannel: 'query-optimization', tags: ['query', 'performance'] },
  ],

  // DevOps & Cloud Channels
  'devops': [
    { subChannel: 'cicd', tags: ['cicd', 'automation'] },
    { subChannel: 'docker', tags: ['docker', 'containers'] },
    { subChannel: 'automation', tags: ['automation', 'scripting'] },
    { subChannel: 'orchestration', tags: ['orchestration', 'deployment'] },
  ],
  'sre': [
    { subChannel: 'observability', tags: ['metrics', 'monitoring'] },
    { subChannel: 'reliability', tags: ['reliability', 'uptime'] },
    { subChannel: 'slo-sli', tags: ['slo', 'sli', 'error-budget'] },
    { subChannel: 'incident-management', tags: ['incident', 'postmortem'] },
    { subChannel: 'chaos-engineering', tags: ['chaos', 'resilience'] },
  ],
  'kubernetes': [
    { subChannel: 'pods', tags: ['pods', 'containers'] },
    { subChannel: 'services', tags: ['services', 'networking'] },
    { subChannel: 'deployments', tags: ['deployments', 'rollouts'] },
    { subChannel: 'helm', tags: ['helm', 'charts'] },
    { subChannel: 'operators', tags: ['operators', 'crds'] },
  ],
  'aws': [
    { subChannel: 'ec2', tags: ['ec2', 'compute'] },
    { subChannel: 's3', tags: ['s3', 'storage'] },
    { subChannel: 'lambda', tags: ['lambda', 'serverless'] },
    { subChannel: 'rds', tags: ['rds', 'database'] },
    { subChannel: 'vpc', tags: ['vpc', 'networking'] },
  ],
  'terraform': [
    { subChannel: 'basics', tags: ['iac', 'basics'] },
    { subChannel: 'modules', tags: ['modules', 'reusability'] },
    { subChannel: 'state-management', tags: ['state', 'backend'] },
    { subChannel: 'providers', tags: ['providers', 'resources'] },
  ],

  // Data & AI Channels
  'data-engineering': [
    { subChannel: 'etl', tags: ['etl', 'pipelines'] },
    { subChannel: 'data-pipelines', tags: ['pipelines', 'airflow'] },
    { subChannel: 'warehousing', tags: ['warehouse', 'analytics'] },
    { subChannel: 'streaming', tags: ['streaming', 'kafka'] },
  ],
  'machine-learning': [
    { subChannel: 'algorithms', tags: ['ml', 'algorithms'] },
    { subChannel: 'model-training', tags: ['training', 'optimization'] },
    { subChannel: 'deployment', tags: ['mlops', 'deployment'] },
    { subChannel: 'deep-learning', tags: ['dl', 'neural-networks'] },
    { subChannel: 'nlp', tags: ['nlp', 'text'] },
  ],
  'python': [
    { subChannel: 'fundamentals', tags: ['python', 'basics'] },
    { subChannel: 'libraries', tags: ['pandas', 'numpy'] },
    { subChannel: 'best-practices', tags: ['patterns', 'clean-code'] },
    { subChannel: 'async', tags: ['async', 'concurrency'] },
  ],

  // Security Channel
  'security': [
    { subChannel: 'application-security', tags: ['appsec', 'vulnerabilities'] },
    { subChannel: 'owasp', tags: ['owasp', 'top10'] },
    { subChannel: 'encryption', tags: ['encryption', 'crypto'] },
    { subChannel: 'authentication', tags: ['auth', 'identity'] },
  ],
  'networking': [
    { subChannel: 'tcp-ip', tags: ['tcp', 'ip', 'protocols'] },
    { subChannel: 'dns', tags: ['dns', 'resolution'] },
    { subChannel: 'load-balancing', tags: ['lb', 'traffic'] },
    { subChannel: 'cdn', tags: ['cdn', 'caching'] },
  ],

  // Mobile Channels
  'ios': [
    { subChannel: 'swift', tags: ['swift', 'language'] },
    { subChannel: 'uikit', tags: ['uikit', 'ui'] },
    { subChannel: 'swiftui', tags: ['swiftui', 'declarative'] },
    { subChannel: 'architecture', tags: ['mvvm', 'patterns'] },
  ],
  'android': [
    { subChannel: 'kotlin', tags: ['kotlin', 'language'] },
    { subChannel: 'jetpack-compose', tags: ['compose', 'ui'] },
    { subChannel: 'architecture', tags: ['mvvm', 'patterns'] },
    { subChannel: 'lifecycle', tags: ['lifecycle', 'components'] },
  ],
  'react-native': [
    { subChannel: 'components', tags: ['components', 'ui'] },
    { subChannel: 'navigation', tags: ['navigation', 'routing'] },
    { subChannel: 'native-modules', tags: ['native', 'bridge'] },
    { subChannel: 'performance', tags: ['perf', 'optimization'] },
  ],

  // Management & Soft Skills Channels
  'engineering-management': [
    { subChannel: 'team-leadership', tags: ['leadership', 'team'] },
    { subChannel: 'one-on-ones', tags: ['1on1', 'feedback'] },
    { subChannel: 'hiring', tags: ['hiring', 'interviews'] },
    { subChannel: 'project-management', tags: ['project', 'planning'] },
  ],
  'behavioral': [
    { subChannel: 'star-method', tags: ['star', 'stories'] },
    { subChannel: 'leadership-principles', tags: ['leadership', 'principles'] },
    { subChannel: 'soft-skills', tags: ['communication', 'collaboration'] },
    { subChannel: 'conflict-resolution', tags: ['conflict', 'resolution'] },
  ],
};

const difficulties = ['beginner', 'intermediate', 'advanced'];

// Get all channels from the config (source of truth)
// This ensures we generate questions for all defined channels
function getAllChannels() {
  return Object.keys(channelConfigs);
}

// Get a random sub-channel config for a given channel
function getRandomSubChannel(channel) {
  const configs = channelConfigs[channel];
  if (!configs || configs.length === 0) {
    return { subChannel: 'general', tags: [channel] };
  }
  return configs[Math.floor(Math.random() * configs.length)];
}

async function main() {
  console.log('=== Daily Question Generator (Unified Storage) ===\n');
  console.log('Mode: 1 question per channel (can map to multiple channels)\n');

  const inputDifficulty = process.env.INPUT_DIFFICULTY || 'random';
  const inputAdditionalChannels = process.env.INPUT_ADDITIONAL_CHANNELS || '';
  
  // Get all channels from config
  const channels = getAllChannels();
  console.log(`Found ${channels.length} channels: ${channels.join(', ')}\n`);

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

    const prompt = `Generate a unique technical interview question for ${channel} (${subChannelConfig.subChannel}). Difficulty: ${difficulty}. Return ONLY valid JSON with no other text: {"question": "the question text", "answer": "brief answer under 150 chars", "explanation": "detailed markdown explanation", "diagram": "mermaid diagram starting with graph TD or LR", "relatedChannels": ["list of other channels this question could belong to"]}`;

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

    const newQuestion = {
      id: generateUnifiedId(),
      question: data.question,
      answer: data.answer.substring(0, 200),
      explanation: data.explanation,
      tags: subChannelConfig.tags,
      difficulty: difficulty,
      diagram: data.diagram || 'graph TD\n    A[Concept] --> B[Implementation]',
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

  writeGitHubOutput({
    added_count: addedQuestions.length,
    failed_count: failedAttempts.length,
    total_questions: totalQuestions,
    added_ids: addedQuestions.map(q => q.id).join(',')
  });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
