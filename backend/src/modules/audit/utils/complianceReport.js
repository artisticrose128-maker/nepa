// utils/complianceReport.js
const AuditLog = require("../../../models/AuditLog");

exports.generateComplianceReport = async ({ startDate, endDate }) => {
  const logs = await AuditLog.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  });

  return {
    totalEvents: logs.length,
    failedActions: logs.filter(l => l.level === "ERROR").length,
    uniqueUsers: [...new Set(logs.map(l => l.userId))].length,
    period: { startDate, endDate },
  };
};