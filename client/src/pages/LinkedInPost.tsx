import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Copy, Download, Share2, Eye, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAllQuestions } from '../lib/data';
import { useToast } from '@/hooks/use-toast';

interface LinkedInPost {
  id: string;
  text: string;
  html: string;
  svg?: string;
  metadata: {
    channel: string;
    subChannel: string;
    difficulty: string;
    tags: string[];
    generatedAt: string;
  };
}

export default function LinkedInPost() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [post, setPost] = useState<LinkedInPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);

  useEffect(() => {
    const allQuestions = getAllQuestions();
    setQuestions(allQuestions);
    if (allQuestions.length > 0) {
      setSelectedQuestion(allQuestions[0]);
    }
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocation('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setLocation]);

  const generatePost = async () => {
    if (!selectedQuestion) return;

    setLoading(true);
    try {
      // Generate post text
      const text = generatePostText(selectedQuestion);
      
      // Create HTML preview
      const html = createHtmlPreview(selectedQuestion);

      const postData: LinkedInPost = {
        id: selectedQuestion.id,
        text,
        html,
        metadata: {
          channel: selectedQuestion.channel,
          subChannel: selectedQuestion.subChannel,
          difficulty: selectedQuestion.difficulty,
          tags: selectedQuestion.tags,
          generatedAt: new Date().toISOString()
        }
      };

      setPost(postData);
      toast({
        title: 'Post Generated',
        description: 'LinkedIn post created successfully!'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate post. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePostText = (question: any) => {
    const lines = [];
    
    lines.push('🎯 Technical Interview Question\n');
    lines.push(`❓ ${question.question}\n`);
    
    const difficultyEmoji: Record<string, string> = {
      'beginner': '🟢',
      'intermediate': '🟡',
      'advanced': '🔴'
    };
    lines.push(`${difficultyEmoji[question.difficulty] || '⚪'} ${question.difficulty.toUpperCase()}\n`);
    
    lines.push(`📚 ${question.channel} / ${question.subChannel}\n`);
    lines.push(`\n💡 Quick Answer:\n${question.answer}\n`);
    
    const explanationPreview = question.explanation
      .split('\n')
      .filter((line: string) => line.trim().length > 0)
      .slice(0, 3)
      .join('\n');
    
    lines.push(`\n📖 Key Points:\n${explanationPreview}\n`);
    
    const tags = question.tags.map((t: string) => `#${t.replace(/[^a-z0-9]/gi, '')}`).join(' ');
    lines.push(`\n${tags}`);
    
    lines.push('\n\n💬 Have you encountered this in interviews? Share your approach in the comments!\n');
    lines.push('🔗 Practice more questions on Code Reels: https://code-reels.github.io/');
    
    return lines.join('');
  };

  const createHtmlPreview = (question: any) => {
    const post = generatePostText(question);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Post - ${question.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f0f2f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .post { background: white; border-radius: 8px; padding: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); line-height: 1.6; color: #333; }
    .post-header { display: flex; align-items: center; margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #e5e7eb; }
    .avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; }
    .post-meta { flex: 1; }
    .post-meta h3 { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .post-meta p { font-size: 12px; color: #65676b; }
    .post-content { margin-bottom: 16px; white-space: pre-wrap; word-wrap: break-word; }
    .engagement { display: flex; justify-content: space-around; padding-top: 12px; border-top: 1px solid #e5e7eb; margin-top: 16px; color: #65676b; font-size: 13px; }
    .metadata { font-size: 12px; color: #65676b; margin-top: 16px; padding-top: 12px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="post">
      <div class="post-header">
        <div class="avatar">CR</div>
        <div class="post-meta">
          <h3>Code Reels</h3>
          <p>Just now • 🌐</p>
        </div>
      </div>
      <div class="post-content">${post}</div>
      <div class="engagement">
        <div>👍 Like</div>
        <div>💬 Comment</div>
        <div>↗️ Share</div>
      </div>
      <div class="metadata">
        <strong>Question ID:</strong> ${question.id}<br>
        <strong>Channel:</strong> ${question.channel}/${question.subChannel}<br>
        <strong>Tags:</strong> ${question.tags.join(', ')}<br>
        <strong>Generated:</strong> ${new Date().toLocaleString()}
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const copyToClipboard = async () => {
    if (!post) return;
    try {
      await navigator.clipboard.writeText(post.text);
      toast({
        title: 'Copied!',
        description: 'Post text copied to clipboard'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard'
      });
    }
  };

  const downloadSvg = () => {
    if (!post?.svg) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(post.svg));
    element.setAttribute('download', `${post.id}-diagram.svg`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: 'Downloaded',
      description: 'Diagram downloaded as SVG'
    });
  };

  const downloadHtml = () => {
    if (!post) return;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(post.html));
    element.setAttribute('download', `${post.id}-preview.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: 'Downloaded',
      description: 'Preview downloaded as HTML'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-3 sm:p-4 md:p-6 font-mono overflow-hidden">
      {/* Header */}
      <header className="border-b border-border pb-3 sm:pb-4 mb-4 flex justify-between items-start flex-shrink-0">
        <div>
          <button 
            onClick={() => setLocation('/')}
            className="flex items-center gap-1 text-[9px] sm:text-xs uppercase tracking-widest hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tighter uppercase">
            <span className="text-primary mr-1">&gt;</span>LinkedIn Post Generator
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Left Panel - Question Selection */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-border p-3 sm:p-4 bg-card space-y-3"
        >
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight">
            <span className="text-primary">1.</span> Select Question
          </h2>

          {/* Question Search/Select */}
          <div className="space-y-2">
            <label className="text-[9px] sm:text-xs uppercase tracking-widest text-muted-foreground">
              Choose a question
            </label>
            <select
              value={selectedQuestion?.id || ''}
              onChange={(e) => {
                const q = questions.find(q => q.id === e.target.value);
                setSelectedQuestion(q);
              }}
              className="w-full bg-background border border-border p-2 text-[9px] sm:text-xs rounded focus:outline-none focus:border-primary"
            >
              {questions.map(q => (
                <option key={q.id} value={q.id}>
                  [{q.id}] {q.question.substring(0, 50)}...
                </option>
              ))}
            </select>
          </div>

          {/* Question Preview */}
          {selectedQuestion && (
            <div className="border border-border/50 p-2 sm:p-3 bg-background/50 space-y-2">
              <div>
                <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mb-1">
                  Question
                </div>
                <p className="text-[9px] sm:text-xs leading-tight">
                  {selectedQuestion.question}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[8px] sm:text-[9px]">
                <div>
                  <span className="text-muted-foreground">Channel:</span>
                  <div className="text-primary font-bold">{selectedQuestion.channel}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Difficulty:</span>
                  <div className="text-primary font-bold">{selectedQuestion.difficulty}</div>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground text-[8px] sm:text-[9px]">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedQuestion.tags?.map((tag: string) => (
                    <span key={tag} className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generatePost}
            disabled={!selectedQuestion || loading}
            className="w-full bg-primary text-primary-foreground py-2 px-3 rounded font-bold uppercase tracking-widest text-[9px] sm:text-xs hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                Generate Post
              </>
            )}
          </button>
        </motion.div>

        {/* Right Panel - Post Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="border border-border p-3 sm:p-4 bg-card space-y-3"
        >
          <h2 className="text-sm sm:text-base font-bold uppercase tracking-tight">
            <span className="text-primary">2.</span> Generated Post
          </h2>

          {!post ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-[9px] sm:text-xs">
              Select a question and click "Generate Post" to create a LinkedIn post
            </div>
          ) : (
            <div className="space-y-3">
              {/* Post Text Preview */}
              <div className="border border-border/50 p-2 sm:p-3 bg-background/50 rounded max-h-48 overflow-y-auto custom-scrollbar">
                <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                  Post Text
                </div>
                <p className="text-[9px] sm:text-xs leading-relaxed whitespace-pre-wrap">
                  {post.text}
                </p>
              </div>

              {/* Diagram Preview */}
              {post.svg && (
                <div className="border border-border/50 p-2 sm:p-3 bg-background/50 rounded">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                    Diagram
                  </div>
                  <div className="max-h-40 overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: post.svg }} />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex items-center justify-center gap-1 bg-primary/20 text-primary py-2 px-2 rounded font-bold uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-primary/30 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy Text
                </button>

                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center justify-center gap-1 bg-primary/20 text-primary py-2 px-2 rounded font-bold uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-primary/30 transition-colors"
                >
                  <Eye className="w-3 h-3" />
                  Preview
                </button>

                {post.svg && (
                  <button
                    onClick={downloadSvg}
                    className="flex items-center justify-center gap-1 bg-primary/20 text-primary py-2 px-2 rounded font-bold uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-primary/30 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    SVG
                  </button>
                )}

                <button
                  onClick={downloadHtml}
                  className="flex items-center justify-center gap-1 bg-primary/20 text-primary py-2 px-2 rounded font-bold uppercase tracking-widest text-[8px] sm:text-[9px] hover:bg-primary/30 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  HTML
                </button>
              </div>

              {/* Metadata */}
              <div className="text-[8px] sm:text-[9px] text-muted-foreground space-y-1 border-t border-border/50 pt-2">
                <div>ID: {post.id}</div>
                <div>Generated: {new Date(post.metadata.generatedAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Preview Modal */}
      {showPreview && post && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background border border-border rounded max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-4 border-b border-border flex justify-between items-center sticky top-0 bg-background">
              <h3 className="font-bold uppercase text-sm">LinkedIn Post Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <div dangerouslySetInnerHTML={{ __html: post.html }} />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
