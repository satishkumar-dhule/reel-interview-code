import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import quotesData from '../lib/quotes/daily-quotes.json';

const INTRO_SEEN_KEY = 'marvel-intro-seen';

interface MarvelIntroProps {
  onComplete: () => void;
}

export function MarvelIntro({ onComplete }: MarvelIntroProps) {
  const [phase, setPhase] = useState<'logo' | 'quote' | 'done'>('logo');
  const [skipEnabled, setSkipEnabled] = useState(false);

  // Get today's quote based on date
  const getTodayQuote = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const index = dayOfYear % quotesData.quotes.length;
    return quotesData.quotes[index];
  };

  const quote = getTodayQuote();

  useEffect(() => {
    // Enable skip after 1 second
    const skipTimer = setTimeout(() => setSkipEnabled(true), 1000);

    // Phase transitions
    const logoTimer = setTimeout(() => setPhase('quote'), 2500);
    const quoteTimer = setTimeout(() => setPhase('done'), 6000);
    const completeTimer = setTimeout(() => {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(logoTimer);
      clearTimeout(quoteTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    onComplete();
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [null, Math.random() * -200 - 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="relative z-10 flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
          >
            {/* Main Logo with Marvel-style reveal */}
            <div className="relative">
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 blur-3xl bg-primary/30"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.8, 0.4], scale: [0.5, 1.2, 1] }}
                transition={{ duration: 2, times: [0, 0.5, 1] }}
              />
              
              {/* Logo text with clip reveal */}
              <motion.div
                className="relative"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={{ clipPath: 'inset(0 0% 0 0)' }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
              >
                <h1 className="text-6xl sm:text-8xl font-black tracking-tighter">
                  <span className="text-white">CODE</span>
                  <span className="text-primary">_</span>
                  <span className="text-primary">REELS</span>
                </h1>
              </motion.div>

              {/* Underline sweep */}
              <motion.div
                className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent mt-4"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              />
            </div>

            {/* Tagline */}
            <motion.p
              className="mt-6 text-white/60 text-sm sm:text-base tracking-[0.3em] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Master Your Interview
            </motion.p>
          </motion.div>
        )}

        {phase === 'quote' && (
          <motion.div
            key="quote"
            className="relative z-10 max-w-2xl mx-auto px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
          >
            {/* Quote marks */}
            <motion.span
              className="absolute -top-8 -left-4 text-8xl text-primary/20 font-serif"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              "
            </motion.span>

            {/* Quote text with typewriter effect */}
            <motion.blockquote
              className="text-2xl sm:text-4xl font-light text-white leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              {quote.text.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.02 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.blockquote>

            {/* Author */}
            <motion.cite
              className="block mt-6 text-primary text-lg sm:text-xl not-italic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              — {quote.author}
            </motion.cite>

            {/* Decorative line */}
            <motion.div
              className="mt-8 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {skipEnabled && phase !== 'done' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 px-4 py-2 text-xs text-white/40 hover:text-white/80 uppercase tracking-widest transition-colors"
          >
            Skip →
          </motion.button>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-primary"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 7, ease: 'linear' }}
      />
    </motion.div>
  );
}

// Hook to check if intro should be shown
export function useMarvelIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY);
    setShowIntro(!seen);
    setIsChecking(false);
  }, []);

  const completeIntro = () => {
    setShowIntro(false);
  };

  const resetIntro = () => {
    localStorage.removeItem(INTRO_SEEN_KEY);
    setShowIntro(true);
  };

  return { showIntro, isChecking, completeIntro, resetIntro };
}
