#!/usr/bin/env node

/**
 * Generate Curated Learning Paths
 * 
 * This script analyzes available channels and certifications to automatically
 * generate curated learning paths. Runs as part of daily batch pipeline.
 * 
 * Usage: node script/generate-curated-paths.js
 */

import Database from 'better-sqlite3';
import { getAllChannels } from '../client/src/lib/data.js';

const db = new Database('questions.db');

// Path templates based on career goals and skill levels
const PATH_TEMPLATES = [
  {
    id: 'full-stack-beginner',
    name: 'Full-Stack Developer (Beginner)',
    description: 'Start your journey as a full-stack developer',
    icon: '🚀',
    level: 'beginner',
    requiredChannels: ['html', 'css', 'javascript', 'react'],
    optionalChannels: ['nodejs', 'express'],
    requiredCerts: [],
    estimatedWeeks: 12
  },
  {
    id: 'cloud-engineer',
    name: 'Cloud Engineer Path',
    description: 'Master cloud technologies and DevOps',
    icon: '☁️',
    level: 'intermediate',
    requiredChannels: ['aws', 'docker', 'kubernetes'],
    optionalChannels: ['terraform', 'linux'],
    requiredCerts: ['aws-solutions-architect'],
    estimatedWeeks: 16
  },
  {
    id: 'data-structures-master',
    name: 'Data Structures & Algorithms Master',
    description: 'Ace technical interviews at top companies',
    icon: '🧠',
    level: 'intermediate',
    requiredChannels: ['data-structures', 'algorithms'],
    optionalChannels: ['system-design'],
    requiredCerts: [],
    estimatedWeeks: 20
  },
  {
    id: 'frontend-specialist',
    name: 'Frontend Specialist',
    description: 'Become an expert in modern frontend development',
    icon: '🎨',
    level: 'intermediate',
    requiredChannels: ['react', 'javascript', 'css', 'html'],
    optionalChannels: ['typescript', 'nextjs', 'vue'],
    requiredCerts: [],
    estimatedWeeks: 14
  },
  {
    id: 'backend-engineer',
    name: 'Backend Engineer',
    description: 'Build scalable server-side applications',
    icon: '⚙️',
    level: 'intermediate',
    requiredChannels: ['nodejs', 'express', 'databases', 'api-design'],
    optionalChannels: ['graphql', 'microservices'],
    requiredCerts: [],
    estimatedWeeks: 16
  },
  {
    id: 'devops-specialist',
    name: 'DevOps Specialist',
    description: 'Master CI/CD, infrastructure, and automation',
    icon: '🔧',
    level: 'advanced',
    requiredChannels: ['docker', 'kubernetes', 'aws', 'linux'],
    optionalChannels: ['terraform', 'jenkins', 'monitoring'],
    requiredCerts: ['aws-solutions-architect', 'kubernetes-admin'],
    estimatedWeeks: 18
  },
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    description: 'Protect applications and infrastructure',
    icon: '🔒',
    level: 'advanced',
    requiredChannels: ['security', 'networking', 'cryptography'],
    optionalChannels: ['penetration-testing', 'compliance'],
    requiredCerts: ['security-plus'],
    estimatedWeeks: 20
  },
  {
    id: 'mobile-developer',
    name: 'Mobile Developer',
    description: 'Build native and cross-platform mobile apps',
    icon: '📱',
    level: 'intermediate',
    requiredChannels: ['react-native', 'javascript', 'mobile-design'],
    optionalChannels: ['flutter', 'swift', 'kotlin'],
    requiredCerts: [],
    estimatedWeeks: 14
  },
  {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    description: 'Build intelligent systems with machine learning',
    icon: '🤖',
    level: 'advanced',
    requiredChannels: ['python', 'machine-learning', 'data-science'],
    optionalChannels: ['deep-learning', 'nlp', 'computer-vision'],
    requiredCerts: [],
    estimatedWeeks: 24
  },
  {
    id: 'interview-prep',
    name: 'Interview Preparation Bootcamp',
    description: 'Get ready for FAANG interviews',
    icon: '💼',
    level: 'intermediate',
    requiredChannels: ['data-structures', 'algorithms', 'system-design'],
    optionalChannels: ['behavioral-interview', 'coding-patterns'],
    requiredCerts: [],
    estimatedWeeks: 12
  }
];

/**
 * Get all available channels from database
 */
function getAvailableChannels() {
  try {
    const channels = getAllChannels();
    const channelIds = channels.map(c => c.id);
    
    // Get question counts per channel
    const channelCounts = {};
    for (const channelId of channelIds) {
      const result = db.prepare('SELECT COUNT(*) as count FROM questions WHERE channel = ?').get(channelId);
      channelCounts[channelId] = result?.count || 0;
    }
    
    return { channelIds, channelCounts };
  } catch (error) {
    console.error('Error getting channels:', error);
    return { channelIds: [], channelCounts: {} };
  }
}

/**
 * Get all available certifications from database
 */
function getAvailableCertifications() {
  try {
    const certs = db.prepare('SELECT DISTINCT id, name FROM certifications').all();
    return certs.map(c => c.id);
  } catch (error) {
    console.error('Error getting certifications:', error);
    return [];
  }
}

/**
 * Check if a path template can be created based on available content
 */
function canCreatePath(template, availableChannels, availableCerts) {
  const { channelIds, channelCounts } = availableChannels;
  
  // Check if required channels exist and have content
  const hasRequiredChannels = template.requiredChannels.every(ch => {
    const exists = channelIds.includes(ch);
    const hasContent = channelCounts[ch] > 0;
    return exists && hasContent;
  });
  
  if (!hasRequiredChannels) return false;
  
  // Check if required certifications exist
  if (template.requiredCerts.length > 0) {
    const hasRequiredCerts = template.requiredCerts.every(cert => 
      availableCerts.includes(cert)
    );
    if (!hasRequiredCerts) return false;
  }
  
  return true;
}

/**
 * Generate a curated path from template
 */
function generatePath(template, availableChannels) {
  const { channelIds, channelCounts } = availableChannels;
  
  // Filter optional channels to only include those with content
  const optionalChannels = template.optionalChannels.filter(ch => 
    channelIds.includes(ch) && channelCounts[ch] > 0
  );
  
  // Calculate total questions
  const totalQuestions = [
    ...template.requiredChannels,
    ...optionalChannels
  ].reduce((sum, ch) => sum + (channelCounts[ch] || 0), 0);
  
  return {
    id: template.id,
    name: template.name,
    description: template.description,
    icon: template.icon,
    level: template.level,
    channels: template.requiredChannels,
    optionalChannels,
    certifications: template.requiredCerts,
    estimatedWeeks: template.estimatedWeeks,
    totalQuestions,
    createdAt: new Date().toISOString(),
    type: 'curated'
  };
}

/**
 * Save curated paths to database
 */
function savePaths(paths) {
  try {
    // Create table if not exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS learning_paths (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        level TEXT,
        channels TEXT,
        optional_channels TEXT,
        certifications TEXT,
        estimated_weeks INTEGER,
        total_questions INTEGER,
        created_at TEXT,
        type TEXT DEFAULT 'curated'
      )
    `);
    
    // Clear existing curated paths
    db.prepare('DELETE FROM learning_paths WHERE type = ?').run('curated');
    
    // Insert new paths
    const insert = db.prepare(`
      INSERT INTO learning_paths (
        id, name, description, icon, level, channels, optional_channels,
        certifications, estimated_weeks, total_questions, created_at, type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const path of paths) {
      insert.run(
        path.id,
        path.name,
        path.description,
        path.icon,
        path.level,
        JSON.stringify(path.channels),
        JSON.stringify(path.optionalChannels),
        JSON.stringify(path.certifications),
        path.estimatedWeeks,
        path.totalQuestions,
        path.createdAt,
        path.type
      );
    }
    
    console.log(`✅ Saved ${paths.length} curated learning paths to database`);
  } catch (error) {
    console.error('Error saving paths:', error);
  }
}

/**
 * Generate JSON file for frontend consumption
 */
function generateJSON(paths) {
  const fs = await import('fs');
  const path = await import('path');
  
  const outputPath = path.join(process.cwd(), 'client/public/data/curated-paths.json');
  
  // Ensure directory exists
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(paths, null, 2));
  console.log(`✅ Generated curated-paths.json with ${paths.length} paths`);
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting curated learning paths generation...\n');
  
  // Get available content
  const availableChannels = getAvailableChannels();
  const availableCerts = getAvailableCertifications();
  
  console.log(`📊 Found ${availableChannels.channelIds.length} channels`);
  console.log(`📜 Found ${availableCerts.length} certifications\n`);
  
  // Generate paths from templates
  const generatedPaths = [];
  
  for (const template of PATH_TEMPLATES) {
    if (canCreatePath(template, availableChannels, availableCerts)) {
      const path = generatePath(template, availableChannels);
      generatedPaths.push(path);
      console.log(`✓ Generated: ${path.name} (${path.totalQuestions} questions)`);
    } else {
      console.log(`✗ Skipped: ${template.name} (missing required content)`);
    }
  }
  
  console.log(`\n📦 Generated ${generatedPaths.length} curated paths\n`);
  
  // Save to database
  savePaths(generatedPaths);
  
  // Generate JSON file
  await generateJSON(generatedPaths);
  
  console.log('\n✨ Curated paths generation complete!');
  
  db.close();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generatePath, canCreatePath, PATH_TEMPLATES };
