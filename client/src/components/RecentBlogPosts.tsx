/**
 * Recent Blog Posts Component - Gen Z Theme
 * Pure black background, neon accents, glassmorphism
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api.service';
import { FileText, ExternalLink, ChevronRight, Sparkles, Zap } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  url: string;
}

interface RecentBlogPostsProps {
  limit?: number;
  className?: string;
}

export function RecentBlogPosts({ limit = 3, className = '' }: RecentBlogPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const allPosts = await api.blog.getAll();
        // Convert to array and take most recent posts
        const postsArray = Object.entries(allPosts).map(([id, info]) => ({
          id,
          ...info,
        }));
        
        // Sort by ID (newer posts have higher timestamps in ID) and take limit
        const recentPosts = postsArray
          .sort((a, b) => {
            // Extract timestamp from blog IDs like "blog-1767709186611-mflfq9"
            const getTimestamp = (id: string) => {
              const match = id.match(/blog-(\d+)/);
              return match ? parseInt(match[1], 10) : 0;
            };
            return getTimestamp(b.id) - getTimestamp(a.id);
          })
          .slice(0, limit);
        
        setPosts(recentPosts);
      } catch (error) {
        console.error('Failed to load blog posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPosts();
  }, [limit]);

  if (isLoading) {
    return (
      <section className={`mb-3 ${className}`}>
        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <span className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider">From the Blog</span>
            </div>
          </div>
          <div className="p-3 space-y-2">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-white/5 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  // Blog base URL - dedicated blog site
  const blogBaseUrl = 'https://openstackdaily.github.io';

  return (
    <section className={`mb-3 ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00ff88]" />
            <span className="text-xs font-bold text-[#a0a0a0] uppercase tracking-wider">
              From the Blog
            </span>
          </div>
          <a
            href={blogBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-[#00d4ff] hover:text-[#00ff88] flex items-center gap-1 transition-colors font-semibold"
          >
            View all <ChevronRight className="w-3 h-3" />
          </a>
        </div>

        {/* Blog Post Tiles */}
        <div className="p-3 space-y-2">
          {posts.map((post, idx) => (
            <motion.a
              key={post.id}
              href={`${blogBaseUrl}${post.url}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00ff88]/30 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 border border-[#00ff88]/30 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-[#00ff88]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold leading-snug line-clamp-2 group-hover:text-[#00ff88] transition-colors mb-1">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-[#a0a0a0] group-hover:text-[#00d4ff] transition-colors">
                    <span className="font-semibold">Read article</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-4 py-3 border-t border-white/10 bg-gradient-to-r from-[#00ff88]/5 to-[#00d4ff]/5">
          <a
            href={blogBaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs font-bold text-[#00ff88] hover:text-[#00d4ff] transition-colors"
          >
            <Zap className="w-3 h-3" />
            <span>Explore More Articles</span>
            <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}
