import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { scanDirectory } from '../../src/scanner.js';
import { runAllDetectors } from '../../src/detectors/orchestrator.js';
import { filterFalsePositives } from '../../src/filters/false-positives.js';
import { generateReport } from '../../src/reporters/json.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Integration: sample-project fixtures', () => {
  // fixtures live in source tree, not dist-test
  const fixturesDir = path.resolve(__dirname, '..', '..', '..', 'tests', 'fixtures', 'sample-project');

  it('should detect secrets in config.env', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'config.env'), 'utf-8');
    const findings = runAllDetectors(content, 'config.env');
    const filtered = filterFalsePositives(findings);
    const report = generateReport(filtered, 1);

    assert.ok(report.findings.length > 0, 'Should find secrets in config.env');

    const categories = report.findings.map(f => f.category);
    assert.ok(categories.includes('env-assignment') || categories.includes('aws-access-key'),
      'Should detect env-assignment or aws-access-key');
  });

  it('should detect private key in server.key', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'server.key'), 'utf-8');
    const findings = runAllDetectors(content, 'server.key');
    const filtered = filterFalsePositives(findings);
    const report = generateReport(filtered, 1);

    assert.ok(report.findings.length > 0, 'Should find private key');
    const categories = report.findings.map(f => f.category);
    assert.ok(categories.includes('private-key'), 'Should detect private-key category');
  });

  it('should detect secrets in config.js', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'config.js'), 'utf-8');
    const findings = runAllDetectors(content, 'config.js');
    const filtered = filterFalsePositives(findings);
    const report = generateReport(filtered, 1);

    assert.ok(report.findings.length > 0, 'Should find secrets in config.js');
  });

  it('should detect secrets in config.yaml', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'config.yaml'), 'utf-8');
    const findings = runAllDetectors(content, 'config.yaml');
    const filtered = filterFalsePositives(findings);
    const report = generateReport(filtered, 1);

    assert.ok(report.findings.length > 0, 'Should find secrets in config.yaml');
  });

  it('should not find secrets in clean app.js', () => {
    const content = fs.readFileSync(path.join(fixturesDir, 'app.js'), 'utf-8');
    const findings = runAllDetectors(content, 'app.js');
    const filtered = filterFalsePositives(findings);
    const report = generateReport(filtered, 1);

    assert.equal(report.findings.length, 0, 'Should not find secrets in clean app.js');
  });

  it('should scan entire fixture directory', () => {
    const { files } = scanDirectory(fixturesDir);
    assert.ok(files.length >= 4, 'Should find at least 4 files');

    const allFindings: import('../../src/types.js').RawFinding[] = [];
    for (const file of files) {
      const findings = runAllDetectors(file.content, file.relativePath);
      allFindings.push(...findings);
    }

    const filtered = filterFalsePositives(allFindings);
    assert.ok(filtered.length > 0, 'Should find secrets across all files');
  });

  it('should produce deterministic sorted output', () => {
    const { files } = scanDirectory(fixturesDir);
    const allFindings: import('../../src/types.js').RawFinding[] = [];
    for (const file of files) {
      const findings = runAllDetectors(file.content, file.relativePath);
      allFindings.push(...findings);
    }

    const filtered = filterFalsePositives(allFindings);
    filtered.sort((a, b) => {
      if (a.file < b.file) return -1;
      if (a.file > b.file) return 1;
      return a.line - b.line;
    });

    // Verify sorting
    for (let i = 1; i < filtered.length; i++) {
      const prev = filtered[i - 1];
      const curr = filtered[i];
      if (prev.file === curr.file) {
        assert.ok(prev.line <= curr.line, `Lines should be sorted in ${prev.file}`);
      } else {
        assert.ok(prev.file < curr.file, `Files should be sorted lexicographically`);
      }
    }
  });
});