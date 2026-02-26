// utils/retentionPolicy.js
const AuditLog = require("../../models/AuditLog");

exports.applyRetentionPolicy = async () => {
  await AuditLog.collection.createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 60 * 60 * 24 * 365 * 7 }
  );
};