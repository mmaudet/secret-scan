import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectEnvAssignment } from '../../src/detectors/env-assignment.js';

describe('detectEnvAssignment', () => {
  it('should detect password in .env file', () => {
    const lines = ['DB_PASSWORD=wJalrXUtnFEMI/K7MDENG'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'env-assignment');
  });

  it('should detect secret key in .env file', () => {
    const lines = ['SECRET_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
  });

  it('should detect API key with quotes', () => {
    const lines = ["API_KEY='a8f5f167f44f4964e6c998dee827110c'"];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
  });

  it('should detect with export prefix', () => {
    const lines = ['export TOKEN=ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ01234567890123'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
  });

  it('should not detect in non-config files', () => {
    const lines = ['DB_PASSWORD=s3cr3tP@ssw0rd!'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'app.js');
    assert.equal(findings.length, 0);
  });

  it('should not detect short values', () => {
    const lines = ['PASSWORD=short'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should not detect non-secret keys', () => {
    const lines = ['HOST=localhost', 'PORT=3000'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should set correct line number', () => {
    const lines = ['line1', 'line2', 'DB_PASSWORD=wJalrXUtnFEMI/K7MDENG'];
    const findings = detectEnvAssignment(lines.join('\n'), lines, 'test.env');
    assert.equal(findings[0].line, 3);
  });
});