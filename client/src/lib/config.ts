// Configuration for AI features
// Cookie will be injected at build time from environment variable

export const AI_CONFIG = {
  // OpenRouter cookie (set via VITE_OPENROUTER_COOKIE env var)
  openRouterCookie: import.meta.env.VITE_OPENROUTER_COOKIE || '',
  
  // OpenRouter model (free tier)
  openRouterModel: 'mistralai/mixtral-8x7b-instruct:free',
};

// Check if OpenRouter is configured
export function isOpenRouterConfigured(): boolean {
  return AI_CONFIG.useOpenRouter && AI_CONFIG.openRouterCookie.length > 0;
}
