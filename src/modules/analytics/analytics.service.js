// analytics.service.js
const Payment = require("../../models/Payment");
const { calculateMetrics } = require("./utils/metricsCalculator");
const { predictNextRevenue } = require("./utils/predictiveEngine");

exports.getDashboardData = async (startDate, endDate) => {
  const query = {};

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const payments = await Payment.find(query).sort({ createdAt: 1 });

  const metrics = calculateMetrics(payments);
  const prediction = predictNextRevenue(payments);

  return {
    metrics,
    prediction,
    chartData: payments.map((p) => ({
      date: p.createdAt,
      amount: p.amount,
    })),
  };
};