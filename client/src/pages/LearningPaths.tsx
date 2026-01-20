import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  BookOpen, Code2, Database, Cloud, Shield, Cpu, 
  Network, Terminal, Layers, GitBranch, CheckCircle, 
  Lock, ArrowRight, Trophy, Target, Zap, Flame, Clock,
  Search, Building2, Briefcase, Filter, X
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SEOHead } from '@/components/SEOHead';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  pathType: 'company' | 'job-title' | 'skill' | 'certification';
  targetCompany?: string;
  targetJobTitle?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  questionIds: string[];
  channels: string[];
  tags: string[];
  prerequisites: string[];
  learningObjectives: string[];
  milestones: any[];
  popularity: number;
  completionRate: number;
  averageRating: number;
  metadata: any;
  status: string;
  createdAt: string;
  lastUpdated: string;
}

const getDifficultyConfig = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return { icon: <Zap className="w-4 h-4" />, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Beginner' };
    case 'intermediate':
      return { icon: <Target className="w-4 h-4" />, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Intermediate' };
    case 'advanced':
      return { icon: <Flame className="w-4 h-4" />, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Advanced' };
    default:
      return { icon: <Target className="w-4 h-4" />, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
  }
};

const getPathTypeIcon = (pathType: string) => {
  switch (pathType) {
    case 'company':
      return <Building2 className="w-6 h-6" />;
    case 'job-title':
      return <Briefcase className="w-6 h-6" />;
    case 'skill':
      return <Code2 className="w-6 h-6" />;
    case 'certification':
      return <Trophy className="w-6 h-6" />;
    default:
      return <BookOpen className="w-6 h-6" />;
  }
};

const getPathTypeColor = (pathType: string) => {
  switch (pathType) {
    case 'company':
      return 'from-blue-500 to-cyan-500';
    case 'job-title':
      return 'from-purple-500 to-pink-500';
    case 'skill':
      return 'from-green-500 to-emerald-500';
    case 'certification':
      return 'from-orange-500 to-red-500';
    default:
      return 'from-gray-500 to-gray-600';
  }
};

export default function LearningPaths() {
  const [, setLocation] = useLocation();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedPathType, setSelectedPathType] = useState<string>('all');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('all');
  const [companies, setCompanies] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLearningPaths();
    fetchFilterOptions();
  }, [selectedDifficulty, selectedPathType, selectedCompany, selectedJobTitle, searchQuery]);

  const fetchLearningPaths = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedPathType !== 'all') params.append('pathType', selectedPathType);
      if (selectedCompany !== 'all') params.append('company', selectedCompany);
      if (selectedJobTitle !== 'all') params.append('jobTitle', selectedJobTitle);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`/api/learning-paths?${params.toString()}`);
      const data = await response.json();
      setPaths(data);
    } catch (error) {
      console.error('Failed to fetch learning paths:', error);
      setPaths([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilterOptions = async () => {
    try {
      const [companiesRes, jobTitlesRes] = await Promise.all([
        fetch('/api/learning-paths/filters/companies'),
        fetch('/api/learning-paths/filters/job-titles')
      ]);
      
      setCompanies(await companiesRes.json());
      setJobTitles(await jobTitlesRes.json());
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
    }
  };

  const handleStartPath = async (path: LearningPath) => {
    // Increment popularity
    try {
      await fetch(`/api/learning-paths/${path.id}/start`, { method: 'POST' });
    } catch (error) {
      console.error('Failed to update popularity:', error);
    }
    
    // Navigate to first question or channel
    if (path.questionIds.length > 0) {
      setLocation(`/channel/${path.questionIds[0]}`);
    } else if (path.channels.length > 0) {
      setLocation(`/channel/${path.channels[0]}`);
    }
  };

  const clearFilters = () => {
    setSelectedDifficulty('all');
    setSelectedPathType('all');
    setSelectedCompany('all');
    setSelectedJobTitle('all');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedDifficulty !== 'all' || 
                          selectedPathType !== 'all' || 
                          selectedCompany !== 'all' || 
                          selectedJobTitle !== 'all' ||
                          searchQuery !== '';

  return (
    <>
      <SEOHead
        title="Learning Paths | Structured Interview Prep"
        description="Follow curated learning paths to master frontend, backend, system design, DevOps, and more. Structured roadmaps for technical interview preparation."
        canonical="https://open-interview.github.io/learning-paths"
      />
      <AppLayout title="Learning Paths" showBackOnMobile>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground mb-4">Learning Paths</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Follow structured roadmaps tailored to companies, job titles, and skills. Each path includes curated questions.
            </p>
            
            {/* Search Bar - directly below title */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-card border border-border rounded-lg">
                {/* Path Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Path Type</label>
                  <select
                    value={selectedPathType}
                    onChange={(e) => setSelectedPathType(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="company">Company-Specific</option>
                    <option value="job-title">Job Title</option>
                    <option value="skill">Skill-Based</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Companies</option>
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Job Title */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                  <select
                    value={selectedJobTitle}
                    onChange={(e) => setSelectedJobTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Roles</option>
                    {jobTitles.map(title => (
                      <option key={title} value={title}>
                        {title.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </motion.div>

          {/* Results Count */}
          {!loading && (
            <div className="mb-4 text-sm text-muted-foreground">
              Found {paths.length} learning path{paths.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">Loading learning paths...</p>
            </div>
          )}

          {/* Learning Paths Grid */}
          {!loading && paths.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paths.map((path, index) => {
                const diffConfig = getDifficultyConfig(path.difficulty);
                const gradient = getPathTypeColor(path.pathType);
                
                return (
                  <motion.div
                    key={path.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative"
                  >
                    <div className="relative h-full bg-card border border-border rounded-xl overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10">
                      {/* Gradient header */}
                      <div className={`h-2 bg-gradient-to-r ${gradient}`} />
                      
                      <div className="p-6">
                        {/* Icon & Type Badge */}
                        <div className="flex items-start justify-between mb-4">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} text-white`}>
                            {getPathTypeIcon(path.pathType)}
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-full">
                            <span className="text-xs text-muted-foreground font-medium capitalize">
                              {path.pathType.replace('-', ' ')}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-2">{path.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{path.description}</p>

                        {/* Meta info */}
                        <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Terminal className="w-3 h-3" />
                            <span>{path.questionIds.length} questions</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{path.estimatedHours}h</span>
                          </div>
                        </div>

                        {/* Company or Job Title Badge */}
                        {path.targetCompany && (
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-500 text-xs rounded-full">
                              <Building2 className="w-3 h-3" />
                              {path.targetCompany}
                            </span>
                          </div>
                        )}
                        {path.targetJobTitle && (
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-500 text-xs rounded-full">
                              <Briefcase className="w-3 h-3" />
                              {path.targetJobTitle.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                            </span>
                          </div>
                        )}

                        {/* Difficulty badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${diffConfig.bg} mb-4`}>
                          <span className={diffConfig.color}>{diffConfig.icon}</span>
                          <span className={`text-xs font-bold ${diffConfig.color}`}>{diffConfig.label}</span>
                        </div>

                        {/* Popularity indicator */}
                        {path.popularity > 0 && (
                          <div className="mb-4 text-xs text-muted-foreground">
                            🔥 {path.popularity} learners started this path
                          </div>
                        )}

                        {/* Action button */}
                        <button
                          onClick={() => handleStartPath(path)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                        >
                          Start Learning
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {!loading && paths.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">No learning paths found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}

          {/* Info Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">
                Learning paths are updated daily based on new questions and trends
              </span>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    </>
  );
}
