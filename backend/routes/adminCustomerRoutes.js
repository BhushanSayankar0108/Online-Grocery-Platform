
const express = require("express");

const {
  getAdminCustomers,
  updateAdminCustomerStatus,
} = require("../controllers/adminCustomerController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Every route requires authentication and Customers permission
router.use(protectAdmin);
router.use(requirePermission("Customers"));

// Get customer list
router.get("/", getAdminCustomers);

// Update customer status
router.patch("/:id/status", updateAdminCustomerStatus);

module.exports = router;
