/**
 * LinkedIn Story Generation Template
 * Creates engaging story-style posts for LinkedIn with emoji-based visuals
 */

// Simple schema format expected by validator: { fieldName: 'type' }
export const schema = {
  story: 'string'
};

export function build(context) {
  const { title, excerpt, channel } = context;
  
  return `Create an ENGAGING LinkedIn post for a technical blog article.

Article Title: ${title}
Topic/Channel: ${channel || 'tech'}
Summary: ${excerpt || 'Technical interview preparation content'}

FORMAT REQUIREMENTS:
1. Start with a HOOK (surprising stat, "Picture this:" scenario, or provocative question)
2. Add 2-3 sentences explaining the key insight with real impact
3. Use an EMOJI FLOW to visualize the concept (see examples below)
4. End with "Read the full breakdown 👇"

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

RULES:
- Total length: 400-600 characters
- Use 3-5 emojis strategically (🚀 💡 ⚡ 🔥 💰 🎯 ✅ ❌ 📈 🔧)
- NO hashtags (added separately)
- NO links (added separately)
- NO ASCII box diagrams (they break on LinkedIn)
- Make it feel like a senior engineer sharing a war story
- The emoji flow should visualize the KEY transformation or process

Output JSON format:
{
  "story": "Your engaging story with emoji flow here..."
}

Output ONLY valid JSON.`;
}

export default { schema, build };
