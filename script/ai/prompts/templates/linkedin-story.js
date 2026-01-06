/**
 * LinkedIn Story Generation Template
 * Creates engaging story-style posts for LinkedIn with emoji-based visuals
 */

// Simple schema format expected by validator: { fieldName: 'type' }
export const schema = {
  story: 'string'
};

// Dynamic hook starters - rotated based on content type
const HOOK_PATTERNS = [
  // Question hooks
  'Ever wondered why {topic}?',
  'What if I told you {insight}?',
  'Why do top engineers {action}?',
  
  // Stat/number hooks
  '{percentage}% of {subject} fail because of this one thing.',
  'This single change reduced {metric} by {number}%.',
  '{company} saved ${amount} by doing this differently.',
  
  // Story hooks
  'It was 3am when the pager went off...',
  'The deploy looked fine. Then everything broke.',
  'A senior engineer once told me: "{quote}"',
  
  // Contrarian hooks
  'Everyone says {common_belief}. They\'re wrong.',
  'Stop doing {bad_practice}. Here\'s why.',
  'The "best practice" that\'s actually hurting you.',
  
  // Curiosity hooks
  'The hidden cost of {topic} nobody talks about.',
  'What {company} learned the hard way about {topic}.',
  'The counterintuitive truth about {topic}.',
  
  // Direct value hooks
  'How to {benefit} in {timeframe}.',
  '{number} lessons from debugging {topic} at scale.',
  'The {topic} playbook top teams use.'
];

export function build(context) {
  const { title, excerpt, channel } = context;
  
  return `Create an ENGAGING LinkedIn post for a technical blog article.

Article Title: ${title}
Topic/Channel: ${channel || 'tech'}
Summary: ${excerpt || 'Technical interview preparation content'}

HOOK VARIETY - Use ONE of these patterns (DO NOT always use "Picture this"):
${HOOK_PATTERNS.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Choose the hook pattern that BEST fits the article content. Vary your approach!

FORMAT REQUIREMENTS:
1. Start with a HOOK using one of the patterns above (NOT "Picture this" every time!)
2. Add 2-3 sentences explaining the key insight with real impact
3. Use an EMOJI FLOW to visualize the concept (see examples below)
4. End with a curiosity gap like "The full breakdown reveals..." or "Read on to see how..."

EMOJI FLOW EXAMPLES (use these patterns, they render well on LinkedIn):

Before → After pattern:
❌ Old way: Manual → Slow → Error-prone
✅ New way: Automated → Fast → Reliable

Flow pattern:
📥 Input → ⚙️ Process → 📤 Output → ✅ Result

Problem → Solution pattern:
🔥 Problem → 💡 Solution → 🚀 Impact

Numbered steps:
1️⃣ Detect → 2️⃣ Isolate → 3️⃣ Fix → 4️⃣ Deploy

Comparison pattern:
Junior: 🐢 Debug for hours
Senior: 🚀 Fix in minutes

RULES:
- Total length: 400-600 characters
- Use 3-5 emojis strategically (🚀 💡 ⚡ 🔥 💰 🎯 ✅ ❌ 📈 🔧)
- NO hashtags (added separately)
- NO links (added separately)
- NO ASCII box diagrams (they break on LinkedIn)
- Make it feel like a senior engineer sharing insider knowledge
- The emoji flow should visualize the KEY transformation or process
- VARY your hooks - don't start every post the same way!

HOOK SELECTION GUIDE:
- For incident/outage stories → Use story hooks ("It was 3am...")
- For performance improvements → Use stat hooks ("Reduced latency by 90%...")
- For best practices → Use contrarian hooks ("Stop doing X...")
- For tutorials/how-tos → Use direct value hooks ("How to...")
- For architecture topics → Use curiosity hooks ("The hidden cost of...")

Output JSON format:
{
  "story": "Your engaging story with emoji flow here..."
}

Output ONLY valid JSON.`;
}

export default { schema, build };
