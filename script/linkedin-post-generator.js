import fs from 'fs';
import { spawn } from 'child_process';
import {
  loadAllQuestions,
  writeGitHubOutput
} from './utils.js';

const POSTS_DIR = 'linkedin-posts';
const TIMEOUT_MS = 120000;

// Mermaid to SVG converter
function renderMermaidToSvg(mermaidCode) {
  return new Promise((resolve) => {
    let output = '';
    let resolved = false;

    // Use mmdc (mermaid-cli) to convert to SVG
    const proc = spawn('mmdc', ['-i', '/dev/stdin', '-o', '/dev/stdout', '-t', 'dark'], {
      timeout: TIMEOUT_MS,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        proc.kill('SIGTERM');
        resolve(null);
      }
    }, TIMEOUT_MS);

    proc.stdin.write(mermaidCode);
    proc.stdin.end();

    proc.stdout.on('data', (data) => { output += data.toString(); });

    proc.on('close', () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(output || null);
      }
    });

    proc.on('error', () => {
      clearTimeout(timeout);
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    });
  });
}

// Generate LinkedIn post content
function generateLinkedInPost(question) {
  const lines = [];
  
  // Hook/Opening
  lines.push('🎯 Technical Interview Question\n');
  
  // Question
  lines.push(`❓ ${question.question}\n`);
  
  // Difficulty badge
  const difficultyEmoji = {
    'beginner': '🟢',
    'intermediate': '🟡',
    'advanced': '🔴'
  };
  lines.push(`${difficultyEmoji[question.difficulty] || '⚪'} ${question.difficulty.toUpperCase()}\n`);
  
  // Category
  lines.push(`📚 ${question.channel} / ${question.subChannel}\n`);
  
  // Quick answer
  lines.push(`\n💡 Quick Answer:\n${question.answer}\n`);
  
  // Key points from explanation (first 2-3 sentences)
  const explanationPreview = question.explanation
    .split('\n')
    .filter(line => line.trim().length > 0)
    .slice(0, 3)
    .join('\n');
  
  lines.push(`\n📖 Key Points:\n${explanationPreview}\n`);
  
  // Tags
  const tags = question.tags.map(t => `#${t.replace(/[^a-z0-9]/gi, '')}`).join(' ');
  lines.push(`\n${tags}`);
  
  // CTA
  lines.push('\n\n💬 Have you encountered this in interviews? Share your approach in the comments!\n');
  lines.push('🔗 Practice more questions on Code Reels: https://reel-interview.github.io/');
  
  return lines.join('');
}

// Create HTML preview for LinkedIn post
function createHtmlPreview(question, svgDiagram) {
  const post = generateLinkedInPost(question);
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Post - ${question.id}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f0f2f5;
      padding: 20px;
    }
    
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    
    .post {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      line-height: 1.6;
      color: #333;
    }
    
    .post-header {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-right: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 20px;
    }
    
    .post-meta {
      flex: 1;
    }
    
    .post-meta h3 {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .post-meta p {
      font-size: 12px;
      color: #65676b;
    }
    
    .post-content {
      margin-bottom: 16px;
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    
    .post-content h2 {
      font-size: 18px;
      margin: 12px 0;
      color: #0a66c2;
    }
    
    .post-content p {
      margin: 8px 0;
    }
    
    .difficulty-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin: 8px 0;
    }
    
    .difficulty-beginner {
      background: #d4edda;
      color: #155724;
    }
    
    .difficulty-intermediate {
      background: #fff3cd;
      color: #856404;
    }
    
    .difficulty-advanced {
      background: #f8d7da;
      color: #721c24;
    }
    
    .diagram-container {
      margin: 20px 0;
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
      overflow-x: auto;
    }
    
    .diagram-container svg {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 0 auto;
    }
    
    .tags {
      margin: 12px 0;
      font-size: 13px;
    }
    
    .tag {
      color: #0a66c2;
      margin-right: 8px;
    }
    
    .engagement {
      display: flex;
      justify-content: space-around;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      margin-top: 16px;
      color: #65676b;
      font-size: 13px;
    }
    
    .engagement-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: color 0.2s;
    }
    
    .engagement-item:hover {
      color: #0a66c2;
    }
    
    .metadata {
      font-size: 12px;
      color: #65676b;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="post">
      <div class="post-header">
        <div class="avatar">CR</div>
        <div class="post-meta">
          <h3>Code Reels</h3>
          <p>2 hours ago • 🌐</p>
        </div>
      </div>
      
      <div class="post-content">
${post}
      </div>
      
      ${svgDiagram ? `<div class="diagram-container">${svgDiagram}</div>` : ''}
      
      <div class="engagement">
        <div class="engagement-item">👍 Like</div>
        <div class="engagement-item">💬 Comment</div>
        <div class="engagement-item">↗️ Share</div>
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

  return html;
}

// Create text-only post for copying
function createTextPost(question) {
  return generateLinkedInPost(question);
}

async function main() {
  console.log('=== LinkedIn Post Generator ===\n');

  const allQuestions = loadAllQuestions();
  console.log(`Loaded ${allQuestions.length} questions\n`);

  if (allQuestions.length === 0) {
    console.log('No questions found.');
    return;
  }

  // Create posts directory
  fs.mkdirSync(POSTS_DIR, { recursive: true });

  const generatedPosts = [];
  const failedPosts = [];

  // Generate posts for last 5 questions
  const recentQuestions = allQuestions.slice(-5);

  for (const question of recentQuestions) {
    console.log(`\nGenerating post for: ${question.id}`);

    try {
      // Generate text post
      const textPost = createTextPost(question);

      // Try to render diagram to SVG
      let svgDiagram = null;
      if (question.diagram) {
        console.log('  Converting diagram to SVG...');
        svgDiagram = await renderMermaidToSvg(question.diagram);
        if (svgDiagram) {
          console.log('  ✅ Diagram converted');
        } else {
          console.log('  ⚠️  Diagram conversion failed, will use text-only');
        }
      }

      // Create HTML preview
      const htmlPreview = createHtmlPreview(question, svgDiagram);

      // Save files
      const postDir = `${POSTS_DIR}/${question.id}`;
      fs.mkdirSync(postDir, { recursive: true });

      fs.writeFileSync(`${postDir}/post.txt`, textPost);
      fs.writeFileSync(`${postDir}/preview.html`, htmlPreview);

      if (svgDiagram) {
        fs.writeFileSync(`${postDir}/diagram.svg`, svgDiagram);
      }

      // Save metadata
      fs.writeFileSync(`${postDir}/metadata.json`, JSON.stringify({
        id: question.id,
        channel: question.channel,
        subChannel: question.subChannel,
        difficulty: question.difficulty,
        tags: question.tags,
        generatedAt: new Date().toISOString(),
        hasDiagram: !!svgDiagram
      }, null, 2));

      generatedPosts.push(question.id);
      console.log(`  ✅ Post generated: ${postDir}`);
    } catch (e) {
      console.log(`  ❌ Failed: ${e.message}`);
      failedPosts.push({ id: question.id, reason: e.message });
    }
  }

  // Print summary
  console.log('\n\n=== SUMMARY ===');
  console.log(`Posts Generated: ${generatedPosts.length}/${recentQuestions.length}`);
  console.log(`Posts Location: ${POSTS_DIR}/`);

  if (generatedPosts.length > 0) {
    console.log('\n✅ Generated Posts:');
    generatedPosts.forEach(id => {
      console.log(`  - ${id}`);
      console.log(`    📄 Text: ${POSTS_DIR}/${id}/post.txt`);
      console.log(`    🌐 Preview: ${POSTS_DIR}/${id}/preview.html`);
    });
  }

  if (failedPosts.length > 0) {
    console.log(`\n❌ Failed Posts: ${failedPosts.length}`);
    failedPosts.forEach(f => {
      console.log(`  - ${f.id}: ${f.reason}`);
    });
  }

  console.log('\n=== END SUMMARY ===\n');

  writeGitHubOutput({
    posts_generated: generatedPosts.length,
    posts_failed: failedPosts.length,
    posts_location: POSTS_DIR
  });
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
