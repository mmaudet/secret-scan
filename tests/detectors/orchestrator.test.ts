import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runAllDetectors } from '../../src/detectors/orchestrator.js';

describe('runAllDetectors', () => {
  it('should run all detectors and return findings', () => {
    const content = [
      'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE',
      'GOOGLE_API_KEY=AIzaSyDaGmXaWyQzvj9ZF_JX2FMvaBQU3hg6HA0',
      'GITHUB_TOKEN=ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ01234567890123',
    ].join('\n');

    const findings = runAllDetectors(content, 'test.env');
    assert.ok(findings.length >= 3);
  });

  it('should deduplicate findings', () => {
    const content = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
    const findings = runAllDetectors(content, 'test.env');

    // Count AWS access key findings
    const awsFindings = findings.filter(f => f.category === 'aws-access-key');
    assert.equal(awsFindings.length, 1);
  });

  it('should return empty array for clean files', () => {
    const content = 'console.log("Hello, world!");\nconst x = 1 + 1;';
    const findings = runAllDetectors(content, 'app.js');
    assert.equal(findings.length, 0);
  });

  it('should set correct file name on all findings', () => {
    const content = 'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE';
    const findings = runAllDetectors(content, 'myenv.env');
    for (const f of findings) {
      assert.equal(f.file, 'myenv.env');
    }
  });
});