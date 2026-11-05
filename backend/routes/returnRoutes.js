
const express = require("express");
const router = express.Router();

const {
  getEligibleReturnOrders,
  createReturnRequest,
  getCustomerReturnRequests,
  getAllReturnRequests,
  updateReturnRequestStatus,
} = require("../controllers/returnController");

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

// Customer routes
router.get(
  "/eligible-orders",
  protectCustomer,
  getEligibleReturnOrders
);

router.post(
  "/customer",
  protectCustomer,
  createReturnRequest
);

router.get(
  "/customer",
  protectCustomer,
  getCustomerReturnRequests
);

// Admin routes
router.get(
  "/admin",
  protectAdmin,
  requirePermission("Orders"),
  getAllReturnRequests
);

router.patch(
  "/admin/:id/status",
  protectAdmin,
  requirePermission("Orders"),
  updateReturnRequestStatus
);

module.exports = router;
