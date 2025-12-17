import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = 'client/public';
const BASE_URL = 'https://reel-interview.github.io';

// All channels from channels-config.ts
const channels = [
  'system-design', 'algorithms', 'frontend', 'backend', 'database',
  'devops', 'sre', 'kubernetes', 'aws', 'terraform',
  'data-engineering', 'machine-learning', 'generative-ai', 'prompt-engineering',
  'llm-ops', 'computer-vision', 'nlp', 'python',
  'security', 'networking', 'operating-systems', 'linux', 'unix',
  'ios', 'android', 'react-native',
  'testing', 'e2e-testing', 'api-testing', 'performance-testing',
  'engineering-management', 'behavioral'
];

// Static pages
const staticPages = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/channels', priority: '0.9', changefreq: 'daily' },
  { path: '/whats-new', priority: '0.8', changefreq: 'daily' },
  { path: '/about', priority: '0.6', changefreq: 'monthly' },
  { path: '/stats', priority: '0.7', changefreq: 'weekly' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  let urls = '';

  // Add static pages
  staticPages.forEach(page => {
    urls += `
  <url>
    <loc>${BASE_URL}${page.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });

  // Add channel pages
  channels.forEach(channel => {
    urls += `
  <url>
    <loc>${BASE_URL}/channel/${channel}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

function main() {
  console.log('=== Generating Sitemap ===\n');

  const sitemap = generateSitemap();

  // Ensure output directory exists
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write sitemap file
  const outputPath = path.join(OUTPUT_DIR, 'sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);

  console.log(`✅ Sitemap generated: ${outputPath}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Static pages: ${staticPages.length}`);
  console.log(`   Channel pages: ${channels.length}`);
  console.log(`   Total URLs: ${staticPages.length + channels.length}`);
}

main();
