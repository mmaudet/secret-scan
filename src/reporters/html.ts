import { RawFinding } from '../types.js';
import { redact } from '../utils/redaction.js';

interface HtmlReport {
  scannedFiles: number;
  totalFindings: number;
  scanTime: number;
  findings: RawFinding[];
  timestamp: string;
}

/**
 * Generate an HTML report with modern styling.
 */
export function generateHtmlReport(report: HtmlReport): string {
  const { scannedFiles, totalFindings, scanTime, findings, timestamp } = report;
  
  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getSeverityClass = (severity: string): string => {
    switch (severity) {
      case 'high': return 'severity-high';
      case 'medium': return 'severity-medium';
      case 'low': return 'severity-low';
      default: return 'severity-neutral';
    };
  };

  const getSeverityEmoji = (severity: string): string => {
    switch (severity) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const rows = findings.map(f => `
      <tr>
        <td><code>${escapeHtml(f.file)}</code></td>
        <td>${f.line}</td>
        <td><span class="category">${escapeHtml(f.category)}</span></td>
        <td class="${getSeverityClass(f.severity)}">${getSeverityEmoji(f.severity)} ${f.severity}</td>
        <td><span class="redacted">${escapeHtml(redact(f.rawValue))}</span></td>
      </tr>`).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Secret Scan Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; 
      max-width: 1000px; 
      margin: 2em auto; 
      padding: 0 1em; 
      background: #f8fafc; 
      color: #1e293b;
      line-height: 1.6;
    }
    h1 { 
      color: #0f172a; 
      margin-bottom: 0.5em;
      font-size: 2em;
    }
    .subtitle {
      color: #64748b;
      margin-bottom: 2em;
    }
    .stats { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
      gap: 1em; 
      margin: 2em 0; 
    }
    .stat { 
      background: white; 
      padding: 1.5em; 
      border-radius: 12px; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
      text-align: center;
      border: 1px solid #e2e8f0;
    }
    .stat-value { 
      font-size: 2.5em; 
      font-weight: bold; 
      color: #0f172a;
      line-height: 1;
    }
    .stat-label { 
      color: #64748b; 
      font-size: 0.85em; 
      margin-top: 0.75em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      background: white; 
      border-radius: 12px; 
      overflow: hidden; 
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid #e2e8f0;
    }
    th { 
      background: #0f172a; 
      color: white; 
      padding: 14px 12px; 
      text-align: left;
      font-weight: 600;
      font-size: 0.9em;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td { 
      padding: 14px 12px; 
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.95em;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover { background: #f8fafc; }
    .severity-high { 
      color: #dc2626; 
      font-weight: 600;
    }
    .severity-medium { 
      color: #d97706; 
      font-weight: 600;
    }
    .severity-low { 
      color: #2563eb;
      font-weight: 600;
    }
    .category { 
      background: #e0e7ff; 
      color: #3730a3; 
      padding: 4px 10px; 
      border-radius: 12px; 
      font-size: 0.85em;
      font-weight: 500;
    }
    .redacted { 
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
      background: #f1f5f9; 
      padding: 4px 8px; 
      border-radius: 6px; 
      font-size: 0.9em;
      color: #475569;
    }
    code {
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      color: #334155;
    }
    .footer { 
      margin-top: 3em; 
      text-align: center; 
      color: #94a3b8; 
      font-size: 0.85em;
      padding: 2em 0;
      border-top: 1px solid #e2e8f0;
    }
    @media (max-width: 768px) {
      body { margin: 1em; }
      .stats { grid-template-columns: 1fr; }
      table { font-size: 0.85em; }
      td, th { padding: 10px 8px; }
    }
  </style>
</head>
<body>
  <h1>🔍 Secret Scan Report</h1>
  <p class="subtitle">Automated secret detection scan results</p>
  
  <div class="stats">
    <div class="stat">
      <div class="stat-value">${scannedFiles}</div>
      <div class="stat-label">Files Scanned</div>
    </div>
    <div class="stat">
      <div class="stat-value" style="color: ${totalFindings > 0 ? '#dc2626' : '#16a34a'}">${totalFindings}</div>
      <div class="stat-label">Findings</div>
    </div>
    <div class="stat">
      <div class="stat-value">${formatDuration(report.scanTime)}</div>
      <div class="stat-label">Scan Time</div>
    </div>
  </div>

  ${totalFindings > 0 ? `
  <table>
    <thead>
      <tr>
        <th>File</th>
        <th>Line</th>
        <th>Category</th>
        <th>Severity</th>
        <th>Redacted Value</th>
      </tr>
    </thead>
    <tbody>
${rows}
    </tbody>
  </table>
  ` : '<div class="stat" style="text-align: center; padding: 3em;"><div class="stat-value" style="color: #16a34a;">✓</div><div class="stat-label">No findings detected</div></div>'}

  <div class="footer">
    Generated by <strong>secret-scan</strong> v1.0.0 on ${timestamp}
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}