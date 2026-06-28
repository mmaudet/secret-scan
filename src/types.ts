export type Severity = 'high' | 'medium' | 'low';

export interface Finding {
  file: string;
  line: number;
  category: string;
  severity: Severity;
  redacted: string;
}

export interface RawFinding {
  file: string;
  line: number;
  category: string;
  severity: Severity;
  rawValue: string;
}

export interface ScanResult {
  version: '1';
  scannedFiles: number;
  findings: Finding[];
}