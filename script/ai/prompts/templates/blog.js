/**
 * Blog Article Generation Prompt Template
 * Transforms Q&A content into professional blog articles
 */

import { jsonOutputRule, buildSystemContext } from './base.js';
import config from '../../config.js';

export const schema = {
  title: "Engaging blog title (not a question)",
  introduction: "Hook paragraph that draws readers in (2-3 sentences)",
  sections: [
    {
      heading: "Section heading",
      content: "Section content in markdown"
    }
  ],
  conclusion: "Wrap-up paragraph with key takeaways",
  metaDescription: "SEO meta description (150-160 chars)"
};

export const guidelines = [
  'Transform the Q&A into a natural blog article flow',
  'Title should be engaging, not a question (e.g., "Mastering X" or "A Deep Dive into Y")',
  'Introduction should hook the reader with why this topic matters',
  'Break content into logical sections with clear headings',
  'Use conversational but professional tone',
  'Include practical examples and real-world applications',
  'Conclusion should summarize key points and encourage action',
  'Preserve all technical accuracy from the original content',
  'Keep code examples and diagrams intact',
  'Target 800-1500 words for the full article'
];

export function build(context) {
  const { question, answer, explanation, channel, difficulty, tags } = context;

  return `${buildSystemContext('blog')}

Transform this interview Q&A into a professional blog article.

ORIGINAL CONTENT:
Question: ${question}
Answer: ${answer || 'N/A'}
Explanation: ${explanation || 'N/A'}
Topic: ${channel}
Difficulty: ${difficulty}
Tags: ${(tags || []).join(', ')}

REQUIREMENTS:
${guidelines.map(g => `- ${g}`).join('\n')}

Output this exact JSON structure:
${JSON.stringify(schema, null, 2)}

${jsonOutputRule}`;
}

export default { schema, guidelines, build };
