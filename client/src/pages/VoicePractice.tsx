/**
 * Unified Voice Practice Component
 * 
 * Combines Training Mode and Interview Mode with a simple toggle
 * - Training Mode: Answer visible for reading practice
 * - Interview Mode: Answer hidden until after recording
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Mic, Square, Eye, EyeOff, Volume2,
  Trophy, RotateCcw, ChevronRight, Sparkles, BookOpen
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { DesktopSidebarWrapper } from '../components/layout/DesktopSidebarWrapper';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { ChannelService } from '../services/api.service';
import type { Question } from '../types';

// Speech recognition support check
const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

type PracticeMode = 'training' | 'interview';
type RecordingState = 'idle' | 'recording' | 'recorded';

interface FeedbackResult {
  wordsSpoken: number;
  targetWords: number;
  duration: number;
  message: string;
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

function calculateFeedback(transcript: string, targetAnswer: string, duration: number): FeedbackResult {
  const wordsSpoken = countWords(transcript);
  const targetWords = countWords(targetAnswer);
  
  let message: string;
  const ratio = wordsSpoken / targetWords;
  
  if (ratio >= 0.8 && ratio <= 1.2) {
    message = "Great job! Your answer length is perfect! 🌟";
  } else if (ratio >= 0.5) {
    message = `Good effort! Try to cover more details. 💪`;
  } else if (wordsSpoken > 0) {
    message = "Keep practicing! Try to elaborate more. 📚";
  } else {
    message = "Start speaking to practice! 🎤";
  }
  
  return { wordsSpoken, targetWords, duration, message };
}

export default function VoicePractice() {
  const [, setLocation] = useLocation();
  const { getSubscribedChannels } = useUserPreferences();
  
  // Core state
  const [mode, setMode] = useState<PracticeMode>('interview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  
  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  
  // Refs
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const recordingStateRef = useRef<RecordingState>('idle');
  const [recognitionReady, setRecognitionReady] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const currentQuestion = questions[currentIndex];
  const targetWords = currentQuestion?.answer ? countWords(currentQuestion.answer) : 0;

  // Keep recording state ref in sync
  useEffect(() => {
    recordingStateRef.current = recordingState;
  }, [recordingState]);

  // Load questions
  useEffect(() => {
    async function loadQuestions() {
      setLoading(true);
      const subscribedChannels = getSubscribedChannels();
      
      if (subscribedChannels.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const allQuestions: Question[] = [];
        
        for (const channel of subscribedChannels) {
          try {
            const data = await ChannelService.getData(channel.id);
            // Filter for voice-suitable questions
            const suitable = data.questions.filter((q: Question) => 
              q.voiceSuitable !== false && q.answer && q.answer.length > 100
            );
            allQuestions.push(...suitable);
          } catch (e) {
            console.error(`Failed to load ${channel.id}`, e);
          }
        }
        
        if (allQuestions.length > 0) {
          const shuffled = allQuestions.sort(() => Math.random() - 0.5);
          setQuestions(shuffled.slice(0, 15));
        }
      } catch (e) {
        console.error('Failed to load questions', e);
      }
      
      setLoading(false);
    }

    loadQuestions();
  }, [getSubscribedChannels]);

  // Initialize speech recognition ONCE
  useEffect(() => {
    console.log('=== INITIALIZING SPEECH RECOGNITION ===');
    console.log('Window location:', window.location.href);
    console.log('Protocol:', window.location.protocol);
    console.log('isSpeechSupported:', isSpeechSupported);
    console.log('SpeechRecognition available:', 'SpeechRecognition' in window);
    console.log('webkitSpeechRecognition available:', 'webkitSpeechRecognition' in window);
    console.log('Browser:', navigator.userAgent);
    
    if (!isSpeechSupported) {
      console.error('❌ Speech recognition not supported in this browser');
      console.error('Browser:', navigator.userAgent);
      alert('❌ Speech Recognition Not Supported\n\nYour browser does not support the Web Speech API.\n\nSupported browsers:\n• Chrome (recommended)\n• Edge\n• Safari\n\nNOT supported:\n• Firefox\n• Opera\n• Other browsers');
      return;
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    console.log('SpeechRecognition constructor:', typeof SpeechRecognition);
    
    if (!SpeechRecognition) {
      console.error('❌ SpeechRecognition constructor not found');
      alert('❌ Speech Recognition Not Available\n\nThe Web Speech API is not available in your browser.\n\nPlease use Chrome, Edge, or Safari.');
      return;
    }
    
    try {
      const recognition = new SpeechRecognition();
      console.log('✅ Recognition instance created successfully');
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      console.log('✅ Recognition configured:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang
      });
      
      recognition.onstart = () => {
        console.log('🎤 Speech recognition STARTED');
        console.log('Recording state:', recordingStateRef.current);
      };
      
      recognition.onresult = (event: any) => {
        console.log('📝 Speech result received:', {
          resultIndex: event.resultIndex,
          resultsLength: event.results.length,
          timestamp: new Date().toISOString()
        });
        
        let interim = '';
        let final = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            final += transcript + ' ';
            console.log('✅ Final transcript:', transcript);
          } else {
            interim += transcript;
            console.log('⏳ Interim transcript:', transcript);
          }
        }
        
        if (final) {
          setTranscript(prev => {
            const updated = (prev + final).trim();
            console.log('📊 Total transcript now:', updated.length, 'chars');
            return updated;
          });
        }
        
        if (interim) {
          setInterimTranscript(interim);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('❌ Speech recognition ERROR:', {
          error: event.error,
          message: event.message,
          timestamp: new Date().toISOString()
        });
        
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          alert('🎤 Microphone Access Denied!\n\nPlease:\n1. Click the microphone icon (🎤) in your browser\'s address bar\n2. Select "Allow" for microphone access\n3. Refresh the page and try again\n\nNote: Some browsers require HTTPS for microphone access.');
        } else if (event.error === 'no-speech') {
          console.log('⚠️ No speech detected, will retry...');
          // Don't alert for no-speech, it's normal
        } else if (event.error === 'network') {
          alert('❌ Network Error\n\nSpeech recognition requires an active internet connection.\n\nPlease check your connection and try again.');
        } else if (event.error === 'aborted') {
          console.log('ℹ️ Speech recognition aborted (normal when stopping)');
        } else {
          alert(`❌ Speech Recognition Error: ${event.error}\n\nPlease check the browser console (F12) for more details.\n\nTry:\n• Refreshing the page\n• Checking microphone permissions\n• Using Chrome or Edge browser`);
        }
      };
      
      recognition.onend = () => {
        console.log('🛑 Speech recognition ENDED');
        console.log('Current recording state:', recordingStateRef.current);
        
        // Only restart if we're still in recording state
        if (recordingStateRef.current === 'recording') {
          console.log('🔄 Attempting to restart recognition...');
          try { 
            recognition.start();
            console.log('✅ Recognition restarted successfully');
          } catch (e) { 
            console.error('❌ Failed to restart recognition:', e);
          }
        } else {
          console.log('ℹ️ Not restarting - recording state is:', recordingStateRef.current);
        }
      };
      
      recognitionRef.current = recognition;
      console.log('✅ Recognition stored in ref and ready to use');
      setRecognitionReady(true);
      console.log('✅ Recognition ready state set to true');
      
      return () => {
        console.log('🧹 Cleaning up speech recognition');
        try { 
          if (recognition) {
            recognition.stop();
            console.log('✅ Recognition stopped');
          }
        } catch (e) { 
          console.log('ℹ️ Recognition cleanup (already stopped)');
        }
      };
    } catch (error) {
      console.error('❌ Failed to create SpeechRecognition instance:', error);
      alert(`❌ Failed to Initialize Speech Recognition\n\nError: ${error}\n\nPlease:\n• Use Chrome, Edge, or Safari browser\n• Check browser console (F12) for details\n• Ensure you're on HTTPS or localhost`);
    }
  }, []); // Only initialize once

  // Timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Start recording
  const startRecording = useCallback(() => {
    console.log('=== START RECORDING CLICKED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('recognitionRef.current exists:', !!recognitionRef.current);
    console.log('recognitionRef.current type:', typeof recognitionRef.current);
    
    if (!recognitionRef.current) {
      console.error('❌ Recognition not initialized!');
      alert('Speech recognition not initialized. Please refresh the page and check console.');
      return;
    }
    
    // Check microphone permissions first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log('🎤 Checking microphone permissions...');
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          console.log('✅ Microphone access granted');
          
          // Start MediaRecorder for audio playback
          try {
            audioChunksRef.current = [];
            const mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
              }
            };
            
            mediaRecorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
              setAudioBlob(audioBlob);
              console.log('✅ Audio recorded:', audioBlob.size, 'bytes');
              
              // Stop all tracks
              stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start();
            mediaRecorderRef.current = mediaRecorder;
            console.log('✅ MediaRecorder started');
          } catch (err) {
            console.error('❌ MediaRecorder error:', err);
          }
          
          // Now start speech recognition
          console.log('🎤 Starting speech recognition...');
          setTranscript('');
          setInterimTranscript('');
          setFeedback(null);
          setDuration(0);
          setAudioBlob(null);
          startTimeRef.current = Date.now();
          
          try {
            recognitionRef.current.start();
            console.log('✅ recognition.start() called');
            setRecordingState('recording');
            console.log('✅ Recording state set to "recording"');
          } catch (err: any) {
            console.error('❌ Failed to start recognition:', err);
            if (err.message && err.message.includes('already started')) {
              console.log('⚠️ Recognition already running, stopping first...');
              try {
                recognitionRef.current.stop();
                setTimeout(() => {
                  try {
                    recognitionRef.current.start();
                    setRecordingState('recording');
                    console.log('✅ Recognition restarted successfully');
                  } catch (e) {
                    console.error('❌ Failed to restart:', e);
                    alert('Failed to start recording. Please refresh the page.');
                  }
                }, 100);
              } catch (e) {
                console.error('❌ Failed to stop/restart:', e);
              }
            } else {
              alert(`Failed to start recording: ${err.message || err}`);
            }
          }
        })
        .catch(err => {
          console.error('❌ Microphone access denied:', err);
          alert('🎤 Microphone access required!\n\nPlease:\n1. Click the microphone icon in your browser\'s address bar\n2. Select "Allow"\n3. Try again\n\nError: ' + err.message);
        });
    } else {
      console.error('❌ getUserMedia not supported');
      alert('Your browser does not support microphone access. Please use Chrome, Edge, or Safari.');
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    
    try {
      recognitionRef.current.stop();
    } catch (e) { /* ignore */ }
    
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        console.log('✅ MediaRecorder stopped');
      } catch (e) {
        console.error('❌ Failed to stop MediaRecorder:', e);
      }
    }
    
    setRecordingState('recorded');
    
    // Calculate feedback
    if (currentQuestion) {
      const result = calculateFeedback(transcript, currentQuestion.answer, duration);
      setFeedback(result);
      
      // In interview mode, reveal answer after recording
      if (mode === 'interview') {
        setShowAnswer(true);
      }
    }
  }, [transcript, currentQuestion, duration, mode]);

  // Reset for new question
  const resetForNewQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setFeedback(null);
    setDuration(0);
    setRecordingState('idle');
    setShowAnswer(mode === 'training'); // Show answer in training mode
    setAudioBlob(null);
    setIsPlayingAudio(false);
  }, [mode]);

  // Play recorded audio
  const playRecording = useCallback(() => {
    if (!audioBlob) return;
    
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsPlayingAudio(true);
        console.log('🔊 Playing recorded audio');
      };
      
      audio.onended = () => {
        setIsPlayingAudio(false);
        URL.revokeObjectURL(audioUrl);
        console.log('✅ Audio playback finished');
      };
      
      audio.onerror = (e) => {
        setIsPlayingAudio(false);
        console.error('❌ Audio playback error:', e);
        alert('Failed to play recording');
      };
      
      audio.play();
    } catch (err) {
      console.error('❌ Failed to play audio:', err);
      alert('Failed to play recording');
    }
  }, [audioBlob]);

  // Stop audio playback
  const stopAudioPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlayingAudio(false);
    }
  }, []);

  // Navigate to next question
  const goToNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetForNewQuestion();
    } else {
      setLocation('/');
    }
  }, [currentIndex, questions.length, resetForNewQuestion, setLocation]);

  // Navigate to previous question
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetForNewQuestion();
    }
  }, [currentIndex, resetForNewQuestion]);

  // Try again
  const tryAgain = useCallback(() => {
    resetForNewQuestion();
  }, [resetForNewQuestion]);

  // Toggle mode
  const toggleMode = useCallback(() => {
    const newMode = mode === 'training' ? 'interview' : 'training';
    setMode(newMode);
    setShowAnswer(newMode === 'training');
  }, [mode]);

  // Set initial answer visibility based on mode
  useEffect(() => {
    setShowAnswer(mode === 'training');
  }, [mode, currentIndex]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#58a6ff]/20 flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-3 border-[#58a6ff] border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-[#8b949e]">Loading questions...</p>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-[#21262d] flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-[#6e7681]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No Questions Available</h2>
          <p className="text-[#8b949e] mb-6">Subscribe to channels to access practice questions</p>
          <button
            onClick={() => setLocation('/channels')}
            className="px-6 py-3 bg-[#238636] text-white rounded-xl font-semibold hover:bg-[#2ea043] transition-colors"
          >
            Browse Channels
          </button>
        </div>
      </div>
    );
  }

  // Browser not supported
  if (!isSpeechSupported) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Browser Not Supported</h1>
          <p className="text-[#8b949e] mb-6">
            Voice practice requires the Web Speech API. Please use Chrome, Edge, or Safari.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="px-6 py-3 bg-[#238636] text-white font-medium rounded-xl hover:bg-[#2ea043] transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <>
      <SEOHead
        title="Voice Practice | Code Reels"
        description="Practice answering interview questions with voice recording and feedback"
        canonical="https://open-interview.github.io/voice-practice"
      />

      <DesktopSidebarWrapper>
        <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117]/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setLocation('/')}
                  className="p-1.5 hover:bg-[#21262d] rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-[#8b949e]" />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f85149] to-[#ff7b72] flex items-center justify-center">
                    <Mic className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-white text-sm">Voice Practice</h1>
                    <p className="text-[10px] text-[#8b949e]">
                      Q{currentIndex + 1}/{questions.length}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Mode Toggle */}
              <button
                onClick={toggleMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === 'interview'
                    ? 'bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/30'
                    : 'bg-[#238636]/20 text-[#3fb950] border border-[#238636]/30'
                }`}
              >
                {mode === 'interview' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {mode === 'interview' ? 'Interview Mode' : 'Training Mode'}
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="max-w-4xl mx-auto px-4 pb-2">
              <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-[#58a6ff] to-[#a371f7] rounded-full"
                />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-4xl mx-auto px-4 py-6">
            {/* Debug Info Panel */}
            <div className="mb-4 p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl">🔍</div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-white mb-2">System Status</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[#8b949e]">
                    <div>Speech API: <span className={isSpeechSupported ? 'text-[#3fb950]' : 'text-[#f85149]'}>{isSpeechSupported ? '✓ Available' : '✗ Not Available'}</span></div>
                    <div>Recognition: <span className={recognitionReady ? 'text-[#3fb950]' : 'text-[#d29922]'}>{recognitionReady ? '✓ Ready' : '⏳ Initializing...'}</span></div>
                    <div>Protocol: <span className="text-white">{typeof window !== 'undefined' ? window.location.protocol : 'unknown'}</span></div>
                    <div>Recording: <span className="text-white">{recordingState}</span></div>
                  </div>
                </div>
              </div>
              
              {!isSpeechSupported && (
                <div className="p-3 bg-[#f85149]/10 border border-[#f85149]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[#f85149] mb-1">⚠️ Browser Not Supported</div>
                  <div className="text-[#8b949e]">
                    Please use Chrome, Edge, or Safari. Firefox is not supported.
                  </div>
                </div>
              )}
              
              {isSpeechSupported && !recognitionReady && (
                <div className="p-3 bg-[#d29922]/10 border border-[#d29922]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[#d29922] mb-1">⏳ Initializing...</div>
                  <div className="text-[#8b949e]">
                    Setting up speech recognition. If this takes too long, check console (F12).
                  </div>
                </div>
              )}
              
              {isSpeechSupported && recognitionReady && (
                <div className="p-3 bg-[#238636]/10 border border-[#238636]/30 rounded-lg text-sm">
                  <div className="font-semibold text-[#3fb950] mb-1">✓ Ready to Record</div>
                  <div className="text-[#8b949e]">
                    Click "Start Recording" and allow microphone access when prompted.
                  </div>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-[#30363d] text-xs text-[#6e7681]">
                💡 <strong>Troubleshooting:</strong> Open browser console (F12) to see detailed logs. 
                <a 
                  href="/test-speech-recognition.html" 
                  target="_blank"
                  className="ml-2 text-[#58a6ff] hover:underline"
                >
                  Run diagnostic test →
                </a>
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Question Card */}
                <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2.5 rounded-xl bg-[#58a6ff]/10 flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-[#58a6ff]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold text-white mb-2">{currentQuestion.question}</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                          currentQuestion.difficulty === 'beginner' ? 'bg-[#238636]/20 text-[#3fb950]' :
                          currentQuestion.difficulty === 'intermediate' ? 'bg-[#d29922]/20 text-[#d29922]' :
                          'bg-[#f85149]/20 text-[#f85149]'
                        }`}>
                          {currentQuestion.difficulty}
                        </span>
                        <span className="text-[#6e7681]">•</span>
                        <span className="text-[#8b949e]">{currentQuestion.channel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Answer Display */}
                  {showAnswer ? (
                    <div className="bg-[#0d1117] rounded-xl p-5 border border-[#30363d]">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-[#3fb950]" />
                          <span className="text-sm font-semibold text-white">
                            {mode === 'training' ? 'Answer to Read' : 'Ideal Answer'}
                          </span>
                        </div>
                        <span className="text-xs text-[#6e7681] px-2 py-1 bg-[#21262d] rounded-lg">
                          {targetWords} words
                        </span>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                        <p className="text-[#e6edf3] text-[15px] leading-[1.7] whitespace-pre-wrap">
                          {currentQuestion.answer}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#0d1117] rounded-xl p-5 border border-[#30363d]">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="w-16 h-16 rounded-2xl bg-[#f85149]/10 flex items-center justify-center mx-auto mb-4">
                            <EyeOff className="w-8 h-8 text-[#f85149]" />
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2">Answer Hidden</h3>
                          <p className="text-sm text-[#8b949e] max-w-md">
                            Record your answer first. The ideal answer will be revealed after you finish.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Recording Panel */}
                <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6">
                  {/* Recording Status */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Mic className="w-5 h-5 text-primary" />
                      Record Your Answer
                    </h3>
                    {recordingState === 'recording' && (
                      <div className="flex items-center gap-2 text-sm text-[#f85149]">
                        <span className="w-2 h-2 bg-[#f85149] rounded-full animate-pulse" />
                        {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>

                  {/* Transcript Display */}
                  {(recordingState !== 'idle' || transcript) && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[#8b949e]">Your Response</span>
                        {audioBlob && recordingState === 'recorded' && (
                          <button
                            onClick={isPlayingAudio ? stopAudioPlayback : playRecording}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#238636] hover:bg-[#2ea043] text-white rounded-lg transition-colors"
                          >
                            {isPlayingAudio ? (
                              <>
                                <Square className="w-3.5 h-3.5" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                Replay
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="p-4 bg-[#0d1117] rounded-xl max-h-[300px] overflow-y-auto custom-scrollbar border border-[#30363d]">
                        {transcript || interimTranscript ? (
                          <p className="text-sm text-[#e6edf3] leading-relaxed whitespace-pre-wrap break-words">
                            {transcript}
                            <span className="text-[#6e7681]">{interimTranscript}</span>
                            {recordingState === 'recording' && <span className="animate-pulse text-[#58a6ff]">|</span>}
                          </p>
                        ) : (
                          <p className="text-sm text-[#6e7681] italic">
                            Start speaking... Your words will appear here.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Word Count */}
                  {transcript && (
                    <div className="mb-4 flex items-center justify-between text-sm">
                      <span className="text-[#8b949e]">Words spoken:</span>
                      <span className="font-semibold text-white">
                        {countWords(transcript)} / {targetWords}
                      </span>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-3">
                    {recordingState === 'idle' && (
                      <>
                        <button
                          onClick={startRecording}
                          disabled={!recognitionReady}
                          className="flex items-center gap-2 px-6 py-3 bg-[#f85149] text-white font-semibold rounded-xl hover:bg-[#da3633] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <Mic className="w-5 h-5" />
                          Start Recording
                        </button>
                        {!recognitionReady && (
                          <span className="text-xs text-[#6e7681]">Initializing microphone...</span>
                        )}
                      </>
                    )}
                    
                    {recordingState === 'recording' && (
                      <button
                        onClick={stopRecording}
                        className="flex items-center gap-2 px-6 py-3 bg-[#f85149] text-white font-semibold rounded-xl hover:bg-[#da3633] transition-all"
                      >
                        <Square className="w-5 h-5" />
                        Stop Recording
                      </button>
                    )}
                    
                    {recordingState === 'recorded' && (
                      <button
                        onClick={tryAgain}
                        className="flex items-center gap-2 px-5 py-3 border border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e] rounded-xl transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Try Again
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                {feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-[#30363d] bg-[#161b22] p-6"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#238636]/20 flex items-center justify-center">
                        <Trophy className="w-6 h-6 text-[#3fb950]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{feedback.message}</h3>
                        <p className="text-sm text-[#8b949e]">Recording completed</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-[#0d1117] rounded-xl">
                        <div className="text-xs text-[#8b949e] mb-1">Words</div>
                        <div className="text-lg font-bold text-white">
                          {feedback.wordsSpoken}
                          <span className="text-sm text-[#6e7681]">/{feedback.targetWords}</span>
                        </div>
                      </div>
                      <div className="text-center p-3 bg-[#0d1117] rounded-xl">
                        <div className="text-xs text-[#8b949e] mb-1">Duration</div>
                        <div className="text-lg font-bold text-white">
                          {Math.floor(feedback.duration / 60)}:{(feedback.duration % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                      <div className="text-center p-3 bg-[#0d1117] rounded-xl">
                        <div className="text-xs text-[#8b949e] mb-1">Coverage</div>
                        <div className="text-lg font-bold text-white">
                          {Math.round((feedback.wordsSpoken / feedback.targetWords) * 100)}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={goToPrevious}
                    disabled={currentIndex === 0}
                    className="px-6 py-3 bg-[#21262d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors text-[#8b949e] hover:text-white border border-[#30363d]"
                  >
                    Previous
                  </button>
                  <button
                    onClick={goToNext}
                    className="flex-1 px-6 py-3 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </DesktopSidebarWrapper>
    </>
  );
}
