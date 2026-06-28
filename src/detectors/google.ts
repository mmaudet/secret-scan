import { RawFinding } from '../types.js';

const GOOGLE_API_KEY_REGEX = /AIza[0-9A-Za-z\-_]{35}/g;

export function detectGoogle(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    GOOGLE_API_KEY_REGEX.lastIndex = 0;

    while ((match = GOOGLE_API_KEY_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'google-api-key',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}