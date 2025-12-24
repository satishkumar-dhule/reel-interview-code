/**
 * Blog Generator Script
 * Generates 1 new blog post per run from interview questions dataset
 * Maintains a blog_posts table to track converted questions
 * Uses AI to transform Q&A content into proper blog articles
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';
import ai from './ai/index.js';

const OUTPUT_DIR = 'blog-output';

// Database connection
const url = process.env.TURSO_DATABASE_URL_RO || process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN_RO || process.env.TURSO_AUTH_TOKEN;
const writeUrl = process.env.TURSO_DATABASE_URL;
const writeToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error('❌ Missing TURSO_DATABASE_URL environment variable');
  process.exit(1);
}

const client = createClient({ url, authToken });
const writeClient = writeUrl ? createClient({ url: writeUrl, authToken: writeToken }) : client;

// Channel category mapping
const categoryMap = {
  'System Design': ['system-design'],
  'Algorithms & Data Structures': ['algorithms'],
  'Frontend Development': ['frontend', 'react-native'],
  'Backend Development': ['backend', 'python'],
  'Database & Storage': ['database'],
  'DevOps & Infrastructure': ['devops', 'terraform', 'kubernetes', 'aws'],
  'Site Reliability': ['sre'],
  'AI & Machine Learning': ['generative-ai', 'machine-learning', 'llm-ops', 'prompt-engineering', 'nlp', 'computer-vision'],
  'Security': ['security'],
  'Testing & QA': ['testing', 'e2e-testing', 'api-testing', 'performance-testing'],
  'Mobile Development': ['ios', 'android'],
  'Networking & Systems': ['networking', 'linux', 'unix', 'operating-systems'],
  'Leadership & Soft Skills': ['behavioral', 'engineering-management'],
  'Data Engineering': ['data-engineering'],
};

// Initialize blog_posts table
async function initBlogPostsTable() {
  console.log('📦 Ensuring blog_posts table exists...');
  await writeClient.execute(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      slug TEXT NOT NULL,
      introduction TEXT,
      sections TEXT,
      conclusion TEXT,
      meta_description TEXT,
      channel TEXT,
      difficulty TEXT,
      tags TEXT,
      diagram TEXT,
      created_at TEXT,
      published_at TEXT
    )
  `);
  await writeClient.execute(`CREATE INDEX IF NOT EXISTS idx_blog_question ON blog_posts(question_id)`);
  console.log('✅ Table ready\n');
}

// Get next question to convert (not yet in blog_posts)
async function getNextQuestionForBlog() {
  const result = await client.execute(`
    SELECT q.id, q.question, q.answer, q.explanation, q.diagram, 
           q.difficulty, q.tags, q.channel, q.sub_channel, q.companies
    FROM questions q
    LEFT JOIN blog_posts bp ON q.id = bp.question_id
    WHERE bp.id IS NULL
      AND q.explanation IS NOT NULL 
      AND LENGTH(q.explanation) > 100
    ORDER BY 
      CASE q.channel
        WHEN 'system-design' THEN 1
        WHEN 'algorithms' THEN 2
        WHEN 'frontend' THEN 3
        WHEN 'backend' THEN 4
        ELSE 5
      END,
      q.difficulty,
      RANDOM()
    LIMIT 1
  `);
  
  if (result.rows.length === 0) return null;
  
  const row = result.rows[0];
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    explanation: row.explanation,
    diagram: row.diagram,
    difficulty: row.difficulty,
    tags: row.tags ? JSON.parse(row.tags) : [],
    channel: row.channel,
    subChannel: row.sub_channel,
    companies: row.companies ? JSON.parse(row.companies) : [],
  };
}

// Get all existing blog posts
async function getAllBlogPosts() {
  const result = await client.execute(`
    SELECT * FROM blog_posts ORDER BY created_at DESC
  `);
  return result.rows.map(row => ({
    id: row.question_id,
    blogTitle: row.title,
    blogSlug: row.slug,
    blogIntro: row.introduction,
    blogSections: row.sections ? JSON.parse(row.sections) : [],
    blogConclusion: row.conclusion,
    blogMeta: row.meta_description,
    channel: row.channel,
    difficulty: row.difficulty,
    tags: row.tags ? JSON.parse(row.tags) : [],
    diagram: row.diagram,
    createdAt: row.created_at
  }));
}

// Save blog post to database
async function saveBlogPost(questionId, blogContent, question) {
  const now = new Date().toISOString();
  await writeClient.execute({
    sql: `INSERT INTO blog_posts 
          (question_id, title, slug, introduction, sections, conclusion, 
           meta_description, channel, difficulty, tags, diagram, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      questionId,
      blogContent.title,
      generateSlug(blogContent.title),
      blogContent.introduction,
      JSON.stringify(blogContent.sections),
      blogContent.conclusion,
      blogContent.metaDescription,
      question.channel,
      question.difficulty,
      JSON.stringify(question.tags),
      question.diagram,
      now
    ]
  });
}

// Get blog stats
async function getBlogStats() {
  const total = await client.execute('SELECT COUNT(*) as count FROM blog_posts');
  const byChannel = await client.execute(`
    SELECT channel, COUNT(*) as count FROM blog_posts GROUP BY channel ORDER BY count DESC
  `);
  return {
    total: total.rows[0]?.count || 0,
    byChannel: byChannel.rows
  };
}

// Helper functions
function getCategoryForChannel(channel) {
  for (const [category, channels] of Object.entries(categoryMap)) {
    if (channels.includes(channel)) return category;
  }
  return 'Other';
}

function formatChannelName(channel) {
  return channel.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 80);
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)+/g, '<ul>$&</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
}

// Transform Q&A to blog using AI
async function transformToBlogArticle(question) {
  console.log('🤖 Transforming with AI...');
  
  try {
    const result = await ai.run('blog', {
      question: question.question,
      answer: question.answer,
      explanation: question.explanation,
      channel: question.channel,
      difficulty: question.difficulty,
      tags: question.tags
    });
    console.log('✅ AI transformation complete');
    return result;
  } catch (error) {
    console.log(`⚠️ AI failed: ${error.message}, using fallback`);
    // Fallback transformation
    const cleanQuestion = question.question.replace(/\?$/, '');
    return {
      title: `Understanding ${cleanQuestion.substring(0, 60)}`,
      introduction: `In this article, we'll explore ${cleanQuestion.toLowerCase()}. This is a fundamental concept in ${formatChannelName(question.channel)} that every engineer should understand.`,
      sections: [
        { heading: 'Overview', content: question.answer || '' },
        { heading: 'Deep Dive', content: question.explanation || '' }
      ],
      conclusion: `Understanding ${cleanQuestion.toLowerCase()} is essential for building robust systems. Apply these concepts in your projects and interviews.`,
      metaDescription: (question.answer || '').substring(0, 155)
    };
  }
}

// CSS Generation
function generateCSS() {
  return `
:root {
  --bg-primary: #0a0a0a; --bg-secondary: #111; --bg-card: #1a1a1a;
  --text-primary: #fff; --text-secondary: #a0a0a0;
  --accent: #22c55e; --accent-hover: #16a34a; --border: #2a2a2a;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg-primary); color: var(--text-primary); line-height: 1.7; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 1rem; }
header { background: var(--bg-secondary); border-bottom: 1px solid var(--border); padding: 1rem 0; position: sticky; top: 0; z-index: 100; }
.header-content { display: flex; align-items: center; justify-content: space-between; }
.logo { font-size: 1.25rem; font-weight: 700; color: var(--accent); text-decoration: none; }
nav { display: flex; gap: 1.5rem; }
nav a { color: var(--text-secondary); text-decoration: none; font-size: 0.875rem; }
nav a:hover { color: var(--accent); }
.hero { padding: 4rem 0; text-align: center; background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%); }
.hero h1 { font-size: 2.5rem; margin-bottom: 1rem; background: linear-gradient(135deg, var(--accent), #4ade80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.hero p { color: var(--text-secondary); max-width: 600px; margin: 0 auto; font-size: 1.125rem; }
.categories { padding: 3rem 0; }
.category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }
.category-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; transition: all 0.3s; }
.category-card:hover { border-color: var(--accent); transform: translateY(-4px); }
.category-card h3 { font-size: 1.25rem; margin-bottom: 0.5rem; }
.category-card p { color: var(--text-secondary); font-size: 0.875rem; }
.category-card a { color: var(--accent); text-decoration: none; font-size: 0.875rem; display: inline-block; margin-top: 1rem; }
.article-list { padding: 3rem 0; }
.article-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 1rem; padding: 1.5rem; margin-bottom: 1.5rem; transition: all 0.2s; }
.article-card:hover { border-color: var(--accent); }
.article-card h2 { font-size: 1.25rem; margin-bottom: 0.75rem; line-height: 1.4; }
.article-card h2 a { color: var(--text-primary); text-decoration: none; }
.article-card h2 a:hover { color: var(--accent); }
.article-meta { display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.75rem; }
.tag { background: var(--bg-secondary); padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; }
.difficulty { padding: 0.25rem 0.75rem; border-radius: 2rem; font-size: 0.75rem; font-weight: 600; }
.difficulty.beginner { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
.difficulty.intermediate { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
.difficulty.advanced { background: rgba(248, 113, 113, 0.2); color: #f87171; }
.excerpt { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; }
.article { padding: 3rem 0; max-width: 800px; margin: 0 auto; }
.article-header { margin-bottom: 2rem; }
.article-header h1 { font-size: 2.25rem; margin-bottom: 1rem; line-height: 1.3; }
.article-intro { font-size: 1.25rem; color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; padding-bottom: 2rem; border-bottom: 1px solid var(--border); }
.article-content { font-size: 1.0625rem; line-height: 1.8; }
.article-content h2 { font-size: 1.5rem; margin: 2.5rem 0 1rem; color: var(--text-primary); }
.article-content h3 { font-size: 1.25rem; margin: 2rem 0 0.75rem; }
.article-content p { margin-bottom: 1.25rem; }
.article-content pre { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; margin: 1.5rem 0; }
.article-content code { font-family: 'Fira Code', monospace; font-size: 0.875rem; }
.article-content ul, .article-content ol { margin: 1.25rem 0; padding-left: 1.5rem; }
.article-content li { margin-bottom: 0.5rem; }
.cta-box { margin-top: 3rem; padding: 2rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 1rem; text-align: center; }
.cta-box p { margin-bottom: 1rem; font-size: 1.125rem; }
.cta-button { display: inline-block; background: var(--accent); color: white; padding: 0.875rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; }
.cta-button:hover { background: var(--accent-hover); }
footer { background: var(--bg-secondary); border-top: 1px solid var(--border); padding: 2rem 0; margin-top: 4rem; text-align: center; color: var(--text-secondary); font-size: 0.875rem; }
footer a { color: var(--accent); }
@media (max-width: 768px) { .hero h1 { font-size: 1.75rem; } .article-header h1 { font-size: 1.5rem; } nav { display: none; } .category-grid { grid-template-columns: 1fr; } }
`;
}

// HTML Generation
function generateHead(title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} | Tech Interview Blog</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="stylesheet" href="/style.css">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💻</text></svg>">
</head>
<body>`;
}

function generateHeader() {
  return `<header><div class="container header-content">
    <a href="/" class="logo">💻 Tech Interview Blog</a>
    <nav><a href="/">Home</a><a href="/categories/">Categories</a><a href="https://reel-interview.github.io" target="_blank">Practice →</a></nav>
  </div></header>`;
}

function generateFooter() {
  return `<footer><div class="container"><p>© ${new Date().getFullYear()} Tech Interview Blog. Powered by <a href="https://reel-interview.github.io">Reel Interview</a></p></div></footer></body></html>`;
}

function generateIndexPage(articles) {
  const recentArticles = articles.slice(0, 12);
  
  let categoryCards = '';
  for (const [category, channels] of Object.entries(categoryMap)) {
    const count = articles.filter(a => channels.includes(a.channel)).length;
    if (count === 0) continue;
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    categoryCards += `<div class="category-card"><h3>${category}</h3><p>${count} articles</p><a href="/categories/${slug}/">Explore →</a></div>`;
  }
  
  let articleCards = recentArticles.map(a => `
    <div class="article-card">
      <div class="article-meta"><span class="tag">${formatChannelName(a.channel)}</span><span class="difficulty ${a.difficulty}">${a.difficulty}</span></div>
      <h2><a href="/posts/${a.id}/${a.blogSlug}/">${escapeHtml(a.blogTitle)}</a></h2>
      <p class="excerpt">${escapeHtml((a.blogIntro || '').substring(0, 150))}...</p>
    </div>`).join('');
  
  return `${generateHead('Tech Interview Insights', 'Expert insights into tech interview topics')}
${generateHeader()}
<main>
  <section class="hero"><div class="container">
    <h1>Tech Interview Insights</h1>
    <p>Deep dives into system design, algorithms, and engineering best practices. ${articles.length} articles to level up your skills.</p>
  </div></section>
  <section class="categories"><div class="container">
    <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem;">Browse by Topic</h2>
    <div class="category-grid">${categoryCards}</div>
  </div></section>
  <section class="article-list"><div class="container">
    <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem;">Latest Articles</h2>
    ${articleCards}
  </div></section>
</main>
${generateFooter()}`;
}

function generateCategoryPage(category, articles) {
  const channels = categoryMap[category] || [];
  const categoryArticles = articles.filter(a => channels.includes(a.channel));
  
  let articleCards = categoryArticles.map(a => `
    <div class="article-card">
      <div class="article-meta"><span class="tag">${formatChannelName(a.channel)}</span><span class="difficulty ${a.difficulty}">${a.difficulty}</span></div>
      <h2><a href="/posts/${a.id}/${a.blogSlug}/">${escapeHtml(a.blogTitle)}</a></h2>
      <p class="excerpt">${escapeHtml((a.blogIntro || '').substring(0, 150))}...</p>
    </div>`).join('');
  
  return `${generateHead(category, `Articles about ${category}`)}
${generateHeader()}
<main><section class="article-list" style="padding-top: 3rem;"><div class="container">
  <a href="/" style="color: var(--text-secondary); text-decoration: none; font-size: 0.875rem;">← Back</a>
  <h1 style="margin: 1rem 0 0.5rem; font-size: 2rem;">${category}</h1>
  <p style="color: var(--text-secondary); margin-bottom: 2rem;">${categoryArticles.length} articles</p>
  ${articleCards}
</div></section></main>
${generateFooter()}`;
}

function generateArticlePage(article) {
  const category = getCategoryForChannel(article.channel);
  const categorySlug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  let sectionsHtml = (article.blogSections || []).map(s => 
    `<h2>${escapeHtml(s.heading)}</h2>${markdownToHtml(s.content)}`
  ).join('');
  
  if (article.diagram) {
    sectionsHtml += `<h2>Visual Overview</h2><pre><code class="language-mermaid">${escapeHtml(article.diagram)}</code></pre>`;
  }
  
  const tags = (article.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join(' ');
  
  return `${generateHead(article.blogTitle, article.blogMeta || '')}
${generateHeader()}
<main><article class="article"><div class="container">
  <a href="/categories/${categorySlug}/" style="color: var(--text-secondary); text-decoration: none; font-size: 0.875rem;">← ${category}</a>
  <div class="article-header">
    <h1>${escapeHtml(article.blogTitle)}</h1>
    <div class="article-meta"><span class="tag">${formatChannelName(article.channel)}</span><span class="difficulty ${article.difficulty}">${article.difficulty}</span>${tags}</div>
  </div>
  <p class="article-intro">${escapeHtml(article.blogIntro)}</p>
  <div class="article-content">${sectionsHtml}<h2>Wrapping Up</h2><p>${escapeHtml(article.blogConclusion)}</p></div>
  <div class="cta-box"><p>Ready to practice?</p><a href="https://reel-interview.github.io/channel/${article.channel}" class="cta-button">Practice on Reel Interview →</a></div>
</div></article></main>
${generateFooter()}`;
}

function generateCategoriesIndexPage(articles) {
  let cards = Object.entries(categoryMap).map(([category, channels]) => {
    const count = articles.filter(a => channels.includes(a.channel)).length;
    if (count === 0) return '';
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `<div class="category-card"><h3>${category}</h3><p>${count} articles</p><a href="/categories/${slug}/">Explore →</a></div>`;
  }).join('');
  
  return `${generateHead('All Categories', 'Browse articles by category')}
${generateHeader()}
<main><section class="categories" style="padding-top: 3rem;"><div class="container">
  <h1 style="margin-bottom: 2rem;">All Categories</h1>
  <div class="category-grid">${cards}</div>
</div></section></main>
${generateFooter()}`;
}

// Main function
async function main() {
  console.log('=== 📝 Blog Generator (Incremental) ===\n');
  
  // Initialize table
  await initBlogPostsTable();
  
  // Get current stats
  const stats = await getBlogStats();
  console.log(`📊 Current blog posts: ${stats.total}`);
  if (stats.byChannel.length > 0) {
    console.log('   By channel:');
    stats.byChannel.slice(0, 5).forEach(c => console.log(`     ${c.channel}: ${c.count}`));
    if (stats.byChannel.length > 5) console.log(`     ... and ${stats.byChannel.length - 5} more`);
  }
  
  // Get next question to convert
  console.log('\n🔍 Finding next question to convert...');
  const question = await getNextQuestionForBlog();
  
  if (!question) {
    console.log('✅ All questions have been converted to blog posts!');
  } else {
    console.log(`   Found: ${question.id} (${question.channel})`);
    console.log(`   Q: ${question.question.substring(0, 60)}...`);
    
    // Transform to blog article
    const blogContent = await transformToBlogArticle(question);
    console.log(`   Title: ${blogContent.title}`);
    
    // Save to database
    console.log('💾 Saving to database...');
    await saveBlogPost(question.id, blogContent, question);
    console.log('✅ Blog post saved!\n');
  }
  
  // Regenerate static site with all blog posts
  console.log('📄 Regenerating static site...');
  
  // Create output directory
  fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Get all blog posts
  const articles = await getAllBlogPosts();
  console.log(`   Total articles: ${articles.length}`);
  
  if (articles.length === 0) {
    console.log('   No articles yet, skipping site generation');
    return;
  }
  
  // Generate CSS
  fs.writeFileSync(path.join(OUTPUT_DIR, 'style.css'), generateCSS());
  
  // Generate index
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), generateIndexPage(articles));
  
  // Generate categories
  fs.mkdirSync(path.join(OUTPUT_DIR, 'categories'), { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'categories', 'index.html'), generateCategoriesIndexPage(articles));
  
  for (const category of Object.keys(categoryMap)) {
    const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const dir = path.join(OUTPUT_DIR, 'categories', slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), generateCategoryPage(category, articles));
  }
  
  // Generate article pages
  const postsDir = path.join(OUTPUT_DIR, 'posts');
  fs.mkdirSync(postsDir, { recursive: true });
  
  for (const article of articles) {
    const dir = path.join(postsDir, article.id, article.blogSlug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), generateArticlePage(article));
  }
  
  // Generate .nojekyll
  fs.writeFileSync(path.join(OUTPUT_DIR, '.nojekyll'), '');
  
  const newStats = await getBlogStats();
  console.log(`\n✅ Blog generated!`);
  console.log(`   Total posts: ${newStats.total}`);
  console.log(`   Output: ${OUTPUT_DIR}/`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
