const BINARY_EXTENSIONS = new Set([
  '.exe', '.dll', '.so', '.dylib',
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
  '.pdf', '.zip', '.tar', '.gz', '.bz2', '.7z', '.rar',
  '.woff', '.woff2', '.ttf', '.eot',
  '.mp3', '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.ogg', '.wav', '.flac', '.aac',
  '.class', '.jar', '.war', '.ear',
  '.pyc', '.pyo',
  '.min.js', '.min.css',
]);

/**
 * Check if a file is binary based on extension.
 */
export function isBinaryByExtension(filePath: string): boolean {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  return BINARY_EXTENSIONS.has(ext);
}

/**
 * Check if file content is binary based on first 8KB.
 * Returns true if >30% of bytes are non-text (excluding \n, \r, \t).
 */
export function isBinaryByContent(content: Buffer): boolean {
  const chunk = content.subarray(0, 8192);
  if (chunk.length === 0) return false;

  let nonTextCount = 0;
  for (let i = 0; i < chunk.length; i++) {
    const byte = chunk[i];
    // Allow: printable ASCII (0x20-0x7E), tab (0x09), newline (0x0A), carriage return (0x0D)
    // Also allow high bytes that are part of valid UTF-8 sequences (0x80-0xFF)
    if (
      (byte >= 0x20 && byte <= 0x7E) ||
      byte === 0x09 || byte === 0x0A || byte === 0x0D
    ) {
      continue;
    }
    // Allow UTF-8 continuation bytes (10xxxxxx) and lead bytes (11xxxxxx)
    if (byte >= 0x80) {
      continue;
    }
    // Control characters below 0x20 (except tab, LF, CR) are non-text
    nonTextCount++;
  }

  return (nonTextCount / chunk.length) > 0.3;
}

/**
 * Determine if a file should be scanned (is text, not binary).
 */
export function isTextFile(filePath: string, content: Buffer): boolean {
  if (isBinaryByExtension(filePath)) return false;
  if (isBinaryByContent(content)) return false;
  return true;
}