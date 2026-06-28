import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateReport, serializeReport } from '../../src/reporters/json.js';
import { RawFinding } from '../../src/types.js';

describe('generateReport', () => {
  it('should generate a valid report', () => {
    const findings: RawFinding[] = [
      {
        file: 'test.env',
        line: 1,
        category: 'aws-access-key',
        severity: 'high',
        rawValue: 'AKIAIOSFODNN7EXAMPLE',
      },
    ];

    const report = generateReport(findings, 1);
    assert.equal(report.version, '1');
    assert.equal(report.scannedFiles, 1);
    assert.equal(report.findings.length, 1);
  });

  it('should redact values in the report', () => {
    const findings: RawFinding[] = [
      {
        file: 'test.env',
        line: 1,
        category: 'aws-access-key',
        severity: 'high',
        rawValue: 'AKIAIOSFODNN7EXAMPLE',
      },
    ];

    const report = generateReport(findings, 1);
    // New redaction: 3 prefix + 12 masked = 15 chars (constant length)
    assert.equal(report.findings[0].redacted, 'AKI************');
  });

  it('should handle empty findings', () => {
    const report = generateReport([], 5);
    assert.equal(report.scannedFiles, 5);
    assert.equal(report.findings.length, 0);
  });
});

describe('serializeReport', () => {
  it('should serialize to valid JSON', () => {
    const report = generateReport([], 0);
    const json = serializeReport(report);
    assert.ok(json.startsWith('{'));
    assert.ok(json.endsWith('}'));
    const parsed = JSON.parse(json);
    assert.equal(parsed.version, '1');
  });
});