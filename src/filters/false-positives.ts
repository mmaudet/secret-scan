import { RawFinding } from '../types.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a value is an obvious placeholder/test value (not a real secret).
 * Conservative approach: only match when the entire value is a placeholder pattern.
 */
function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  
  // Empty or too short to be a real secret
  if (trimmed.length === 0) return true;
  
  // Template patterns: {{...}}, <...>, [...]
  if (/^<[^>]+>$/.test(trimmed)) return true;
  if (/^\{\{[^}]+\}\}$/.test(trimmed)) return true;
  if (/^\[[^\]]+\]$/.test(trimmed)) return true;
  
  // Exact placeholder words (common in docs/examples)
  const exactPlaceholders = new Set([
    'example', 'examples', 'changeme', 'change-me', 'your-password',
    'your-secret', 'your-token', 'your-api-key', 'your-access-key',
    'dummy', 'dummy-value', 'fake', 'fake-value', 'lorem', 'lorem-ipsum',
    'xxxx', 'xxxxxxxx', 'xxxxxxxx', 'placeholder', 'replace-me',
    'insert-here', 'none', 'null', 'test', 'test-value',
  ]);
  if (exactPlaceholders.has(trimmed.toLowerCase())) return true;
  
  // All-caps underscore patterns commonly used in docs: EXAMPLE, CHANGEME, XXXXX
  // Only match if the value consists entirely of uppercase + underscore
  if (/^[A-Z_]+$/.test(trimmed)) {
    const docPlaceholders = new Set([
      'EXAMPLE', 'EXAMPLES', 'CHANGEME', 'CHANGE_ME', 'DUMMY', 'FAKE',
      'LOREM', 'XXXX', 'XXXXX', 'XXXXXX', 'XXXXXXX', 'XXXXXXXX',
      'YOUR_PASSWORD', 'YOUR_SECRET', 'YOUR_TOKEN', 'YOUR_API_KEY',
      'REPLACE_ME', 'INSERT_HERE', 'PLACEHOLDER', 'TEST',
    ]);
    if (docPlaceholders.has(trimmed)) return true;
  }
  
  return false;
}

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function filterFalsePositives(findings: RawFinding[]): RawFinding[] {
  return findings.filter(finding => {
    // Skip findings in minified/vendor files
    if (/\.(min|bundle|all|packed)\.js$/.test(finding.file)) return false;

    const value = finding.rawValue;
    if (isPlaceholder(value)) return false;
    if (isUUID(value)) return false;
    return true;
  });
}