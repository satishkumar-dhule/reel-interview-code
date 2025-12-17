import fs from 'fs';
import path from 'path';

const QUESTIONS_DIR = 'client/src/lib/questions';
const OUTPUT_DIR = 'client/public';
const BASE_URL = 'https://reel-interview.github.io';

// Load changelog
function loadChangelog() {
  try {
    const changelogPath = path.join(QUESTIONS_DIR, 'changelog.json');
    return JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
  } catch {
    return { entries: [], stats: {} };
  }
}

// Load all questions
function loadAllQuestions() {
  try {
    const allQuestionsPath = path.join(QUESTIONS_DIR, 'all-questions.json');
    const data = JSON.parse(fs.readFileSync(allQuestionsPath, 'utf-8'));
    return data.questions || {};
  } catch {
    return {};
  }
}

// Escape XML special characters
function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS XML
function generateRssFeed() {
  const changelog = loadChangelog();
  const allQuestions = loadAllQuestions();

  const items = changelog.entries.slice(0, 20).map((entry) => {
    const pubDate = new Date(entry.date).toUTCString();
    const questionIds = entry.details?.questionIds || [];

    // Build description with question details
    let description = escapeXml(entry.description);
    if (questionIds.length > 0) {
      const questionDetails = questionIds
        .slice(0, 5)
        .map((id) => {
          const q = allQuestions[id];
          return q ? `• ${escapeXml(q.question)}` : null;
        })
        .filter(Boolean)
        .join('\n');

      if (questionDetails) {
        description += `\n\nSample questions:\n${questionDetails}`;
      }
    }

    const channels = entry.details?.channels || [];
    const channelTags = channels
      .slice(0, 5)
      .map((c) => `      <category>${escapeXml(c)}</category>`)
      .join('\n');

    return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${entry.date}-${entry.type}</guid>
      <link>${BASE_URL}/whats-new</link>
${channelTags}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Code Reels - Interview Questions</title>
    <description>Daily AI-generated technical interview questions for system design, algorithms, frontend, backend, DevOps, and more.</description>
    <link>${BASE_URL}</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${BASE_URL}/favicon.svg</url>
      <title>Code Reels</title>
      <link>${BASE_URL}</link>
    </image>
    ${items}
  </channel>
</rss>`;
}

// Main
function main() {
  console.log('=== Generating RSS Feed ===\n');

  const rssFeed = generateRssFeed();

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write RSS file
  const outputPath = path.join(OUTPUT_DIR, 'rss.xml');
  fs.writeFileSync(outputPath, rssFeed);

  console.log(`✅ RSS feed generated: ${outputPath}`);
  console.log(`   Base URL: ${BASE_URL}`);
}

main();
