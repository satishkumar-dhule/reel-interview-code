/**
 * Reward Notification
 * Animated notification for achievements, XP, credits, and level ups
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Coins, Star, X, TrendingUp } from 'lucide-react';
import { Achievement, Reward } from '../lib/achievements';

interface RewardNotificationProps {
  achievement?: Achievement;
  rewards?: Reward[];
  levelUp?: { from: number; to: number; title: string };
  xpGained?: number;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function RewardNotification({
  achievement,
  rewards = [],
  levelUp,
  xpGained,
  onClose,
  autoClose = true,
  duration = 5000
}: RewardNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto close
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  // Achievement notification
  if (achievement) {
    return (
      <AnimatePresence>
        {isVisible && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className={`bg-gradient-to-br ${achievement.gradient} p-4 rounded-xl shadow-2xl border-2 border-white/20`}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-1">
                      Achievement Unlocked!
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-white/90">
                      {achievement.description}
                    </p>
                    
                    {/* Rewards */}
                    {rewards.length > 0 && (
                      <div className="flex items-center gap-3 mt-2">
                        {rewards.map((reward, i) => (
                          <div key={i} className="flex items-center gap-1 text-white/90">
                            {reward.type === 'xp' && <Zap className="w-4 h-4" />}
                            {reward.type === 'credits' && <Coins className="w-4 h-4" />}
                            {reward.type === 'title' && <Star className="w-4 h-4" />}
                            <span className="text-sm font-bold">
                              +{reward.amount} {reward.type === 'xp' ? 'XP' : reward.type === 'credits' ? 'Credits' : reward.item}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    );
  }

  // Level up notification
  if (levelUp) {
    return (
      <AnimatePresence>
        {isVisible && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 max-w-sm w-full mx-4"
            >
              <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-6 rounded-2xl shadow-2xl border-2 border-white/20 text-center">
                {/* Level badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="text-4xl font-bold text-white">
                    {levelUp.to}
                  </div>
                </motion.div>
                
                {/* Text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-sm font-bold text-white/80 uppercase tracking-wider mb-2">
                    Level Up!
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {levelUp.title}
                  </h2>
                  <p className="text-white/90 text-sm">
                    You've reached Level {levelUp.to}!
                  </p>
                  
                  {/* Rewards */}
                  {rewards.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                        Rewards
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {rewards.map((reward, i) => (
                          <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 rounded-full">
                            {reward.type === 'xp' && <Zap className="w-4 h-4 text-white" />}
                            {reward.type === 'credits' && <Coins className="w-4 h-4 text-white" />}
                            {reward.type === 'unlock' && <Star className="w-4 h-4 text-white" />}
                            <span className="text-sm font-bold text-white">
                              {reward.type === 'unlock' ? reward.item?.replace(/_/g, ' ') : `+${reward.amount}`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
                
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    );
  }

  // XP gained notification (simple)
  if (xpGained) {
    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className="bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-bold text-primary-foreground">
                +{xpGained} XP
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return null;
}

// Hook for managing notifications
export function useRewardNotifications() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'achievement' | 'levelup' | 'xp';
    data: any;
  }>>([]);

  const showAchievement = (achievement: Achievement, rewards: Reward[]) => {
    const id = `achievement-${Date.now()}`;
    setNotifications(prev => [...prev, {
      id,
      type: 'achievement',
      data: { achievement, rewards }
    }]);
  };

  const showLevelUp = (from: number, to: number, title: string, rewards: Reward[]) => {
    const id = `levelup-${Date.now()}`;
    setNotifications(prev => [...prev, {
      id,
      type: 'levelup',
      data: { levelUp: { from, to, title }, rewards }
    }]);
  };

  const showXP = (amount: number) => {
    const id = `xp-${Date.now()}`;
    setNotifications(prev => [...prev, {
      id,
      type: 'xp',
      data: { xpGained: amount }
    }]);
  };

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return {
    notifications,
    showAchievement,
    showLevelUp,
    showXP,
    dismiss,
  };
}
