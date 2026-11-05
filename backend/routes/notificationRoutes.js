
const express = require("express");
const router = express.Router();

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const {
  // Customer notification controllers
  getCustomerNotifications,
  markCustomerNotificationRead,
  markAllCustomerNotificationsRead,
  deleteCustomerNotification,

  // Admin notification controllers
  getAdminNotifications,
  updateAdminNotificationRead,
  markAllAdminNotificationsRead,
  deleteAdminNotification,
  createAdminNotification,
  getAdminUnreadCount,

  // Customer broadcast controller
  broadcastCustomerNotification,
} = require("../controllers/notificationsController");

// =====================================================
// CUSTOMER NOTIFICATION ROUTES
// =====================================================

router.get(
  "/customer",
  protectCustomer,
  getCustomerNotifications
);

router.patch(
  "/customer/read-all",
  protectCustomer,
  markAllCustomerNotificationsRead
);

router.patch(
  "/customer/:id/read",
  protectCustomer,
  markCustomerNotificationRead
);

router.delete(
  "/customer/:id",
  protectCustomer,
  deleteCustomerNotification
);

// =====================================================
// ADMIN NOTIFICATION ROUTES
// =====================================================

// Keep unread-count before parameterized routes.
router.get(
  "/admin/unread-count",
  protectAdmin,
  getAdminUnreadCount
);

router.get(
  "/admin",
  protectAdmin,
  requirePermission("Notifications"),
  getAdminNotifications
);

// Send notification to all active customers.
router.post(
  "/admin/broadcast",
  protectAdmin,
  requirePermission("Notifications"),
  broadcastCustomerNotification
);

// Create an internal admin notification.
router.post(
  "/admin",
  protectAdmin,
  requirePermission("Notifications"),
  createAdminNotification
);

router.patch(
  "/admin/read-all",
  protectAdmin,
  requirePermission("Notifications"),
  markAllAdminNotificationsRead
);

router.patch(
  "/admin/:id/read",
  protectAdmin,
  requirePermission("Notifications"),
  updateAdminNotificationRead
);

router.delete(
  "/admin/:id",
  protectAdmin,
  requirePermission("Notifications"),
  deleteAdminNotification
);

module.exports = router;
