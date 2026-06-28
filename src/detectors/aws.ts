import { RawFinding } from '../types.js';
import { calculateShannonEntropy } from '../utils/entropy.js';

const AWS_ACCESS_KEY_REGEX = /AKIA[0-9A-Z]{16}/g;
const AWS_SECRET_KEY_REGEX = /[A-Za-z0-9\/+=]{40}/g;

/**
 * Detect AWS Access Key IDs (AKIA...)
 */
function detectAWSAccessKeys(lines: string[]): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    AWS_ACCESS_KEY_REGEX.lastIndex = 0;

    while ((match = AWS_ACCESS_KEY_REGEX.exec(line)) !== null) {
      findings.push({
        file: '', // filled by caller
        line: i + 1,
        category: 'aws-access-key',
        severity: 'high',
        rawValue: match[0],
      });
    }
  }

  return findings;
}

/**
 * Detect AWS Secret Access Keys (40-char base64 near AWS_SECRET or aws_secret_access_key)
 */
function detectAWSSecretKeys(lines: string[]): RawFinding[] {
  const findings: RawFinding[] = [];
  const contextPatterns = [
    /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY|aws_secret_key|AWS_SECRET_KEY)\s*[:=]\s*/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ctxPattern of contextPatterns) {
      if (ctxPattern.test(line)) {
        // Look for 40-char base64 value after the context
        const valueMatch = line.match(/(?:[:=]\s*)([A-Za-z0-9\/+=]{40})/);
        if (valueMatch) {
          const value = valueMatch[1];
          // Verify it looks like a secret (not a common word)
          if (calculateShannonEntropy(value) > 3.5) {
            findings.push({
              file: '',
              line: i + 1,
              category: 'aws-secret-key',
              severity: 'high',
              rawValue: value,
            });
          }
        }
      }
    }
  }

  return findings;
}

/**
 * Main AWS detector.
 */
export function detectAWS(content: string, lines: string[], filename: string): RawFinding[] {
  const findings = [
    ...detectAWSAccessKeys(lines),
    ...detectAWSSecretKeys(lines),
  ];

  // Set the file path for all findings
  for (const f of findings) {
    f.file = filename;
  }

  return findings;
}