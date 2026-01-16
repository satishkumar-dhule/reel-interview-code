/**
 * LinkedIn Story Generation Template
 * Creates engaging story-style posts for LinkedIn with proper formatting
 * Prioritizes recent technology updates, tools, and patterns
 */

// Simple schema format expected by validator: { fieldName: 'type' }
export const schema = {
  story: 'string'
};

// Recent tech trends to prioritize (updated regularly)
const RECENT_TECH_TRENDS = [
  // AI/ML (2024-2025)
  { keyword: 'ai', trend: 'AI agents, RAG patterns, LangGraph, Claude 3.5, GPT-4o, Gemini 2.0' },
  { keyword: 'llm', trend: 'Fine-tuning, prompt engineering, AI coding assistants, Cursor, Copilot' },
  { keyword: 'ml', trend: 'MLOps maturity, feature stores, model monitoring, LLMOps' },
  
  // Cloud & Infrastructure
  { keyword: 'kubernetes', trend: 'Gateway API GA, Karpenter, cilium, eBPF networking' },
  { keyword: 'aws', trend: 'Bedrock agents, Aurora Limitless, EKS Auto Mode' },
  { keyword: 'terraform', trend: 'OpenTofu adoption, Terraform stacks, CDK for Terraform' },
  { keyword: 'docker', trend: 'Docker Build Cloud, Wasm support, Docker Scout' },
  
  // Languages & Frameworks
  { keyword: 'react', trend: 'React 19, Server Components, React Compiler' },
  { keyword: 'node', trend: 'Node.js 22, native TypeScript support, built-in test runner' },
  { keyword: 'python', trend: 'Python 3.13, free-threading, JIT compiler' },
  { keyword: 'rust', trend: 'Rust in Linux kernel, async improvements, embedded growth' },
  { keyword: 'typescript', trend: 'TypeScript 5.5+, isolated declarations, config improvements' },
  
  // Databases
  { keyword: 'database', trend: 'Vector databases, pgvector, Turso, PlanetScale, Neon' },
  { keyword: 'postgres', trend: 'PostgreSQL 17, pgvector for AI, logical replication improvements' },
  
  // DevOps & Platform
  { keyword: 'devops', trend: 'Platform engineering, Internal Developer Platforms, Backstage' },
  { keyword: 'observability', trend: 'OpenTelemetry maturity, eBPF tracing, AI-powered observability' },
  { keyword: 'security', trend: 'Zero trust, SBOM requirements, supply chain security' },
  
  // Architecture
  { keyword: 'microservice', trend: 'Service mesh simplification, modular monoliths comeback' },
  { keyword: 'system-design', trend: 'Event-driven architecture, CQRS patterns, edge computing' },
  { keyword: 'api', trend: 'GraphQL federation, tRPC, API-first design' }
];

// Diverse hook patterns to avoid repetition
const HOOK_PATTERNS = [
  'question', // Start with a thought-provoking question
  'statistic', // Lead with a surprising number or fact
  'contrarian', // Challenge common assumptions
  'story', // Brief narrative (not always 2am!)
  'problem', // State a common pain point
  'insight', // Share a key realization
  'trend', // Highlight what's changing in 2025
  'mistake' // Common error engineers make
];

export function build(context) {
  const { title, excerpt, channel, tags: rawTags } = context;
  
  // Parse tags if it's a string
  let tags = rawTags;
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags);
    } catch {
      tags = tags.includes(',') ? tags.split(',').map(t => t.trim()) : [tags];
    }
  }
  tags = Array.isArray(tags) ? tags : [];
  
  // Find relevant recent trends
  const contentText = `${title} ${excerpt} ${channel} ${tags.join(' ')}`.toLowerCase();
  const relevantTrends = RECENT_TECH_TRENDS.filter(t => contentText.includes(t.keyword));
  
  const trendContext = relevantTrends.length > 0 
    ? `\nRECENT TECH CONTEXT (mention if relevant):
${relevantTrends.map(t => `- ${t.keyword.toUpperCase()}: ${t.trend}`).join('\n')}`
    : '';

  // Select a random hook pattern to ensure variety
  const hookPattern = HOOK_PATTERNS[Math.floor(Math.random() * HOOK_PATTERNS.length)];

  return `Create an ENGAGING and INFORMATIVE LinkedIn post for a technical blog article.

CRITICAL: This post should be EDUCATIONAL and include enough technical detail that someone unfamiliar with the topic can understand what it's about and why it matters.

Article Title: ${title}
Topic/Channel: ${channel || 'tech'}
Summary: ${excerpt || 'Technical interview preparation content'}
${trendContext}

HOOK PATTERN FOR THIS POST: ${hookPattern}
Use this pattern to create a UNIQUE opening that fits the content.

═══════════════════════════════════════════════════════════════
CRITICAL: LINKEDIN FORMATTING RULES
═══════════════════════════════════════════════════════════════

LinkedIn renders posts as plain text. To create visual structure:

1. USE BLANK LINES to separate paragraphs (\\n\\n)
2. USE BULLET POINTS with emojis at line start
3. KEEP PARAGRAPHS SHORT (2-3 sentences max)
4. USE LINE BREAKS between distinct ideas

═══════════════════════════════════════════════════════════════
REQUIRED POST STRUCTURE (follow this EXACTLY)
═══════════════════════════════════════════════════════════════

SECTION 1 - HOOK (1-2 lines)
Create an attention-grabbing hook using the "${hookPattern}" pattern:

• question: "Why do 90% of engineers get X wrong?"
• statistic: "73% of production outages trace back to this one thing."
• contrarian: "Everyone optimizes for X. The real bottleneck is Y."
• story: "Last Tuesday, our API went down. The root cause surprised everyone."
• problem: "You've seen this error message. Here's what it really means."
• insight: "After 50 interviews, I noticed a pattern most engineers miss."
• trend: "In 2025, the way we approach X is fundamentally different."
• mistake: "I spent 3 days debugging. The fix was one line."

SECTION 2 - TECHNICAL CONTEXT (3-4 lines, separated by blank line)
Explain the WHAT and WHY with enough detail for newcomers:
- What is the technology/concept?
- Why does it matter?
- What problem does it solve?
- Include 1-2 specific technical terms with brief context

SECTION 3 - KEY INSIGHTS (4-5 bullet points)
Use emoji bullets with CONCRETE, ACTIONABLE points:
🔍 Specific technical insight with context
⚡ Performance/efficiency gain with numbers if possible
🎯 Best practice or pattern to follow
🛡️ Common pitfall to avoid
💡 Practical takeaway or next step

SECTION 4 - TAKEAWAY (1-2 lines)
End with actionable insight that reinforces learning value.

═══════════════════════════════════════════════════════════════
EXAMPLE OUTPUT FORMAT (using "statistic" hook)
═══════════════════════════════════════════════════════════════

67% of Kubernetes clusters are misconfigured in production.

The issue? Most teams focus on deployment but overlook resource limits and requests. These settings control how the scheduler allocates pods across nodes. Without proper configuration, you get cascading failures during traffic spikes.

Here's what actually matters:

🔍 Requests define minimum guaranteed resources - set too low and pods get evicted
⚡ Limits cap maximum usage - set too high and you waste money, too low and you throttle
🎯 Use Vertical Pod Autoscaler to discover optimal values from real usage data
🛡️ Always set memory limits - OOM kills are harder to debug than CPU throttling
💡 Start with conservative requests, then tune based on P95 metrics

Proper resource management isn't optional - it's the difference between stable and chaotic deployments.

═══════════════════════════════════════════════════════════════
EXAMPLE OUTPUT FORMAT (using "question" hook)
═══════════════════════════════════════════════════════════════

Why do senior engineers always talk about "idempotency"?

Because distributed systems fail in unpredictable ways. Idempotency means an operation produces the same result whether you run it once or multiple times. This is critical when network requests can timeout, retry, or duplicate.

Key principles:

🔍 Use unique request IDs to detect and skip duplicate operations
⚡ Design APIs where POST /orders with same ID returns existing order, not error
🎯 Database upserts (INSERT ... ON CONFLICT UPDATE) are your friend
🛡️ Avoid incrementing counters directly - use SET operations instead
💡 Test retry scenarios explicitly - they will happen in production

The best systems assume failure and handle it gracefully.

═══════════════════════════════════════════════════════════════
FORMATTING RULES
═══════════════════════════════════════════════════════════════

✅ DO:
- Use \\n\\n (double newline) between paragraphs
- Start bullet points with emoji + space
- Keep each bullet on its own line
- Include specific technical terms with brief explanations
- Use 5-6 emojis total (🔍 ⚡ 🎯 🛡️ 💡 🚀 ✅ ❌ 📈)
- Make it educational - someone new should learn something concrete
- Total length: 600-900 characters

❌ DON'T:
- Write wall-of-text paragraphs
- Use ASCII art or box characters
- Include hashtags (added separately)
- Include URLs (added separately)
- Use markdown formatting (**, ##, etc.)
- Assume reader knows all the jargon - explain briefly
- Repeat the same hook pattern (it was 2am, etc.)

═══════════════════════════════════════════════════════════════
OUTPUT
═══════════════════════════════════════════════════════════════

Output ONLY valid JSON with the story field containing properly formatted text:

{
  "story": "Hook line here.\\n\\nTechnical context with explanations here.\\n\\nKey insights:\\n\\n🔍 Point one with specifics\\n⚡ Point two with context\\n🎯 Point three with actionable advice\\n🛡️ Point four avoiding pitfalls\\n💡 Point five with takeaway\\n\\nFinal insight that reinforces learning."
}

IMPORTANT: 
- Use \\n for line breaks and \\n\\n for paragraph breaks in the JSON string
- Include enough technical detail that a newcomer can understand the concept
- Vary your hook - don't always use story-based openings
- Make it educational AND engaging`;
}

export default { schema, build };
