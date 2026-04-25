// utils/metricsCalculator.js

exports.calculateMetrics = (payments) => {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalTransactions = payments.length;

  return {
    totalRevenue,
    totalTransactions,
    avgTransactionValue:
      totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
  };
};