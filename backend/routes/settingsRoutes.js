const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public settings
router.get("/public", getSettings);

// Admin settings
router.get(
  "/admin",
  protectAdmin,
  requirePermission("Settings"),
  getSettings
);

// Update settings
router.put(
  "/",
  protectAdmin,
  requirePermission("Settings"),
  updateSettings
);

module.exports = router;