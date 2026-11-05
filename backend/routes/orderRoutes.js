
const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getCustomerOrderById,
  getCustomerOrders,
} = require("../controllers/orderController");

const {
  verifyRazorpayPayment,
} = require("../controllers/paymentController");

const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// =====================================================
// CUSTOMER ROUTES
// =====================================================

// Create an order for an authenticated customer.
router.post(
  "/customer",
  protectCustomer,
  createOrder
);

// Verify Razorpay Card / UPI Checkout payment.
// Keep this before generic order-ID routes.
router.post(
  "/verify-payment",
  protectCustomer,
  verifyRazorpayPayment
);

// Get all orders belonging to the authenticated customer.
router.get(
  "/customer",
  protectCustomer,
  getCustomerOrders
);

// Get a specific order belonging to the authenticated customer.
router.get(
  "/customer/:id",
  protectCustomer,
  getCustomerOrderById
);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard-stats",
  protectAdmin,
  requirePermission("Orders"),
  getDashboardStats
);

// =====================================================
// GUEST CHECKOUT
// Keep public only if guest checkout is intentionally supported.
// =====================================================

router.post("/", createOrder);

// =====================================================
// ADMIN ORDER ROUTES
// =====================================================

// Get all orders.
router.get(
  "/",
  protectAdmin,
  requirePermission("Orders"),
  getOrders
);

// Update order status.
router.patch(
  "/:id/status",
  protectAdmin,
  requirePermission("Orders"),
  updateOrderStatus
);

// Cancel an order.
router.patch(
  "/:id/cancel",
  protectAdmin,
  requirePermission("Orders"),
  cancelOrder
);

// Get a specific order by ID.
router.get(
  "/:id",
  protectAdmin,
  requirePermission("Orders"),
  getOrderById
);

module.exports = router;
