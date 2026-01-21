/**
 * Theme Toggle Button - Gen Z Edition
 * Floating button to switch between dark and light modes
 */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'genz-dark';

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={cn(
        "fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all lg:bottom-6",
        isDark
          ? "bg-gradient-to-br from-[#00ff88] to-[#00d4ff] shadow-[#00ff88]/50"
          : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/50"
      )}
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Moon className="w-6 h-6 text-black" strokeWidth={2.5} />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className="absolute"
      >
        <Sun className="w-6 h-6 text-white" strokeWidth={2.5} />
      </motion.div>
    </motion.button>
  );
}
