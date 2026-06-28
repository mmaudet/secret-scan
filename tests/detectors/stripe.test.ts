import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectStripe } from '../../src/detectors/stripe.js';

describe('detectStripe', () => {
  it('should not match short live keys (placeholder)', () => {
    // sk_live_SHORTKEY is too short to match the detector regex (needs 24+ alphanumeric chars)
    const lines = ['STRIPE_KEY=sk_live_SHORTKEY'];
    const findings = detectStripe(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should not match test keys', () => {
    const lines = ['STRIPE_KEY=sk_test_AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHH'];
    const findings = detectStripe(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });
});