
const express = require("express");

const {
  registerCustomer,
  loginCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  forgotPassword,
  resetPassword,
} = require("../controllers/customerController");

const {
  getMyOrders,
  getMyOrderById,
} = require("../controllers/customerOrderController");

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// ==========================================
// PUBLIC CUSTOMER AUTHENTICATION ROUTES
// ==========================================

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

// ==========================================
// CUSTOMER PASSWORD RECOVERY ROUTES
// ==========================================

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

// ==========================================
// PROTECTED CUSTOMER ROUTES
// ==========================================

router.get("/profile", protectCustomer, getCustomerProfile);

router.put("/profile", protectCustomer, updateCustomerProfile);

// ==========================================
// CUSTOMER ORDER ROUTES
// ==========================================

router.get("/orders", protectCustomer, getMyOrders);

router.get("/orders/:orderId", protectCustomer, getMyOrderById);

module.exports = router;
