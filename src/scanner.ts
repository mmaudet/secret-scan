import * as fs from 'fs';
import * as path from 'path';
import { isTextFile } from './filters/binary.js';

export interface ScanFile {
  path: string;
  relativePath: string;
  content: string;
}

const IGNORED_DIRS = new Set(['.git', 'node_modules', '.svn', '.hg', 'dist', 'build']);

/**
 * Recursively scan a directory for text files.
 * Ignores .git/, node_modules/, and binary files.
 */
export function scanDirectory(rootPath: string): { files: ScanFile[]; error?: string } {
  const files: ScanFile[] = [];
  let error: string | undefined;

  function walk(currentPath: string, relativePath: string) {
    let entries;
    try {
      entries = fs.readdirSync(currentPath, { withFileTypes: true });
    } catch (e) {
      error = `Permission denied: ${currentPath}`;
      return;
    }

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      if (IGNORED_DIRS.has(entry.name)) continue;

      const fullPath = path.join(currentPath, entry.name);
      const relPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        walk(fullPath, relPath);
        continue;
      }

      if (!entry.isFile()) continue;

      try {
        const content = fs.readFileSync(fullPath);
        if (!isTextFile(fullPath, content)) continue;
        files.push({
          path: fullPath,
          relativePath: relPath,
          content: content.toString('utf-8'),
        });
      } catch (e) {
        error = `Could not read: ${fullPath}`;
      }
    }
  }

  walk(rootPath, '');
  return { files, error };
}