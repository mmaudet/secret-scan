/**
 * Redact a secret value: keep first 4 + last 4 characters visible.
 * If length ≤ 10, mask entirely.
 */
export function redact(value: string): string {
  if (value.length <= 10) {
    return '*'.repeat(value.length);
  }
  const prefix = value.substring(0, 4);
  const suffix = value.substring(value.length - 4);
  const middle = '*'.repeat(value.length - 8);
  return `${prefix}${middle}${suffix}`;
}