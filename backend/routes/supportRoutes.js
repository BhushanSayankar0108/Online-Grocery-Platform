
const express = require("express");

const {
  createSupportQuery,
  getSupportQueries,
  updateSupportQueryStatus,
} = require("../controllers/supportController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ==========================================
// CUSTOMER: PUBLIC SUPPORT FORM
// ==========================================

// Submit a support query without admin authentication.
router.post("/", createSupportQuery);

// ==========================================
// ADMIN: SUPPORT QUERY MANAGEMENT
// ==========================================

// Get all customer support queries.
router.get(
  "/admin",
  protectAdmin,
  requirePermission("Support"),
  getSupportQueries
);

// Update support query status and admin note.
router.patch(
  "/admin/:id/status",
  protectAdmin,
  requirePermission("Support"),
  updateSupportQueryStatus
);

module.exports = router;
