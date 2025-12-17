import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

// Load questions from JSON files
const questionsPath = path.join(process.cwd(), "client/src/lib/questions");
const questionsByChannel: Record<string, any[]> = {};

// Load changelog for RSS feed
function loadChangelog() {
  try {
    const changelogPath = path.join(questionsPath, "changelog.json");
    return JSON.parse(fs.readFileSync(changelogPath, "utf-8"));
  } catch {
    return { entries: [], stats: {} };
  }
}

// Load all questions for RSS
function loadAllQuestions() {
  try {
    const allQuestionsPath = path.join(questionsPath, "all-questions.json");
    const data = JSON.parse(fs.readFileSync(allQuestionsPath, "utf-8"));
    return data.questions || {};
  } catch {
    return {};
  }
}

// Generate RSS XML
function generateRssFeed(baseUrl: string) {
  const changelog = loadChangelog();
  const allQuestions = loadAllQuestions();
  
  const escapeXml = (str: string) => 
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&apos;');

  const items = changelog.entries.slice(0, 20).map((entry: any) => {
    const pubDate = new Date(entry.date).toUTCString();
    const questionIds = entry.details?.questionIds || [];
    
    // Build description with question details
    let description = escapeXml(entry.description);
    if (questionIds.length > 0) {
      const questionDetails = questionIds
        .slice(0, 5)
        .map((id: string) => {
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
    const channelTags = channels.slice(0, 5).map((c: string) => 
      `<category>${escapeXml(c)}</category>`
    ).join('\n      ');

    return `
    <item>
      <title>${escapeXml(entry.title)}</title>
      <description><![CDATA[${description}]]></description>
      <pubDate>${pubDate}</pubDate>
      <guid isPermaLink="false">${entry.date}-${entry.type}</guid>
      <link>${baseUrl}/whats-new</link>
      ${channelTags}
    </item>`;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Code Reels - Interview Questions</title>
    <description>Daily AI-generated technical interview questions for system design, algorithms, frontend, backend, DevOps, and more.</description>
    <link>${baseUrl}</link>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>Code Reels</title>
      <link>${baseUrl}</link>
    </image>
    ${items}
  </channel>
</rss>`;
}

// Load all channel JSON files
const channelFiles = ["algorithms", "database", "devops", "frontend", "sre", "system-design"];
for (const channel of channelFiles) {
  try {
    const filePath = path.join(questionsPath, `${channel}.json`);
    const data = fs.readFileSync(filePath, "utf-8");
    questionsByChannel[channel] = JSON.parse(data);
  } catch (error) {
    console.error(`Failed to load ${channel}.json:`, error);
    questionsByChannel[channel] = [];
  }
}

const allQuestions = Object.values(questionsByChannel).flat();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // RSS Feed endpoint
  app.get("/rss.xml", (req, res) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.headers['x-forwarded-host'] || req.get('host');
    const baseUrl = `${protocol}://${host}`;
    
    const rssFeed = generateRssFeed(baseUrl);
    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.send(rssFeed);
  });

  // Alternate RSS path
  app.get("/feed", (req, res) => {
    res.redirect(301, '/rss.xml');
  });

  // Get all channels metadata
  app.get("/api/channels", (_req, res) => {
    const channels = Object.keys(questionsByChannel).map(channelId => ({
      id: channelId,
      questionCount: questionsByChannel[channelId].length
    }));
    res.json(channels);
  });

  // Get filtered questions list (IDs only) for a channel
  app.get("/api/questions/:channelId", (req, res) => {
    const { channelId } = req.params;
    const { subChannel, difficulty } = req.query;

    let questions = questionsByChannel[channelId] || [];

    // Filter by subchannel
    if (subChannel && subChannel !== "all") {
      questions = questions.filter((q: any) => q.subChannel === subChannel);
    }

    // Filter by difficulty
    if (difficulty && difficulty !== "all") {
      questions = questions.filter((q: any) => q.difficulty === difficulty);
    }

    // Return only IDs and basic metadata
    const questionList = questions.map((q: any) => ({
      id: q.id,
      difficulty: q.difficulty,
      subChannel: q.subChannel
    }));

    res.json(questionList);
  });

  // Get a single question by ID
  app.get("/api/question/:questionId", (req, res) => {
    const { questionId } = req.params;

    // Search through all channels
    for (const questions of Object.values(questionsByChannel)) {
      const question = questions.find((q: any) => q.id === questionId);
      if (question) {
        return res.json(question);
      }
    }

    res.status(404).json({ error: "Question not found" });
  });

  // Get channel stats
  app.get("/api/stats", (_req, res) => {
    const stats = Object.entries(questionsByChannel).map(([channelId, questions]) => {
      const beginner = questions.filter((q: any) => q.difficulty === "beginner").length;
      const intermediate = questions.filter((q: any) => q.difficulty === "intermediate").length;
      const advanced = questions.filter((q: any) => q.difficulty === "advanced").length;

      return {
        id: channelId,
        total: questions.length,
        beginner,
        intermediate,
        advanced
      };
    });

    res.json(stats);
  });

  // Get all subchannels for a channel
  app.get("/api/subchannels/:channelId", (req, res) => {
    const { channelId } = req.params;
    const questions = questionsByChannel[channelId] || [];

    const subChannelSet = new Set<string>();
    questions.forEach((q: any) => {
      if (q.subChannel) {
        subChannelSet.add(q.subChannel);
      }
    });
    const subChannels = Array.from(subChannelSet).sort();

    res.json(subChannels);
  });

  return httpServer;
}
