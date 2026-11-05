
const express = require("express");

const {
  getAdminCoupons,
  getPublicCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
} = require("../controllers/couponController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public checkout endpoints
router.get("/public", getPublicCoupons);
router.post("/validate", validateCoupon);

// Admin-only endpoints: require authentication and Coupons & Offers permission
router.get(
  "/admin",
  protectAdmin,
  requirePermission("Coupons & Offers"),
  getAdminCoupons
);

router.post(
  "/admin",
  protectAdmin,
  requirePermission("Coupons & Offers"),
  createCoupon
);

router.put(
  "/admin/:id",
  protectAdmin,
  requirePermission("Coupons & Offers"),
  updateCoupon
);

router.patch(
  "/admin/:id/status",
  protectAdmin,
  requirePermission("Coupons & Offers"),
  updateCouponStatus
);

router.delete(
  "/admin/:id",
  protectAdmin,
  requirePermission("Coupons & Offers"),
  deleteCoupon
);

module.exports = router;
