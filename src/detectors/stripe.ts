import { RawFinding } from '../types.js';

const STRIPE_KEY_REGEX = /sk_live_[0-9a-zA-Z]{24,}/g;

export function detectStripe(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    STRIPE_KEY_REGEX.lastIndex = 0;

    while ((match = STRIPE_KEY_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'stripe-key',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}