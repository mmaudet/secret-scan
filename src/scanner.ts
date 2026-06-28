import * as fs from 'fs';
import * as path from 'path';
import { isTextFile } from './filters/binary.js';

export interface ScanFile {
  path: string;
  relativePath: string;
  content: string;
}

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.svn', '.hg', 'dist', 'build']);

// Default max file size: 1MB
const DEFAULT_MAX_FILE_SIZE = 1 * 1024 * 1024;

/**
 * Recursively yield text files one at a time (lazy/streaming).
 * Ignores .git/, node_modules/, and binary files.
 * Memory-efficient: only one file in memory at a time.
 */
export function* scanDirectoryLazy(
  rootPath: string,
  maxFileSize: number = DEFAULT_MAX_FILE_SIZE,
): IterableIterator<ScanFile> {
  function* walk(currentPath: string, relativePath: string): IterableIterator<ScanFile> {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch {
      return; // skip unreadable dirs silently
    }

    for (const entry of entries) {
      // Skip ignored directories (.git, node_modules, etc.)
      // Note: dotfiles like .env ARE scanned — they're the #1 leak source
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(currentPath, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        yield* walk(fullPath, relPath);
        continue;
      }

      if (!entry.isFile()) continue;

      try {
        const stat = fs.statSync(fullPath);
        if (stat.size > maxFileSize) continue;
        const content = fs.readFileSync(fullPath);
        if (!isTextFile(fullPath, content)) continue;
        yield {
          path: fullPath,
          relativePath: relPath,
          content: content.toString('utf-8'),
        };
      } catch {
        // skip unreadable files
      }
    }
  }

  yield* walk(rootPath, '');
}

/**
 * Backward-compatible: scan all files into an array (not recommended for large dirs).
 */
export function scanDirectory(
  rootPath: string,
  maxFileSize: number = DEFAULT_MAX_FILE_SIZE,
): { files: ScanFile[]; error?: string } {
  const files: ScanFile[] = [];
  for (const file of scanDirectoryLazy(rootPath, maxFileSize)) {
    files.push(file);
  }
  return { files };
}