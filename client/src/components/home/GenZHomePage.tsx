/**
 * Gen Z Home Page - Addictive, Beautiful, Zero Learning Curve
 * Built different 🔥
 */

import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useGlobalStats } from '../../hooks/use-progress';
import { useCredits } from '../../context/CreditsContext';
import { ProgressStorage } from '../../services/storage.service';
import {
  Flame, Zap, Trophy, Target, Mic, Code, Brain, 
  ChevronRight, Sparkles, TrendingUp, Star, Award, Rocket, Server, Plus
} from 'lucide-react';

// Learning Paths - Role-based journeys
const learningPaths = [
  {
    id: 'frontend',
    name: 'Frontend Developer',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    description: 'Master React, JavaScript, and modern web development',
    channels: ['frontend', 'react-native', 'javascript', 'algorithms'],
    difficulty: 'Beginner Friendly',
    duration: '3-6 months',
    jobs: ['Frontend Developer', 'React Developer', 'UI Engineer']
  },
  {
    id: 'backend',
    name: 'Backend Engineer',
    icon: Server,
    color: 'from-green-500 to-emerald-500',
    description: 'Build scalable APIs and microservices',
    channels: ['backend', 'database', 'system-design', 'algorithms'],
    difficulty: 'Intermediate',
    duration: '4-8 months',
    jobs: ['Backend Engineer', 'API Developer', 'Systems Engineer']
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: Rocket,
    color: 'from-purple-500 to-pink-500',
    description: 'End-to-end application development',
    channels: ['frontend', 'backend', 'database', 'devops', 'system-design'],
    difficulty: 'Advanced',
    duration: '6-12 months',
    jobs: ['Full Stack Developer', 'Software Engineer', 'Tech Lead']
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    icon: Target,
    color: 'from-orange-500 to-red-500',
    description: 'Infrastructure, CI/CD, and cloud platforms',
    channels: ['devops', 'kubernetes', 'aws', 'terraform', 'docker'],
    difficulty: 'Advanced',
    duration: '4-8 months',
    jobs: ['DevOps Engineer', 'SRE', 'Cloud Engineer']
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-500',
    description: 'iOS and Android app development',
    channels: ['react-native', 'ios', 'android', 'frontend'],
    difficulty: 'Intermediate',
    duration: '4-6 months',
    jobs: ['Mobile Developer', 'iOS Developer', 'Android Developer']
  },
  {
    id: 'data',
    name: 'Data Engineer',
    icon: Brain,
    color: 'from-indigo-500 to-purple-500',
    description: 'Data pipelines, warehousing, and analytics',
    channels: ['data-engineering', 'database', 'python', 'aws'],
    difficulty: 'Advanced',
    duration: '6-10 months',
    jobs: ['Data Engineer', 'Analytics Engineer', 'ML Engineer']
  }
];

export function GenZHomePage() {
  const [, setLocation] = useLocation();
  const { stats: activityStats } = useGlobalStats();
  const { balance } = useCredits();
  
  const totalCompleted = ProgressStorage.getAllCompletedIds().size;
  
  // Get active learning paths from localStorage (can have multiple)
  const activePaths = (() => {
    try {
      // Check for new format (plural - array)
      let saved = localStorage.getItem('activeLearningPaths');
      
      // Migration: Check for old format (singular - single path)
      if (!saved) {
        const oldSaved = localStorage.getItem('activeLearningPath');
        if (oldSaved) {
          // Migrate from old format to new format
          const pathId = JSON.parse(oldSaved);
          const pathIds = [pathId];
          localStorage.setItem('activeLearningPaths', JSON.stringify(pathIds));
          saved = JSON.stringify(pathIds);
        }
      }
      
      if (!saved) return [];
      
      const pathIds = JSON.parse(saved);
      if (!Array.isArray(pathIds)) return [];
      
      // Load custom paths from localStorage
      const customPathsData = localStorage.getItem('customPaths');
      const customPaths = customPathsData ? JSON.parse(customPathsData) : [];
      
      const paths = pathIds.map((pathId: string) => {
        // Check if it's a custom path (starts with 'custom-')
        if (pathId.startsWith && pathId.startsWith('custom-')) {
          // Find in customPaths array
          const customPath = customPaths.find((p: any) => p.id === pathId);
          if (customPath) {
            return {
              id: customPath.id,
              name: customPath.name,
              icon: Brain,
              color: 'from-purple-500 to-pink-500',
              description: 'Your custom learning journey',
              channels: customPath.channels || [],
              certifications: customPath.certifications || [],
              difficulty: 'Custom',
              duration: 'Self-paced',
              totalQuestions: 0,
              jobs: ['Custom Path'],
              skills: [],
              salary: 'Varies'
            };
          }
        }
        
        // Otherwise find curated path
        return learningPaths.find(p => p.id === pathId);
      }).filter((path): path is NonNullable<typeof path> => path !== null && path !== undefined); // Type guard to remove undefined
      
      return paths;
    } catch {
      return [];
    }
  })();
  
  // Calculate streak
  const streak = (() => {
    try {
      let s = 0;
      for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        if (activityStats?.find(x => x.date === d.toISOString().split('T')[0])) s++;
        else break;
      }
      return s;
    } catch {
      return 0;
    }
  })();

  // Calculate level (100 XP per level)
  const level = Math.floor(balance / 100);
  const xpInLevel = balance % 100;
  const xpForNextLevel = 100;

  // Onboarding for new users - show path selection
  if (activePaths.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 via-transparent to-[#00d4ff]/10" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-2xl text-center space-y-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-32 h-32 mx-auto bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-[32px] flex items-center justify-center relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-[32px] blur-2xl opacity-50" />
            <Brain className="w-16 h-16 text-black relative z-10" strokeWidth={2.5} />
          </motion.div>

          {/* Headline */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-6xl md:text-7xl font-black text-white leading-tight"
            >
              Level up your
              <br />
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                interview game
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl text-[#a0a0a0]"
            >
              Practice. Progress. Get hired. No cap. 🚀
            </motion.p>
          </div>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation('/learning-paths')}
            className="group relative px-12 py-6 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-[20px] font-bold text-xl text-black overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
            <div className="relative flex items-center gap-3">
              Choose your path
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-8 text-sm text-[#666]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <span>12K+ learners</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#ffd700]" />
              <span>500K+ questions solved</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Helper function to remove a path from active paths
  const removeActivePath = (pathId: string) => {
    try {
      const currentPaths = JSON.parse(localStorage.getItem('activeLearningPaths') || '[]');
      const updatedPaths = currentPaths.filter((id: string) => id !== pathId);
      localStorage.setItem('activeLearningPaths', JSON.stringify(updatedPaths));
      
      // Force re-render by reloading
      window.location.reload();
    } catch (e) {
      console.error('Failed to remove path:', e);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Stats Bar - Sticky */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-black/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Streak */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30 cursor-pointer"
              >
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-lg">{streak}</span>
                <span className="text-sm text-[#a0a0a0]">day streak</span>
              </motion.div>

              {/* XP */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#00ff88]/20 to-[#00d4ff]/20 rounded-full border border-[#00ff88]/30 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#00ff88]" />
                <span className="font-bold text-lg">{balance}</span>
                <span className="text-sm text-[#a0a0a0]">XP</span>
              </motion.div>

              {/* Level */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-500/30 cursor-pointer"
              >
                <Trophy className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-lg">Level {level}</span>
              </motion.div>
            </div>

            {/* Level Progress */}
            <div className="hidden md:flex items-center gap-3">
              <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(xpInLevel / xpForNextLevel) * 100}%` }}
                  className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                />
              </div>
              <span className="text-sm text-[#a0a0a0]">{xpInLevel}/{xpForNextLevel} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="space-y-12">
          {/* Active Paths Progress */}
          {activePaths.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black">Your Active Paths</h2>
                  <p className="text-[#a0a0a0] mt-1">{activePaths.length} {activePaths.length === 1 ? 'path' : 'paths'} active</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLocation('/learning-paths')}
                  className="px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-[16px] font-bold text-black flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Path
                </motion.button>
              </div>

              {activePaths.map((path, index) => {
                const Icon = path.icon;
                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative p-6 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-[24px] border border-white/20 overflow-hidden"
                  >
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-10`} />
                    
                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 bg-gradient-to-br ${path.color} rounded-[16px] flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                          </div>
                          <div>
                            <div className="text-xs text-[#666] mb-0.5">Active Path {index + 1}</div>
                            <h3 className="text-xl font-black">{path.name}</h3>
                            <p className="text-sm text-[#a0a0a0] mt-0.5">{path.description}</p>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeActivePath(path.id)}
                          className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-[8px] text-xs font-semibold transition-all"
                        >
                          Remove
                        </motion.button>
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="p-3 bg-black/30 rounded-[12px]">
                          <div className="text-xs text-[#a0a0a0] mb-1">Completed</div>
                          <div className="text-lg font-black">{totalCompleted}</div>
                          <div className="text-[10px] text-[#666]">questions</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded-[12px]">
                          <div className="text-xs text-[#a0a0a0] mb-1">Progress</div>
                          <div className="text-lg font-black">{Math.min(Math.round((totalCompleted / 500) * 100), 100)}%</div>
                          <div className="text-[10px] text-[#666]">of path</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded-[12px]">
                          <div className="text-xs text-[#a0a0a0] mb-1">Streak</div>
                          <div className="text-lg font-black flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-500" />
                            {streak}
                          </div>
                          <div className="text-[10px] text-[#666]">days</div>
                        </div>
                        <div className="p-3 bg-black/30 rounded-[12px]">
                          <div className="text-xs text-[#a0a0a0] mb-1">Level</div>
                          <div className="text-lg font-black flex items-center gap-1">
                            <Trophy className="w-4 h-4 text-purple-400" />
                            {level}
                          </div>
                          <div className="text-[10px] text-[#666]">current</div>
                        </div>
                      </div>

                      {/* Channels in Path */}
                      <div>
                        <div className="text-xs text-[#666] mb-2">Channels in this path</div>
                        <div className="flex flex-wrap gap-2">
                          {path.channels.slice(0, 4).map((channel: string) => (
                            <motion.button
                              key={channel}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setLocation(`/channel/${channel}`)}
                              className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold transition-all"
                            >
                              {channel}
                            </motion.button>
                          ))}
                          {path.channels.length > 4 && (
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-[#666]">
                              +{path.channels.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLocation(`/channel/${path.channels[0]}`)}
                        className={`w-full py-4 bg-gradient-to-r ${path.color} rounded-[16px] font-bold text-base text-white flex items-center justify-center gap-2`}
                      >
                        Continue Learning
                        <ChevronRight className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Hero CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h1 className="text-6xl md:text-7xl font-black">
              Ready to
              <br />
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                level up?
              </span>
            </h1>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLocation('/voice-interview')}
              className="group relative px-12 py-6 bg-gradient-to-r from-[#00ff88] to-[#00d4ff] rounded-[20px] font-bold text-2xl text-black overflow-hidden inline-flex items-center gap-3"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              <Mic className="w-8 h-8" />
              <span className="relative">Start Practice</span>
              <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Quick Actions - Bento Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Mic, label: 'Voice', color: 'from-blue-500 to-cyan-500', path: '/voice-interview' },
              { icon: Code, label: 'Code', color: 'from-green-500 to-emerald-500', path: '/coding' },
              { icon: Target, label: 'Train', color: 'from-orange-500 to-red-500', path: '/training' },
              { icon: Zap, label: 'Test', color: 'from-yellow-500 to-orange-500', path: '/tests' },
            ].map((action, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation(action.path)}
                className="group relative p-8 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-[16px] flex items-center justify-center`}>
                    <action.icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="text-2xl font-bold">{action.label}</div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-sm text-[#a0a0a0]">Completed</div>
                    <div className="text-3xl font-black">{totalCompleted}</div>
                  </div>
                </div>
                <div className="text-sm text-[#a0a0a0]">questions crushed 💪</div>
              </div>
            </motion.div>

            {/* Paths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-8 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-[#a0a0a0]">Learning Paths</div>
                    <div className="text-3xl font-black">{learningPaths.length}</div>
                  </div>
                </div>
                <div className="text-sm text-[#a0a0a0]">career paths available 🎯</div>
              </div>
            </motion.div>

            {/* Rank */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-8 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[24px] border border-[#ffd700]/30"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ffd700] to-[#ff8c00] rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="text-sm text-[#a0a0a0]">Rank</div>
                    <div className="text-3xl font-black">Top 15%</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                  <span className="text-[#00ff88]">+3 this week</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Learning Paths - Show All */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black">Choose Your Path</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setLocation('/learning-paths')}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-[16px] border border-white/10 font-semibold transition-all"
              >
                View All
              </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {learningPaths.map((path, i) => {
                const Icon = path.icon;

                return (
                  <motion.button
                    key={path.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLocation('/learning-paths')}
                    className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
                  >
                    {/* Background gradient on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-10 transition-opacity`} />

                    <div className="relative space-y-4">
                      {/* Icon */}
                      <div className={`w-16 h-16 bg-gradient-to-br ${path.color} rounded-[16px] flex items-center justify-center`}>
                        <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-xl font-bold mb-2">{path.name}</h3>
                        <p className="text-sm text-[#a0a0a0] mb-4">{path.description}</p>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-[#a0a0a0]">
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          <span>{path.difficulty}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{path.duration}</span>
                        </div>
                      </div>

                      {/* Jobs */}
                      <div className="flex flex-wrap gap-2">
                        {path.jobs.slice(0, 2).map((job) => (
                          <span
                            key={job}
                            className="px-2 py-1 bg-white/5 rounded-full text-xs font-medium"
                          >
                            {job}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className="absolute top-6 right-6 w-5 h-5 text-[#666] group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Daily Challenge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative p-8 bg-gradient-to-br from-[#ff0080]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[24px] border border-[#ff0080]/30 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#ff0080] to-[#ff8c00] rounded-full blur-3xl opacity-20" />
            <div className="relative space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-[#ff0080] to-[#ff8c00] rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-[#a0a0a0]">Daily Challenge</div>
                  <div className="text-2xl font-black">System Design Basics</div>
                </div>
              </div>
              
              <p className="text-lg text-[#a0a0a0]">Design a URL shortener service</p>
              
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setLocation('/training')}
                  className="px-8 py-4 bg-gradient-to-r from-[#ff0080] to-[#ff8c00] rounded-[16px] font-bold text-lg"
                >
                  Accept Challenge
                </motion.button>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-5 h-5 text-[#ffd700]" />
                  <span className="text-[#a0a0a0]">+50 XP reward</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
