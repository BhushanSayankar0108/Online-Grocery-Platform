
const express = require("express");

const {
  loginAdmin,
  getAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
} = require("../controllers/adminController");

const {
  protectAdmin,
  requireSuperAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public login route
router.post("/login", loginAdmin);

// Only Super Admin can manage administrator accounts
router.get("/", protectAdmin, requireSuperAdmin, getAdmins);

router.post("/", protectAdmin, requireSuperAdmin, createAdmin);

router.put("/:id", protectAdmin, requireSuperAdmin, updateAdmin);

router.patch(
  "/:id/status",
  protectAdmin,
  requireSuperAdmin,
  updateAdminStatus
);

router.delete("/:id", protectAdmin, requireSuperAdmin, deleteAdmin);

module.exports = router;
