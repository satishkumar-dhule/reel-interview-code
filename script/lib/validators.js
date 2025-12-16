// Centralized validation utilities for all bots
// Uses OpenCode AI for intelligent verification, not just static checks
import https from 'https';
import { runWithRetries, parseJson } from '../utils.js';

// ============================================
// YOUTUBE VIDEO VALIDATION
// ============================================

const BLOCKED_VIDEO_IDS = [
  'dQw4w9WgXcQ', 'oHg5SJYRHA0', 'xvFZjo5PgG0', 'DLzxrzFCyOs',
  'kJQP7kiw5Fk', '9bZkp7q19f0', 'jNQXAC9IVRw',
  'AAAAAAAAAA', 'BBBBBBBBBBB', 'CCCCCCCCCCC',
  'xxxxxxxxxxx', 'yyyyyyyyyyy', 'zzzzzzzzzzz',
  '12345678901', 'abcdefghijk',
];

const BLOCKED_TITLE_PATTERNS = [
  /official\s*(music\s*)?video/i, /\(official\)/i, /music\s*video/i,
  /lyric\s*video/i, /lyrics/i, /ft\.|feat\./i, /rick\s*astley/i,
  /never\s*gonna\s*give/i, /despacito/i, /gangnam/i, /baby\s*shark/i, /vevo$/i,
];

export function extractYouTubeVideoId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function validateYouTubeVideo(url) {
  const videoId = extractYouTubeVideoId(url);
  if (!videoId) return { valid: false, reason: 'Invalid URL format' };
  if (BLOCKED_VIDEO_IDS.includes(videoId)) return { valid: false, reason: 'Blocked video' };
  
  return new Promise((resolve) => {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const req = https.get(oembedUrl, { timeout: 5000 }, (res) => {
      if (res.statusCode === 200) {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const info = JSON.parse(data);
            resolve({ valid: true, videoId, title: info.title, author: info.author_name });
          } catch { resolve({ valid: true, videoId }); }
        });
      } else {
        resolve({ valid: false, reason: res.statusCode === 404 ? 'Not found' : `HTTP ${res.statusCode}` });
      }
    });
    req.on('error', () => resolve({ valid: false, reason: 'Network error' }));
    req.on('timeout', () => { req.destroy(); resolve({ valid: false, reason: 'Timeout' }); });
  });
}

export function isVideoTitleRelevant(title) {
  if (!title) return true;
  return !BLOCKED_TITLE_PATTERNS.some(p => p.test(title));
}

export async function validateYouTubeVideos(videos) {
  if (!videos) return { shortVideo: null, longVideo: null };
  const result = { shortVideo: null, longVideo: null };
  
  for (const type of ['shortVideo', 'longVideo']) {
    if (videos[type]) {
      const validation = await validateYouTubeVideo(videos[type]);
      if (validation.valid && isVideoTitleRelevant(validation.title)) {
        result[type] = videos[type];
        console.log(`  ✓ ${type} valid: ${validation.title || videos[type]}`);
      } else {
        console.log(`  ✗ ${type} invalid: ${validation.reason || 'Non-educational'}`);
      }
    }
  }
  return result;
}

// AI-powered verification: Check if video is actually relevant to the question
export async function verifyVideoRelevanceWithAI(videoTitle, videoAuthor, question) {
  if (!videoTitle || !question) return { relevant: false, reason: 'Missing data' };
  
  const prompt = `Verify if this YouTube video is relevant to the interview question.

Video Title: "${videoTitle}"
Video Author: "${videoAuthor || 'Unknown'}"
Interview Question: "${question}"

Analyze:
1. Does the video topic match the question subject?
2. Is this an educational/tutorial video (not music, entertainment, meme)?
3. Would watching this video help someone answer the interview question?

Return JSON:
{
  "relevant": true/false,
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return { relevant: false, reason: 'AI verification failed' };
  
  const data = parseJson(response);
  if (!data) return { relevant: false, reason: 'Failed to parse AI response' };
  
  return {
    relevant: data.relevant === true && (data.confidence || 0) >= 0.6,
    confidence: data.confidence || 0,
    reason: data.reason || 'Unknown'
  };
}

// Full video validation with AI relevance check
export async function validateVideoWithAI(url, questionText) {
  // First do static validation (exists, not blocked)
  const staticCheck = await validateYouTubeVideo(url);
  if (!staticCheck.valid) {
    return { valid: false, reason: staticCheck.reason };
  }
  
  // Check title patterns
  if (!isVideoTitleRelevant(staticCheck.title)) {
    return { valid: false, reason: 'Non-educational content detected' };
  }
  
  // AI verification for relevance
  console.log(`  🤖 AI verifying relevance: "${staticCheck.title?.substring(0, 50)}..."`);
  const aiCheck = await verifyVideoRelevanceWithAI(staticCheck.title, staticCheck.author, questionText);
  
  if (!aiCheck.relevant) {
    console.log(`  ✗ AI rejected: ${aiCheck.reason}`);
    return { valid: false, reason: `AI: ${aiCheck.reason}` };
  }
  
  console.log(`  ✓ AI approved (${Math.round(aiCheck.confidence * 100)}% confidence)`);
  return { 
    valid: true, 
    videoId: staticCheck.videoId,
    title: staticCheck.title,
    author: staticCheck.author,
    aiConfidence: aiCheck.confidence
  };
}

// ============================================
// MERMAID DIAGRAM VALIDATION
// ============================================

const VALID_DIAGRAM_TYPES = [
  /^(graph|flowchart)\s+(TD|TB|BT|RL|LR)/i,
  /^sequenceDiagram/i, /^classDiagram/i, /^stateDiagram/i,
  /^erDiagram/i, /^gantt/i, /^pie/i, /^mindmap/i
];

export function isValidMermaidSyntax(diagram) {
  if (!diagram || diagram.length < 20) return false;
  return VALID_DIAGRAM_TYPES.some(p => p.test(diagram.trim()));
}

export function getDiagramQuality(diagram) {
  if (!diagram) return { valid: false, reason: 'missing' };
  if (!isValidMermaidSyntax(diagram)) return { valid: false, reason: 'invalid_syntax' };
  
  const nodeCount = (diagram.match(/\[.*?\]|\(.*?\)|{.*?}|>.*?]/g) || []).length;
  if (nodeCount < 3) return { valid: false, reason: 'too_simple' };
  if (diagram.includes('Concept') && diagram.includes('Implementation') && nodeCount <= 3) {
    return { valid: false, reason: 'placeholder' };
  }
  return { valid: true, nodeCount };
}

// AI-powered verification: Check if diagram actually represents the concept correctly
export async function verifyDiagramWithAI(diagram, question, answer) {
  if (!diagram || !question) return { valid: false, reason: 'Missing data' };
  
  const prompt = `Verify if this Mermaid diagram correctly represents the interview question concept.

Question: "${question}"
Answer Summary: "${(answer || '').substring(0, 300)}"

Diagram:
\`\`\`mermaid
${diagram}
\`\`\`

Analyze:
1. Does the diagram accurately represent the concept in the question?
2. Are the nodes and relationships meaningful (not generic placeholders)?
3. Would this diagram help someone understand the answer?
4. Is the diagram technically accurate for this topic?

Return JSON:
{
  "valid": true/false,
  "accuracy": 0.0-1.0,
  "issues": ["list of issues if any"],
  "reason": "brief explanation"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return { valid: false, reason: 'AI verification failed' };
  
  const data = parseJson(response);
  if (!data) return { valid: false, reason: 'Failed to parse AI response' };
  
  const isValid = data.valid === true && (data.accuracy || 0) >= 0.6;
  
  return {
    valid: isValid,
    accuracy: data.accuracy || 0,
    issues: data.issues || [],
    reason: data.reason || 'Unknown'
  };
}

// ============================================
// COMPANY VALIDATION
// ============================================

export const KNOWN_COMPANIES = new Set([
  'Google', 'Amazon', 'Meta', 'Microsoft', 'Apple', 'Netflix', 'Uber', 'Airbnb',
  'LinkedIn', 'Twitter', 'Stripe', 'Salesforce', 'Adobe', 'Oracle', 'IBM',
  'Spotify', 'Snap', 'Pinterest', 'Dropbox', 'Slack', 'Zoom', 'Shopify',
  'Square', 'PayPal', 'Intuit', 'VMware', 'Cisco', 'Intel', 'AMD', 'NVIDIA',
  'Tesla', 'SpaceX', 'Palantir', 'Databricks', 'Snowflake', 'MongoDB',
  'Coinbase', 'Robinhood', 'DoorDash', 'Instacart', 'Lyft', 'Reddit',
  'TikTok', 'ByteDance', 'Alibaba', 'Tencent', 'Baidu', 'Samsung',
  'Goldman Sachs', 'Morgan Stanley', 'JPMorgan', 'Bloomberg', 'Citadel',
  'Two Sigma', 'Jane Street', 'DE Shaw', 'Bridgewater', 'Visa', 'Mastercard',
  'OpenAI', 'Anthropic', 'Figma', 'Notion', 'Canva', 'Atlassian', 'ServiceNow',
  'Workday', 'Splunk', 'Elastic', 'HashiCorp', 'Confluent', 'Cloudflare',
  'Twilio', 'Okta', 'CrowdStrike', 'Datadog', 'Palo Alto Networks'
]);

const COMPANY_ALIASES = {
  'facebook': 'Meta', 'fb': 'Meta', 'aws': 'Amazon', 'msft': 'Microsoft',
  'goog': 'Google', 'alphabet': 'Google', 'x': 'Twitter', 'x.com': 'Twitter',
  'openai': 'OpenAI', 'github': 'GitHub',
};

export function normalizeCompanies(companies) {
  if (!companies || !Array.isArray(companies)) return [];
  const normalized = new Set();
  
  companies.forEach(company => {
    if (!company || typeof company !== 'string') return;
    const trimmed = company.trim();
    const lower = trimmed.toLowerCase();
    
    if (COMPANY_ALIASES[lower]) { normalized.add(COMPANY_ALIASES[lower]); return; }
    
    for (const known of KNOWN_COMPANIES) {
      if (known.toLowerCase() === lower) { normalized.add(known); return; }
    }
    
    const capitalized = trimmed.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    if (capitalized.length >= 2 && /^[A-Za-z0-9\s&.-]+$/.test(capitalized)) {
      normalized.add(capitalized);
    }
  });
  
  return Array.from(normalized).sort();
}

export function validateCompanyData(companies, minRequired = 3) {
  const valid = normalizeCompanies(companies);
  if (valid.length === 0) return { valid: false, reason: 'missing' };
  if (valid.length < minRequired) return { valid: false, reason: 'insufficient', count: valid.length };
  return { valid: true, count: valid.length };
}

// AI-powered verification: Check if companies actually ask this type of question
export async function verifyCompaniesWithAI(companies, question, difficulty) {
  if (!companies || companies.length === 0 || !question) {
    return { valid: false, reason: 'Missing data' };
  }
  
  const prompt = `Verify if these companies are known to ask this type of interview question.

Question: "${question}"
Difficulty: ${difficulty || 'intermediate'}
Companies claimed: ${companies.join(', ')}

Based on your knowledge of:
- Glassdoor interview reports
- LeetCode company tags
- Known interview patterns for each company
- Company engineering blog posts about hiring

For each company, assess if they would realistically ask this type of question.

Return JSON:
{
  "verified": ["list of companies that likely ask this"],
  "unlikely": ["list of companies that probably don't ask this"],
  "confidence": 0.0-1.0,
  "reason": "brief explanation"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return { valid: false, reason: 'AI verification failed', verified: [] };
  
  const data = parseJson(response);
  if (!data) return { valid: false, reason: 'Failed to parse AI response', verified: [] };
  
  const verified = data.verified || [];
  const isValid = verified.length >= 2 && (data.confidence || 0) >= 0.5;
  
  return {
    valid: isValid,
    verified: verified,
    unlikely: data.unlikely || [],
    confidence: data.confidence || 0,
    reason: data.reason || 'Unknown'
  };
}

// ============================================
// QUESTION VALIDATION
// ============================================

export function validateQuestion(data) {
  return data &&
    data.question?.length > 10 &&
    data.answer?.length > 5 &&
    data.explanation?.length > 20;
}

export function getQuestionIssues(q) {
  const issues = [];
  if (!q.answer || q.answer.length < 20) issues.push('short_answer');
  if (!q.answer || q.answer.length > 300) issues.push('long_answer');
  if (!q.explanation || q.explanation.length < 50) issues.push('short_explanation');
  if (!q.diagram || q.diagram.length < 10) issues.push('no_diagram');
  if (q.explanation?.includes('[truncated')) issues.push('truncated');
  if (!q.question.endsWith('?')) issues.push('no_question_mark');
  if (!q.sourceUrl) issues.push('no_source_url');
  if (!q.videos?.shortVideo) issues.push('no_short_video');
  if (!q.videos?.longVideo) issues.push('no_long_video');
  if (!q.companies || q.companies.length < 2) issues.push('no_companies');
  return issues;
}
