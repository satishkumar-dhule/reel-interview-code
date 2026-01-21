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
        'bg-card/50 backdrop-blur-xl rounded-[24px] border transition-all',
        neonBorder ? 'border-primary/30 hover:border-primary/60' : 'border-border',
        gradient && `bg-gradient-to-br ${gradient}`,
        className
      )}
    >
      {children}
    </div>
  );
}
