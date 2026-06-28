/**
 * Redact a secret value conservatively.
 * Shows only a short prefix (first 3 chars) and masks the rest.
 * Does NOT reveal length or suffix — prevents partial reconstruction.
 */
export function redact(value: string): string {
  if (value.length <= 6) {
    return '*'.repeat(Math.max(value.length, 4));
  }
  // Show only first 3 chars (type prefix: AKIA, ghp_, sk_, etc.)
  // Fixed-length mask (12 stars) — never reveal the secret's length
  const prefix = value.substring(0, 3);
  return `${prefix}${'*'.repeat(12)}`;
}