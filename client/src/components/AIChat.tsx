import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Loader2, MessageCircle, Code, Lightbulb, HelpCircle, List } from 'lucide-react';
import { streamChatWithAI, createTutorPrompt, createInterviewerPrompt, createExplainerPrompt, createCodeReviewPrompt, createRelatedQuestionsPrompt, createHintPrompt } from '../lib/ai';
import type { Question } from '../lib/data';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  question: Question;
  isOpen: boolean;
  onClose: () => void;
}

type AIMode = 'tutor' | 'interviewer' | 'explainer' | 'reviewer' | 'related' | 'hints';

export function AIChat({ question, isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<AIMode>('tutor');
  const [hintLevel, setHintLevel] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      let prompt;
      switch (mode) {
        case 'tutor':
          prompt = createTutorPrompt(question.question, question.answer, question.explanation, input);
          break;
        case 'interviewer':
          prompt = createInterviewerPrompt(question.question, input);
          break;
        case 'explainer':
          prompt = createExplainerPrompt(input, question.question);
          break;
        case 'reviewer':
          prompt = createCodeReviewPrompt(question.question, input);
          break;
        default:
          prompt = createTutorPrompt(question.question, question.answer, question.explanation, input);
      }

      let assistantContent = '';
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamChatWithAI(prompt)) {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action: AIMode) => {
    setMode(action);
    setIsLoading(true);

    try {
      let prompt;
      let actionMessage = '';

      switch (action) {
        case 'related':
          actionMessage = 'Show me related questions';
          prompt = createRelatedQuestionsPrompt(question.question, question.difficulty);
          break;
        case 'hints':
          actionMessage = `Give me hint level ${hintLevel}`;
          prompt = createHintPrompt(question.question, hintLevel);
          setHintLevel(prev => (prev % 3) + 1);
          break;
        case 'explainer':
          actionMessage = 'Explain the key concepts';
          prompt = createExplainerPrompt(question.question, `${question.channel} - ${question.subChannel}`);
          break;
        default:
          return;
      }

      setMessages(prev => [...prev, { role: 'user', content: actionMessage }]);

      let assistantContent = '';
      const assistantMessage: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamChatWithAI(prompt)) {
        assistantContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-black border-l border-white/10 flex flex-col z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <div className="text-sm font-bold text-white">AI Tutor</div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">{mode}</div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-1 p-2 border-b border-white/10 overflow-x-auto">
          <button
            onClick={() => setMode('tutor')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
              mode === 'tutor' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <MessageCircle className="w-3 h-3 inline mr-1" />
            Tutor
          </button>
          <button
            onClick={() => setMode('interviewer')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
              mode === 'interviewer' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <HelpCircle className="w-3 h-3 inline mr-1" />
            Interview
          </button>
          <button
            onClick={() => setMode('reviewer')}
            className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${
              mode === 'reviewer' ? 'bg-primary text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Code className="w-3 h-3 inline mr-1" />
            Review
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 p-2 border-b border-white/10 bg-white/5">
          <button
            onClick={() => handleQuickAction('hints')}
            disabled={isLoading}
            className="flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 inline mr-1" />
            Hint {hintLevel}/3
          </button>
          <button
            onClick={() => handleQuickAction('explainer')}
            disabled={isLoading}
            className="flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 inline mr-1" />
            Explain
          </button>
          <button
            onClick={() => handleQuickAction('related')}
            disabled={isLoading}
            className="flex-1 px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-white/5 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          >
            <List className="w-3 h-3 inline mr-1" />
            Related
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-white/30 text-sm mt-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Ask me anything about this question!</p>
              <p className="text-xs">Try: "Can you explain this in simpler terms?"</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-black'
                    : 'bg-white/10 text-white'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 px-3 py-2 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10 bg-black/50">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={
                mode === 'tutor' ? 'Ask a follow-up question...' :
                mode === 'interviewer' ? 'Type your answer...' :
                mode === 'reviewer' ? 'Paste your code...' :
                'Ask anything...'
              }
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-primary hover:bg-primary/80 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-black" />
            </button>
          </div>
          <div className="mt-2 text-[10px] text-white/30 text-center">
            Powered by HuggingFace AI • Smart fallback enabled
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
