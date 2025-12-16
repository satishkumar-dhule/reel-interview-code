import { useState, useEffect, useMemo } from 'react';
import {
  getQuestionsForChannel,
  getQuestionById,
  getSubChannels,
  getChannelQuestionMetadata,
  loadQuestion,
  type Question,
  type QuestionMetadata,
} from '../lib/questions-lazy-loader';

// Hook to get questions for a channel with filters (async/lazy)
export function useQuestions(
  channelId: string,
  subChannel: string = 'all',
  difficulty: string = 'all',
  company: string = 'all'
) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!channelId) {
      setQuestions([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getQuestionsForChannel(channelId, subChannel, difficulty, company)
      .then((result) => {
        if (!cancelled) {
          setQuestions(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [channelId, subChannel, difficulty, company]);

  const questionIds = useMemo(() => questions.map((q) => q.id), [questions]);

  return {
    questions,
    questionIds,
    totalQuestions: questions.length,
    loading,
    error,
  };
}

// Hook to get metadata only (sync, lightweight)
export function useQuestionMetadata(channelId: string) {
  const metadata = useMemo(() => {
    if (!channelId) return [];
    return getChannelQuestionMetadata(channelId);
  }, [channelId]);

  return {
    metadata,
    totalQuestions: metadata.length,
    loading: false,
    error: null,
  };
}

// Hook to get a single question by ID (async)
export function useQuestion(questionId: string | undefined) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getQuestionById(questionId)
      .then((result) => {
        if (!cancelled) {
          setQuestion(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [questionId]);

  return { question, loading, error };
}


// Combined hook for question navigation with current question (async)
export function useQuestionsWithPrefetch(
  channelId: string,
  currentIndex: number,
  subChannel: string = 'all',
  difficulty: string = 'all',
  company: string = 'all'
) {
  const { questions, questionIds, totalQuestions, loading, error } = useQuestions(
    channelId,
    subChannel,
    difficulty,
    company
  );

  const currentQuestion = useMemo(() => {
    if (currentIndex >= 0 && currentIndex < questions.length) {
      return questions[currentIndex];
    }
    return null;
  }, [questions, currentIndex]);

  return {
    question: currentQuestion,
    questions,
    questionIds,
    totalQuestions,
    loading,
    error,
  };
}

// Hook to get subchannels for a channel (sync - from mappings)
export function useSubChannels(channelId: string) {
  const subChannels = useMemo(() => {
    if (!channelId) return [];
    return getSubChannels(channelId);
  }, [channelId]);

  return {
    subChannels,
    loading: false,
    error: null,
  };
}

// Hook to get companies with counts (async - needs full questions)
export function useCompaniesWithCounts(
  channelId: string,
  subChannel: string = 'all',
  difficulty: string = 'all'
) {
  const { questions, loading, error } = useQuestions(channelId, subChannel, difficulty);

  const companiesWithCounts = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => {
      if (q.companies) {
        q.companies.forEach((c) => {
          counts.set(c, (counts.get(c) || 0) + 1);
        });
      }
    });
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [questions]);

  return {
    companiesWithCounts,
    loading,
    error,
  };
}

// Hook to prefetch next/prev questions for smooth navigation
export function usePrefetchQuestions(
  questionIds: string[],
  currentIndex: number,
  prefetchCount: number = 2
) {
  useEffect(() => {
    // Prefetch next questions
    for (let i = 1; i <= prefetchCount; i++) {
      const nextIndex = currentIndex + i;
      if (nextIndex < questionIds.length) {
        loadQuestion(questionIds[nextIndex]).catch(() => {});
      }
    }
    // Prefetch previous questions
    for (let i = 1; i <= prefetchCount; i++) {
      const prevIndex = currentIndex - i;
      if (prevIndex >= 0) {
        loadQuestion(questionIds[prevIndex]).catch(() => {});
      }
    }
  }, [questionIds, currentIndex, prefetchCount]);
}

// Re-export types
export type { Question, QuestionMetadata };
