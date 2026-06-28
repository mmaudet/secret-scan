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

  it('should always produce same length regardless of input', () => {
    // Fixed-length mask — never reveals the secret's length
    const short = redact('1234567');
    const long = redact('123456789012345678901234567890');
    assert.equal(short.length, long.length, 'Redaction should have constant length');
    assert.equal(short.length, 15); // 3 prefix + 12 masked
    assert.equal(long.length, 15);
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