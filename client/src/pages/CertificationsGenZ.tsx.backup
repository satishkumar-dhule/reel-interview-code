/**
 * Gen Z Certifications Page - Get Certified, Get Hired
 * Same aesthetic as Channels page
 */

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { AppLayout } from '../components/layout/AppLayout';
import { SEOHead } from '../components/SEOHead';
import {
  Search, Award, Clock, ChevronRight, Sparkles, TrendingUp, Check, Plus,
  Cloud, Shield, Database, Brain, Code, Users, Box, Terminal, Server, Cpu,
  Layers, Network, GitBranch, Loader2, Target
} from 'lucide-react';

// Certification type
interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  icon: string;
  color: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  estimatedHours: number;
  examCode?: string;
  questionCount: number;
  passingScore: number;
  examDuration: number;
}

// Icon mapping
const iconMap: Record<string, any> = {
  'cloud': Cloud,
  'shield': Shield,
  'database': Database,
  'brain': Brain,
  'code': Code,
  'users': Users,
  'box': Box,
  'terminal': Terminal,
  'server': Server,
  'cpu': Cpu,
  'layers': Layers,
  'network': Network,
  'infinity': GitBranch,
  'award': Award,
};

// Categories
const categories = [
  { id: 'cloud', name: 'Cloud' },
  { id: 'devops', name: 'DevOps' },
  { id: 'security', name: 'Security' },
  { id: 'data', name: 'Data' },
  { id: 'ai', name: 'AI & ML' },
  { id: 'development', name: 'Development' },
  { id: 'management', name: 'Management' }
];

// Fetch certifications
function useCertifications() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCertifications() {
      try {
        const basePath = import.meta.env.BASE_URL || '/';
        const response = await fetch(`${basePath}data/certifications.json`);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setCertifications(data);
      } catch (err) {
        console.error('Failed to load certifications:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCertifications();
  }, []);

  return { certifications, loading };
}

export default function CertificationsGenZ() {
  const [, navigate] = useLocation();
  const { certifications, loading } = useCertifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [startedCerts, setStartedCerts] = useState<Set<string>>(new Set());

  // Load started certifications from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('startedCertifications');
      if (saved) {
        setStartedCerts(new Set(JSON.parse(saved)));
      }
    } catch (e) {
      console.error('Failed to load started certs:', e);
    }
  }, []);

  // Toggle started certification
  const toggleStarted = (certId: string) => {
    const newStarted = new Set(startedCerts);
    if (newStarted.has(certId)) {
      newStarted.delete(certId);
    } else {
      newStarted.add(certId);
    }
    setStartedCerts(newStarted);
    try {
      localStorage.setItem('startedCertifications', JSON.stringify(Array.from(newStarted)));
    } catch (e) {
      console.error('Failed to save:', e);
    }
  };

  // Filter certifications
  const filteredCerts = certifications.filter(cert => {
    const matchesSearch = cert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cert.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-[#00ff88] animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <>
      <SEOHead
        title="Certifications - Get Certified, Get Hired 🎓"
        description="Practice for AWS, Azure, GCP, Kubernetes, and more certifications"
        canonical="https://open-interview.github.io/certifications"
      />

      <AppLayout>
        <div className="min-h-screen bg-black text-white">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6 mb-12"
            >
              <h1 className="text-6xl md:text-7xl font-black">
                Get
                <br />
                <span className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] bg-clip-text text-transparent">
                  certified
                </span>
              </h1>
              <p className="text-xl text-[#a0a0a0]">
                {filteredCerts.length} certifications to master
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search certifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[24px] text-xl focus:outline-none focus:border-[#00ff88] transition-all"
                />
              </div>
            </motion.div>

            {/* Category Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-3 justify-center mb-12"
            >
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  !selectedCategory
                    ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </motion.div>

            {/* Certifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCerts.map((cert, i) => {
                const IconComponent = iconMap[cert.icon] || Award;
                const isStarted = startedCerts.has(cert.id);

                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(i * 0.05, 0.5) }}
                    className="group relative p-6 bg-white/5 backdrop-blur-xl rounded-[24px] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#00ff88]/10 to-[#00d4ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="w-14 h-14 bg-gradient-to-br from-[#00ff88]/20 to-[#00d4ff]/20 rounded-[16px] flex items-center justify-center flex-shrink-0 border border-[#00ff88]/30">
                            <IconComponent className="w-7 h-7 text-[#00ff88]" strokeWidth={2} />
                          </div>
                          <div>
                            <div className="text-xs text-[#666] mb-1">{cert.provider}</div>
                            <h3 className="text-xl font-bold leading-tight">{cert.name}</h3>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-[#a0a0a0] line-clamp-2">{cert.description}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#00ff88]" />
                          <span className="text-[#a0a0a0]">{cert.questionCount} questions</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-[#00d4ff]" />
                          <span className="text-[#a0a0a0]">{cert.estimatedHours}h</span>
                        </div>
                      </div>

                      {/* Difficulty Badge */}
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-[#666]" />
                        <span className={`text-xs font-semibold uppercase ${
                          cert.difficulty === 'beginner' ? 'text-green-500' :
                          cert.difficulty === 'intermediate' ? 'text-yellow-500' :
                          cert.difficulty === 'advanced' ? 'text-orange-500' :
                          'text-red-500'
                        }`}>
                          {cert.difficulty}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStarted(cert.id)}
                          className={`flex-1 px-6 py-3 rounded-[16px] font-bold transition-all ${
                            isStarted
                              ? 'bg-white/10 border border-white/20 hover:bg-white/20'
                              : 'bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-black hover:scale-105'
                          }`}
                        >
                          {isStarted ? (
                            <span className="flex items-center justify-center gap-2">
                              <Check className="w-5 h-5" />
                              Started
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <Plus className="w-5 h-5" />
                              Start
                            </span>
                          )}
                        </button>

                        {isStarted && (
                          <button
                            onClick={() => navigate(`/certification/${cert.id}`)}
                            className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-[16px] border border-white/10 transition-all"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredCerts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold mb-2">No certifications found</h3>
                <p className="text-[#a0a0a0]">Try a different search or category</p>
              </motion.div>
            )}
          </div>
        </div>
      </AppLayout>
    </>
  );
}
