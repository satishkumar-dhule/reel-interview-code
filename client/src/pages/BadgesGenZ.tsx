/**
 * Gen Z Badges Page - Your Achievements
 * Collect badges, show off your skills
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import { useAchievements } from '../hooks/use-achievements';
import {
  Trophy, Lock, Sparkles
} from 'lucide-react';

const tierColors = {
  bronze: 'from-[#cd7f32] to-[#8b4513]',
  silver: 'from-[#c0c0c0] to-[#808080]',
  gold: 'from-[#ffd700] to-[#ff8c00]',
  platinum: 'from-[#e5e4e2] to-[#b0b0b0]',
  diamond: 'from-[#b9f2ff] to-cyan-500'
};

export default function BadgesGenZ() {
  const { progress: allBadges, unlocked: unlockedBadges, locked: lockedBadges, nextUp, stats, isLoading } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(allBadges.map(b => b.achievement.category)));

  const filteredBadges = selectedCategory
    ? allBadges.filter(b => b.achievement.category === selectedCategory)
    : allBadges;

  // Safety check
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h2 className="text-2xl font-bold mb-2">Loading achievements...</h2>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!allBadges || allBadges.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold mb-2">No badges yet</h2>
            <p className="text-muted-foreground">Start completing challenges to earn badges!</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Achievements - Your Badges 🏆"
        description="View your earned badges and achievements"
        canonical="https://open-interview.github.io/badges"
      />

      <AppLayout>
        <div className="min-h-screen bg-background text-foreground">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black">
                Your
                <br />
                <span className="bg-gradient-to-r from-[#ffd700] to-[#ff8c00] bg-clip-text text-transparent">
                  achievements
                </span>
              </h1>
              <p className="text-xl text-muted-foreground">
                {stats.unlocked}/{stats.total} unlocked
              </p>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-12"
            >
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percentage}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-[#ffd700] to-[#ff8c00]"
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
                    ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black'
                    : 'bg-muted/50 border border-border hover:bg-muted'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all capitalize ${
                    selectedCategory === cat
                      ? 'bg-gradient-to-r from-[#ffd700] to-[#ff8c00] text-black'
                      : 'bg-muted/50 border border-border hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </motion.div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBadges.map((badgeProgress, i) => {
                const badge = badgeProgress.achievement;
                const isUnlocked = badgeProgress.isUnlocked;
                const currentProgress = badgeProgress.progress;
                const target = badgeProgress.target;
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    whileHover={{ scale: isUnlocked ? 1.05 : 1 }}
                    className={`relative p-6 backdrop-blur-xl rounded-[24px] border transition-all ${
                      isUnlocked
                        ? 'bg-muted/50 border-border'
                        : 'bg-muted/20 border-border/50 opacity-50'
                    }`}
                  >
                    {/* Badge Icon */}
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isUnlocked
                        ? `bg-gradient-to-br ${tierColors[badge.tier as keyof typeof tierColors] || tierColors.bronze}`
                        : 'bg-muted'
                    }`}>
                      {isUnlocked ? (
                        <Trophy className="w-10 h-10 text-foreground" strokeWidth={2.5} />
                      ) : (
                        <Lock className="w-10 h-10 text-muted-foreground" />
                      )}
                    </div>

                    {/* Badge Info */}
                    <div className="text-center space-y-2">
                      <h3 className="font-bold">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{badge.description}</p>
                      
                      {isUnlocked && badgeProgress.unlockedAt && (
                        <div className="text-xs text-primary">
                          Unlocked {new Date(badgeProgress.unlockedAt).toLocaleDateString()}
                        </div>
                      )}

                      {!isUnlocked && currentProgress !== undefined && target !== undefined && (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {currentProgress}/{target}
                          </div>
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-cyan-500"
                              style={{ width: `${Math.min((currentProgress / target) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Tier Badge */}
                      <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold capitalize ${
                        isUnlocked
                          ? `bg-gradient-to-r ${tierColors[badge.tier as keyof typeof tierColors] || tierColors.bronze} text-foreground`
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {badge.tier}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Next Up */}
            {nextUp.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 p-8 bg-gradient-to-br from-primary/20 to-cyan-500/20 backdrop-blur-xl rounded-[24px] border border-primary/30"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Almost There!</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextUp.slice(0, 4).map((badgeProgress) => {
                    const badge = badgeProgress.achievement;
                    const currentProgress = badgeProgress.current;
                    const target = badgeProgress.target;
                    
                    return (
                      <div
                        key={badge.id}
                        className="p-4 bg-muted/50 rounded-[16px] border border-border"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-bold mb-1">{badge.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {currentProgress}/{target}
                            </div>
                            <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-cyan-500"
                                style={{ width: `${Math.min((currentProgress / target) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
