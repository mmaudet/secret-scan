import { RawFinding } from '../types.js';

// Match sk-... but NOT sk_live_... (which is Stripe)
const GENERIC_SECRET_KEY_REGEX = /(?<!sk_live_)sk-[0-9a-zA-Z]{20,}/g;

export function detectGenericKey(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    GENERIC_SECRET_KEY_REGEX.lastIndex = 0;

    while ((match = GENERIC_SECRET_KEY_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'generic-secret-key',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}