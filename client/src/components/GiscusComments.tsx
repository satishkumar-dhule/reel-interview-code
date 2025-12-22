import { useEffect, useRef, useState } from 'react';
import { MessageCircle, ChevronDown, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const GISCUS_REPO = import.meta.env.VITE_GISCUS_REPO || 'satishkumar-dhule/code-reels';
const GISCUS_REPO_ID = import.meta.env.VITE_GISCUS_REPO_ID || 'R_kgDOQmWh6w';
const GISCUS_CATEGORY = import.meta.env.VITE_GISCUS_CATEGORY || 'General';
const GISCUS_CATEGORY_ID = import.meta.env.VITE_GISCUS_CATEGORY_ID || 'DIC_kwDOQmWh684C0ESo';

const LIGHT_THEMES = ['clean', 'light', 'macos-light', 'ios-light', 'playful', 'aqua', 'solarized'];

interface GiscusCommentsProps {
  questionId: string;
}

export function GiscusComments({ questionId }: GiscusCommentsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  const giscusTheme = LIGHT_THEMES.includes(theme) ? 'light' : 'transparent_dark';

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    setIsLoading(true);
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', GISCUS_REPO);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID);
    script.setAttribute('data-category', GISCUS_CATEGORY);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', questionId);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '0');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'top');
    script.setAttribute('data-theme', giscusTheme);
    script.setAttribute('data-lang', 'en');
    script.crossOrigin = 'anonymous';
    script.async = true;

    containerRef.current.appendChild(script);

    const timeout = setTimeout(() => setIsLoading(false), 3000);

    const handleMessage = (event: MessageEvent) => {
      if (event.origin === 'https://giscus.app' && event.data?.giscus) {
        setIsLoading(false);
        clearTimeout(timeout);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timeout);
    };
  }, [isOpen, questionId, giscusTheme]);

  return (
    <div className="w-full mt-4 pb-20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 rounded-xl border border-border/50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <MessageCircle className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium text-foreground">Discussion</span>
            <p className="text-xs text-muted-foreground">Ask questions or share insights</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-4">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
              <span className="text-xs text-muted-foreground">Loading discussion...</span>
            </div>
          )}
          <div 
            ref={containerRef}
            className="giscus"
            style={{ colorScheme: LIGHT_THEMES.includes(theme) ? 'light' : 'dark' }}
          />
        </div>
      )}
    </div>
  );
}
