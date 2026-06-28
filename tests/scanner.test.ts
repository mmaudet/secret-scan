import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { scanDirectory } from '../src/scanner.js';

describe('scanDirectory', () => {
  let tmpDir: string;

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-scan-test-'));
    // Create test files
    fs.writeFileSync(path.join(tmpDir, 'app.js'), 'console.log("hello");\n');
    fs.writeFileSync(path.join(tmpDir, 'config.env'), 'DB_HOST=localhost\nDB_PASS=secret123\n');
    fs.mkdirSync(path.join(tmpDir, 'subdir'));
    fs.writeFileSync(path.join(tmpDir, 'subdir', 'nested.txt'), 'nested content\n');
    fs.writeFileSync(path.join(tmpDir, 'image.png'), Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A]));
    fs.mkdirSync(path.join(tmpDir, '.git'));
    fs.writeFileSync(path.join(tmpDir, '.git', 'config'), '[core]\n');
    fs.mkdirSync(path.join(tmpDir, 'node_modules'));
    fs.writeFileSync(path.join(tmpDir, 'node_modules', 'pkg.js'), 'module.exports = {};\n');
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should find all text files', () => {
    const result = scanDirectory(tmpDir);
    assert.equal(result.error, undefined);
    assert.ok(result.files.length >= 3);
  });

  it('should exclude binary files', () => {
    const result = scanDirectory(tmpDir);
    const paths = result.files.map(f => f.relativePath);
    assert.ok(!paths.some(p => p.endsWith('.png')));
  });

  it('should exclude .git and node_modules', () => {
    const result = scanDirectory(tmpDir);
    const paths = result.files.map(f => f.relativePath);
    assert.ok(!paths.some(p => p.startsWith('.git/') || p.startsWith('node_modules/')));
  });

  it('should include nested files', () => {
    const result = scanDirectory(tmpDir);
    const paths = result.files.map(f => f.relativePath);
    assert.ok(paths.some(p => p === 'subdir/nested.txt'));
  });

  it('should return relative paths', () => {
    const result = scanDirectory(tmpDir);
    for (const file of result.files) {
      assert.ok(!path.isAbsolute(file.relativePath), `Expected relative path, got: ${file.relativePath}`);
    }
  });

  it('should return error for invalid path', () => {
    const result = scanDirectory('/nonexistent/path');
    assert.ok(result.error !== undefined);
  });
});