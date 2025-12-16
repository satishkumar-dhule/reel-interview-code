// Unified Enrichment Bot - Videos, Diagrams, and Companies in one pass
// More efficient: one AI call can enrich multiple aspects
// Uses AI verification to ensure all enrichments are accurate and relevant
import { BotFramework } from '../lib/bot-framework.js';
import { 
  validateYouTubeVideos,
  validateVideoWithAI,
  getDiagramQuality, 
  isValidMermaidSyntax,
  verifyDiagramWithAI,
  validateCompanyData, 
  normalizeCompanies,
  verifyCompaniesWithAI
} from '../lib/validators.js';
import { getAllQuestions, saveQuestion } from '../lib/storage.js';
import { runWithRetries, parseJson } from '../utils.js';

// Check what enrichments are needed
function getNeededEnrichments(question) {
  const needs = [];
  
  // Videos
  const videos = question.videos || {};
  if (!videos.shortVideo?.length > 10) needs.push('shortVideo');
  if (!videos.longVideo?.length > 10) needs.push('longVideo');
  
  // Diagram
  const diagramCheck = getDiagramQuality(question.diagram);
  if (!diagramCheck.valid) needs.push('diagram');
  
  // Companies
  const companyCheck = validateCompanyData(question.companies, 3);
  if (!companyCheck.valid) needs.push('companies');
  
  return needs;
}

// Single AI call to get all enrichments
async function enrichQuestion(question, needs) {
  const needsVideo = needs.includes('shortVideo') || needs.includes('longVideo');
  const needsDiagram = needs.includes('diagram');
  const needsCompanies = needs.includes('companies');
  
  const prompt = `Enrich this interview question with the following:
${needsVideo ? '- YouTube video URLs (real, educational videos)' : ''}
${needsDiagram ? '- Mermaid diagram (flowchart with 5-10 nodes)' : ''}
${needsCompanies ? '- Companies that ask this question' : ''}

Question: "${question.question}"
Topic: ${question.tags?.slice(0, 3).join(', ') || 'technical'}
Difficulty: ${question.difficulty || 'intermediate'}

Return JSON:
{
  ${needsVideo ? '"videos": { "shortVideo": "youtube URL or null", "longVideo": "youtube URL or null" },' : ''}
  ${needsDiagram ? '"diagram": "flowchart TD\\n  A[Step] --> B[Step]",' : ''}
  ${needsCompanies ? '"companies": ["Company1", "Company2", "Company3"],' : ''}
  "success": true
}`;

  const response = await runWithRetries(prompt);
  if (!response) return null;
  
  return parseJson(response);
}

// Process single question
async function processQuestion(question) {
  const needs = getNeededEnrichments(question);
  
  if (needs.length === 0) {
    console.log('✅ Fully enriched');
    return { skipped: true, stats: { fullyEnriched: 1 } };
  }
  
  console.log(`Needs: ${needs.join(', ')}`);
  
  // Validate existing videos first
  if (question.videos?.shortVideo || question.videos?.longVideo) {
    const validated = await validateYouTubeVideos(question.videos);
    question.videos = validated;
  }
  
  // Get enrichments from AI
  console.log('🔄 Enriching...');
  const enrichments = await enrichQuestion(question, needs);
  
  if (!enrichments) {
    return { failed: true, reason: 'AI enrichment failed' };
  }
  
  const stats = {};
  let updated = false;
  
  // Apply video enrichments with AI verification
  if (enrichments.videos) {
    // First do static validation
    const staticValidated = await validateYouTubeVideos(enrichments.videos);
    
    // Then AI verify each video
    if (staticValidated.shortVideo && !question.videos?.shortVideo) {
      console.log('  🤖 AI verifying short video...');
      const aiCheck = await validateVideoWithAI(staticValidated.shortVideo, question.question);
      if (aiCheck.valid) {
        question.videos = question.videos || {};
        question.videos.shortVideo = staticValidated.shortVideo;
        stats.videosAdded = (stats.videosAdded || 0) + 1;
        updated = true;
        console.log(`    ✓ Short video AI-verified`);
      } else {
        console.log(`    ✗ Short video failed AI check: ${aiCheck.reason}`);
      }
    }
    if (staticValidated.longVideo && !question.videos?.longVideo) {
      console.log('  🤖 AI verifying long video...');
      const aiCheck = await validateVideoWithAI(staticValidated.longVideo, question.question);
      if (aiCheck.valid) {
        question.videos = question.videos || {};
        question.videos.longVideo = staticValidated.longVideo;
        stats.videosAdded = (stats.videosAdded || 0) + 1;
        updated = true;
        console.log(`    ✓ Long video AI-verified`);
      } else {
        console.log(`    ✗ Long video failed AI check: ${aiCheck.reason}`);
      }
    }
  }
  
  // Apply diagram enrichment with AI verification
  if (enrichments.diagram && isValidMermaidSyntax(enrichments.diagram)) {
    console.log('  🤖 AI verifying diagram accuracy...');
    const aiCheck = await verifyDiagramWithAI(enrichments.diagram, question.question, question.answer);
    if (aiCheck.valid) {
      const wasEmpty = !question.diagram || question.diagram.length < 20;
      question.diagram = enrichments.diagram;
      stats[wasEmpty ? 'diagramsAdded' : 'diagramsImproved'] = 1;
      updated = true;
      console.log(`    ✓ Diagram AI-verified (${Math.round(aiCheck.accuracy * 100)}% accuracy)`);
    } else {
      console.log(`    ✗ Diagram failed AI check: ${aiCheck.reason}`);
    }
  }
  
  // Apply company enrichment with AI verification
  if (enrichments.companies) {
    const newCompanies = normalizeCompanies(enrichments.companies);
    if (newCompanies.length > 0) {
      console.log('  🤖 AI verifying companies...');
      const aiCheck = await verifyCompaniesWithAI(newCompanies, question.question, question.difficulty);
      const verifiedCompanies = aiCheck.verified || [];
      
      if (verifiedCompanies.length > 0) {
        const existing = normalizeCompanies(question.companies || []);
        const merged = [...new Set([...existing, ...verifiedCompanies])].sort();
        const addedCount = merged.length - existing.length;
        if (addedCount > 0) {
          question.companies = merged;
          stats.companiesAdded = addedCount;
          updated = true;
          console.log(`    ✓ ${verifiedCompanies.length} companies AI-verified`);
        }
      } else {
        console.log(`    ✗ No companies passed AI verification`);
      }
    }
  }
  
  if (!updated) {
    return { failed: true, reason: 'No valid enrichments' };
  }
  
  question.lastEnriched = new Date().toISOString();
  
  return { updated: true, data: question, stats };
}

// Main
async function main() {
  const bot = new BotFramework({
    name: 'enrichment-bot',
    batchSize: 5,
    rateLimitMs: 3000, // Slightly longer for combined call
    processQuestion
  });
  
  const questions = getAllQuestions();
  await bot.run(questions, (_id, data) => saveQuestion(data));
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
