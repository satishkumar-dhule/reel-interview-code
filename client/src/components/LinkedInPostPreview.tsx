import { useState, useRef } from 'react';
import { Copy, Download, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface LinkedInPostPreviewProps {
  question: any;
  onClose: () => void;
}

export function LinkedInPostPreview({ question, onClose }: LinkedInPostPreviewProps) {
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
        allowTaint: true
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
          {/* LinkedIn-style Post */}
          <div ref={postRef} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-lg">
            {/* Post Header */}
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

            {/* Post Content */}
            <div className="p-6 space-y-4">
              <div className="text-lg font-bold text-blue-600">
                🎯 Technical Interview Question
              </div>

              <div className="text-base text-gray-900 font-semibold">
                ❓ {question.question}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {
                    (['beginner', 'intermediate', 'advanced'] as const).includes(question.difficulty as any)
                      ? {
                          'beginner': '🟢',
                          'intermediate': '🟡',
                          'advanced': '🔴'
                        }[question.difficulty as 'beginner' | 'intermediate' | 'advanced']
                      : '⚪'
                  }
                </span>
                <span className="font-bold text-gray-700 uppercase text-sm">
                  {question.difficulty}
                </span>
              </div>

              <div className="text-sm text-gray-600">
                📚 {question.channel} / {question.subChannel}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <div className="font-bold text-gray-900 mb-2">💡 Quick Answer:</div>
                <p className="text-gray-700 text-sm">{question.answer}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-bold text-gray-900 mb-2">📖 Key Points:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {question.explanation
                    .split('\n')
                    .filter((line: string) => line.trim().length > 0)
                    .slice(0, 3)
                    .map((point: string, idx: number) => (
                      <li key={idx}>• {point.substring(0, 80)}</li>
                    ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {question.tags.map((tag: string) => (
                  <span key={tag} className="text-blue-600 text-sm font-semibold">
                    #{tag.replace(/[^a-z0-9]/gi, '')}
                  </span>
                ))}
              </div>

              <div className="text-sm text-gray-600 italic">
                💬 Have you encountered this in interviews? Share your approach in the comments!
              </div>

              <div className="text-sm text-blue-600 font-semibold">
                🔗 Practice more questions on Code Reels: https://reel-interview.github.io/
              </div>
            </div>

            {/* Post Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-around text-gray-600 text-sm font-semibold">
              <button className="hover:text-blue-600 transition-colors">👍 Like</button>
              <button className="hover:text-blue-600 transition-colors">💬 Comment</button>
              <button className="hover:text-blue-600 transition-colors">↗️ Share</button>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600 space-y-1">
            <div><strong>Question ID:</strong> {question.id}</div>
            <div><strong>Channel:</strong> {question.channel}/{question.subChannel}</div>
            <div><strong>Difficulty:</strong> {question.difficulty}</div>
            <div><strong>Generated:</strong> {new Date().toLocaleString()}</div>
          </div>

          {/* Post Text Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="font-bold text-gray-900 mb-2 text-sm">📋 Post Text (Copy to LinkedIn):</div>
            <div className="bg-white p-3 rounded border border-gray-200 text-xs text-gray-700 whitespace-pre-wrap max-h-40 overflow-y-auto font-mono">
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
