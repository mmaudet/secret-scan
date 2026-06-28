import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateShannonEntropy } from '../../src/utils/entropy.js';

describe('calculateShannonEntropy', () => {
  it('should return 0 for empty string', () => {
    assert.equal(calculateShannonEntropy(''), 0);
  });

  it('should return 0 for single character repeated', () => {
    assert.equal(calculateShannonEntropy('aaaa'), 0);
  });

  it('should return high entropy for random-looking strings', () => {
    // Mixed case, digits, and symbols for high entropy
    const random = 'Kx9mP2vL8nQ4wR7yT3bF6hJ0dS5gA1cE';
    const entropy = calculateShannonEntropy(random);
    assert.ok(entropy >= 4.0, `Expected entropy >= 4.0, got ${entropy}`);
  });

  it('should return low entropy for repetitive strings', () => {
    const repetitive = 'aaaa1111bbbb2222cccc';
    const entropy = calculateShannonEntropy(repetitive);
    assert.ok(entropy < 4.0, `Expected entropy < 4.0, got ${entropy}`);
  });

  it('should return moderate entropy for structured strings', () => {
    const structured = 'AKIAIOSFODNN7EXAMPLE';
    const entropy = calculateShannonEntropy(structured);
    assert.ok(entropy < 4.5, `Expected entropy < 4.5, got ${entropy}`);
  });

  it('should handle a real AWS secret key', () => {
    const awsSecret = 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY';
    const entropy = calculateShannonEntropy(awsSecret);
    assert.ok(entropy >= 3.5, `Expected entropy >= 3.5, got ${entropy}`);
  });
});