// audit.controller.js
const auditService = require("./audit.service");
const { generateComplianceReport } = require("./utils/complianceReport");

exports.getLogs = async (req, res) => {
  try {
    const logs = await auditService.searchLogs(req.query);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getComplianceReport = async (req, res) => {
  const report = await generateComplianceReport(req.query);
  res.json(report);
};