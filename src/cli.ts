#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { scanDirectoryLazy } from './scanner.js';
import { runAllDetectors } from './detectors/orchestrator.js';
import { filterFalsePositives } from './filters/false-positives.js';
import { RawFinding } from './types.js';
import { generateReport, serializeReport } from './reporters/json.js';

interface CLIOptions {
  directory: string;
  verbose: boolean;
  summary: boolean;
  maxFileSize: number;
  maxFindings: number;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    directory: '.',
    verbose: false,
    summary: false,
    maxFileSize: 1 * 1024 * 1024, // 1MB default
    maxFindings: 10000, // default limit
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
    } else if (args[i] === '--summary') {
      options.summary = true;
    } else if (args[i] === '--max-file-size' && i + 1 < args.length) {
      options.maxFileSize = parseInt(args[i + 1], 10) || 1 * 1024 * 1024;
      i++;
    } else if (args[i] === '--max-findings' && i + 1 < args.length) {
      options.maxFindings = parseInt(args[i + 1], 10) || 10000;
      i++;
    } else if (!args[i].startsWith('-')) {
      options.directory = args[i];
    }
  }

  return options;
}

function main(): void {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  const startTime = Date.now();

  // Resolve the directory path
  const targetDir = path.resolve(options.directory);

  // Verify directory exists
  try {
    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      process.stderr.write(`Error: Not a directory: ${targetDir}\n`);
      process.exit(2);
    }
  } catch {
    process.stderr.write(`Error: Directory not found: ${targetDir}\n`);
    process.exit(2);
  }

  if (options.verbose) {
    process.stderr.write(`Scanning: ${targetDir} (max file size: ${options.maxFileSize} bytes)\n`);
  }

  // Process files one at a time (streaming) — only findings accumulate in memory
  const allRawFindings: RawFinding[] = [];
  let scannedCount = 0;

  for (const file of scanDirectoryLazy(targetDir, options.maxFileSize)) {
    scannedCount++;

    if (options.verbose) {
      if (scannedCount % 100 === 0) {
        process.stderr.write(`  Scanned ${scannedCount} files...\n`);
      }
    }

    const findings = runAllDetectors(file.content, file.relativePath);
    allRawFindings.push(...findings);
  }

  // Filter false positives
  const filteredFindings = filterFalsePositives(allRawFindings);

  // Sort findings: by file (lexicographic), then by line (ascending)
  filteredFindings.sort((a, b) => {
    if (a.file < b.file) return -1;
    if (a.file > b.file) return 1;
    return a.line - b.line;
  });

  // Truncate to max findings (with warning)
  if (filteredFindings.length > options.maxFindings) {
    if (options.verbose) {
      process.stderr.write(`Truncating findings: ${filteredFindings.length} -> ${options.maxFindings} (use --max-findings to increase)\n`);
    }
    filteredFindings.length = options.maxFindings;
  }

  if (options.verbose) {
    process.stderr.write(`Scanned ${scannedCount} files in ${(Date.now() - startTime)}ms\n`);
    process.stderr.write(`Found ${filteredFindings.length} potential secrets\n`);
  }

  // Generate report (or summary)
  let output: string;
  if (options.summary) {
    // Summary mode: just list files with findings
    const fileCounts = new Map<string, number>();
    for (const f of filteredFindings) {
      fileCounts.set(f.file, (fileCounts.get(f.file) || 0) + 1);
    }
    const summary = {
      version: '1',
      scannedFiles: scannedCount,
      affectedFiles: Array.from(fileCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([file, count]) => ({ file, findings: count })),
    };
    output = JSON.stringify(summary, null, 2);
  } else {
    const report = generateReport(filteredFindings, scannedCount);
    output = serializeReport(report);
  }

  // Output to stdout
  process.stdout.write(output + '\n');

  // Exit with appropriate code
  if (filteredFindings.length > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

main();