// audit.service.js
const AuditLog = require("../../models/AuditLog");

exports.searchLogs = async (filters) => {
  const query = {};

  if (filters.userId) query.userId = filters.userId;
  if (filters.level) query.level = filters.level;

  if (filters.startDate && filters.endDate) {
    query.createdAt = {
      $gte: new Date(filters.startDate),
      $lte: new Date(filters.endDate),
    };
  }

  return AuditLog.find(query).sort({ createdAt: -1 }).limit(500);
};