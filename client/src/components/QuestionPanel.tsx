import { motion } from 'framer-motion';
import { Hash, Zap, Target, Flame, Bookmark, Clock } from 'lucide-react';
import type { Question } from '../lib/data';

interface QuestionPanelProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isMarked: boolean;
  onToggleMark: () => void;
  timerEnabled: boolean;
  timeLeft: number;
}

export function QuestionPanel({ 
  question, 
  questionNumber, 
  totalQuestions,
  isMarked,
  onToggleMark,
  timerEnabled,
  timeLeft
}: QuestionPanelProps) {
  const getDifficultyConfig = () => {
    switch (question.difficulty) {
      case 'beginner':
        return {
          icon: Zap,
          color: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          label: 'Beginner'
        };
      case 'intermediate':
        return {
          icon: Target,
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          label: 'Intermediate'
        };
      case 'advanced':
        return {
          icon: Flame,
          color: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          label: 'Advanced'
        };
      default:
        return {
          icon: Target,
          color: 'text-white/50',
          bg: 'bg-white/5',
          border: 'border-white/10',
          label: 'Unknown'
        };
    }
  };

  const difficultyConfig = getDifficultyConfig();
  const DifficultyIcon = difficultyConfig.icon;

  return (
    <div className="w-full h-full flex flex-col justify-center px-3 sm:px-6 md:px-10 lg:px-16 py-4 sm:py-6 relative">
      {/* Header badges */}
      <div className="absolute top-2 sm:top-4 left-3 sm:left-6 md:left-10 lg:left-16 right-3 sm:right-4 flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* Question ID */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded">
          <Hash className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-mono text-white/70">{question.id}</span>
        </div>

        {/* Progress */}
        <div className="px-2 py-1 bg-white/5 border border-white/10 rounded">
          <span className="text-[10px] font-mono text-white/70">
            {questionNumber} / {totalQuestions}
          </span>
        </div>

        {/* Difficulty */}
        <div className={`flex items-center gap-1.5 px-2 py-1 ${difficultyConfig.bg} border ${difficultyConfig.border} rounded`}>
          <DifficultyIcon className={`w-3 h-3 ${difficultyConfig.color}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${difficultyConfig.color}`}>
            {difficultyConfig.label}
          </span>
        </div>

        {/* SubChannel */}
        <div className="px-2 py-1 bg-white/5 border border-white/10 rounded">
          <span className="text-[10px] font-mono text-white/50 uppercase tracking-wider">
            {question.subChannel}
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bookmark */}
        <button
          onClick={onToggleMark}
          className={`p-1.5 rounded transition-all ${
            isMarked
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-white/5 text-white/30 hover:text-blue-400 hover:bg-blue-500/10 border border-white/10'
          }`}
          title={isMarked ? 'Remove bookmark' : 'Bookmark this question'}
        >
          <Bookmark className={`w-4 h-4 ${isMarked ? 'fill-blue-400' : ''}`} />
        </button>
      </div>

      {/* Main question content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto w-full space-y-3 sm:space-y-6"
      >
        {/* Question text - More compact on mobile */}
        <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold leading-snug sm:leading-tight tracking-tight text-white">
          {question.question}
        </h1>

        {/* Tags - Fewer on mobile */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {question.tags.slice(0, 4).map(tag => (
              <span 
                key={tag} 
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-white/5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider border border-white/10 text-white/50 rounded"
              >
                #{tag}
              </span>
            ))}
            {question.tags.length > 4 && (
              <span className="px-2 py-0.5 text-[9px] sm:text-xs text-white/30">
                +{question.tags.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Timer display - Compact on mobile */}
        {timerEnabled && timeLeft > 0 && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 sm:gap-3 px-3 py-2 sm:px-4 sm:py-3 bg-primary/5 border-l-4 border-primary rounded"
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/50 mb-0.5">Time Left</div>
              <div className="text-lg sm:text-2xl font-mono font-bold text-primary tabular-nums">
                {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Bottom hint - Hidden on very small screens */}
      <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-6 md:left-10 lg:left-16 right-3 sm:right-4 hidden xs:block">
        <div className="text-[9px] sm:text-[10px] text-white/20 uppercase tracking-widest">
          <span className="hidden sm:inline">Press → to reveal answer</span>
          <span className="sm:hidden">Tap below to reveal</span>
        </div>
      </div>
    </div>
  );
}
