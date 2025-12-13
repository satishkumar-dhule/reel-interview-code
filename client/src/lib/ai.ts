// AI Integration with OpenRouter (with cookie auth) and HuggingFace fallback
// Falls back to mock responses if both APIs fail

import { AI_CONFIG, isOpenRouterConfigured } from './config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  content: string;
  error?: string;
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Try OpenRouter - only option, no fallbacks
async function tryOpenRouter(messages: ChatMessage[]): Promise<AIResponse | null> {
  if (!isOpenRouterConfigured()) return null;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Learn Reels - Interview Prep',
        'Cookie': AI_CONFIG.openRouterCookie,
      },
      credentials: 'include',
      body: JSON.stringify({
        model: AI_CONFIG.openRouterModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.log('OpenRouter failed:', response.status);
      return null;
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
    };
  } catch (error) {
    console.error('OpenRouter error:', error);
    return null;
  }
}



export async function chatWithAI(
  messages: ChatMessage[],
  _model?: string
): Promise<AIResponse> {
  // Only try OpenRouter - no fallbacks
  if (!isOpenRouterConfigured()) {
    return {
      content: '',
      error: 'OpenRouter not configured. Please add your cookie to .env file. See OPENROUTER_SETUP.md for instructions.',
    };
  }

  const openRouterResponse = await tryOpenRouter(messages);
  if (openRouterResponse && openRouterResponse.content) {
    console.log('✅ Using OpenRouter');
    return openRouterResponse;
  }

  // If OpenRouter failed, return error
  return {
    content: '',
    error: 'AI service unavailable. Please check your OpenRouter cookie or try again later.',
  };
}



// Streaming response - only OpenRouter, no fallbacks
export async function* streamChatWithAI(
  messages: ChatMessage[],
  _model?: string
): AsyncGenerator<string> {
  // Check if configured
  if (!isOpenRouterConfigured()) {
    yield 'Error: OpenRouter not configured. Please add your cookie to .env file.\n\n';
    yield 'See OPENROUTER_SETUP.md for setup instructions or visit http://localhost:5001/test/cookie to check configuration.';
    return;
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Learn Reels - Interview Prep',
        'Cookie': AI_CONFIG.openRouterCookie,
      },
      credentials: 'include',
      body: JSON.stringify({
        model: AI_CONFIG.openRouterModel,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenRouter error:', response.status, errorData);
      
      if (response.status === 401) {
        yield 'Error: Authentication failed. Your OpenRouter cookie may be invalid or expired.\n\n';
        yield 'Please extract a fresh cookie from https://openrouter.ai and update your .env file.\n\n';
        yield 'Run: node script/get-openrouter-cookie.js';
      } else {
        yield `Error: AI service returned ${response.status}. Please try again later.`;
      }
      return;
    }

    if (!response.body) {
      yield 'Error: No response body from AI service.';
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error) {
    console.error('OpenRouter streaming error:', error);
    yield 'Error: Failed to connect to AI service. Please check your internet connection and try again.';
  }
}

// AI Feature: Tutor - Answer follow-up questions
export function createTutorPrompt(question: string, answer: string, explanation: string, userQuestion: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are an expert technical interview tutor. Help students understand interview concepts deeply. Be concise but thorough. Use examples when helpful.`,
    },
    {
      role: 'user',
      content: `Interview Question: ${question}\n\nAnswer: ${answer}\n\nExplanation: ${explanation}\n\nStudent's Question: ${userQuestion}`,
    },
  ];
}

// AI Feature: Mock Interviewer - Evaluate user's answer
export function createInterviewerPrompt(question: string, userAnswer: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a senior technical interviewer. Evaluate the candidate's answer constructively. Point out strengths and areas for improvement. Be encouraging but honest.`,
    },
    {
      role: 'user',
      content: `Interview Question: ${question}\n\nCandidate's Answer: ${userAnswer}\n\nPlease evaluate this answer and provide feedback.`,
    },
  ];
}

// AI Feature: Concept Explainer - Break down complex topics
export function createExplainerPrompt(concept: string, context: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a technical educator. Explain complex concepts in simple terms using analogies and examples. Break down into digestible parts.`,
    },
    {
      role: 'user',
      content: `Explain this concept in the context of: ${context}\n\nConcept: ${concept}`,
    },
  ];
}

// AI Feature: Code Reviewer - Review solution approach
export function createCodeReviewPrompt(question: string, code: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are a senior software engineer doing code review. Analyze code for correctness, efficiency, readability, and best practices. Suggest improvements.`,
    },
    {
      role: 'user',
      content: `Question: ${question}\n\nProposed Solution:\n\`\`\`\n${code}\n\`\`\`\n\nPlease review this code.`,
    },
  ];
}

// AI Feature: Related Questions - Generate similar questions
export function createRelatedQuestionsPrompt(question: string, difficulty: string): ChatMessage[] {
  return [
    {
      role: 'system',
      content: `You are an interview question curator. Generate 3-5 related interview questions that test similar concepts. Format as a numbered list.`,
    },
    {
      role: 'user',
      content: `Based on this ${difficulty} question, suggest related questions:\n\n${question}`,
    },
  ];
}

// AI Feature: Hint Generator - Progressive hints without spoiling
export function createHintPrompt(question: string, hintLevel: number): ChatMessage[] {
  const levels = ['subtle', 'moderate', 'detailed'];
  return [
    {
      role: 'system',
      content: `You are a helpful tutor. Provide a ${levels[hintLevel - 1]} hint that guides thinking without giving away the answer.`,
    },
    {
      role: 'user',
      content: `Question: ${question}\n\nProvide hint level ${hintLevel}/3`,
    },
  ];
}
