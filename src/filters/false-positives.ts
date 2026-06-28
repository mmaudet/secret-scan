import { RawFinding } from '../types.js';

const PLACEHOLDER_PATTERNS = [
  /example/i,
  /changeme/i,
  /your-/i,
  /dummy/i,
  /fake/i,
  /xxxx/i,
  /lorem/i,
  /<[^>]+>/,
  /\{\{[^}]+\}\}/,
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value));
}

function isUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

export function filterFalsePositives(findings: RawFinding[]): RawFinding[] {
  return findings.filter(finding => {
    const value = finding.rawValue;
    if (isPlaceholder(value)) return false;
    if (isUUID(value)) return false;
    return true;
  });
}