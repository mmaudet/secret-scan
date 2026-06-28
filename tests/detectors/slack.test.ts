import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectSlack } from '../../src/detectors/slack.js';

describe('detectSlack', () => {
  it('should not match short bot tokens (placeholder)', () => {
    // xoxb-short is too short to match the detector regex (needs 10+ chars after prefix)
    const lines = ['TOKEN=xoxb-short'];
    const findings = detectSlack(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should not match short user tokens (placeholder)', () => {
    const lines = ['TOKEN=xoxp-short'];
    const findings = detectSlack(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });
});