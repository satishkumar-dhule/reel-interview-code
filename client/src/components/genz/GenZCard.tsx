/**
 * GenZ Card Component - Glassmorphism card with neon accents
 */

import { cn } from '../../lib/utils';

interface GenZCardProps {
  children: React.ReactNode;
  className?: string;
  neonBorder?: boolean;
  gradient?: string;
}

export function GenZCard({ children, className, neonBorder, gradient }: GenZCardProps) {
  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-xl rounded-[24px] border transition-all',
        neonBorder ? 'border-[#00ff88]/30 hover:border-[#00ff88]/60' : 'border-white/10',
        gradient && `bg-gradient-to-br ${gradient}`,
        className
      )}
    >
      {children}
    </div>
  );
}
