/**
 * Gen Z Profile Page - Your Settings & Preferences
 * Customize your experience
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useCredits } from '../context/CreditsContext';
import { getAllQuestions } from '../lib/data';
import {
  User, Settings, Zap, Trophy, Target, Sparkles,
  Volume2, VolumeX, Shuffle, Eye, Moon, Sun
} from 'lucide-react';

export default function ProfileGenZ() {
  const [, setLocation] = useLocation();
  const { preferences, updatePreferences } = useUserPreferences();
  const { balance } = useCredits();
  const [totalCompleted, setTotalCompleted] = useState(0);

  useEffect(() => {
    const allQuestions = getAllQuestions();
    const allCompletedIds = new Set<string>();
    
    allQuestions.forEach(q => {
      const stored = localStorage.getItem(`progress-${q.channel}`);
      if (stored) {
        const completedIds = new Set(JSON.parse(stored));
        if (completedIds.has(q.id)) {
          allCompletedIds.add(q.id);
        }
      }
    });
    
    setTotalCompleted(allCompletedIds.size);
  }, []);

  const level = Math.floor(balance / 100);
  const xpInLevel = balance % 100;

  return (
    <>
      <SEOHead
        title="Profile - Your Settings ⚙️"
        description="Customize your learning experience"
        canonical="https://open-interview.github.io/profile"
      />

      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-4xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              {/* Avatar */}
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full flex items-center justify-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88] to-[#00d4ff] rounded-full blur-2xl opacity-50" />
                <User className="w-16 h-16 text-black relative z-10" strokeWidth={2.5} />
              </div>

              <div>
                <h1 className="text-4xl font-black mb-2">Level {level}</h1>
                <p className="text-[#a0a0a0]">{balance} XP • {totalCompleted} completed</p>
              </div>

              {/* Level Progress */}
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-[#a0a0a0]">Level {level}</span>
                  <span className="text-[#a0a0a0]">Level {level + 1}</span>
                </div>
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpInLevel}%` }}
                    transition={{ duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                  />
                </div>
                <div className="text-center text-sm text-[#a0a0a0] mt-2">
                  {xpInLevel}/100 XP to next level
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 backdrop-blur-xl rounded-[20px] border border-[#00ff88]/30 text-center"
              >
                <Zap className="w-8 h-8 text-[#00ff88] mx-auto mb-2" />
                <div className="text-2xl font-black">{balance}</div>
                <div className="text-xs text-[#a0a0a0]">Total XP</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-[20px] border border-purple-500/30 text-center"
              >
                <Trophy className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-black">{level}</div>
                <div className="text-xs text-[#a0a0a0]">Level</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[20px] border border-[#ffd700]/30 text-center"
              >
                <Target className="w-8 h-8 text-[#ffd700] mx-auto mb-2" />
                <div className="text-2xl font-black">{totalCompleted}</div>
                <div className="text-xs text-[#a0a0a0]">Completed</div>
              </motion.div>
            </div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-black flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Settings
              </h2>

              {/* Learning Preferences */}
              <div className="p-6 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 space-y-4">
                <h3 className="text-xl font-bold mb-4">Learning Preferences</h3>

                {/* Shuffle Questions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5 text-[#00ff88]" />
                    <div>
                      <div className="font-semibold">Shuffle Questions</div>
                      <div className="text-sm text-[#a0a0a0]">Randomize question order</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePreferences({ shuffleQuestions: !preferences.shuffleQuestions })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.shuffleQuestions !== false
                        ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.shuffleQuestions !== false ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Prioritize Unvisited */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-[#00d4ff]" />
                    <div>
                      <div className="font-semibold">Prioritize New</div>
                      <div className="text-sm text-[#a0a0a0]">Show unvisited questions first</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePreferences({ prioritizeUnvisited: !preferences.prioritizeUnvisited })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.prioritizeUnvisited !== false
                        ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.prioritizeUnvisited !== false ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Auto-play TTS */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="font-semibold">Auto-play Audio</div>
                      <div className="text-sm text-[#a0a0a0]">Automatically read questions</div>
                    </div>
                  </div>
                  <button
                    onClick={() => updatePreferences({ autoPlayTTS: !preferences.autoPlayTTS })}
                    className={`w-14 h-8 rounded-full transition-all ${
                      preferences.autoPlayTTS
                        ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff]'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${
                      preferences.autoPlayTTS ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/badges')}
                  className="p-6 bg-gradient-to-br from-[#ffd700]/20 to-[#ff8c00]/20 backdrop-blur-xl rounded-[20px] border border-[#ffd700]/30 text-left"
                >
                  <Trophy className="w-8 h-8 text-[#ffd700] mb-3" />
                  <div className="font-bold">Achievements</div>
                  <div className="text-sm text-[#a0a0a0]">View your badges</div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setLocation('/stats')}
                  className="p-6 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 backdrop-blur-xl rounded-[20px] border border-[#00ff88]/30 text-left"
                >
                  <Sparkles className="w-8 h-8 text-[#00ff88] mb-3" />
                  <div className="font-bold">Statistics</div>
                  <div className="text-sm text-[#a0a0a0]">View your progress</div>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </AppLayout>
    </>
  );
}
