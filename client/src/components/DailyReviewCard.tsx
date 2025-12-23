/**
 * Daily Review Card Component
 * Shows SRS review queue status and quick access to reviews
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Brain, Flame, ChevronRight, Calendar, 
  Trophy, Target, Sparkles, Clock
} from 'lucide-react';
import { 
  getSRSStats, getDueCards, getMasteryLabel, getMasteryColor,
  type SRSStats, type ReviewCard 
} from '../lib/spaced-repetition';

export function DailyReviewCard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<SRSStats | null>(null);
  const [dueCards, setDueCards] = useState<ReviewCard[]>([]);

  useEffect(() => {
    setStats(getSRSStats());
    setDueCards(getDueCards());
  }, []);

  if (!stats || stats.totalCards === 0) {
    return null; // Don't show if no cards in SRS
  }

  const hasDueCards = stats.dueToday > 0;

  return (
    <section className="mx-3 sm:mx-0 mb-2 sm:mb-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl sm:rounded-2xl border overflow-hidden ${
          hasDueCards 
            ? 'bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20' 
            : 'bg-card border-border'
        }`}
      >
        {/* Header */}
        <div className="px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-b border-border/30">
          <div className="flex items-center gap-2">
            <Brain className={`w-4 h-4 ${hasDueCards ? 'text-purple-500' : 'text-muted-foreground'}`} />
            <span className={`text-xs sm:text-sm font-semibold uppercase tracking-wide ${
              hasDueCards ? 'text-purple-500' : 'text-muted-foreground'
            }`}>
              Spaced Repetition
            </span>
          </div>
          {stats.reviewStreak > 0 && (
            <div className="flex items-center gap-1 text-orange-500">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{stats.reviewStreak} day streak</span>
            </div>
          )}
        </div>

        {/* Content */}
        <button
          onClick={() => setLocation('/review')}
          className="w-full p-3 sm:p-4 text-left hover:bg-muted/30 transition-colors"
        >
          {hasDueCards ? (
            <div className="space-y-3">
              {/* Due count */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl sm:text-3xl font-bold text-purple-500">
                    {stats.dueToday}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    cards due for review
                  </div>
                </div>
                <div className="flex items-center gap-1 text-purple-500">
                  <span className="text-sm font-medium">Start Review</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              {/* Preview of due cards */}
              {dueCards.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {dueCards.slice(0, 5).map((card) => (
                    <span
                      key={card.questionId}
                      className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium ${getMasteryColor(card.masteryLevel)} bg-muted/50`}
                    >
                      {card.channel}
                    </span>
                  ))}
                  {dueCards.length > 5 && (
                    <span className="px-2 py-0.5 text-[10px] sm:text-xs text-muted-foreground">
                      +{dueCards.length - 5} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <div className="font-medium text-sm sm:text-base">All caught up!</div>
                  <div className="text-xs text-muted-foreground">
                    {stats.dueTomorrow > 0 
                      ? `${stats.dueTomorrow} cards due tomorrow`
                      : `${stats.dueThisWeek} cards due this week`
                    }
                  </div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
        </button>

        {/* Stats footer */}
        <div className="px-3 sm:px-4 py-2 border-t border-border/30 flex items-center justify-around text-center">
          <div>
            <div className="text-sm sm:text-base font-semibold">{stats.totalCards}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Total</div>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <div className="text-sm sm:text-base font-semibold text-green-500">{stats.mastered}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Mastered</div>
          </div>
          <div className="w-px h-6 bg-border" />
          <div>
            <div className="text-sm sm:text-base font-semibold text-blue-500">{stats.learning}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">Learning</div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default DailyReviewCard;
