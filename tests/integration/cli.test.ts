import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawnSync } from 'child_process';

describe('CLI end-to-end', () => {
  let tmpDir: string;
  const cliPath = path.resolve(process.cwd(), 'dist-test', 'src', 'cli.js');

  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-scan-cli-'));
    // Create a test file with secrets (avoid EXAMPLE/CHANGEME to not trigger false positive filter)
    fs.writeFileSync(path.join(tmpDir, 'config.env'), [
      'DB_PASSWORD=wJalrXUtnFEMI/K7MDENG/bPxRfiCYREALSECRET',
      'AWS_ACCESS_KEY_ID=AKIAIOSFODNN7REALK',
      'NORMAL_VAR=hello',
    ].join('\n'));

    // Create a clean file
    fs.writeFileSync(path.join(tmpDir, 'clean.js'), 'console.log("Hello, world!");\n');
  });

  after(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should output JSON report with findings', () => {
    const result = spawnSync(process.execPath, [cliPath, tmpDir], {
      encoding: 'utf-8',
      env: process.env,
      cwd: process.cwd(),
    });

    assert.equal(result.status, 1); // Exit code 1 = findings found

    // Parse the output
    const report = JSON.parse(result.stdout);
    assert.equal(report.version, '1');
    assert.ok(report.scannedFiles >= 1);
    assert.ok(report.findings.length >= 1);

    // Check that findings are sorted by file then line
    for (let i = 1; i < report.findings.length; i++) {
      const prev = report.findings[i - 1];
      const curr = report.findings[i];
      if (prev.file === curr.file) {
        assert.ok(prev.line <= curr.line);
      }
    }
  });

  it('should exit with 0 for clean directory', () => {
    const cleanDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-scan-clean-'));
    try {
      fs.writeFileSync(path.join(cleanDir, 'app.js'), 'console.log("hello");\n');

      const result = spawnSync(process.execPath, [cliPath, cleanDir], {
        encoding: 'utf-8',
        env: process.env,
        cwd: process.cwd(),
      });

      assert.equal(result.status, 0); // Exit code 0 = clean

      const report = JSON.parse(result.stdout);
      assert.equal(report.findings.length, 0);
    } finally {
      fs.rmSync(cleanDir, { recursive: true, force: true });
    }
  });

  it('should exit with 2 for invalid directory', () => {
    const result = spawnSync(process.execPath, [cliPath, '/nonexistent/path'], {
      encoding: 'utf-8',
      env: process.env,
      cwd: process.cwd(),
    });

    assert.equal(result.status, 2); // Exit code 2 = error
  });
});