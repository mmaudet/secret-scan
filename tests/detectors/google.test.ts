import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectGoogle } from '../../src/detectors/google.js';

describe('detectGoogle', () => {
  it('should detect Google API key', () => {
    const lines = ['GOOGLE_API_KEY=AIzaSyDaGmXaWyQzvj9ZF_JX2FMvaBQU3hg6HA0'];
    const findings = detectGoogle(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'google-api-key');
    assert.ok(findings[0].rawValue.startsWith('AIza'));
  });

  it('should not match incomplete keys', () => {
    const lines = ['KEY=AIzaSyshort'];
    const findings = detectGoogle(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });
});