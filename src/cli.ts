#!/usr/bin/env node

import * as path from 'path';
import { scanDirectory } from './scanner.js';
import { isBinaryByExtension } from './filters/binary.js';
import { runAllDetectors } from './detectors/orchestrator.js';
import { filterFalsePositives } from './filters/false-positives.js';
import { generateReport, serializeReport } from './reporters/json.js';

interface CLIOptions {
  directory: string;
  verbose: boolean;
}

function parseArgs(args: string[]): CLIOptions {
  const options: CLIOptions = {
    directory: '.',
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--verbose' || args[i] === '-v') {
      options.verbose = true;
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

  // Scan the directory
  const { files, error } = scanDirectory(targetDir);
  if (error) {
    process.stderr.write(`Error: ${error}\n`);
    process.exit(2);
  }

  if (options.verbose) {
    process.stderr.write(`Scanned ${files.length} files in ${targetDir}\n`);
  }

  // Run detectors on each file
  const allRawFindings: import('./types.js').RawFinding[] = [];
  for (const file of files) {
    if (options.verbose) {
      process.stderr.write(`  Scanning: ${file.relativePath}\n`);
    }

    const findings = runAllDetectors(file.content, file.relativePath);
    allRawFindings.push(...findings);
  }

  // Filter false positives
  const filteredFindings = filterFalsePositives(allRawFindings);

  if (options.verbose) {
    process.stderr.write(`Found ${filteredFindings.length} potential secrets\n`);
  }

  // Sort findings: by file (lexicographic), then by line (ascending)
  filteredFindings.sort((a, b) => {
    if (a.file < b.file) return -1;
    if (a.file > b.file) return 1;
    return a.line - b.line;
  });

  // Generate report
  const report = generateReport(filteredFindings, files.length);
  const output = serializeReport(report);

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