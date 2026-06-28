import { RawFinding, ScanResult } from '../types.js';
import { redact } from '../utils/redaction.js';

/**
 * Generate the final JSON report from filtered findings.
 */
export function generateReport(findings: RawFinding[], scannedFiles: number): ScanResult {
  return {
    version: '1',
    scannedFiles,
    findings: findings.map(finding => ({
      file: finding.file,
      line: finding.line,
      category: finding.category,
      severity: finding.severity,
      redacted: redact(finding.rawValue),
    })),
  };
}

/**
 * Serialize the report to a JSON string.
 */
export function serializeReport(report: ScanResult): string {
  return JSON.stringify(report, null, 2);
}