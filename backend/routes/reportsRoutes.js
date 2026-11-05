const express = require("express");

const { getAdminReports } = require("../controllers/reportsController");

const {
    protectAdmin,
    requirePermission
} = require("../middleware/authMiddleware");

const router = express.Router();

// Reports contain sensitive business and sales information.
router.get(
    "/",
    protectAdmin,
    requirePermission("Orders"),
    getAdminReports
);

module.exports = router;