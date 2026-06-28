import { RawFinding } from '../types.js';

const BEGIN_PRIVATE_KEY = '-----BEGIN';
const PRIVATE_KEY_TYPES = [
  'RSA PRIVATE KEY',
  'DSA PRIVATE KEY',
  'EC PRIVATE KEY',
  'OPENSSH PRIVATE KEY',
  'PGP PRIVATE KEY',
  'PRIVATE KEY',
];

export function detectPrivateKey(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line.startsWith(BEGIN_PRIVATE_KEY)) continue;

    for (const type of PRIVATE_KEY_TYPES) {
      if (line.includes(type)) {
        findings.push({
          file: filename,
          line: i + 1,
          category: 'private-key',
          severity: 'high',
          rawValue: `${BEGIN_PRIVATE_KEY} ${type}`,
        });
        break;
      }
    }
  }

  return findings;
}