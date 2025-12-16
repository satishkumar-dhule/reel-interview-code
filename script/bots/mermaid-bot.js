// Mermaid Bot - Add/improve diagrams using the bot framework
// Uses AI verification to ensure diagrams accurately represent concepts
import { BotFramework } from '../lib/bot-framework.js';
import { getDiagramQuality, isValidMermaidSyntax, verifyDiagramWithAI } from '../lib/validators.js';
import { getAllQuestions, saveQuestion } from '../lib/storage.js';
import { runWithRetries, parseJson } from '../utils.js';

// Generate diagram using AI
async function generateDiagram(question, previousIssues = null) {
  let feedbackSection = '';
  if (previousIssues && previousIssues.length > 0) {
    feedbackSection = `
IMPORTANT: Previous attempt had these issues - fix them:
${previousIssues.map(i => `- ${i}`).join('\n')}
`;
  }
  
  const prompt = `Create a detailed Mermaid diagram for this interview question.

Question: "${question.question}"
Answer: "${question.answer?.substring(0, 300) || ''}"
Tags: ${question.tags?.slice(0, 4).join(', ') || 'technical'}
${feedbackSection}
Requirements:
1. Use flowchart TD or appropriate diagram type (sequence, class, state, etc.)
2. Include 5-10 meaningful nodes that ACCURATELY represent the concept
3. Show relationships and flow clearly
4. Use proper Mermaid syntax
5. Nodes should be SPECIFIC to this topic, not generic placeholders
6. The diagram should help someone understand the answer

Return ONLY valid JSON:
{
  "diagram": "flowchart TD\\n  A[Step 1] --> B[Step 2]\\n  B --> C[Step 3]",
  "diagramType": "flowchart|sequence|class|state"
}`;

  const response = await runWithRetries(prompt);
  if (!response) return null;
  
  const data = parseJson(response);
  if (!data?.diagram || !isValidMermaidSyntax(data.diagram)) return null;
  
  return data;
}

// Process single question
async function processQuestion(question) {
  const check = getDiagramQuality(question.diagram);
  console.log(`Status: ${check.reason || 'valid'}${check.nodeCount ? ` (${check.nodeCount} nodes)` : ''}`);
  
  // If diagram exists and passes static check, verify with AI
  if (check.valid) {
    console.log('🤖 AI verifying existing diagram accuracy...');
    const aiCheck = await verifyDiagramWithAI(question.diagram, question.question, question.answer);
    
    if (aiCheck.valid) {
      console.log(`  ✓ AI approved (${Math.round(aiCheck.accuracy * 100)}% accuracy)`);
      return { skipped: true, stats: { diagramsValid: 1 } };
    } else {
      console.log(`  ✗ AI rejected: ${aiCheck.reason}`);
      if (aiCheck.issues?.length > 0) {
        console.log(`    Issues: ${aiCheck.issues.join(', ')}`);
      }
      // Continue to regenerate
    }
  }
  
  console.log(`🔧 Generating diagram (reason: ${check.reason || 'AI rejected'})...`);
  
  const generated = await generateDiagram(question);
  if (!generated) {
    return { failed: true, reason: 'Generation failed' };
  }
  
  // Verify generated diagram with AI
  console.log('🤖 AI verifying generated diagram...');
  const aiVerify = await verifyDiagramWithAI(generated.diagram, question.question, question.answer);
  
  if (!aiVerify.valid) {
    console.log(`  ✗ Generated diagram failed AI verification: ${aiVerify.reason}`);
    // Try one more time with feedback
    console.log('  🔄 Retrying with AI feedback...');
    const retryGenerated = await generateDiagram(question, aiVerify.issues);
    if (retryGenerated) {
      const retryVerify = await verifyDiagramWithAI(retryGenerated.diagram, question.question, question.answer);
      if (retryVerify.valid) {
        generated.diagram = retryGenerated.diagram;
        console.log(`  ✓ Retry succeeded (${Math.round(retryVerify.accuracy * 100)}% accuracy)`);
      } else {
        return { failed: true, reason: 'Diagram failed AI verification after retry' };
      }
    } else {
      return { failed: true, reason: 'Retry generation failed' };
    }
  } else {
    console.log(`  ✓ AI approved (${Math.round(aiVerify.accuracy * 100)}% accuracy)`);
  }
  
  console.log(`✅ Generated ${generated.diagramType || 'flowchart'} diagram`);
  
  const wasEmpty = !question.diagram || question.diagram.length < 20;
  
  return {
    updated: true,
    data: {
      ...question,
      diagram: generated.diagram,
      lastDiagramUpdate: new Date().toISOString()
    },
    stats: wasEmpty ? { diagramsAdded: 1 } : { diagramsImproved: 1 }
  };
}

// Main
async function main() {
  const bot = new BotFramework({
    name: 'mermaid-bot',
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
