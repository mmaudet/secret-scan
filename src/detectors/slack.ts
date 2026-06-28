import { RawFinding } from '../types.js';

const SLACK_TOKEN_REGEX = /xox[baprs]-[0-9A-Za-z\-]{10,}/g;

export function detectSlack(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    SLACK_TOKEN_REGEX.lastIndex = 0;

    while ((match = SLACK_TOKEN_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'slack-token',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}