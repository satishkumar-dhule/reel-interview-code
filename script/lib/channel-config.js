// Single source of truth for channel configurations
// Used by all scripts and bots

export const CHANNEL_CONFIGS = {
  // Engineering Channels
  'system-design': [
    { subChannel: 'infrastructure', tags: ['infra', 'scale', 'distributed'] },
    { subChannel: 'distributed-systems', tags: ['dist-sys', 'cap-theorem', 'consensus'] },
    { subChannel: 'api-design', tags: ['api', 'rest', 'grpc', 'graphql'] },
    { subChannel: 'caching', tags: ['cache', 'redis', 'memcached', 'cdn'] },
    { subChannel: 'load-balancing', tags: ['lb', 'traffic', 'nginx', 'haproxy'] },
    { subChannel: 'message-queues', tags: ['kafka', 'rabbitmq', 'sqs', 'pubsub'] },
  ],
  'algorithms': [
    { subChannel: 'data-structures', tags: ['arrays', 'linkedlist', 'hashtable', 'heap'] },
    { subChannel: 'sorting', tags: ['quicksort', 'mergesort', 'complexity'] },
    { subChannel: 'dynamic-programming', tags: ['dp', 'memoization', 'tabulation'] },
    { subChannel: 'graphs', tags: ['bfs', 'dfs', 'dijkstra', 'topological'] },
    { subChannel: 'trees', tags: ['bst', 'avl', 'trie', 'segment-tree'] },
  ],
  'frontend': [
    { subChannel: 'react', tags: ['react', 'hooks', 'context', 'redux'] },
    { subChannel: 'javascript', tags: ['js', 'es6', 'closures', 'promises'] },
    { subChannel: 'css', tags: ['css', 'flexbox', 'grid', 'animations'] },
    { subChannel: 'performance', tags: ['lighthouse', 'bundle', 'lazy-loading'] },
    { subChannel: 'web-apis', tags: ['dom', 'fetch', 'websocket', 'service-worker'] },
  ],
  'backend': [
    { subChannel: 'apis', tags: ['rest', 'graphql', 'grpc', 'openapi'] },
    { subChannel: 'microservices', tags: ['saga', 'cqrs', 'event-sourcing'] },
    { subChannel: 'caching', tags: ['redis', 'memcached', 'cache-invalidation'] },
    { subChannel: 'authentication', tags: ['jwt', 'oauth2', 'oidc', 'saml'] },
    { subChannel: 'server-architecture', tags: ['scaling', 'sharding', 'replication'] },
  ],
  'database': [
    { subChannel: 'sql', tags: ['joins', 'indexes', 'normalization', 'postgres'] },
    { subChannel: 'nosql', tags: ['mongodb', 'dynamodb', 'cassandra', 'redis'] },
    { subChannel: 'indexing', tags: ['btree', 'hash-index', 'composite'] },
    { subChannel: 'transactions', tags: ['acid', 'isolation-levels', 'mvcc'] },
    { subChannel: 'query-optimization', tags: ['explain', 'query-plan', 'partitioning'] },
  ],
  'devops': [
    { subChannel: 'cicd', tags: ['github-actions', 'jenkins', 'gitlab-ci'] },
    { subChannel: 'docker', tags: ['dockerfile', 'compose', 'multi-stage'] },
    { subChannel: 'automation', tags: ['ansible', 'puppet', 'chef'] },
    { subChannel: 'gitops', tags: ['argocd', 'flux', 'declarative'] },
  ],
  'sre': [
    { subChannel: 'observability', tags: ['prometheus', 'grafana', 'opentelemetry'] },
    { subChannel: 'reliability', tags: ['slo', 'sli', 'error-budget'] },
    { subChannel: 'incident-management', tags: ['pagerduty', 'runbooks', 'postmortem'] },
    { subChannel: 'chaos-engineering', tags: ['chaos-monkey', 'litmus', 'gremlin'] },
    { subChannel: 'capacity-planning', tags: ['forecasting', 'autoscaling', 'load-testing'] },
  ],
  'kubernetes': [
    { subChannel: 'pods', tags: ['containers', 'init-containers', 'sidecars'] },
    { subChannel: 'services', tags: ['clusterip', 'nodeport', 'loadbalancer', 'ingress'] },
    { subChannel: 'deployments', tags: ['rolling-update', 'canary', 'blue-green'] },
    { subChannel: 'helm', tags: ['charts', 'values', 'templating'] },
    { subChannel: 'operators', tags: ['crds', 'controllers', 'reconciliation'] },
  ],
  'aws': [
    { subChannel: 'compute', tags: ['ec2', 'ecs', 'eks', 'fargate'] },
    { subChannel: 'storage', tags: ['s3', 'ebs', 'efs', 'glacier'] },
    { subChannel: 'serverless', tags: ['lambda', 'api-gateway', 'step-functions'] },
    { subChannel: 'database', tags: ['rds', 'aurora', 'dynamodb', 'elasticache'] },
    { subChannel: 'networking', tags: ['vpc', 'route53', 'cloudfront', 'alb'] },
  ],
  'terraform': [
    { subChannel: 'basics', tags: ['hcl', 'resources', 'data-sources'] },
    { subChannel: 'modules', tags: ['composition', 'versioning', 'registry'] },
    { subChannel: 'state-management', tags: ['remote-state', 'locking', 'workspaces'] },
    { subChannel: 'best-practices', tags: ['dry', 'terragrunt', 'atlantis'] },
  ],
  'data-engineering': [
    { subChannel: 'etl', tags: ['spark', 'airflow', 'dbt'] },
    { subChannel: 'data-pipelines', tags: ['dag', 'orchestration', 'scheduling'] },
    { subChannel: 'warehousing', tags: ['snowflake', 'bigquery', 'redshift'] },
    { subChannel: 'streaming', tags: ['kafka', 'flink', 'kinesis'] },
  ],
  'machine-learning': [
    { subChannel: 'algorithms', tags: ['regression', 'classification', 'clustering'] },
    { subChannel: 'model-training', tags: ['hyperparameter', 'cross-validation', 'regularization'] },
    { subChannel: 'deployment', tags: ['mlflow', 'kubeflow', 'sagemaker'] },
    { subChannel: 'deep-learning', tags: ['cnn', 'rnn', 'transformer', 'attention'] },
    { subChannel: 'evaluation', tags: ['precision', 'recall', 'auc-roc', 'f1'] },
  ],
  'generative-ai': [
    { subChannel: 'llm-fundamentals', tags: ['transformer', 'attention', 'tokenization'] },
    { subChannel: 'fine-tuning', tags: ['lora', 'qlora', 'peft', 'adapter'] },
    { subChannel: 'rag', tags: ['retrieval', 'embeddings', 'vector-db', 'chunking'] },
    { subChannel: 'agents', tags: ['langchain', 'autogen', 'tool-use', 'planning'] },
    { subChannel: 'evaluation', tags: ['hallucination', 'faithfulness', 'relevance'] },
  ],
  'prompt-engineering': [
    { subChannel: 'techniques', tags: ['chain-of-thought', 'few-shot', 'zero-shot'] },
    { subChannel: 'optimization', tags: ['prompt-tuning', 'dspy', 'automatic-prompting'] },
    { subChannel: 'safety', tags: ['jailbreak', 'guardrails', 'content-filtering'] },
    { subChannel: 'structured-output', tags: ['json-mode', 'function-calling', 'schema'] },
  ],
  'llm-ops': [
    { subChannel: 'deployment', tags: ['vllm', 'tgi', 'triton', 'onnx'] },
    { subChannel: 'optimization', tags: ['quantization', 'pruning', 'distillation'] },
    { subChannel: 'monitoring', tags: ['latency', 'throughput', 'cost-tracking'] },
    { subChannel: 'infrastructure', tags: ['gpu', 'tpu', 'inference-server'] },
  ],
  'computer-vision': [
    { subChannel: 'image-classification', tags: ['cnn', 'resnet', 'efficientnet'] },
    { subChannel: 'object-detection', tags: ['yolo', 'rcnn', 'detr'] },
    { subChannel: 'segmentation', tags: ['unet', 'mask-rcnn', 'sam'] },
    { subChannel: 'multimodal', tags: ['clip', 'blip', 'llava', 'vision-transformer'] },
  ],
  'nlp': [
    { subChannel: 'text-processing', tags: ['tokenization', 'stemming', 'ner'] },
    { subChannel: 'embeddings', tags: ['word2vec', 'bert', 'sentence-transformers'] },
    { subChannel: 'sequence-models', tags: ['lstm', 'gru', 'seq2seq'] },
    { subChannel: 'transformers', tags: ['bert', 'gpt', 't5', 'llama'] },
  ],
  'python': [
    { subChannel: 'fundamentals', tags: ['generators', 'decorators', 'context-managers'] },
    { subChannel: 'libraries', tags: ['pandas', 'numpy', 'scikit-learn'] },
    { subChannel: 'best-practices', tags: ['pep8', 'typing', 'testing'] },
    { subChannel: 'async', tags: ['asyncio', 'aiohttp', 'concurrency'] },
  ],
  'security': [
    { subChannel: 'application-security', tags: ['xss', 'csrf', 'sqli', 'ssrf'] },
    { subChannel: 'owasp', tags: ['top10', 'asvs', 'samm'] },
    { subChannel: 'encryption', tags: ['aes', 'rsa', 'tls', 'hashing'] },
    { subChannel: 'authentication', tags: ['mfa', 'passkeys', 'zero-trust'] },
  ],
  'networking': [
    { subChannel: 'tcp-ip', tags: ['tcp', 'udp', 'http2', 'quic'] },
    { subChannel: 'dns', tags: ['resolution', 'caching', 'dnssec'] },
    { subChannel: 'load-balancing', tags: ['l4', 'l7', 'consistent-hashing'] },
    { subChannel: 'cdn', tags: ['edge', 'caching', 'purging'] },
  ],
  'operating-systems': [
    { subChannel: 'processes', tags: ['process', 'threads', 'scheduling', 'context-switch'] },
    { subChannel: 'memory', tags: ['virtual-memory', 'paging', 'segmentation', 'cache'] },
    { subChannel: 'file-systems', tags: ['inodes', 'ext4', 'ntfs', 'journaling'] },
    { subChannel: 'concurrency', tags: ['mutex', 'semaphore', 'deadlock', 'race-condition'] },
  ],
  'linux': [
    { subChannel: 'administration', tags: ['systemd', 'cron', 'users', 'permissions'] },
    { subChannel: 'shell-scripting', tags: ['bash', 'awk', 'sed', 'grep'] },
    { subChannel: 'system-tools', tags: ['top', 'htop', 'strace', 'lsof'] },
    { subChannel: 'networking', tags: ['iptables', 'netstat', 'ss', 'tcpdump'] },
  ],
  'unix': [
    { subChannel: 'fundamentals', tags: ['posix', 'signals', 'pipes', 'sockets'] },
    { subChannel: 'commands', tags: ['find', 'xargs', 'cut', 'sort'] },
    { subChannel: 'system-programming', tags: ['fork', 'exec', 'ipc', 'shared-memory'] },
  ],
  'ios': [
    { subChannel: 'swift', tags: ['optionals', 'protocols', 'generics'] },
    { subChannel: 'uikit', tags: ['autolayout', 'tableview', 'collectionview'] },
    { subChannel: 'swiftui', tags: ['state', 'binding', 'environment'] },
    { subChannel: 'architecture', tags: ['mvvm', 'viper', 'clean-architecture'] },
  ],
  'android': [
    { subChannel: 'kotlin', tags: ['coroutines', 'flow', 'sealed-classes'] },
    { subChannel: 'jetpack-compose', tags: ['composables', 'state', 'navigation'] },
    { subChannel: 'architecture', tags: ['mvvm', 'mvi', 'clean-architecture'] },
    { subChannel: 'lifecycle', tags: ['viewmodel', 'livedata', 'savedstate'] },
  ],
  'react-native': [
    { subChannel: 'components', tags: ['flatlist', 'navigation', 'gestures'] },
    { subChannel: 'native-modules', tags: ['turbo-modules', 'fabric', 'jsi'] },
    { subChannel: 'performance', tags: ['hermes', 'reanimated', 'profiling'] },
    { subChannel: 'architecture', tags: ['new-architecture', 'bridgeless'] },
  ],
  'testing': [
    { subChannel: 'unit-testing', tags: ['jest', 'mocha', 'pytest', 'junit'] },
    { subChannel: 'integration-testing', tags: ['api-testing', 'database-testing', 'mocking'] },
    { subChannel: 'tdd', tags: ['test-driven', 'red-green-refactor', 'test-first'] },
    { subChannel: 'test-strategies', tags: ['test-pyramid', 'coverage', 'mutation-testing'] },
  ],
  'e2e-testing': [
    { subChannel: 'playwright', tags: ['playwright', 'browser-automation', 'selectors'] },
    { subChannel: 'cypress', tags: ['cypress', 'component-testing', 'fixtures'] },
    { subChannel: 'selenium', tags: ['selenium', 'webdriver', 'grid'] },
    { subChannel: 'visual-testing', tags: ['screenshot', 'visual-regression', 'percy'] },
  ],
  'api-testing': [
    { subChannel: 'rest-testing', tags: ['postman', 'rest-assured', 'supertest'] },
    { subChannel: 'contract-testing', tags: ['pact', 'consumer-driven', 'schema-validation'] },
    { subChannel: 'graphql-testing', tags: ['graphql', 'apollo', 'introspection'] },
    { subChannel: 'mocking', tags: ['wiremock', 'mockserver', 'msw'] },
  ],
  'performance-testing': [
    { subChannel: 'load-testing', tags: ['jmeter', 'k6', 'gatling', 'locust'] },
    { subChannel: 'stress-testing', tags: ['spike-testing', 'soak-testing', 'breakpoint'] },
    { subChannel: 'profiling', tags: ['cpu-profiling', 'memory-profiling', 'flame-graphs'] },
    { subChannel: 'benchmarking', tags: ['latency', 'throughput', 'percentiles'] },
  ],
  'engineering-management': [
    { subChannel: 'team-leadership', tags: ['delegation', 'mentoring', 'growth'] },
    { subChannel: 'one-on-ones', tags: ['feedback', 'career-development', 'coaching'] },
    { subChannel: 'hiring', tags: ['sourcing', 'interviewing', 'onboarding'] },
    { subChannel: 'project-management', tags: ['agile', 'scrum', 'kanban', 'okrs'] },
  ],
  'behavioral': [
    { subChannel: 'star-method', tags: ['situation', 'task', 'action', 'result'] },
    { subChannel: 'leadership-principles', tags: ['ownership', 'bias-for-action', 'customer-obsession'] },
    { subChannel: 'soft-skills', tags: ['communication', 'collaboration', 'influence'] },
    { subChannel: 'conflict-resolution', tags: ['negotiation', 'mediation', 'feedback'] },
  ],
};

// Helper functions
export function getAllChannels() {
  return Object.keys(CHANNEL_CONFIGS);
}

export function getSubChannels(channel) {
  return CHANNEL_CONFIGS[channel]?.map(c => c.subChannel) || [];
}

export function getRandomSubChannel(channel) {
  const configs = CHANNEL_CONFIGS[channel];
  if (!configs || configs.length === 0) {
    return { subChannel: 'general', tags: [channel] };
  }
  return configs[Math.floor(Math.random() * configs.length)];
}

export function isValidChannel(channel) {
  return channel in CHANNEL_CONFIGS;
}

export function isValidSubChannel(channel, subChannel) {
  return getSubChannels(channel).includes(subChannel) || subChannel === 'general';
}
