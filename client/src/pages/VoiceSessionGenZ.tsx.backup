/**
 * Voice Session GenZ - Gen Z themed voice interview sessions
 * Pure black background, neon accents, glassmorphism
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Target, Play, CheckCircle, XCircle, AlertCircle,
  Loader2, RotateCcw, ArrowRight
} from 'lucide-react';
import { SEOHead } from '../components/SEOHead';
import { getAllQuestionsAsync } from '../lib/questions-loader';
import { useCredits } from '../context/CreditsContext';
import { useAchievementContext } from '../context/AchievementContext';
import { useUserPreferences } from '../hooks/use-user-preferences';
import { CreditsDisplay } from '../components/CreditsDisplay';
import { AppLayout } from '../components/layout/AppLayout';
import { GenZCard, GenZButton, GenZMicrophone, GenZProgress } from '../components/genz';
import {
  type VoiceSession,
  type SessionState,
  type SessionResult,
  loadVoiceSessions,
  generateSessionsFromQuestions,
  buildSessionQuestions,
  startSession,
  beginSession,
  submitAnswer,
  nextQuestion,
  getCurrentQuestion,
  completeSession,
  saveSessionState,
  loadSessionState,
  clearSessionState,
  saveSessionToHistory
} from '../lib/voice-interview-session';
import type { Question } from '../types';

type PageState = 'loading' | 'select' | 'intro' | 'recording' | 'editing' | 'feedback' | 'results';

const isSpeechSupported = typeof window !== 'undefined' && 
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

export default function VoiceSessionGenZ() {
  const [, setLocation] = useLocation();
  const { preferences } = useUserPreferences();
  
  const [pageState, setPageState] = useState<PageState>('loading');
  const [availableSessions, setAvailableSessions] = useState<VoiceSession[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [sessionResult, setSessionResult] = useState<SessionResult | null>(null);
  
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);
  
  const { onVoiceInterview } = useCredits();
  const { trackEvent } = useAchievementContext();

  const currentQuestion = sessionState ? getCurrentQuestion(sessionState) : null;

  // Load sessions and questions
  useEffect(() => {
    async function loadData() {
      try {
        const questions = await getAllQuestionsAsync();
        setAllQuestions(questions);
        
        let sessions = await loadVoiceSessions();
        if (sessions.length === 0) {
          sessions = generateSessionsFromQuestions(questions);
        }
        
        const subscribedChannels = preferences.subscribedChannels;
        const filteredSessions = sessions.filter(s => subscribedChannels.includes(s.channel));
        setAvailableSessions(filteredSessions);
        
        const saved = loadSessionState();
        if (saved && saved.status !== 'completed') {
          setSessionState(saved);
          setPageState('intro');
          return;
        }
        
        setPageState('select');
      } catch (err) {
        setError('Failed to load sessions');
        console.error(err);
      }
    }
    loadData();
  }, [preferences.subscribedChannels]);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSpeechSupported) return;
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      if (final) {
        setTranscript(prev => prev + final);
      }
      setInterimTranscript(interim);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied.');
        setPageState('editing');
      }
    };
    
    recognition.onend = () => {
      if (pageState === 'recording') {
        try { recognition.start(); } catch (e) { }
      }
    };
    
    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch (e) { } };
  }, [pageState]);

  const startNewSession = useCallback((session: VoiceSession) => {
    const sessionQuestions = buildSessionQuestions(session, allQuestions);
    if (sessionQuestions.length < 3) {
      setError('Not enough questions available for this session');
      return;
    }
    const newState = startSession(session, sessionQuestions);
    setSessionState(newState);
    saveSessionState(newState);
    setPageState('intro');
  }, [allQuestions]);

  const beginQuestions = useCallback(() => {
    if (!sessionState) return;
    const updated = beginSession(sessionState);
    setSessionState(updated);
    saveSessionState(updated);
    setTranscript('');
    setInterimTranscript('');
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setPageState('recording');
      } catch (err) {
        setError('Failed to start recording.');
        setPageState('editing');
      }
    }
  }, [sessionState]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    setPageState('editing');
  }, []);

  const submitCurrentAnswer = useCallback(() => {
    if (!sessionState || !transcript.trim()) {
      setError('Please provide an answer.');
      return;
    }
    const updated = submitAnswer(sessionState, transcript.trim());
    setSessionState(updated);
    saveSessionState(updated);
    setPageState('feedback');
  }, [sessionState, transcript]);

  const goToNextQuestion = useCallback(() => {
    if (!sessionState) return;
    
    if (sessionState.currentQuestionIndex >= sessionState.questions.length - 1) {
      const result = completeSession(sessionState);
      setSessionResult(result);
      saveSessionToHistory(result);
      clearSessionState();
      
      const verdict = result.overallScore >= 60 ? 'hire' : 'no-hire';
      onVoiceInterview(verdict);
      trackEvent({ type: 'voice_interview_completed', timestamp: new Date().toISOString() });
      setPageState('results');
    } else {
      const updated = nextQuestion(sessionState);
      setSessionState(updated);
      saveSessionState(updated);
      setTranscript('');
      setInterimTranscript('');
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setPageState('recording');
        } catch (err) {
          setPageState('editing');
        }
      }
    }
  }, [sessionState, onVoiceInterview, trackEvent]);

  const retryQuestion = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setPageState('recording');
      } catch (err) {
        setPageState('editing');
      }
    }
  }, []);

  const exitSession = useCallback(() => {
    clearSessionState();
    setSessionState(null);
    setSessionResult(null);
    setPageState('select');
  }, []);

  if (!isSpeechSupported) {
    return (
      <AppLayout fullWidth hideNav>
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-[#ffd700]/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-[#ffd700]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3">Browser Not Supported</h1>
            <p className="text-[#a0a0a0] mb-6">Voice sessions require the Web Speech API. Use Chrome, Edge, or Safari.</p>
            <GenZButton onClick={() => setLocation('/')}>Go Home</GenZButton>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'loading') {
    return (
      <AppLayout fullWidth hideNav>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00d4ff]/20 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
            </div>
            <p className="text-[#a0a0a0]">Loading sessions...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (pageState === 'select') {
    const byChannel: Record<string, VoiceSession[]> = {};
    for (const session of availableSessions) {
      if (!byChannel[session.channel]) byChannel[session.channel] = [];
      byChannel[session.channel].push(session);
    }

    return (
      <>
        <SEOHead title="Voice Sessions | Code Reels" description="Practice interview topics with focused question sessions" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-black text-white">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setLocation('/')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <Home className="w-5 h-5 text-[#a0a0a0]" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center">
                    <Target className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h1 className="font-semibold text-white">Voice Sessions</h1>
                    <p className="text-xs text-[#a0a0a0]">{availableSessions.length} sessions available</p>
                  </div>
                </div>
              </div>
              <CreditsDisplay compact onClick={() => setLocation('/profile')} />
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            {availableSessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-[#a0a0a0]" />
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">No Sessions Available</h2>
                <p className="text-[#a0a0a0] mb-6">Subscribe to channels to unlock voice sessions.</p>
                <GenZButton onClick={() => setLocation('/channels')}>
                  Subscribe to Channels
                </GenZButton>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(byChannel).map(([channel, sessions]) => (
                  <div key={channel}>
                    <h2 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#00d4ff]" />
                      {channel.replace(/-/g, ' ')}
                    </h2>
                    <div className="grid gap-3">
                      {sessions.map((session) => (
                        <motion.button
                          key={session.id}
                          onClick={() => startNewSession(session)}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          className="p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:border-[#00d4ff]/50 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-white group-hover:text-[#00d4ff] transition-colors mb-1">
                                {session.topic}
                              </h3>
                              <p className="text-sm text-[#a0a0a0] mb-3">{session.description}</p>
                              <div className="flex items-center gap-3">
                                <span className={`px-2.5 py-1 text-xs font-medium rounded-lg ${
                                  session.difficulty === 'beginner' ? 'bg-[#00ff88]/20 text-[#00ff88]' :
                                  session.difficulty === 'intermediate' ? 'bg-[#ffd700]/20 text-[#ffd700]' :
                                  'bg-[#ff0080]/20 text-[#ff0080]'
                                }`}>
                                  {session.difficulty}
                                </span>
                                <span className="text-xs text-[#a0a0a0]">
                                  {session.totalQuestions} questions
                                </span>
                                <span className="text-xs text-[#a0a0a0]">
                                  ~{session.estimatedMinutes} min
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'intro' && sessionState) {
    return (
      <>
        <SEOHead title={`${sessionState.session.topic} | Voice Session`} description="Voice interview session practice" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg w-full"
          >
            <GenZCard className="p-8 text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#00ff88] to-[#00d4ff] flex items-center justify-center mx-auto mb-6">
                <Target className="w-10 h-10 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{sessionState.session.topic}</h1>
              <p className="text-[#a0a0a0] mb-6">
                {sessionState.questions.length} questions • ~{sessionState.session.estimatedMinutes} min
              </p>
              
              <div className="bg-black/50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-[#a0a0a0]">{sessionState.session.description}</p>
              </div>

              <div className="flex gap-3">
                <GenZButton variant="secondary" onClick={exitSession} className="flex-1">
                  Back
                </GenZButton>
                <GenZButton variant="primary" onClick={beginQuestions} className="flex-1">
                  <Play className="w-5 h-5 mr-2" />
                  Start Session
                </GenZButton>
              </div>
            </GenZCard>
          </motion.div>
        </div>
        </AppLayout>
      </>
    );
  }

  if ((pageState === 'recording' || pageState === 'editing') && sessionState && currentQuestion) {
    const progress = ((sessionState.currentQuestionIndex + 1) / sessionState.questions.length) * 100;
    
    return (
      <>
        <SEOHead title={`Q${sessionState.currentQuestionIndex + 1} | ${sessionState.session.topic}`} description="Answer the interview question" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-black text-white">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4">
              <div className="h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={exitSession} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Home className="w-5 h-5 text-[#a0a0a0]" />
                  </button>
                  <div>
                    <h1 className="font-semibold text-white text-sm">{sessionState.session.topic}</h1>
                    <p className="text-xs text-[#a0a0a0]">Question {sessionState.currentQuestionIndex + 1} of {sessionState.questions.length}</p>
                  </div>
                </div>
              </div>
              <div className="pb-3">
                <GenZProgress value={sessionState.currentQuestionIndex + 1} max={sessionState.questions.length} color="blue" />
              </div>
            </div>
          </header>

          <main className="max-w-4xl mx-auto px-4 py-6">
            <GenZCard className="p-6 mb-6" neonBorder>
              <h2 className="text-lg font-medium text-white leading-relaxed">{currentQuestion.question}</h2>
              {error && (
                <div className="mt-4 p-4 bg-[#ff0080]/10 border border-[#ff0080]/30 rounded-xl text-[#ff0080] text-sm">
                  {error}
                </div>
              )}
            </GenZCard>

            <GenZCard className="p-6">
              <div className="flex flex-col items-center gap-6">
                <GenZMicrophone
                  isRecording={pageState === 'recording'}
                  onStart={() => {}}
                  onStop={stopRecording}
                />

                <div className="w-full">
                  {pageState === 'editing' ? (
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="w-full p-4 bg-black/50 border border-white/10 rounded-xl min-h-[100px] text-sm text-white resize-y focus:outline-none focus:ring-2 focus:ring-[#00d4ff]/50"
                      placeholder="Edit your answer..."
                    />
                  ) : (
                    <div className="p-4 bg-black/50 rounded-xl min-h-[80px] border border-white/10">
                      {transcript || interimTranscript ? (
                        <p className="text-sm text-white whitespace-pre-wrap">
                          {transcript}
                          <span className="text-[#a0a0a0]">{interimTranscript}</span>
                        </p>
                      ) : (
                        <p className="text-sm text-[#a0a0a0] italic">
                          Start speaking... Your words will appear here.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  {pageState === 'editing' && (
                    <>
                      <GenZButton variant="secondary" onClick={retryQuestion}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Re-record
                      </GenZButton>
                      <GenZButton variant="primary" onClick={submitCurrentAnswer} disabled={!transcript.trim()}>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Submit
                      </GenZButton>
                    </>
                  )}
                </div>
              </div>
            </GenZCard>
          </main>
        </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'feedback' && sessionState) {
    const lastAnswer = sessionState.answers[sessionState.answers.length - 1];
    const isLastQuestion = sessionState.currentQuestionIndex >= sessionState.questions.length - 1;
    
    return (
      <>
        <SEOHead title="Feedback | Voice Session" description="Review your answer feedback" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <GenZCard className="p-8">
              <div className="text-center">
                <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                  lastAnswer.isCorrect ? 'bg-[#00ff88]/20' : 'bg-[#ff0080]/20'
                }`}>
                  {lastAnswer.isCorrect 
                    ? <CheckCircle className="w-12 h-12 text-[#00ff88]" /> 
                    : <XCircle className="w-12 h-12 text-[#ff0080]" />
                  }
                </div>
                <div className="text-4xl font-bold text-white mb-2">{lastAnswer.score}%</div>
                <p className={`text-sm font-medium ${lastAnswer.isCorrect ? 'text-[#00ff88]' : 'text-[#ff0080]'}`}>
                  {lastAnswer.isCorrect ? 'Good answer!' : 'Needs improvement'}
                </p>
              </div>

              <div className="mt-6 bg-black/50 rounded-xl p-4">
                <p className="text-sm text-[#a0a0a0]">{lastAnswer.feedback}</p>
              </div>

              <div className="mt-6">
                <GenZButton variant="primary" onClick={goToNextQuestion} className="w-full">
                  {isLastQuestion ? 'View Results' : 'Next Question'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </GenZButton>
              </div>
            </GenZCard>
          </motion.div>
        </div>
        </AppLayout>
      </>
    );
  }

  if (pageState === 'results' && sessionResult) {
    return (
      <>
        <SEOHead title="Session Complete | Voice Session" description="View your session results" />
        <AppLayout fullWidth hideNav>
          <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full"
          >
            <GenZCard className="p-8">
              <div className="text-center">
                <div className="text-6xl font-black text-white mb-4">{sessionResult.overallScore}%</div>
                <p className="text-xl font-semibold text-[#a0a0a0] mb-8">Session Complete!</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#00ff88]">{sessionResult.correctAnswers}</div>
                    <div className="text-xs text-[#a0a0a0]">Correct</div>
                  </div>
                  <div className="bg-black/50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-[#ff0080]">{sessionResult.totalQuestions - sessionResult.correctAnswers}</div>
                    <div className="text-xs text-[#a0a0a0]">Incorrect</div>
                  </div>
                </div>

                <GenZButton variant="primary" onClick={() => setLocation('/')} className="w-full">
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </GenZButton>
              </div>
            </GenZCard>
          </motion.div>
        </div>
        </AppLayout>
      </>
    );
  }

  return null;
}
