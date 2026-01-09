/**
 * Achievement Notification Manager
 * Displays achievement unlock notifications globally
 */

import { useAchievementContext } from '../context/AchievementContext';
import { RewardNotification } from './RewardNotification';
import { AnimatePresence } from 'framer-motion';

export function AchievementNotificationManager() {
  const { newlyUnlocked, dismissNotification } = useAchievementContext();

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      <AnimatePresence>
        {newlyUnlocked.map((achievement, index) => (
          <div
            key={achievement.id}
            className="pointer-events-auto"
            style={{
              position: 'absolute',
              top: `${16 + index * 120}px`,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          >
            <RewardNotification
              achievement={achievement}
              rewards={achievement.rewards}
              onClose={() => dismissNotification(achievement.id)}
              autoClose={true}
              duration={5000}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
