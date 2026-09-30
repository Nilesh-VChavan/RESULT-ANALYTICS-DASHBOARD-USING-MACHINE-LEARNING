export function calculatePercentage(total, max = 100) {
  return max ? Number(((total / max) * 100).toFixed(2)) : 0;
}