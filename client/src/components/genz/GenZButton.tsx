/**
 * GenZ Button Component - Neon gradient buttons
 */

import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GenZButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function GenZButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className,
  type = 'button',
}: GenZButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black font-bold',
    secondary: 'bg-white/10 border border-white/20 text-white hover:bg-white/20',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold',
    ghost: 'bg-transparent text-white hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-[12px]',
    md: 'px-6 py-3 text-base rounded-[16px]',
    lg: 'px-8 py-4 text-lg rounded-[20px]',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      className={cn(
        'transition-all font-semibold',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {children}
    </motion.button>
  );
}
