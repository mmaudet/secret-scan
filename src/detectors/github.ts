import { RawFinding } from '../types.js';

const GITHUB_PAT_TOKEN_REGEX = /gh[pous]_[A-Za-z0-9]{36,}/g;
const GITHUB_FINE_GRAINED_REGEX = /github_pat_[A-Za-z0-9_]{22,}/g;

export function detectGitHub(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;

    GITHUB_PAT_TOKEN_REGEX.lastIndex = 0;
    while ((match = GITHUB_PAT_TOKEN_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'github-token',
        severity: 'high',
        rawValue: match[0],
      });
    }

    GITHUB_FINE_GRAINED_REGEX.lastIndex = 0;
    while ((match = GITHUB_FINE_GRAINED_REGEX.exec(line)) !== null) {
      findings.push({
        file: filename,
        line: i + 1,
        category: 'github-token',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}