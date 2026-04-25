// analytics.controller.js
const analyticsService = require("./analytics.service");
const { exportExcel, exportPDF } = require("./utils/exportUtil");
const Payment = require("../../models/Payment");

exports.getDashboard = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const data = await analyticsService.getDashboardData(
      startDate,
      endDate
    );

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.exportReport = async (req, res) => {
  const { format } = req.query;
  const payments = await Payment.find();

  if (format === "excel") {
    return exportExcel(payments, res);
  }

  if (format === "pdf") {
    return exportPDF(payments, res);
  }

  res.status(400).json({ message: "Invalid format" });
};