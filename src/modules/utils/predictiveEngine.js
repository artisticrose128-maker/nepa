// utils/predictiveEngine.js

exports.predictNextRevenue = (payments) => {
  if (payments.length < 2) return { nextPrediction: 0 };

  const values = payments.map((p) => p.amount);
  const n = values.length;

  const x = [...Array(n).keys()];

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * values[i], 0);
  const sumXX = x.reduce((sum, val) => sum + val * val, 0);

  const slope =
    (n * sumXY - sumX * sumY) /
    (n * sumXX - sumX * sumX);

  const intercept = (sumY - slope * sumX) / n;

  return {
    nextPrediction: Math.round(slope * n + intercept),
  };
};