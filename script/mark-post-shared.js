#!/usr/bin/env node
/**
 * Mark Blog Post as Shared on LinkedIn
 * Updates the database to track which posts have been shared
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const postId = process.env.POST_ID;

if (!url || !postId) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function markAsShared() {
  console.log(`📝 Marking post ${postId} as shared on LinkedIn...`);
  
  const now = new Date().toISOString();
  
  await client.execute({
    sql: `UPDATE blog_posts SET linkedin_shared_at = ? WHERE question_id = ?`,
    args: [now, postId]
  });
  
  console.log('✅ Post marked as shared');
}

markAsShared().catch(console.error);
