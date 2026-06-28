import { RawFinding } from '../types.js';
import { calculateShannonEntropy } from '../utils/entropy.js';

const JWT_REGEX = /eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

export function detectJWT(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match: RegExpExecArray | null;
    JWT_REGEX.lastIndex = 0;

    while ((match = JWT_REGEX.exec(line)) !== null) {
      const jwt = match[0];
      // Validate: must have exactly 2 dots and 3 segments
      const parts = jwt.split('.');
      if (parts.length !== 3) continue;

      // Decode payload and check entropy of decoded content
      let decodedPayload: string;
      try {
        // Add padding if needed for base64 decoding
        let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        decodedPayload = Buffer.from(b64, 'base64').toString('utf-8');
      } catch {
        decodedPayload = parts[1];
      }
      const payloadEntropy = calculateShannonEntropy(decodedPayload);
      if (payloadEntropy < 3.5) continue;

      findings.push({
        file: filename,
        line: i + 1,
        category: 'jwt-token',
        severity: 'medium',
        rawValue: jwt,
      });
    }
  }

  return findings;
}