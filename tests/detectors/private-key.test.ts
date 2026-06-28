import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectPrivateKey } from '../../src/detectors/private-key.js';

describe('detectPrivateKey', () => {
  it('should detect RSA private key', () => {
    const lines = ['-----BEGIN RSA PRIVATE KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'private-key');
    assert.equal(findings[0].rawValue, '-----BEGIN RSA PRIVATE KEY');
  });

  it('should detect generic private key', () => {
    const lines = ['-----BEGIN PRIVATE KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings.length, 1);
    assert.ok(findings[0].rawValue.includes('PRIVATE KEY'));
  });

  it('should detect EC private key', () => {
    const lines = ['-----BEGIN EC PRIVATE KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'private-key');
  });

  it('should detect OPENSSH private key', () => {
    const lines = ['-----BEGIN OPENSSH PRIVATE KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'private-key');
  });

  it('should not match BEGIN PUBLIC KEY', () => {
    const lines = ['-----BEGIN PUBLIC KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings.length, 0);
  });

  it('should set correct line number', () => {
    const lines = ['line1', 'line2', '-----BEGIN RSA PRIVATE KEY-----'];
    const findings = detectPrivateKey(lines.join('\n'), lines, 'test.key');
    assert.equal(findings[0].line, 3);
  });
});