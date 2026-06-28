import { RawFinding } from '../types.js';
import { detectAWS } from './aws.js';
import { detectGoogle } from './google.js';
import { detectGitHub } from './github.js';
import { detectSlack } from './slack.js';
import { detectStripe } from './stripe.js';
import { detectGenericKey } from './generic-key.js';
import { detectPrivateKey } from './private-key.js';
import { detectJWT } from './jwt.js';
import { detectEnvAssignment } from './env-assignment.js';
import { detectHighEntropy } from './high-entropy.js';

/**
 * Run all detectors on a file's content.
 */
export function runAllDetectors(content: string, filename: string): RawFinding[] {
  const lines = content.split('\n');
  const allFindings: RawFinding[] = [];

  // Run each detector and merge results
  allFindings.push(...detectAWS(content, lines, filename));
  allFindings.push(...detectGoogle(content, lines, filename));
  allFindings.push(...detectGitHub(content, lines, filename));
  allFindings.push(...detectSlack(content, lines, filename));
  allFindings.push(...detectStripe(content, lines, filename));
  allFindings.push(...detectGenericKey(content, lines, filename));
  allFindings.push(...detectPrivateKey(content, lines, filename));
  allFindings.push(...detectJWT(content, lines, filename));
  allFindings.push(...detectEnvAssignment(content, lines, filename));
  allFindings.push(...detectHighEntropy(content, lines, filename));

  // Deduplicate by (line, category, rawValue)
  const seen = new Set<string>();
  const deduplicated = allFindings.filter(finding => {
    const key = `${finding.line}:${finding.category}:${finding.rawValue}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return deduplicated;
}