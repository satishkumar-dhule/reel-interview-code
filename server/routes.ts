import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// LinkedIn post generator utilities
function generateLinkedInPost(question: any) {
  const lines = [];
  
  lines.push('🎯 Technical Interview Question\n');
  lines.push(`❓ ${question.question}\n`);
  
  const difficultyEmoji: Record<string, string> = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  };
  lines.push(`${difficultyEmoji[question.difficulty] || '⚪'} ${question.difficulty.toUpperCase()}\n`);
  
  lines.push(`📚 ${question.channel} / ${question.subChannel}\n`);
  lines.push(`\n💡 Quick Answer:\n${question.answer}\n`);
  
  const explanationPreview = question.explanation
    .split('\n')
    .filter((line: string) => line.trim().length > 0)
    .slice(0, 3)
    .join('\n');
  
  lines.push(`\n📖 Key Points:\n${explanationPreview}\n`);
  
  const tags = question.tags.map((t: string) => `#${t.replace(/[^a-z0-9]/gi, '')}`).join(' ');
  lines.push(`\n${tags}`);
  
  lines.push('\n\n💬 Have you encountered this in interviews? Share your approach in the comments!\n');
  lines.push('🔗 Practice more questions on Code Reels: https://code-reels.github.io/');
  
  return lines.join('');
}

function createHtmlPreview(question: any, svgDiagram?: string) {
  const post = generateLinkedInPost(question);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Post - ${question.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .post { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.6; color: #333; }
    .post-header { display: flex; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
    .post-meta { flex: 1; }
    .post-meta h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .post-meta p { font-size: 12px; color: #65676b; }
    .post-content { margin-bottom: 16px; white-space: pre-wrap; word-wrap: break-word; }
    .diagram-container { margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 8px; overflow-x: auto; }
    .diagram-container svg { max-width: 100%; height: auto; display: block; margin: 0 auto; }
    .engagement { display: flex; justify-content: space-around; padding-top: 12px; border-top: 1px solid #e5e7eb; margin-top: 16px; color: #65676b; font-size: 13px; }
    .metadata { font-size: 12px; color: #65676b; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="post">
      <div class="post-header">
        <div class="avatar">CR</div>
        <div class="post-meta">
          <h3>Code Reels</h3>
          <p>Just now • 🌐</p>
        </div>
      </div>
      <div class="post-content">${post}</div>
      ${svgDiagram ? `<div class="diagram-container">${svgDiagram}</div>` : ''}
      <div class="engagement">
        <div>👍 Like</div>
        <div>💬 Comment</div>
        <div>↗️ Share</div>
      </div>
      <div class="metadata">
        <strong>Question ID:</strong> ${question.id}<br>
        <strong>Channel:</strong> ${question.channel}/${question.subChannel}<br>
        <strong>Tags:</strong> ${question.tags.join(', ')}<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // LinkedIn post generation endpoint
  app.post("/api/linkedin-post", async (req, res) => {
    try {
      const { questionId } = req.body;
      
      if (!questionId) {
        return res.status(400).json({ error: "questionId is required" });
      }

      // In a real app, you'd fetch from database
      // For now, we'll return a mock response
      // The actual question data comes from the client
      const question = req.body.question;
      
      if (!question) {
        return res.status(400).json({ error: "question data is required" });
      }

      const text = generateLinkedInPost(question);
      const html = createHtmlPreview(question, question.svgDiagram);

      res.json({
        id: question.id,
        text,
        html,
        svg: question.svgDiagram,
        metadata: {
          channel: question.channel,
          subChannel: question.subChannel,
          difficulty: question.difficulty,
          tags: question.tags,
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Error generating LinkedIn post:", error);
      res.status(500).json({ error: "Failed to generate post" });
    }
  });

  return httpServer;
}
