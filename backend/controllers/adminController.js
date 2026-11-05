
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Admin = require("../models/Admin");

// =====================================================
// Constants
// =====================================================

const ADMIN_ROLES = [
  "Super Admin",
  "Admin",
  "Manager",
  "Content Manager",
  "Order Manager",
];

const ADMIN_STATUSES = ["Active", "Inactive"];


const PERMISSIONS = [
  "Dashboard",
  "Products",
  "Categories",
  "Inventory",
  "Orders",
  "Support",
  "Customers",
  "Coupons & Offers",
  "Delivery",
  "Reviews",
  "Notifications",
  "Website CMS",
  "Reports",
  "Settings",
];


// Supports SUPER_ADMIN, Super Admin, super-admin
const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const isSuperAdmin = (role) => normalizeRole(role) === "super_admin";

const isActiveStatus = (status) =>
  String(status || "").trim().toLowerCase() === "active";

// =====================================================
// Sanitize admin response
// =====================================================

const sanitizeAdmin = (admin) => {
  const item = admin.toObject ? admin.toObject() : admin;

  let createdAt = "";

  const dateValue = item.created_at || item.createdAt;

  if (dateValue) {
    const parsedDate = new Date(dateValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      createdAt = parsedDate.toISOString().slice(0, 10);
    }
  }

  return {
    id: String(item._id || item.id),
    name: item.name || "",
    email: item.email || "",
    mobile: item.mobile || "",
    role: item.role || "Manager",
    status: item.status || "Active",
    permissions: Array.isArray(item.permissions)
      ? item.permissions
      : ["Dashboard"],
    createdAt,
    lastLogin: item.lastLogin || "Not tracked",
  };
};

// =====================================================
// Validate admin input
// =====================================================


const validateAdminInput = (body = {}, isCreate = false) => {
  const errors = [];

  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const mobile = String(body.mobile || "").replace(/\s+/g, "");
  const role = String(body.role || "Manager").trim();
  const status = String(body.status || "Active").trim();

  // Normalize permissions before validating.
  const permissions = Array.isArray(body.permissions)
    ? [
        ...new Set(
          body.permissions
            .map((permission) => String(permission).trim())
            .filter(Boolean)
        ),
      ]
    : [];

  if (
    isCreate &&
    (typeof body.password !== "string" || body.password.length < 8)
  ) {
    errors.push("Password must contain at least 8 characters.");
  }

  if (!name || name.length > 100) {
    errors.push("Name is required and must be at most 100 characters.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Enter a valid email address.");
  }

  if (!/^\+?[0-9]{10,15}$/.test(mobile)) {
    errors.push("Enter a valid mobile number.");
  }

  if (!ADMIN_ROLES.includes(role)) {
    errors.push("Invalid administrator role.");
  }

  if (!ADMIN_STATUSES.includes(status)) {
    errors.push("Invalid administrator status.");
  }

  if (!permissions.length) {
    errors.push("Please select at least one permission.");
  }

  const invalidPermissions = permissions.filter(
    (permission) => !PERMISSIONS.includes(permission)
  );

  if (invalidPermissions.length > 0) {
    errors.push(
      `Invalid permissions: ${invalidPermissions.join(", ")}.`
    );
  }

  return {
    errors,
    data: {
      name,
      email,
      mobile,
      role,
      status,
      permissions,
    },
  };
};


// =====================================================
// POST /api/admin/login
// =====================================================

const loginAdmin = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = req.body?.password;

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!isActiveStatus(admin.status)) {
      return res.status(403).json({
        success: false,
        message: "Your administrator account is inactive.",
      });
    }

    if (!admin.password) {
      return res.status(500).json({
        success: false,
        message: "Administrator password is not configured correctly.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const role = normalizeRole(admin.role);

    // Allow only roles explicitly defined for the admin portal.
    const allowedLoginRoles = ADMIN_ROLES.map(normalizeRole);

    console.log("Admin login role check:", {
      email: admin.email,
      storedRole: admin.role,
      normalizedRole: role,
    });

    if (!allowedLoginRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "This account does not have administrator login access.",
      });
    }

    const token = jwt.sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        role,
        type: "admin",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Admin login successful.",
      token,
      admin: {
        ...sanitizeAdmin(admin),
        role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to log in at this time.",
    });
  }
};

// =====================================================
// GET /api/admin
// =====================================================

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select("-password")
      .sort({ created_at: -1 });

    return res.status(200).json({
      success: true,
      admins: admins.map(sanitizeAdmin),
    });
  } catch (error) {
    console.error("Get admins error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch administrators.",
    });
  }
};

// =====================================================
// POST /api/admin
// =====================================================

const createAdmin = async (req, res) => {
  try {
    const { errors, data } = validateAdminInput(req.body, true);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    const exists = await Admin.findOne({ email: data.email });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const admin = await Admin.create({
      ...data,
      password: hashedPassword,
    });

    return res.status(201).json({
      success: true,
      message: "Administrator created successfully.",
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    console.error("Create admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create administrator.",
    });
  }
};

// =====================================================
// PUT /api/admin/:id
// =====================================================

const updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    const { errors, data } = validateAdminInput(req.body);

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }

    if (
      isSuperAdmin(admin.role) &&
      (!isSuperAdmin(data.role) || data.status !== "Active")
    ) {
      return res.status(400).json({
        success: false,
        message: "The Super Admin account cannot be demoted or deactivated.",
      });
    }

    const duplicate = await Admin.findOne({
      email: data.email,
      _id: { $ne: id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    Object.assign(admin, data);
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Administrator updated successfully.",
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An administrator with this email already exists.",
      });
    }

    console.error("Update admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update administrator.",
    });
  }
};

// =====================================================
// PATCH /api/admin/:id/status
// =====================================================

const updateAdminStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body?.status || "").trim();

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    if (!ADMIN_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator status.",
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    if (isSuperAdmin(admin.role) && status !== "Active") {
      return res.status(400).json({
        success: false,
        message: "The Super Admin account cannot be deactivated.",
      });
    }

    admin.status = status;
    await admin.save();

    return res.status(200).json({
      success: true,
      message: "Administrator status updated successfully.",
      admin: sanitizeAdmin(admin),
    });
  } catch (error) {
    console.error("Update admin status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update administrator status.",
    });
  }
};

// =====================================================
// DELETE /api/admin/:id
// =====================================================

const deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid administrator ID.",
      });
    }

    const admin = await Admin.findById(id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Administrator not found.",
      });
    }

    if (isSuperAdmin(admin.role)) {
      return res.status(400).json({
        success: false,
        message: "The Super Admin account cannot be deleted.",
      });
    }

    const currentAdminId = req.admin?._id
      ? String(req.admin._id)
      : String(req.admin?.id || "");

    if (currentAdminId && currentAdminId === String(admin._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account.",
      });
    }

    await Admin.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Administrator deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete administrator.",
    });
  }
};

// =====================================================
// Exports
// =====================================================

module.exports = {
  loginAdmin,
  getAdmins,
  createAdmin,
  updateAdmin,
  updateAdminStatus,
  deleteAdmin,
};
