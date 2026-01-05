/**
 * LinkedIn Story Generation Template
 * Creates engaging story-style posts for LinkedIn with ASCII diagrams
 */

// Simple schema format expected by validator: { fieldName: 'type' }
export const schema = {
  story: 'string'
};

export function build(context) {
  const { title, excerpt, channel, tags } = context;
  
  return `Create an ENGAGING LinkedIn post for a technical blog article with a simple ASCII diagram.

Article Title: ${title}
Topic/Channel: ${channel || 'tech'}
Summary: ${excerpt || 'Technical interview preparation content'}

FORMAT REQUIREMENTS:
1. Start with a HOOK (surprising stat, question, or "Picture this:" scenario)
2. Add 1-2 sentences explaining the key insight
3. Include a SIMPLE ASCII diagram showing the concept (3-4 lines max)
4. End with "Read the full breakdown 👇"

ASCII DIAGRAM EXAMPLES:
┌─────────┐    ┌─────────┐    ┌─────────┐
│ Problem │ -> │Solution │ -> │ Result  │
└─────────┘    └─────────┘    └─────────┘

Or simpler:
Before: ❌ Slow -> Flaky -> Broken
After:  ✅ Fast -> Stable -> Reliable

Or flow:
Input → Process → Output
  ↓        ↓        ↓
Data    Transform  Result

RULES:
- Total length: 500-700 characters
- Use 2-3 emojis strategically (🚀 💡 ⚡ 🔥 💰 🎯)
- NO hashtags (added separately)
- NO links (added separately)
- Make it feel like a senior engineer sharing a war story
- The diagram should visualize the KEY concept

Output JSON format:
{
  "story": "Your engaging story with ASCII diagram here..."
}

Output ONLY valid JSON.`;
}

export default { schema, build };
