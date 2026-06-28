import { RawFinding } from '../types.js';
import { redact } from '../utils/redaction.js';

interface TextReport {
  scannedFiles: number;
  totalFindings: number;
  scanTime: number;
  findings: RawFinding[];
}

function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'high': return '🔴';
    case 'medium': return '🟡';
    case 'low': return '🔵';
    default: return '⚪';
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function truncate(str: string, maxLen: number = 50): string {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen - 3) + '...';
}

/**
 * Generate a concise text report for console output.
 */
export function generateTextReport(report: TextReport): string {
  const lines: string[] = [];
  const width = 60;
  const separator = '═'.repeat(width);
  const thinSeparator = '─'.repeat(width);

  // Header
  lines.push('');
  lines.push(`╔${separator}╗`);
  lines.push(`║${padCenter(' SECRET SCAN REPORT ', width)}║`);
  lines.push(`╠${separator}╣`);
  lines.push(`║${padLeft(`Files scanned: ${report.scannedFiles}`, width)}║`);
  lines.push(`║${padLeft(`Findings: ${report.totalFindings}`, width)}║`);
  lines.push(`║${padLeft(`Scan time: ${formatDuration(report.scanTime)}`, width)}║`);
  lines.push(`╠${separator}╣`);

  // Group findings by severity
  const bySeverity: Record<string, RawFinding[]> = {};
  for (const f of report.findings) {
    if (!bySeverity[f.severity]) bySeverity[f.severity] = [];
    bySeverity[f.severity].push(f);
  }

  const severityOrder = ['high', 'medium', 'low'];
  for (const severity of severityOrder) {
    const findings = bySeverity[severity] || [];
    if (findings.length === 0) continue;

    lines.push(`║${padLeft(`${getSeverityEmoji(severity)} ${severity.toUpperCase()} (${findings.length})`, width)}║`);
    lines.push(`╠${thinSeparator}╣`);

    for (const f of findings) {
      const redacted = truncate(redact(f.rawValue), 25);
      const category = f.category.padEnd(20);
      const location = `${f.file}:${f.line}`.padEnd(25);
      lines.push(`║${padLeft(`${location} ${category}`, width)}║`);
      lines.push(`║${padLeft(`  ${redacted}`, width)}║`);
    }
    lines.push(`╠${separator}╣`);
  }

  // Footer
  lines.push(`╚${separator}╝`);
  lines.push('');

  return lines.join('\n');
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  return str + ' '.repeat(len - str.length);
}

function padCenter(str: string, len: number): string {
  if (str.length >= len) return str.substring(0, len);
  const padding = len - str.length;
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + str + ' '.repeat(right);
}