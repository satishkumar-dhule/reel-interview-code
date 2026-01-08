/**
 * Achievement Context
 * Global state management for achievements with credit system integration
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  Achievement,
  AchievementProgress,
  UserEvent,
  processUserEvent,
  calculateAchievementProgress,
  getMetrics,
  UserMetrics,
} from '../lib/achievements';
import { earnCredits as earnCreditsLib } from '../lib/credits';

interface AchievementContextType {
  progress: AchievementProgress[];
  metrics: UserMetrics;
  newlyUnlocked: Achievement[];
  trackEvent: (event: UserEvent) => void;
  refreshProgress: () => void;
  dismissNotification: (achievementId: string) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics>(() => getMetrics());
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load initial progress
  useEffect(() => {
    refreshProgress();
  }, []);

  // Refresh progress
  const refreshProgress = useCallback(() => {
    const allProgress = calculateAchievementProgress();
    setProgress(allProgress);
    setMetrics(getMetrics());
  }, []);

  // Track user event
  const trackEvent = useCallback((event: UserEvent) => {
    const unlocked = processUserEvent(event);
    
    if (unlocked.length > 0) {
      // Show notifications
      setNewlyUnlocked(prev => [...prev, ...unlocked]);
      
      // Award credits for achievements
      unlocked.forEach(achievement => {
        const creditRewards = achievement.rewards.filter(r => r.type === 'credits');
        creditRewards.forEach(reward => {
          earnCreditsLib(reward.amount, `Achievement: ${achievement.name}`);
        });
      });
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNewlyUnlocked(prev => prev.filter(a => !unlocked.includes(a)));
      }, 5000);
    }
    
    // Refresh progress
    refreshProgress();
  }, [refreshProgress]);

  // Dismiss notification
  const dismissNotification = useCallback((achievementId: string) => {
    setNewlyUnlocked(prev => prev.filter(a => a.id !== achievementId));
  }, []);

  return (
    <AchievementContext.Provider
      value={{
        progress,
        metrics,
        newlyUnlocked,
        trackEvent,
        refreshProgress,
        dismissNotification,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievementContext() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievementContext must be used within AchievementProvider');
  }
  return context;
}
