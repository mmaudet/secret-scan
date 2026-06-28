import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectGenericKey } from '../../src/detectors/generic-key.js';

describe('detectGenericKey', () => {
  it('should detect generic sk- key', () => {
    const lines = ['API_KEY=sk-abc123def456ghi789jkl012mno345'];
    const findings = detectGenericKey(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'generic-secret-key');
    assert.ok(findings[0].rawValue.startsWith('sk-'));
  });

  it('should not match short Stripe keys (placeholder)', () => {
    // sk_live_SHORTKEY is too short to match the detector regex
    const lines = ['STRIPE_KEY=sk_live_SHORTKEY'];
    const findings = detectGenericKey(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should not match short keys', () => {
    const lines = ['KEY=sk-short'];
    const findings = detectGenericKey(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });
});