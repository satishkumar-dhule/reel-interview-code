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
    <AnimatePresence>
      {newlyUnlocked.map((achievement, index) => (
        <div
          key={achievement.id}
          style={{
            position: 'fixed',
            top: `${4 + index * 120}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
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
  );
}
