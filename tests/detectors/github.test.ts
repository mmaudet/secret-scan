import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectGitHub } from '../../src/detectors/github.js';

describe('detectGitHub', () => {
  it('should detect personal access token', () => {
    const lines = ['GITHUB_TOKEN=ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ01234567890123'];
    const findings = detectGitHub(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'github-token');
    assert.ok(findings[0].rawValue.startsWith('ghp_'));
  });

  it('should detect fine-grained token', () => {
    // Placeholder format only — not a real token
    const lines = ['GITHUB_FG_TOKEN=github_pat_dummy1234567890abcdefghij'];
    const findings = detectGitHub(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'github-token');
    assert.ok(findings[0].rawValue.startsWith('github_pat_'));
  });

  it('should not match short tokens', () => {
    const lines = ['TOKEN=ghp_short'];
    const findings = detectGitHub(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });
});