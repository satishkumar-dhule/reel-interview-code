// Company Bot - Add company data using the bot framework
// Uses AI verification to ensure companies actually ask these questions
import { BotFramework } from '../lib/bot-framework.js';
import { validateCompanyData, normalizeCompanies, verifyCompaniesWithAI } from '../lib/validators.js';
import { getAllQuestions, saveQuestion } from '../lib/storage.js';
import { runWithRetries, parseJson } from '../utils.js';

const MIN_COMPANIES = 3;

// Find companies using AI
async function findCompaniesForQuestion(question) {
  const prompt = `Find real tech companies that ask this interview question or similar ones.

Question: "${question.question}"
Topic: ${question.tags?.slice(0, 4).join(', ') || 'technical interview'}
Difficulty: ${question.difficulty || 'intermediate'}

Research which companies are known to ask this type of question based on:
- Glassdoor interview reports
- LeetCode company tags
- Known interview patterns

Consider: FAANG, Microsoft, Uber, Airbnb, LinkedIn, Stripe, Goldman Sachs, Bloomberg, Databricks, Snowflake

Return JSON:
{
  "companies": ["Company1", "Company2", "Company3", "Company4", "Company5"],
  "reasoning": "brief explanation"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return null;
  
  const data = parseJson(response);
  if (!data?.companies) return null;
  
  const validated = normalizeCompanies(data.companies);
  return validated.length > 0 ? { companies: validated, reasoning: data.reasoning } : null;
}

// Process single question
async function processQuestion(question) {
  const currentCompanies = question.companies || [];
  const check = validateCompanyData(currentCompanies, MIN_COMPANIES);
  
  console.log(`Current: ${currentCompanies.length > 0 ? currentCompanies.slice(0, 3).join(', ') : 'none'}`);
  console.log(`Status: ${check.reason || 'valid'}${check.count ? ` (${check.count})` : ''}`);
  
  // If companies exist and pass static check, verify with AI
  if (check.valid) {
    console.log('🤖 AI verifying existing company data...');
    const aiCheck = await verifyCompaniesWithAI(currentCompanies, question.question, question.difficulty);
    
    if (aiCheck.valid) {
      console.log(`  ✓ AI verified ${aiCheck.verified.length} companies (${Math.round(aiCheck.confidence * 100)}% confidence)`);
      return { skipped: true, stats: { companiesValid: 1 } };
    } else {
      console.log(`  ⚠️ AI flagged some companies as unlikely: ${aiCheck.unlikely?.join(', ') || 'none'}`);
      // Remove unlikely companies and continue to find more
      const verifiedOnly = aiCheck.verified || [];
      if (verifiedOnly.length >= MIN_COMPANIES) {
        // Update with only verified companies
        return {
          updated: true,
          data: {
            ...question,
            companies: verifiedOnly,
            lastCompanyUpdate: new Date().toISOString()
          },
          stats: { companiesVerified: 1 }
        };
      }
      // Need to find more companies
    }
  }
  
  console.log(`🔍 Finding companies (reason: ${check.reason || 'need more verified'})...`);
  
  const found = await findCompaniesForQuestion(question);
  if (!found) {
    return { failed: true, reason: 'AI search failed' };
  }
  
  console.log(`📋 Found candidates: ${found.companies.join(', ')}`);
  
  // Verify found companies with AI
  console.log('🤖 AI verifying found companies...');
  const aiVerify = await verifyCompaniesWithAI(found.companies, question.question, question.difficulty);
  
  const verifiedCompanies = aiVerify.verified || [];
  if (verifiedCompanies.length === 0) {
    console.log(`  ✗ No companies passed AI verification`);
    return { failed: true, reason: 'No companies passed AI verification' };
  }
  
  console.log(`  ✓ AI verified: ${verifiedCompanies.join(', ')}`);
  if (aiVerify.unlikely?.length > 0) {
    console.log(`  ✗ AI rejected: ${aiVerify.unlikely.join(', ')}`);
  }
  
  // Merge verified with existing verified (deduplicate)
  const existingNormalized = normalizeCompanies(currentCompanies);
  const merged = [...new Set([...existingNormalized, ...verifiedCompanies])].sort();
  const newCount = merged.length - existingNormalized.length;
  
  return {
    updated: true,
    data: {
      ...question,
      companies: merged,
      lastCompanyUpdate: new Date().toISOString()
    },
    stats: { companiesAdded: newCount }
  };
}

// Main
async function main() {
  const bot = new BotFramework({
    name: 'company-bot',
    batchSize: 5,
    rateLimitMs: 2000,
    processQuestion
  });
  
  const questions = getAllQuestions();
  await bot.run(questions, (_id, data) => saveQuestion(data));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
