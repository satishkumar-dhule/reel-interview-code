/**
 * Pyodide Runner - Execute Python code in the browser using Pyodide
 * https://pyodide.org/
 */

// Pyodide types
interface PyodideInterface {
  runPython: (code: string) => unknown;
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInterface>;
  }
}

let pyodideInstance: PyodideInterface | null = null;
let loadingPromise: Promise<PyodideInterface> | null = null;

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/';

/**
 * Load the Pyodide script dynamically
 */
function loadPyodideScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.loadPyodide === 'function') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `${PYODIDE_CDN}pyodide.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pyodide script'));
    document.head.appendChild(script);
  });
}

/**
 * Initialize Pyodide - loads the Python runtime into the browser
 * This is a heavy operation (~10MB download) so we do it lazily
 */
export async function initPyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    await loadPyodideScript();
    
    pyodideInstance = await window.loadPyodide({
      indexURL: PYODIDE_CDN,
    });

    return pyodideInstance;
  })();

  return loadingPromise;
}

/**
 * Check if Pyodide is loaded
 */
export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}

/**
 * Check if Pyodide is currently loading
 */
export function isPyodideLoading(): boolean {
  return loadingPromise !== null && pyodideInstance === null;
}

export interface PythonExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  executionTime: number;
}

/**
 * Execute Python code and return the result
 */
export async function executePython(
  code: string,
  functionName: string,
  input: string
): Promise<PythonExecutionResult> {
  const startTime = performance.now();

  try {
    const pyodide = await initPyodide();

    // Wrap the execution to capture the result
    const wrappedCode = `
import json
from collections.abc import Iterator, Iterable

${code}

# Execute the function with the input
_input = ${input}
if isinstance(_input, tuple):
    _result = ${functionName}(*_input)
else:
    _result = ${functionName}(_input)

# Convert result to JSON-compatible format
def to_json_compatible(obj):
    if obj is None:
        return None
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, (int, float, str)):
        return obj
    if isinstance(obj, (list, tuple)):
        return [to_json_compatible(x) for x in obj]
    if isinstance(obj, dict):
        return {str(k): to_json_compatible(v) for k, v in obj.items()}
    # Handle iterators (like reversed(), map(), filter(), etc.)
    if isinstance(obj, Iterator):
        return [to_json_compatible(x) for x in obj]
    # Handle other iterables
    if isinstance(obj, Iterable) and not isinstance(obj, (str, bytes)):
        return [to_json_compatible(x) for x in obj]
    return str(obj)

_json_result = json.dumps(to_json_compatible(_result))
_json_result
`;

    const result = await pyodide.runPythonAsync(wrappedCode);
    const executionTime = performance.now() - startTime;

    return {
      success: true,
      output: String(result),
      executionTime,
    };
  } catch (error) {
    const executionTime = performance.now() - startTime;
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown Python error',
      executionTime,
    };
  }
}

/**
 * Extract Python function name from code
 */
export function extractPythonFunctionName(code: string): string | null {
  const match = code.match(/def\s+(\w+)\s*\(/);
  return match ? match[1] : null;
}
