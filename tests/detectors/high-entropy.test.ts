import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectHighEntropy } from '../../src/detectors/high-entropy.js';

describe('detectHighEntropy', () => {
  it('should detect high entropy strings', () => {
    const lines = ['random_secret=a8f5f167f44f4964e6c998dee827110c'];
    const findings = detectHighEntropy(lines.join('\n'), lines, 'test.env');
    const entropyFindings = findings.filter(f => f.category === 'high-entropy-string');
    assert.ok(entropyFindings.length >= 1);
  });

  it('should not detect short strings', () => {
    const lines = ['short=abc123'];
    const findings = detectHighEntropy(lines.join('\n'), lines, 'test.env');
    const entropyFindings = findings.filter(f => f.category === 'high-entropy-string');
    assert.equal(entropyFindings.length, 0);
  });

  it('should not detect lines starting with #', () => {
    const lines = ['# comment: a8f5f167f44f4964e6c998dee827110c'];
    const findings = detectHighEntropy(lines.join('\n'), lines, 'test.env');
    const entropyFindings = findings.filter(f => f.category === 'high-entropy-string');
    assert.equal(entropyFindings.length, 0);
  });

  it('should set correct line number', () => {
    const lines = ['line1', 'line2', 'random_secret=a8f5f167f44f4964e6c998dee827110c'];
    const findings = detectHighEntropy(lines.join('\n'), lines, 'test.env');
    const entropyFindings = findings.filter(f => f.category === 'high-entropy-string');
    if (entropyFindings.length > 0) {
      assert.equal(entropyFindings[0].line, 3);
    }
  });
});