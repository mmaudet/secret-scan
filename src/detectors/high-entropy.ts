import { RawFinding } from '../types.js';
import { calculateShannonEntropy } from '../utils/entropy.js';

const ENTROPY_THRESHOLD = 4.0;
const MIN_LENGTH = 32;
const SKIP_PATTERNS = [
  /https?:\/\/[^\s]+/,
  /\b\w{3,}\s+\w{3,}\s+\w{3,}\b/, // sentences
];

export function detectHighEntropy(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip comments
    if (line.trim().startsWith('#') || line.trim().startsWith('//') || line.trim().startsWith('/*')) continue;

    // Split by whitespace and non-alphanumeric chars to extract tokens
    const tokens = line.split(/[\s,;:(){}\[\]"'`]+/).filter(t => t.length > 0);

    for (const token of tokens) {
      if (token.length < MIN_LENGTH) continue;

      // Skip known non-secret patterns
      if (SKIP_PATTERNS.some(pattern => pattern.test(token))) continue;

      const entropy = calculateShannonEntropy(token);
      if (entropy >= ENTROPY_THRESHOLD) {
        findings.push({
          file: filename,
          line: i + 1,
          category: 'high-entropy-string',
          severity: 'low',
          rawValue: token,
        });
      }
    }
  }

  return findings;
}