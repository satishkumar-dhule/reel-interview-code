import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ArrowRight, Zap, Target, Flame, Filter, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useDebounce } from '@/hooks/use-debounce';
import { useUserPreferences } from '../context/UserPreferencesContext';
import { useToast } from '@/hooks/use-toast';
import { allChannelsConfig } from '../lib/channels-config';
import { getQuestions } from '../lib/data';

// Pagefind types
interface PagefindResult {
  id: string;
  data: () => Promise<PagefindResultData>;
}

interface PagefindResultData {
  url: string;
  content: string;
  word_count: number;
  filters: Record<string, string[]>;
  meta: {
    title: string;
    channel?: string;
    difficulty?: string;
    id?: string;
  };
  excerpt: string;
}

interface PagefindSearchResponse {
  results: PagefindResult[];
  filters: Record<string, Record<string, number>>;
  totalFilters: Record<string, Record<string, number>>;
  timings: {
    preload: number;
    search: number;
    total: number;
  };
}

interface Pagefind {
  init: () => Promise<void>;
  search: (query: string, options?: { filters?: Record<string, string> }) => Promise<PagefindSearchResponse>;
  filters: () => Promise<Record<string, Record<string, number>>>;
}

declare global {
  interface Window {
    pagefind?: Pagefind;
  }
}

interface SearchResultItem {
  id: string;
  title: string;
  excerpt: string;
  channel: string;
  difficulty: string;
}

interface PagefindSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PagefindSearch({ isOpen, onClose }: PagefindSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, Record<string, number>>>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const pagefindRef = useRef<Pagefind | null>(null);
  const [, setLocation] = useLocation();
  const { isSubscribed, subscribeChannel } = useUserPreferences();
  const { toast } = useToast();
  
  const debouncedQuery = useDebounce(query, 200);

  // Initialize Pagefind
  useEffect(() => {
    async function initPagefind() {
      try {
        // Load Pagefind CSS for excerpt highlighting
        if (!document.querySelector('link[href*="pagefind"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = '/pagefind/pagefind-ui.css';
          document.head.appendChild(link);
        }

        // Load Pagefind via dynamic script injection to avoid Vite bundling
        if (!window.pagefind) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement('script');
            script.src = '/pagefind/pagefind.js';
            script.type = 'module';
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Pagefind script'));
            document.head.appendChild(script);
          });

          // Wait for pagefind to be available on window
          let attempts = 0;
          while (!window.pagefind && attempts < 50) {
            await new Promise(r => setTimeout(r, 100));
            attempts++;
          }
        }

        if (!window.pagefind) {
          throw new Error('Pagefind not available');
        }

        await window.pagefind.init();
        pagefindRef.current = window.pagefind;

        // Load available filters
        const availableFilters = await window.pagefind.filters();
        setFilters(availableFilters);

        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error('Failed to load Pagefind:', err);
        setError('Search index not available. Using fallback search.');
        setIsLoading(false);
      }
    }

    if (isOpen && !pagefindRef.current) {
      initPagefind();
    }
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
      setActiveFilter(null);
    }
  }, [isOpen]);

  // Search when query changes
  useEffect(() => {
    async function performSearch() {
      if (!pagefindRef.current || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const searchOptions: { filters?: Record<string, string> } = {};
        if (activeFilter) {
          searchOptions.filters = { difficulty: activeFilter };
        }
        
        const response = await pagefindRef.current.search(debouncedQuery, searchOptions);
        
        // Load result data
        const loadedResults = await Promise.all(
          response.results.slice(0, 15).map(async (result) => {
            const data = await result.data();
            return {
              id: data.meta.id || result.id,
              title: data.meta.title,
              excerpt: data.excerpt,
              channel: data.meta.channel || '',
              difficulty: data.meta.difficulty || 'intermediate',
            };
          })
        );
        
        setResults(loadedResults);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }

    performSearch();
  }, [debouncedQuery, activeFilter]);

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigateToQuestion(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [results, selectedIndex, onClose]);

  const navigateToQuestion = (result: SearchResultItem) => {
    const channel = result.channel;
    
    // Auto-subscribe if not already subscribed
    if (channel && !isSubscribed(channel)) {
      subscribeChannel(channel);
      const channelConfig = allChannelsConfig.find(c => c.id === channel);
      toast({
        title: "Channel Subscribed",
        description: `You've been subscribed to ${channelConfig?.name || channel}`,
      });
    }
    
    // Find the index of this question in the channel
    if (channel) {
      const channelQuestions = getQuestions(channel);
      const questionIndex = channelQuestions.findIndex(q => q.id === result.id);
      const index = questionIndex >= 0 ? questionIndex : 0;
      setLocation(`/channel/${channel}/${index}`);
    }
    
    onClose();
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Zap className="w-3 h-3 text-green-400" />;
      case 'intermediate': return <Target className="w-3 h-3 text-yellow-400" />;
      case 'advanced': return <Flame className="w-3 h-3 text-red-400" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-card border border-border rounded-lg shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-border">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isLoading ? "Loading search..." : "Search questions..."}
              className="flex-1 bg-transparent text-foreground text-lg outline-none placeholder:text-muted-foreground/50"
              autoComplete="off"
              spellCheck={false}
              disabled={isLoading}
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-muted rounded">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] text-muted-foreground bg-muted border border-border rounded">
              ESC
            </kbd>
          </div>

          {/* Difficulty Filter */}
          {filters.difficulty && Object.keys(filters.difficulty).length > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
              <Filter className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">Difficulty:</span>
              <button
                onClick={() => setActiveFilter(null)}
                className={`px-2 py-0.5 text-[11px] rounded-full transition-all ${
                  !activeFilter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                All
              </button>
              {Object.entries(filters.difficulty).map(([level, count]) => (
                <button
                  key={level}
                  onClick={() => setActiveFilter(activeFilter === level ? null : level)}
                  className={`flex items-center gap-1 px-2 py-0.5 text-[11px] rounded-full transition-all ${
                    activeFilter === level ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {getDifficultyIcon(level)}
                  {level}
                  <span className="text-[9px] opacity-70">({count})</span>
                </button>
              ))}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-xs">
              {error}
            </div>
          )}

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isSearching && (
              <div className="p-8 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto" />
              </div>
            )}

            {!isSearching && query.length >= 2 && results.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>No questions found for "{query}"</p>
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="py-2">
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => navigateToQuestion(result)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      index === selectedIndex ? 'bg-primary/20' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getDifficultyIcon(result.difficulty)}
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                          {result.channel}
                        </span>
                      </div>
                      <p className="text-sm text-foreground line-clamp-2">
                        {result.title}
                      </p>
                      <p 
                        className="text-xs text-muted-foreground line-clamp-2 mt-1"
                        dangerouslySetInnerHTML={{ __html: result.excerpt }}
                      />
                    </div>
                    <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-opacity ${
                      index === selectedIndex ? 'text-primary opacity-100' : 'text-muted-foreground/30 opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            )}

            {!isSearching && query.length < 2 && !isLoading && (
              <div className="p-6 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Type at least 2 characters to search</p>
                <p className="text-xs mt-2 opacity-70">Powered by Pagefind</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground/70">
            <div className="flex items-center gap-4">
              <span><kbd className="px-1 bg-muted rounded">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 bg-muted rounded">↵</kbd> Select</span>
              <span><kbd className="px-1 bg-muted rounded">ESC</kbd> Close</span>
            </div>
            {results.length > 0 && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
