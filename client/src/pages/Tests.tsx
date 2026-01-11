/**
 * Tests Page - Lists all available tests and user progress
 * Vibrant channel-based theming with pass expiration tracking
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Target, Clock, CheckCircle, Lock,
  ChevronRight, Star, BarChart2, Mic, Coins,
  Sparkles, AlertTriangle, RefreshCw, Zap
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { AppLayout } from '../components/layout/AppLayout';
import { 
  Test, loadTests, getAllTestProgress, TestProgress, getTestStats,
  getChannelTheme, checkAndExpireTests, checkTestExpiration
} from '../lib/tests';
import { useCredits } from '../context/CreditsContext';

export default function Tests() {
  const [_, setLocation] = useLocation();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [expiredChannels, setExpiredChannels] = useState<string[]>([]);
  const progress = getAllTestProgress();
  const stats = getTestStats();
  const { balance, formatCredits, config } = useCredits();

  useEffect(() => {
    const initTests = async () => {
      // Check for expired tests first
      const expired = await checkAndExpireTests();
      setExpiredChannels(expired);
      
      const t = await loadTests();
      setTests(t);
      setLoading(false);
    };
    initTests();
  }, []);

  // Calculate vibrant stats
  const passedCount = Object.values(progress).filter(p => p.passed && !p.expired).length;
  const expiredCount = Object.values(progress).filter(p => p.expired).length;

  return (
    <>
      <SEOHead
        title="Knowledge Tests - Test Your Interview Prep | Code Reels"
        description="Test your technical interview knowledge with quizzes for each topic. Track your progress and earn shareable badges."
        canonical="https://open-interview.github.io/tests"
      />

      <AppLayout title="Tests" showBackOnMobile>
        <div className="max-w-4xl mx-auto font-mono">

          {/* Vibrant Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-full border border-primary/30 mb-3">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium">Channel-Based Knowledge Tests</span>
            </div>
          </motion.div>

          {/* Stats Overview - More Vibrant */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6"
          >
            <div className="border border-green-500/30 p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/5 rounded-lg text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
              <Trophy className="w-5 h-5 mx-auto mb-1 text-green-500 relative z-10" />
              <div className="text-lg font-bold text-green-500 relative z-10">{passedCount}</div>
              <div className="text-[9px] text-muted-foreground uppercase relative z-10">Passed</div>
            </div>
            <div className="border border-blue-500/30 p-3 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 rounded-lg text-center">
              <Target className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <div className="text-lg font-bold text-blue-500">{stats.totalAttempts}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Attempts</div>
            </div>
            <div className="border border-purple-500/30 p-3 bg-gradient-to-br from-purple-500/10 to-violet-500/5 rounded-lg text-center">
              <BarChart2 className="w-5 h-5 mx-auto mb-1 text-purple-500" />
              <div className="text-lg font-bold text-purple-500">{stats.averageScore}%</div>
              <div className="text-[9px] text-muted-foreground uppercase">Avg Score</div>
            </div>
            <button 
              onClick={() => setLocation('/profile')}
              className="border border-amber-500/30 p-3 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-lg text-center hover:from-amber-500/20 hover:to-yellow-500/10 transition-all"
            >
              <Coins className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              <div className="text-lg font-bold text-amber-500">{formatCredits(balance)}</div>
              <div className="text-[9px] text-muted-foreground uppercase">Credits</div>
            </button>
          </motion.div>

          {/* Expired Tests Alert */}
          <AnimatePresence>
            {expiredCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-500">
                    {expiredCount} test{expiredCount > 1 ? 's' : ''} expired due to new questions!
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Retake to maintain your certification status
                  </p>
                </div>
                <RefreshCw className="w-4 h-4 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Voice Interview CTA - Enhanced */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setLocation('/voice-interview')}
            className="w-full mb-6 p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-4 hover:from-emerald-500/20 hover:via-teal-500/20 hover:to-cyan-500/20 transition-all group shadow-lg shadow-emerald-500/10"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Mic className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold flex items-center gap-2">
                Voice Interview Practice
                <Zap className="w-4 h-4 text-amber-500" />
              </h3>
              <p className="text-xs text-muted-foreground">Answer questions out loud and get AI feedback</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-xs font-bold text-green-400 flex items-center gap-1">
                <Coins className="w-3 h-3" />+{config.VOICE_ATTEMPT}
              </span>
              <ChevronRight className="w-5 h-5 text-emerald-500 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>

          {/* Tests List - Vibrant Channel Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading tests...</p>
            </div>
          ) : tests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border border-dashed border-border rounded-lg"
            >
              <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="text-lg font-bold mb-2">No Tests Available Yet</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Tests are being generated by our bot. Check back soon!
              </p>
              <button
                onClick={() => setLocation('/')}
                className="text-primary hover:underline text-sm"
              >
                Continue Learning
              </button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {tests.map((test, i) => {
                const testProgress = progress[test.id];
                const isPassed = testProgress?.passed && !testProgress?.expired;
                const isExpired = testProgress?.expired;
                const bestScore = testProgress?.bestScore || 0;
                const attempts = testProgress?.attempts.length || 0;
                const theme = getChannelTheme(test.channelId);

                return (
                  <motion.div
                    key={test.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setLocation(`/test/${test.channelId}`)}
                    className={`border p-4 bg-card rounded-lg cursor-pointer transition-all group relative overflow-hidden ${
                      isPassed 
                        ? 'border-green-500/50 hover:border-green-500' 
                        : isExpired
                        ? 'border-amber-500/50 hover:border-amber-500'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {/* Vibrant gradient background */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient} opacity-30 group-hover:opacity-50 transition-opacity`} />
                    
                    <div className="flex items-center gap-4 relative z-10">
                      {/* Channel icon with theme */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${theme.secondary} ${
                        isPassed ? 'ring-2 ring-green-500/50' : isExpired ? 'ring-2 ring-amber-500/50' : ''
                      }`}>
                        {isPassed ? (
                          <CheckCircle className="w-6 h-6 text-green-500" />
                        ) : isExpired ? (
                          <RefreshCw className="w-6 h-6 text-amber-500" />
                        ) : (
                          <span className="text-2xl">{theme.icon}</span>
                        )}
                      </div>

                      {/* Test info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`font-bold leading-tight ${theme.primary}`}>{test.title}</h3>
                          {isPassed && (
                            <span className="px-1.5 py-0.5 bg-green-500/20 text-green-500 text-[9px] uppercase rounded flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Passed
                            </span>
                          )}
                          {isExpired && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-500 text-[9px] uppercase rounded flex items-center gap-1 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> Expired
                            </span>
                          )}
                          {test.version > 1 && (
                            <span className="px-1.5 py-0.5 bg-primary/20 text-primary text-[9px] uppercase rounded">
                              v{test.version}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {test.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Sparkles className={`w-3 h-3 ${theme.primary}`} />
                            {test.questions.length} questions
                          </span>
                          <span>•</span>
                          <span>{test.passingScore}% to pass</span>
                          {attempts > 0 && (
                            <>
                              <span>•</span>
                              <span className={theme.primary}>Best: {bestScore}%</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Arrow with theme color */}
                      <ChevronRight className={`w-5 h-5 ${theme.primary} opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all flex-shrink-0`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </AppLayout>
    </>
  );
}
