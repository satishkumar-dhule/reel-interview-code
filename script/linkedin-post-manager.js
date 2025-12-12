#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'linkedin-posts');

function listPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found.');
    return;
  }

  const posts = fs.readdirSync(POSTS_DIR)
    .filter(f => fs.statSync(path.join(POSTS_DIR, f)).isDirectory());

  if (posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  console.log(`\n📱 LinkedIn Posts (${posts.length} total)\n`);
  console.log('ID'.padEnd(15) + 'Channel'.padEnd(25) + 'Difficulty'.padEnd(15) + 'Generated');
  console.log('-'.repeat(80));

  posts.forEach(postId => {
    const metadataPath = path.join(POSTS_DIR, postId, 'metadata.json');
    try {
      const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
      const date = new Date(metadata.generatedAt).toLocaleDateString();
      const channel = `${metadata.channel}/${metadata.subChannel}`.substring(0, 23);
      console.log(
        postId.padEnd(15) +
        channel.padEnd(25) +
        metadata.difficulty.padEnd(15) +
        date
      );
    } catch (e) {
      console.log(postId.padEnd(15) + 'Error reading metadata');
    }
  });
  console.log();
}

function viewPost(postId) {
  const postDir = path.join(POSTS_DIR, postId);

  if (!fs.existsSync(postDir)) {
    console.log(`Post not found: ${postId}`);
    return;
  }

  const textPath = path.join(postDir, 'post.txt');
  const metadataPath = path.join(postDir, 'metadata.json');

  if (!fs.existsSync(textPath)) {
    console.log(`Post text not found: ${postId}`);
    return;
  }

  const text = fs.readFileSync(textPath, 'utf8');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

  console.log(`\n${'='.repeat(80)}`);
  console.log(`📱 LinkedIn Post: ${postId}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`📚 Channel: ${metadata.channel}/${metadata.subChannel}`);
  console.log(`🎯 Difficulty: ${metadata.difficulty}`);
  console.log(`🏷️  Tags: ${metadata.tags.join(', ')}`);
  console.log(`📅 Generated: ${new Date(metadata.generatedAt).toLocaleString()}`);
  console.log(`📊 Has Diagram: ${metadata.hasDiagram ? 'Yes' : 'No'}\n`);

  console.log(`${'─'.repeat(80)}\n`);
  console.log(text);
  console.log(`\n${'─'.repeat(80)}\n`);

  console.log('📋 Files:');
  console.log(`  📄 post.txt - Copy this text to LinkedIn`);
  console.log(`  🌐 preview.html - Open in browser to see preview`);
  if (metadata.hasDiagram) {
    console.log(`  📊 diagram.svg - Diagram image`);
  }
  console.log(`  📋 metadata.json - Post metadata\n`);
}

function copyToClipboard(postId) {
  const postDir = path.join(POSTS_DIR, postId);
  const textPath = path.join(postDir, 'post.txt');

  if (!fs.existsSync(textPath)) {
    console.log(`Post not found: ${postId}`);
    return;
  }

  const text = fs.readFileSync(textPath, 'utf8');

  // Try to copy to clipboard using xclip, pbcopy, or wl-copy
  const clipboardCommands = [
    { cmd: 'xclip', args: ['-selection', 'clipboard'] },
    { cmd: 'pbcopy', args: [] },
    { cmd: 'wl-copy', args: [] }
  ];

  let copied = false;
  for (const { cmd, args } of clipboardCommands) {
    try {
      const { spawn } = await import('child_process');
      const proc = spawn(cmd, args);
      proc.stdin.write(text);
      proc.stdin.end();
      copied = true;
      break;
    } catch (e) {
      // Try next command
    }
  }

  if (copied) {
    console.log(`✅ Post copied to clipboard: ${postId}`);
  } else {
    console.log(`Post text:\n\n${text}`);
  }
}

function openPreview(postId) {
  const postDir = path.join(POSTS_DIR, postId);
  const previewPath = path.join(postDir, 'preview.html');

  if (!fs.existsSync(previewPath)) {
    console.log(`Preview not found: ${postId}`);
    return;
  }

  console.log(`Opening preview: ${previewPath}`);
  console.log(`Open this file in your browser to see the LinkedIn post preview.`);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const postId = args[1];

  switch (command) {
    case 'list':
    case 'ls':
      listPosts();
      break;

    case 'view':
    case 'show':
      if (!postId) {
        console.log('Usage: linkedin-post-manager view <post-id>');
        process.exit(1);
      }
      viewPost(postId);
      break;

    case 'copy':
      if (!postId) {
        console.log('Usage: linkedin-post-manager copy <post-id>');
        process.exit(1);
      }
      copyToClipboard(postId);
      break;

    case 'preview':
      if (!postId) {
        console.log('Usage: linkedin-post-manager preview <post-id>');
        process.exit(1);
      }
      openPreview(postId);
      break;

    default:
      console.log(`
📱 LinkedIn Post Manager

Usage:
  linkedin-post-manager list              List all generated posts
  linkedin-post-manager view <id>         View post content
  linkedin-post-manager copy <id>         Copy post to clipboard
  linkedin-post-manager preview <id>      Show preview file path

Examples:
  linkedin-post-manager list
  linkedin-post-manager view sd-42
  linkedin-post-manager copy sd-42
      `);
  }
}

main();
