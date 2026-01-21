/**
 * Gen Z Channels Page - Browse All Topics
 * Search, filter, subscribe - all with that Gen Z aesthetic
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { allChannelsConfig, categories } from '../lib/channels-config';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useChannelStats } from '../hooks/use-stats';
import { useProgress } from '../hooks/use-progress';
import { SEOHead } from '../components/SEOHead';
import {
  Search, Check, Plus, Sparkles, TrendingUp, Star, ChevronRight, Filter,
  Box, Terminal, Layout, Server, Database, Infinity, Activity, Cloud, Layers,
  Brain, Eye, FileText, Code, Shield, Network, Monitor, Smartphone, CheckCircle,
  Zap, Gauge, Users, MessageCircle, Calculator, Cpu, GitBranch, Binary, Puzzle,
  GitMerge, Workflow, Award
} from 'lucide-react';

// Icon mapping for channel icons
const iconMap: Record<string, any> = {
  'boxes': Box,
  'chart-line': TrendingUp,
  'git-branch': GitBranch,
  'binary': Binary,
  'puzzle': Puzzle,
  'git-merge': GitMerge,
  'calculator': Calculator,
  'cpu': Cpu,
  'terminal': Terminal,
  'layout': Layout,
  'server': Server,
  'database': Database,
  'infinity': Infinity,
  'activity': Activity,
  'box': Box,
  'cloud': Cloud,
  'layers': Layers,
  'workflow': Workflow,
  'brain': Brain,
  'sparkles': Sparkles,
  'message-circle': MessageCircle,
  'eye': Eye,
  'file-text': FileText,
  'code': Code,
  'shield': Shield,
  'network': Network,
  'monitor': Monitor,
  'smartphone': Smartphone,
  'check-circle': CheckCircle,
  'zap': Zap,
  'gauge': Gauge,
  'users': Users,
  'award': Award,
};

export default function AllChannelsGenZ() {
  const [, navigate] = useLocation();
  const { isSubscribed, toggleSubscription } = useUserPreferences();
  const { stats } = useChannelStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Question counts
  const questionCounts: Record<string, number> = {};
  stats.forEach(s => { questionCounts[s.id] = s.total; });

  // Filter channels
  const filteredChannels = allChannelsConfig.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <SEOHead
        title="Browse Channels - Level Up Your Skills 🚀"
        description="Explore all topics and start learning. Frontend, backend, DevOps, and more."
        canonical="https://open-interview.github.io/channels"
      />

      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          {/* Header */}
          <div className="max-w-7xl mx-auto px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black">
                Pick your
                <br />
                <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                  poison
                </span>
              </h1>
              <p className="text-xl text-[#a0a0a0]">
                {filteredChannels.length} channels to master
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-xl focus:outline-none focus:border-[#00ff88] transition-all"
                />
              </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 justify-center mb-12"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>

            {/* Channels Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChannels.map((channel, i) => {
                const subscribed = isSubscribed(channel.id);
                const { completed } = useProgress(channel.id);
                const questionCount = questionCounts[channel.id] || 0;
                const progress = questionCount > 0 ? Math.round((completed.length / questionCount) * 100) : 0;

                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-[#00d4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          {(() => {
                            const IconComponent = iconMap[channel.icon] || Box;
                            return (
                              <div className="w-14 h-14 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-[16px] flex items-center justify-center flex-shrink-0 border border-[#00ff88]/30">
                                <IconComponent className="w-7 h-7 text-[#00ff88]" strokeWidth={2} />
                              </div>
                            );
                          })()}
                          <div>
                            <h3 className="text-2xl font-bold mb-2">{channel.name}</h3>
                            <p className="text-sm text-[#a0a0a0] line-clamp-2">{channel.description}</p>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#00ff88]" />
                          <span className="text-[#a0a0a0]">{questionCount} questions</span>
                        </div>
                        {subscribed && progress > 0 && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#00d4ff]" />
                            <span className="text-[#a0a0a0]">{progress}% done</span>
                          </div>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {subscribed && (
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: Math.min(i * 0.1, 0.5) }}
                            className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleSubscription(channel.id)}
                          className={`flex-1 px-6 py-3 rounded-[16px] font-bold transition-all ${
                            subscribed
                              ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                              : 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black hover:scale-105'
                          }`}
                        >
                          {subscribed ? (
                            <span className="flex items-center justify-center gap-2">
                              <Check className="w-5 h-5" />
                              Subscribed
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Plus className="w-5 h-5" />
                              Subscribe
                            </span>
                          )}
                        </button>

                        {subscribed && (
                          <button
                            onClick={() => navigate(`/channel/${channel.id}`)}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-[16px] border border-white/10 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredChannels.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No channels found</h3>
                <p className="text-[#a0a0a0]">Try a different search or category</p>
              </motion.div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
