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
  it('should keep real AWS keys (EXAMPLE as substring is NOT a placeholder)', () => {
    const findings = [makeFinding('AKIAIOSFODNN7EXAMPLE')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 1); // Real key pattern, not a placeholder
  });

  it('should remove exact placeholder "example"', () => {
    const findings = [makeFinding('example')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove exact placeholder "changeme"', () => {
    const findings = [makeFinding('changeme')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should keep values containing changeme as substring', () => {
    const findings = [makeFinding('my-secret-CHANGEME-value')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 1); // Substring, not exact match
  });

  it('should remove exact placeholder "your-api-key"', () => {
    const findings = [makeFinding('your-api-key')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove exact placeholder "dummy"', () => {
    const findings = [makeFinding('dummy')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should keep values containing dummy as substring', () => {
    const findings = [makeFinding('dummy-secret-key')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 1);
  });

  it('should remove template patterns <...>', () => {
    const findings = [makeFinding('<your-secret-here>')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 0);
  });

  it('should remove template patterns {{...}}', () => {
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

  it('should remove all-caps doc placeholders like EXAMPLE, CHANGEME', () => {
    for (const ph of ['EXAMPLE', 'CHANGEME', 'DUMMY', 'XXXXXX', 'YOUR_TOKEN']) {
      const findings = [makeFinding(ph)];
      const filtered = filterFalsePositives(findings);
      assert.equal(filtered.length, 0, `Should filter: ${ph}`);
    }
  });

  it('should keep all-caps values that are real keys', () => {
    // Real AWS keys are uppercase but contain digits and mixed chars
    const findings = [makeFinding('AKIAIOSFODNN7REAL1')];
    const filtered = filterFalsePositives(findings);
    assert.equal(filtered.length, 1); // Has digits, not in docPlaceholders list
  });
});