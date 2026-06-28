import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { redact } from '../../src/utils/redaction.js';

describe('redact', () => {
  it('should mask entire value if length ≤ 10', () => {
    assert.equal(redact('short'), '*****');
    assert.equal(redact('abcdefghij'), '**********');
  });

  it('should keep first 4 and last 4 characters visible', () => {
    assert.equal(
      redact('AKIAIOSFODNN7EXAMPLE'),
      'AKIA************MPLE'
    );
  });

  it('should handle a long GitHub token', () => {
    const token = 'ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ01234567890123';
    const result = redact(token);
    assert.ok(result.startsWith('ghp_'));
    assert.ok(result.endsWith('23'));
    assert.ok(result.includes('****'));
  });

  it('should handle exactly 11 characters', () => {
    const value = '12345678901';
    const result = redact(value);
    assert.equal(result, '1234***8901');
  });
});