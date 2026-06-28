/**
 * Redact a secret value conservatively.
 * Shows only a short prefix (first 3 chars) and masks the rest.
 * Does NOT reveal length or suffix — prevents partial reconstruction.
 */
export function redact(value: string): string {
  if (value.length <= 6) {
    return '*'.repeat(Math.max(value.length, 4));
  }
  // Show only first 3 chars (usually the type prefix: AKIA, ghp_, sk_, etc.)
  // Never reveal the suffix — it may be the actual secret part
  const prefix = value.substring(0, 3);
  const masked = '*'.repeat(Math.max(value.length - 3, 8));
  return `${prefix}${masked}`;
}