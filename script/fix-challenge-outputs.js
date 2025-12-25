/**
 * Fix Coding Challenge Expected Outputs
 * Re-runs all challenge solutions to regenerate correct expected outputs
 * 
 * Usage: node script/fix-challenge-outputs.js
 */

import 'dotenv/config';
import { createClient } from '@libsql/client';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Execute Python code and return the result
 */
async function executePythonCode(code, functionName, input) {
  return new Promise((resolve, reject) => {
    const wrappedCode = `
import json
from collections.abc import Iterator, Iterable

${code}

# Parse input and call function
_args = (${input},)
if len(_args) == 1 and isinstance(_args[0], tuple):
    _args = _args[0]

_result = ${functionName}(*_args)

# Convert to JSON-compatible format
def to_json(obj):
    if obj is None: return None
    if isinstance(obj, bool): return obj
    if isinstance(obj, (int, float, str)): return obj
    if isinstance(obj, (list, tuple)): return [to_json(x) for x in obj]
    if isinstance(obj, dict): return {str(k): to_json(v) for k, v in obj.items()}
    if isinstance(obj, Iterator): return [to_json(x) for x in obj]
    if isinstance(obj, Iterable) and not isinstance(obj, (str, bytes)): return [to_json(x) for x in obj]
    return str(obj)

print(json.dumps(to_json(_result)))
`;

    const tempFile = path.join(os.tmpdir(), `fix_challenge_${Date.now()}.py`);
    fs.writeFileSync(tempFile, wrappedCode);

    const python = spawn('python3', [tempFile], { timeout: 10000 });
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => { stdout += data.toString(); });
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.on('close', (code) => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
      
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Python error: ${stderr || 'Unknown error'}`));
      }
    });

    python.on('error', (err) => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
      reject(err);
    });
  });
}

function extractPythonFunctionName(code) {
  const match = code.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}

async function main() {
  console.log('=== 🔧 Fix Coding Challenge Expected Outputs ===\n');
  
  // Get all challenges
  const result = await db.execute(`
    SELECT id, title, solution_py, test_cases 
    FROM coding_challenges 
    ORDER BY id
  `);
  
  console.log(`📊 Found ${result.rows.length} challenges to check\n`);
  
  let fixed = 0;
  let failed = 0;
  let unchanged = 0;
  
  for (const row of result.rows) {
    const { id, title, solution_py, test_cases } = row;
    
    if (!solution_py) {
      console.log(`⏭️ ${id}: No Python solution, skipping`);
      continue;
    }
    
    const functionName = extractPythonFunctionName(solution_py);
    if (!functionName) {
      console.log(`⏭️ ${id}: Could not extract function name, skipping`);
      continue;
    }
    
    let testCases;
    try {
      testCases = JSON.parse(test_cases);
    } catch (e) {
      console.log(`❌ ${id}: Invalid test_cases JSON`);
      failed++;
      continue;
    }
    
    console.log(`\n🔍 ${id}: ${title}`);
    console.log(`   Function: ${functionName}()`);
    
    let hasChanges = false;
    const updatedTestCases = [];
    
    for (const tc of testCases) {
      try {
        const actualOutput = await executePythonCode(solution_py, functionName, tc.input);
        
        if (actualOutput !== tc.expectedOutput) {
          console.log(`   ⚠️ Test ${tc.id}: "${tc.expectedOutput}" → "${actualOutput}"`);
          hasChanges = true;
        }
        
        updatedTestCases.push({
          ...tc,
          expectedOutput: actualOutput
        });
      } catch (error) {
        console.log(`   ❌ Test ${tc.id} failed: ${error.message}`);
        updatedTestCases.push(tc); // Keep original
      }
    }
    
    if (hasChanges) {
      // Update database
      await db.execute({
        sql: 'UPDATE coding_challenges SET test_cases = ?, last_updated = ? WHERE id = ?',
        args: [JSON.stringify(updatedTestCases), new Date().toISOString(), id]
      });
      console.log(`   ✅ Fixed and saved`);
      fixed++;
    } else {
      console.log(`   ✓ All test cases correct`);
      unchanged++;
    }
  }
  
  console.log('\n=== SUMMARY ===');
  console.log(`Fixed: ${fixed}`);
  console.log(`Unchanged: ${unchanged}`);
  console.log(`Failed: ${failed}`);
  console.log(`Total: ${result.rows.length}`);
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
