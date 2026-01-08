/**
 * Training Mode - Read and Record Answers
 * 
 * Features:
 * - Answer is visible for reading
 * - Voice recording with unified hook
 * - Practice speaking technical answers fluently
 * - Word-by-word playback highlighting
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ChevronRight, Eye, Target,
  CheckCircle, BookOpen, Sparkles
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ChannelService } from '../services/api.service';
import { useVoiceRecording } from '../hooks/use-voice-recording';
import { RecordingPanel } from '../components/unified/RecordingPanel';
import type { Question } from '../types';

// No local interfaces needed - using unified hook

export default function TrainingMode() {
  const [, setLocation] = useLocation();
  const { getSubscribedChannels } = useUserPreferences();
  const subscribedChannels = getSubscribedChannels();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [hasLoadedQuestions, setHasLoadedQuestions] = useState(false);

  // Use unified voice recording hook
  const recording = useVoiceRecording({
    onRecordingComplete: (_audioBlob, _transcript) => {
      // Mark question as completed when recording is done
      if (currentQuestion) {
        setCompletedQuestions(prev => new Set(prev).add(currentQuestion.id));
      }
    }
  });

  const currentQuestion = questions[currentIndex];
  const totalWords = currentQuestion?.answer ? countWords(currentQuestion.answer) : 0;

  // Load questions from subscribed channels - only once
  useEffect(() => {
    if (hasLoadedQuestions) return;

    const loadQuestions = async () => {
      console.log('TrainingMode: Starting to load questions');
      console.log('TrainingMode: Subscribed channels:', subscribedChannels.length);
      
      setLoading(true);
      
      if (subscribedChannels.length === 0) {
        console.log('TrainingMode: No subscribed channels');
        setLoading(false);
        setHasLoadedQuestions(true);
        return;
      }

      try {
        const allQuestions: Question[] = [];
        
        for (const channel of subscribedChannels) {
          try {
            console.log(`TrainingMode: Loading channel ${channel.id}`);
            const data = await ChannelService.getData(channel.id);
            console.log(`TrainingMode: Loaded ${data.questions.length} questions from ${channel.id}`);
            allQuestions.push(...data.questions);
          } catch (e) {
            console.error(`TrainingMode: Failed to load ${channel.id}`, e);
          }
        }

        console.log(`TrainingMode: Total questions loaded: ${allQuestions.length}`);
        
        if (allQuestions.length > 0) {
          // Simple shuffle
          const shuffled = allQuestions.sort(() => Math.random() - 0.5);
          const selected = shuffled.slice(0, 20);
          console.log(`TrainingMode: Selected ${selected.length} questions for training`);
          setQuestions(selected);
        }
      } catch (e) {
        console.error('TrainingMode: Failed to load questions', e);
      }
      
      setLoading(false);
      setHasLoadedQuestions(true);
    };

    loadQuestions();
  }, [subscribedChannels, hasLoadedQuestions]);

  // Reset recording when question changes
  useEffect(() => {
    if (!currentQuestion?.answer) return;
    recording.resetRecording();
  }, [currentQuestion]);

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Completed all questions
      setLocation('/');
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading training questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No Questions Available</h2>
          <p className="text-muted-foreground mb-4">
            Subscribe to channels to access training questions
          </p>
          <button
            onClick={() => setLocation('/channels')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Browse Channels
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Training Mode - Practice Speaking Answers"
        description="Read and record technical interview answers to improve your speaking skills"
      />

      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setLocation('/')}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-semibold text-green-500">
                  {completedQuestions.size}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Question Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold mb-2">{currentQuestion.question}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        currentQuestion.difficulty === 'beginner' ? 'bg-green-500/10 text-green-600' :
                        currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {currentQuestion.difficulty}
                      </span>
                      <span>•</span>
                      <span>{currentQuestion.channel}</span>
                    </div>
                  </div>
                </div>

                {/* Answer with Full Display */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Answer to Read</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {totalWords} words
                    </span>
                  </div>

                  <div className="max-w-none overflow-auto max-h-96">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {currentQuestion.answer}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recording Controls - Using Unified Component */}
              <RecordingPanel
                recording={recording}
                targetWords={totalWords}
                showTranscript={true}
                showWordCount={true}
                showTimer={true}
                tip="Read the full answer naturally. Click 'Stop Recording' when you're done."
                className=""
              />

              {/* Navigation */}
              <div className="flex gap-3">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="px-6 py-3 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={goToNext}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

// Helper function
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}
