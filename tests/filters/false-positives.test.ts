import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { filterFalsePositives } from '../../src/filters/false-positives.js';
import { RawFinding } from '../../src/types.js';

function makeFinding(value: string, category = 'test'): RawFinding {
  return {
    file: 'test.env',
    line: 1,
    category,
    severity: 'high',
    rawValue: value,
  };
}

describe('filterFalsePositives', () => {
  it('should remove placeholder values with EXAMPLE', () => {
    const findings = [makeFinding('AKIAIOSFODNN7EXAMPLE')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with CHANGEME', () => {
    const findings = [makeFinding('my-secret-CHANGEME-value')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with your-', () => {
    const findings = [makeFinding('your-api-key-here')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with dummy', () => {
    const findings = [makeFinding('dummy-secret-key')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with fake', () => {
    const findings = [makeFinding('fake-token-value')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with xxxx', () => {
    const findings = [makeFinding('token-xxxx-xxxx-xxxx')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values with lorem', () => {
    const findings = [makeFinding('lorem-ipsum-dolor')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values in <...>', () => {
    const findings = [makeFinding('<your-secret-here>')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove placeholder values in {{...}}', () => {
    const findings = [makeFinding('{{SECRET_VALUE}}')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove UUID values', () => {
    const findings = [makeFinding('550e8400-e29b-41d4-a716-446655440000')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should keep real secret values', () => {
    const findings = [
      makeFinding('AKIAIOSFODNN7REAL1'),
      makeFinding('wJalrXUtnFEMI/K7MDENG/bPxRfiCY'),
    ];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 2);
  });

  it('should keep values that are not placeholders', () => {
    const findings = [makeFinding('my-actual-secret-key-12345')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 1);
  });
});