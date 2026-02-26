// audit.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./audit.controller");

router.get("/logs", controller.getLogs);
router.get("/compliance-report", controller.getComplianceReport);

module.exports = router;