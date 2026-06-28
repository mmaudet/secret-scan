import { RawFinding, ScanResult } from '../types.js';
import { redact } from '../utils/redaction.js';

/**
 * Sanitize a string for safe JSON serialization.
 * Removes BOM, control characters, and non-ASCII bytes.
 */
function sanitize(str: string): string {
  return str
    .replace(/\ufeff/g, '')       // Remove BOM
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control chars
    .replace(/[^\x20-\x7E\t\n\r]/g, '') // Keep only printable ASCII + tabs/newlines
    .replace(/\r\n/g, '\\n')      // Normalize line endings
    .replace(/\r/g, '\\n');
}

/**
 * Generate the final JSON report from filtered findings.
 */
export function generateReport(findings: RawFinding[], scannedFiles: number): ScanResult {
  return {
    version: '1',
    scannedFiles,
    findings: findings.map(finding => ({
      file: sanitize(finding.file),
      line: finding.line,
      category: finding.category,
      severity: finding.severity,
      redacted: sanitize(redact(finding.rawValue)),
    })),
  };
}

/**
 * Serialize the report to a JSON string.
 */
export function serializeReport(report: ScanResult): string {
  return JSON.stringify(report, null, 2);
}