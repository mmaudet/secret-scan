import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../../src/utils/redaction.js';

describe('redact', () => {
  it('should mask entire value if length ≤ 6', () => {
    assert.equal(redact('short'), '*****');
    assert.equal(redact('abc'), '****');
  });

  it('should show only first 3 chars, never the suffix', () => {
    const result = redact('AKIAIOSFODNN7EXAMPLE');
    assert.ok(result.startsWith('AKI'));
    assert.ok(!result.includes('MPLE')); // suffix NOT revealed
    assert.ok(result.includes('****'));
  });

  it('should handle a long GitHub token', () => {
    const token = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ01234567890123';
    const result = redact(token);
    assert.ok(result.startsWith('ghp'));
    assert.ok(!result.endsWith('23')); // suffix NOT revealed
    assert.ok(result.includes('****'));
  });

  it('should handle exactly 7 characters', () => {
    const value = '1234567';
    const result = redact(value);
    assert.ok(result.startsWith('123'));
    assert.ok(!result.includes('67')); // suffix NOT revealed
    // Length is 3 (prefix) + 8 (min masked) = 11
    assert.equal(result.length, 11);
  });

  it('should never reveal more than 3 prefix characters', () => {
    const tests = ['abcdefghij', 'xYz1234567890', 'sk_live_abc123'];
    for (const test of tests) {
      const result = redact(test);
      const rest = result.substring(3);
      assert.ok(/^[*]+$/.test(rest), `All chars after prefix should be '*' for: ${test}`);
    }
  });
});