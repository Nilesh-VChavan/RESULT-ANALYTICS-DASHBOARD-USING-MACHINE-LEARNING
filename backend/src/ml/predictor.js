export function predictRisk({ percentage = 0, attendance = 0 }) {
  const risk = percentage < 40 || attendance < 75;
  return { atRisk: risk, score: risk ? 1 : 0 };
}