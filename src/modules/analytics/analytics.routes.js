// analytics.routes.js
const express = require("express");
const router = express.Router();
const controller = require("./analytics.controller");

router.get("/dashboard", controller.getDashboard);
router.get("/export", controller.exportReport);

module.exports = router;