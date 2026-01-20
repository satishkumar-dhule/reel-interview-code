/**
 * Gen Z Tests Page - Challenge Yourself
 * Take tests, earn badges, track progress
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { 
  Test, loadTests, getAllTestProgress, getTestStats,
  checkAndExpireTests
} from '../lib/tests';
import { useCredits } from '../context/CreditsContext';
import {
  Trophy, Target, Clock, CheckCircle, Lock, ChevronRight,
  Star, Zap, Sparkles, AlertTriangle, Search
} from 'lucide-react';

export default function TestsGenZ() {
  const [, setLocation] = useLocation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiredChannels, setExpiredChannels] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const progress = getAllTestProgress();
  const stats = getTestStats();
  const { balance, formatCredits } = useCredits();

  useEffect(() => {
    const initTests = async () => {
      const expired = await checkAndExpireTests();
      setExpiredChannels(expired);
      const t = await loadTests();
      setTests(t);
      setLoading(false);
    };
    initTests();
  }, []);

  const passedCount = Object.values(progress).filter(p => p.passed && !p.expired).length;
  const expiredCount = Object.values(progress).filter(p => p.expired).length;

  // Filter tests based on search query
  const filteredTests = tests.filter(test =>
    test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.channelId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEOHead
        title="Tests - Challenge Yourself 🎯"
        description="Take knowledge tests and earn badges"
        canonical="https://open-interview.github.io/tests"
      />

      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black">
                Test your
                <br />
                <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                  knowledge
                </span>
              </h1>
              <p className="text-xl text-[#a0a0a0]">
                Prove what you know 💪
              </p>
            </motion.div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[20px] text-white placeholder:text-[#666] focus:outline-none focus:border-[#00ff88] transition-colors"
                />
              </div>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-[20px] border border-green-500/30"
              >
                <Trophy className="w-8 h-8 text-green-500 mb-2" />
                <div className="text-3xl font-black">{passedCount}</div>
                <div className="text-sm text-[#a0a0a0]">Passed</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="p-6 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl rounded-[20px] border border-blue-500/30"
              >
                <Target className="w-8 h-8 text-blue-500 mb-2" />
                <div className="text-3xl font-black">{stats.totalAttempts}</div>
                <div className="text-sm text-[#a0a0a0]">Attempts</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-xl rounded-[20px] border border-purple-500/30"
              >
                <Star className="w-8 h-8 text-purple-500 mb-2" />
                <div className="text-3xl font-black">{stats.averageScore}%</div>
                <div className="text-sm text-[#a0a0a0]">Avg Score</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="p-6 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 backdrop-blur-xl rounded-[20px] border border-amber-500/30"
              >
                <Zap className="w-8 h-8 text-amber-500 mb-2" />
                <div className="text-3xl font-black">{formatCredits(balance)}</div>
                <div className="text-sm text-[#a0a0a0]">Credits</div>
              </motion.div>
            </div>

            {/* Tests Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-[#a0a0a0]">Loading tests...</p>
              </div>
            ) : filteredTests.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No tests found</h3>
                <p className="text-[#a0a0a0]">Try a different search term</p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map((test, i) => {
                  const testProgress = progress[test.channelId];
                  const isPassed = testProgress?.passed && !testProgress?.expired;
                  const isExpired = testProgress?.expired;

                  return (
                    <motion.button
                      key={test.channelId}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.05, 0.5) }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLocation(`/test/${test.channelId}`)}
                      className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 hover:border-white/20 transition-all text-left overflow-hidden"
                    >
                      {/* Background gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-[#00d4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="relative space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-xs font-semibold text-[#00ff88] mb-1 uppercase tracking-wider">
                              {test.channelName}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{test.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
                              <Clock className="w-4 h-4" />
                              <span>{test.questions.length} questions</span>
                            </div>
                          </div>

                          {isPassed && (
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-white" />
                            </div>
                          )}

                          {isExpired && (
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Progress */}
                        {testProgress && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-[#a0a0a0]">Best Score</span>
                              <span className="font-bold">{testProgress.bestScore}%</span>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff]"
                                style={{ width: `${testProgress.bestScore}%` }}
                              />
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-sm font-semibold text-[#00ff88]">
                            {isPassed ? 'Retake Test' : isExpired ? 'Retake (Expired)' : 'Start Test'}
                          </span>
                          <ChevronRight className="w-5 h-5 text-[#666] group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}


          </div>
        </div>
      </AppLayout>
    </>
  );
}
