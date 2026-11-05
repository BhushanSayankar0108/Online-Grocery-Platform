
const mongoose = require("mongoose");
const Coupon = require("../models/Coupon");

const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "This coupon code already exists.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Coupon error:", error.message);

  return res.status(500).json({
    success: false,
    message: "Coupon operation failed.",
  });
};

const validateCouponData = (body = {}) => {
  const code = String(body.code || "").trim().toUpperCase();
  const discountType = body.discountType;
  const discountValue = Number(body.discountValue);
  const minOrderAmount = Number(body.minOrderAmount);
  const maxDiscount = Number(body.maxDiscount);
  const usageLimit = Number(body.usageLimit);
  const startDate = new Date(`${body.startDate}T00:00:00`);
  const endDate = new Date(`${body.endDate}T23:59:59.999`);

  if (!/^[A-Z0-9_-]{1,40}$/.test(code)) {
    throw Object.assign(
      new Error("Coupon code can contain letters, numbers, hyphens and underscores."),
      { statusCode: 400 }
    );
  }

  if (!["percentage", "fixed"].includes(discountType)) {
    throw Object.assign(new Error("Invalid discount type."), {
      statusCode: 400,
    });
  }

  if (
    !Number.isFinite(discountValue) ||
    discountValue <= 0 ||
    (discountType === "percentage" && discountValue > 100)
  ) {
    throw Object.assign(new Error("Invalid discount value."), {
      statusCode: 400,
    });
  }

  if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
    throw Object.assign(new Error("Invalid minimum order amount."), {
      statusCode: 400,
    });
  }

  if (!Number.isFinite(maxDiscount) || maxDiscount <= 0) {
    throw Object.assign(new Error("Maximum discount must be greater than zero."), {
      statusCode: 400,
    });
  }

  if (
    !Number.isInteger(usageLimit) ||
    usageLimit < 1
  ) {
    throw Object.assign(new Error("Usage limit must be a positive whole number."), {
      statusCode: 400,
    });
  }

  if (
    !body.startDate ||
    !body.endDate ||
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate < startDate
  ) {
    throw Object.assign(new Error("Please provide a valid date range."), {
      statusCode: 400,
    });
  }

  return {
    code,
    description: String(body.description || "").trim(),
    discountType,
    discountValue,
    minOrderAmount,
    maxDiscount,
    startDate,
    endDate,
    usageLimit,
    status: body.status === "inactive" ? "inactive" : "active",
  };
};

// GET /api/coupons/admin
const getAdminCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();

    return res.json({ success: true, coupons });
  } catch (error) {
    return sendError(res, error);
  }
};

// GET /api/coupons/public
const getPublicCoupons = async (req, res) => {
  try {
    const now = new Date();

    const coupons = await Coupon.find({
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    })
      .select(
        "code description discountType discountValue minOrderAmount maxDiscount startDate endDate"
      )
      .sort({ minOrderAmount: 1 })
      .lean();

    return res.json({ success: true, coupons });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/coupons/validate
const validateCoupon = async (req, res) => {
  try {
    const code = String(req.body?.code || "").trim().toUpperCase();
    const subtotal = Number(req.body?.subtotal);

    if (!code || !Number.isFinite(subtotal) || subtotal < 0) {
      return res.status(400).json({
        success: false,
        message: "A coupon code and valid subtotal are required.",
      });
    }

    const now = new Date();

    const coupon = await Coupon.findOne({
      code,
      status: "active",
      startDate: { $lte: now },
      endDate: { $gte: now },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    }).lean();

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon is invalid, expired, inactive or fully used.",
      });
    }

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.`,
      });
    }

    const calculatedDiscount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discountValue) / 100
        : coupon.discountValue;

    const discount = roundMoney(
      Math.min(calculatedDiscount, coupon.maxDiscount, subtotal)
    );

    return res.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscount: coupon.maxDiscount,
      },
      discount,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// POST /api/coupons/admin
const createCoupon = async (req, res) => {
  try {
    const data = validateCouponData(req.body);
    const coupon = await Coupon.create(data);

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
};

// PUT /api/coupons/admin/:id
const updateCoupon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const existing = await Coupon.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const data = validateCouponData(req.body);

    if (data.usageLimit < existing.usedCount) {
      return res.status(400).json({
        success: false,
        message: "Usage limit cannot be less than the number of times this coupon has been used.",
      });
    }

    Object.assign(existing, data);
    await existing.save();

    return res.json({
      success: true,
      message: "Coupon updated successfully.",
      coupon: existing,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
};

// PATCH /api/coupons/admin/:id/status
const updateCouponStatus = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const status = req.body?.status;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be active or inactive.",
      });
    }

    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
{ returnDocument: "after", runValidators: true }    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.json({
      success: true,
      message: `Coupon is now ${status}.`,
      coupon,
    });
  } catch (error) {
    return sendError(res, error);
  }
};

// DELETE /api/coupons/admin/:id
const deleteCoupon = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
    }

    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
};

module.exports = {
  getAdminCoupons,
  getPublicCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  updateCouponStatus,
  deleteCoupon,
};
