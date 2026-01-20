/**
 * GenZ Progress Bar - Neon progress indicator
 */

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GenZProgressProps {
  value: number;
  max: number;
  color?: 'green' | 'blue' | 'pink' | 'gold';
  showLabel?: boolean;
  className?: string;
}

export function GenZProgress({
  value,
  max,
  color = 'green',
  showLabel = false,
  className,
}: GenZProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    green: 'from-[#00ff88] to-[#00d4ff]',
    blue: 'from-[#00d4ff] to-[#0080ff]',
    pink: 'from-[#ff0080] to-[#ff00ff]',
    gold: 'from-[#ffd700] to-[#ff8c00]',
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full bg-gradient-to-r ${colors[color]}`}
        />
      </div>
      {showLabel && (
        <div className="mt-2 text-sm text-[#a0a0a0] text-right">
          {value} / {max}
        </div>
      )}
    </div>
  );
}
