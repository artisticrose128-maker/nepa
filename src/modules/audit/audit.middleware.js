// audit.middleware.js
const AuditLog = require("../../models/AuditLog");

exports.auditLogger = async (req, res, next) => {
  const start = Date.now();

  res.on("finish", async () => {
    try {
      await AuditLog.create({
        correlationId: req.correlationId,
        userId: req.user?.id || null,
        action: `${req.method} ${req.originalUrl}`,
        entity: req.baseUrl,
        method: req.method,
        route: req.originalUrl,
        ipAddress: req.ip,
        metadata: {
          statusCode: res.statusCode,
          responseTime: Date.now() - start,
        },
      });
    } catch (err) {
      console.error("Audit logging failed:", err.message);
    }
  });

  next();
};