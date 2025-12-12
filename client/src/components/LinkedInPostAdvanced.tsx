import { useState, useRef } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface LinkedInPostAdvancedProps {
  question: any;
  onClose: () => void;
}

export function LinkedInPostAdvanced({ question, onClose }: LinkedInPostAdvancedProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const postRef = useRef<HTMLDivElement>(null);

  const generatePostText = () => {
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
    lines.push('🔗 Practice more questions on Code Reels: https://reel-interview.github.io/');
    
    return lines.join('');
  };

  const postText = generatePostText();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postText);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Post copied to clipboard'
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard'
      });
    }
  };

  const downloadAsImage = async () => {
    if (!postRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(postRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: 1500
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `code-reels-${question.id}-${Date.now()}.png`;
      link.click();

      toast({
        title: 'Downloaded!',
        description: 'Post image saved successfully'
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: 'Error',
        description: 'Failed to download image'
      });
    } finally {
      setDownloading(false);
    }
  };

  const difficultyColorMap: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    'beginner': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    'intermediate': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
    'advanced': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
  };
  const difficultyColor = difficultyColorMap[question.difficulty] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', badge: 'bg-gray-100 text-gray-700' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-8 flex justify-between items-start rounded-t-2xl">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">LinkedIn Post</h2>
            <p className="text-blue-100 text-sm">Optimized for sharing • Ready to download</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Main Post - Optimized for sharing */}
          <div 
            ref={postRef} 
            className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100"
            style={{ width: '1200px', margin: '0 auto' }}
          >
            {/* Post Header with Avatar */}
            <div className="p-6 border-b border-gray-100 flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-md">
                CR
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">Code Reels</h3>
                <p className="text-sm text-gray-500">Technical Interview Prep Platform</p>
              </div>
              <div className="text-3xl">🚀</div>
            </div>

            {/* Main Content */}
            <div className="p-8 space-y-6">
              {/* Title Section */}
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-900 leading-tight">
                  {question.question}
                </div>
                
                {/* Difficulty & Category Badges */}
                <div className="flex flex-wrap gap-3">
                  <span className={`px-4 py-2 rounded-full font-semibold text-sm ${difficultyColor.badge}`}>
                    {question.difficulty === 'beginner' && '🟢'}
                    {question.difficulty === 'intermediate' && '🟡'}
                    {question.difficulty === 'advanced' && '🔴'}
                    {' '}{question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                  </span>
                  <span className="px-4 py-2 rounded-full font-semibold text-sm bg-indigo-100 text-indigo-700">
                    📚 {question.channel}
                  </span>
                  <span className="px-4 py-2 rounded-full font-semibold text-sm bg-purple-100 text-purple-700">
                    🏷️ {question.subChannel}
                  </span>
                </div>
              </div>

              {/* Quick Answer Section */}
              <div className={`p-6 rounded-xl border-2 ${difficultyColor.border} ${difficultyColor.bg}`}>
                <div className="font-bold text-lg mb-3 text-gray-900">💡 Quick Answer</div>
                <p className="text-gray-800 leading-relaxed text-base">
                  {question.answer}
                </p>
              </div>

              {/* Key Points Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
                <div className="font-bold text-lg mb-4 text-gray-900">📖 Key Points</div>
                <ul className="space-y-3">
                  {question.explanation
                    .split('\n')
                    .filter((line: string) => line.trim().length > 0)
                    .slice(0, 4)
                    .map((point: string, idx: number) => (
                      <li key={idx} className="flex gap-3 text-gray-800">
                        <span className="text-blue-600 font-bold flex-shrink-0">✓</span>
                        <span className="leading-relaxed">{point.substring(0, 120)}</span>
                      </li>
                    ))}
                </ul>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <div className="font-bold text-gray-900">🏷️ Topics</div>
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      #{tag.replace(/[^a-z0-9]/gi, '')}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-xl text-white space-y-3">
                <div className="font-bold text-lg">💬 Join the Discussion</div>
                <p className="text-blue-50">Have you encountered this in interviews? Share your approach in the comments!</p>
                <div className="pt-3 border-t border-blue-400">
                  <p className="text-sm font-semibold">🔗 Practice more questions on Code Reels</p>
                  <p className="text-blue-100 text-sm mt-1">https://reel-interview.github.io/</p>
                </div>
              </div>

              {/* Footer Stats */}
              <div className="flex justify-around pt-4 border-t border-gray-200 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">👍</div>
                  <p className="text-xs text-gray-500 mt-1">Like</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">💬</div>
                  <p className="text-xs text-gray-500 mt-1">Comment</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">↗️</div>
                  <p className="text-xs text-gray-500 mt-1">Share</p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Text for Copying */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="font-bold text-gray-900 mb-3">📋 Post Text</div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 text-xs text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
              {postText}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-t border-gray-200 rounded-b-2xl flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors font-semibold"
          >
            Close
          </button>
          <button
            onClick={copyToClipboard}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-all ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Text'}
          </button>
          <button
            onClick={downloadAsImage}
            disabled={downloading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Downloading...' : 'Download Image'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
