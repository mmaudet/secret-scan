import { RawFinding } from '../types.js';
import { calculateShannonEntropy } from '../utils/entropy.js';

const CONFIG_EXTENSIONS = new Set([
  '.env', '.env.local', '.env.development', '.env.test', '.env.production',
  '.config.js', '.config.ts', '.config.json', '.config.yml', '.config.yaml',
  '.yaml', '.yml', '.toml', '.json', '.ini', '.cfg', '.conf',
]);

const SECRET_KEY_PATTERNS = [
  /password/i,
  /secret/i,
  /token/i,
  /api[_-]?(key|secret)/i,
  /private[_-]?key/i,
  /credential/i,
  /auth/i,
  /access[_-]?key/i,
  /database[_-]?url/i,
  /db[_-]?pass/i,
  /connection[_-]?string/i,
  /dsn/i,
];

function isConfigFile(filePath: string): boolean {
  const dotIndex = filePath.lastIndexOf('.');
  const ext = dotIndex >= 0 ? filePath.substring(dotIndex).toLowerCase() : '';
  return CONFIG_EXTENSIONS.has(ext);
}

function looksLikeSecretKey(key: string): boolean {
  return SECRET_KEY_PATTERNS.some(pattern => pattern.test(key));
}

function looksLikeSecretValue(value: string): boolean {
  // Remove quotes
  const clean = value.replace(/^['"]|['"]$/g, '');
  if (clean.length < 8) return false;
  const entropy = calculateShannonEntropy(clean);
  return entropy > 3.5;
}

export function detectEnvAssignment(content: string, lines: string[], filename: string): RawFinding[] {
  const findings: RawFinding[] = [];

  // Only scan config files
  if (!isConfigFile(filename)) return findings;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Match KEY=value patterns (skip comments and lines with no value)
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*[:=]\s*["']?([^"'\n#][^"\n#]*?)["']?\s*$/);
    if (!match) continue;

    const [, key, value] = match;
    if (!looksLikeSecretKey(key)) continue;
    if (!looksLikeSecretValue(value)) continue;

    findings.push({
      file: filename,
      line: i + 1,
      category: 'env-assignment',
      severity: 'medium',
      rawValue: value,
    });
  }

  return findings;
}