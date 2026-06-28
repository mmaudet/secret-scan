import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectAWS } from '../../src/detectors/aws.js';

describe('detectAWS', () => {
  it('should detect AWS access key', () => {
    const lines = ['AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE'];
    const findings = detectAWS(lines.join('\n'), lines, 'test.env');
    const awsFindings = findings.filter(f => f.category === 'aws-access-key');
    assert.equal(awsFindings.length, 1);
    assert.equal(awsFindings[0].rawValue, 'AKIAIOSFODNN7EXAMPLE');
  });

  it('should detect AWS secret key in env assignment', () => {
    const lines = [
      'aws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY'
    ];
    const findings = detectAWS(lines.join('\n'), lines, 'test.env');
    const secretFindings = findings.filter(f => f.category === 'aws-secret-key');
    assert.equal(secretFindings.length, 1);
    assert.equal(secretFindings[0].rawValue.length, 40);
  });

  it('should detect multiple AWS keys in same file', () => {
    const lines = [
      'KEY1=AKIAIOSFODNN7EXAMPLE1',
      'KEY2=AKIAI44QH8DHBEXAMPLE',
    ];
    const findings = detectAWS(lines.join('\n'), lines, 'test.env');
    const awsFindings = findings.filter(f => f.category === 'aws-access-key');
    assert.equal(awsFindings.length, 2);
  });

  it('should set correct line numbers', () => {
    const lines = [
      'line1',
      'line2',
      'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
    ];
    const findings = detectAWS(lines.join('\n'), lines, 'test.env');
    const awsFindings = findings.filter(f => f.category === 'aws-access-key');
    assert.equal(awsFindings[0].line, 3);
  });

  it('should handle no matches', () => {
    const lines = ['Hello world', 'No secrets here'];
    const findings = detectAWS(lines.join('\n'), lines, 'test.env');
    const awsFindings = findings.filter(f => f.category === 'aws-access-key');
    assert.equal(awsFindings.length, 0);
  });
});