export function clamp(n: number, min: number, max: number) {
  if (Number.isNaN(n)) return undefined;
  return Math.max(min, Math.min(max, n));
}