
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const ALLOWED_ADMIN_ROLES = [
  "admin",
  "super_admin",
  "manager",
  "content_manager",
  "order_manager",
];

const SUPER_ADMIN_ROLES = ["super_admin", "superadmin"];

// ==========================================
// 1. Authenticate admin using JWT
// ==========================================
const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Server authentication configuration error.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const tokenRole = normalizeRole(decoded.role);

    if (
      decoded.type !== "admin" ||
      !decoded.id ||
      !mongoose.isValidObjectId(decoded.id) ||
      !ALLOWED_ADMIN_ROLES.includes(tokenRole)
    ) {
      return res.status(403).json({
        success: false,
        message: "A valid administrator token is required.",
      });
    }

    const admin = await Admin.findById(decoded.id).select("-password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found. Please log in again.",
      });
    }

    if (normalizeRole(admin.status) !== "active") {
      return res.status(403).json({
        success: false,
        message: "Admin account is inactive.",
      });
    }

    const currentRole = normalizeRole(admin.role);

    if (
      !ALLOWED_ADMIN_ROLES.includes(currentRole) ||
      currentRole !== tokenRole
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Administrator permissions have changed. Please log in again.",
      });
    }

    req.admin = {
      id: String(admin._id),
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: currentRole,
      status: admin.status,
      permissions: Array.isArray(admin.permissions)
        ? admin.permissions
        : [],
    };

    return next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired administrator token.",
      });
    }

    console.error("Admin authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Admin authentication failed due to a server error.",
    });
  }
};

// ==========================================
// 2. Check permission for a specific module
// ==========================================
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const role = normalizeRole(req.admin.role);

    // Super Admin has full access
    if (SUPER_ADMIN_ROLES.includes(role)) {
      return next();
    }

    const permissions = Array.isArray(req.admin.permissions)
      ? req.admin.permissions
      : [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to access ${permission}.`,
      });
    }

    return next();
  };
};

// ==========================================
// 3. Restrict admin management to Super Admin
// ==========================================
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const role = normalizeRole(req.admin.role);

  if (!SUPER_ADMIN_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Only Super Admin can perform this action.",
    });
  }

  return next();
};

// ==========================================
// 4. Export middleware
// ==========================================
module.exports = {
  protectAdmin,
  requirePermission,
  requireSuperAdmin,
};
