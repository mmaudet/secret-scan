import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectJWT } from '../../src/detectors/jwt.js';

describe('detectJWT', () => {
  it('should detect a real JWT', () => {
    // Create a valid JWT with high-entropy payload
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
    const payload = btoa(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: 1516239022, random: 'a8f5f167f44f4964e6c998dee827110c' })).replace(/=/g, '');
    const signature = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    const jwt = `${header}.${payload}.${signature}`;

    const lines = [`Authorization: Bearer ${jwt}`];
    const findings = detectJWT(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].category, 'jwt-token');
    assert.ok(findings[0].rawValue.startsWith('eyJ'));
  });

  it('should not match JWTs with low-entropy payloads', () => {
    const header = 'eyJhbGciOiJIUzI1NiJ9';
    const payload = 'eyJ0ZXN0IjoiYWFhIn0'; // {"test":"aaa"} - low entropy
    const signature = 'signature';
    const jwt = `${header}.${payload}.${signature}`;

    const lines = [jwt];
    const findings = detectJWT(lines.join('\n'), lines, 'test.env');
    assert.equal(findings.length, 0);
  });

  it('should set correct line number', () => {
    const header = btoa(JSON.stringify({ alg: 'HS256' })).replace(/=/g, '');
    const payload = btoa(JSON.stringify({ random: 'a8f5f167f44f4964e6c998dee827110c' })).replace(/=/g, '');
    const signature = 'sig';
    const jwt = `${header}.${payload}.${signature}`;

    const lines = ['line1', `Token: ${jwt}`];
    const findings = detectJWT(lines.join('\n'), lines, 'test.env');
    assert.equal(findings[0].line, 2);
  });
});