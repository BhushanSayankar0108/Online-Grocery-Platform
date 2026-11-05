const mongoose = require("mongoose");
const SupportQuery = require("../models/SupportQuery");

// ==========================================
// CUSTOMER: SUBMIT SUPPORT QUERY
// POST /api/support
// ==========================================

const createSupportQuery = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};

    // Validate required fields
    if (
  typeof name !== "string" ||
  typeof email !== "string" ||
  typeof subject !== "string" ||
  typeof message !== "string" ||
  !name.trim() ||
  !email.trim() ||
  !subject.trim() ||
  !message.trim()
) {
  return res.status(400).json({
    success: false,
    message: "All fields are required and must be valid text.",
  });
}

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Validate lengths
    if (
      cleanName.length > 100 ||
      cleanEmail.length > 150 ||
      cleanSubject.length > 150 ||
      cleanMessage.length > 3000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length.",
      });
    }

    const supportQuery = await SupportQuery.create({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    return res.status(201).json({
      success: true,
      message: "Your support query has been submitted successfully.",
      query: {
        id: supportQuery._id,
        status: supportQuery.status,
        createdAt: supportQuery.createdAt,
      },
    });
  } catch (error) {
    console.error("Create support query error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit your query. Please try again later.",
    });
  }
};

// ==========================================
// ADMIN: GET ALL SUPPORT QUERIES
// GET /api/support/admin
// ==========================================

const getSupportQueries = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const filter = {};

    // Filter by status
    if (req.query.status) {
      const allowedStatuses = ["New", "In Progress", "Resolved"];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid support query status.",
        });
      }

      filter.status = req.query.status;
    }

    // Search by name, email or subject
    if (req.query.search?.trim()) {
      const search = req.query.search.trim();

      const escapedSearch = search.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      const searchRegex = new RegExp(escapedSearch, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
      ];
    }

    const [queries, total, newCount, inProgressCount, resolvedCount] =
      await Promise.all([
        SupportQuery.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),

        SupportQuery.countDocuments(filter),

        SupportQuery.countDocuments({ status: "New" }),

        SupportQuery.countDocuments({ status: "In Progress" }),

        SupportQuery.countDocuments({ status: "Resolved" }),
      ]);

    return res.status(200).json({
      success: true,
      count: queries.length,
      total,
      page,
      pages: Math.ceil(total / limit),

      stats: {
        total: await SupportQuery.countDocuments(),
        new: newCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },

      queries,
    });
  } catch (error) {
    console.error("Get support queries error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve support queries.",
    });
  }
};

// ==========================================
// ADMIN: UPDATE QUERY STATUS
// PATCH /api/support/admin/:id/status
// ==========================================

const updateSupportQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid support query ID.",
      });
    }

    const allowedStatuses = ["New", "In Progress", "Resolved"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid status.",
      });
    }

    if (
      adminNote !== undefined &&
      (typeof adminNote !== "string" || adminNote.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message: "Admin note must be a string of at most 1000 characters.",
      });
    }

    const query = await SupportQuery.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Support query not found.",
      });
    }

    query.status = status;

    if (adminNote !== undefined) {
      query.adminNote = adminNote.trim();
    }

    query.resolvedAt =
      status === "Resolved" ? new Date() : null;

    await query.save();

    return res.status(200).json({
      success: true,
      message: "Support query updated successfully.",
      query,
    });
  } catch (error) {
    console.error("Update support query error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update support query.",
    });
  }
};

module.exports = {
  createSupportQuery,
  getSupportQueries,
  updateSupportQueryStatus,
};