
const mongoose = require("mongoose");

const DeliveryZone = require("../models/DeliveryZone");
const DeliverySlot = require("../models/DeliverySlot");

/* =====================================================
   COMMON HELPERS
===================================================== */

// Async error handler
const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

// Standard error response
const sendError = (res, status, message) => {
  return res.status(status).json({
    success: false,
    message,
  });
};

const normalizeName = (value) =>
  typeof value === "string" ? value.trim() : "";

const validateName = (name) => {
  if (!name) return "Name is required";
  if (name.length > 100) return "Name cannot exceed 100 characters";
  return null;
};

const validId = (id) => mongoose.isValidObjectId(id);

const validStatus = (status) =>
  ["active", "inactive"].includes(status);

const parseNonNegativeNumber = (value) =>
  value !== "" &&
  value !== undefined &&
  value !== null &&
  Number.isFinite(Number(value)) &&
  Number(value) >= 0;

// Escape special RegExp characters
const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Check duplicate names (case-insensitive)
async function checkDuplicate(Model, name, id = null) {
  const filter = {
    name: {
      $regex: `^${escapeRegex(name)}$`,
      $options: "i",
    },
  };

  if (id) {
    filter._id = { $ne: id };
  }

  return Model.exists(filter);
}

// Extract six-digit PIN codes from zone areas.
// Supported separators: comma, semicolon, newline.
const extractPincodes = (areas) => {
  return String(areas || "")
    .split(/[,;\n\r]+/)
    .map((area) => area.trim())
    .filter((area) => /^\d{6}$/.test(area));
};

// Validate delivery zone amounts
const validateZoneAmounts = (body) => {
  if (!parseNonNegativeNumber(body.deliveryCharge)) {
    return "Delivery charge must be a valid non-negative number";
  }

  if (!parseNonNegativeNumber(body.minimumOrder)) {
    return "Minimum order must be a valid non-negative number";
  }

  if (!parseNonNegativeNumber(body.freeDeliveryAbove)) {
    return "Free delivery threshold must be a valid non-negative number";
  }

  const deliveryCharge = Number(body.deliveryCharge);
  const minimumOrder = Number(body.minimumOrder);
  const freeDeliveryAbove = Number(body.freeDeliveryAbove);

  if (freeDeliveryAbove < minimumOrder) {
    return "Free delivery threshold must be equal to or greater than minimum order";
  }

  return {
    deliveryCharge,
    minimumOrder,
    freeDeliveryAbove,
  };
};

/* =====================================================
   DELIVERY ZONES - ADMIN
===================================================== */

// GET ALL ZONES
const getZones = asyncHandler(async (req, res) => {
  const zones = await DeliveryZone.find()
    .sort({ createdAt: -1 })
    .lean();

  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    zones,
  });
});

// CREATE ZONE
const createZone = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const name = normalizeName(body.name);
  const areas =
    typeof body.areas === "string" ? body.areas.trim() : "";
  const status = body.status || "active";

  const nameError = validateName(name);
  if (nameError) {
    return sendError(res, 400, nameError);
  }

  if (!areas || areas.length > 1000) {
    return sendError(
      res,
      400,
      "Areas are required and cannot exceed 1000 characters"
    );
  }

  const amounts = validateZoneAmounts(body);

  if (typeof amounts === "string") {
    return sendError(res, 400, amounts);
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const duplicate = await checkDuplicate(DeliveryZone, name);

  if (duplicate) {
    return sendError(
      res,
      409,
      "A delivery zone with this name already exists"
    );
  }

  const zone = await DeliveryZone.create({
    name,
    areas,
    deliveryCharge: amounts.deliveryCharge,
    minimumOrder: amounts.minimumOrder,
    freeDeliveryAbove: amounts.freeDeliveryAbove,
    status,
  });

  return res.status(201).json({
    success: true,
    message: "Delivery zone created successfully",
    zone,
  });
});

// UPDATE ZONE
const updateZone = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery zone ID");
  }

  const body = req.body || {};

  const name = normalizeName(body.name);
  const areas =
    typeof body.areas === "string" ? body.areas.trim() : "";
  const status = body.status;

  const nameError = validateName(name);
  if (nameError) {
    return sendError(res, 400, nameError);
  }

  if (!areas || areas.length > 1000) {
    return sendError(
      res,
      400,
      "Areas are required and cannot exceed 1000 characters"
    );
  }

  const amounts = validateZoneAmounts(body);

  if (typeof amounts === "string") {
    return sendError(res, 400, amounts);
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const duplicate = await checkDuplicate(
    DeliveryZone,
    name,
    id
  );

  if (duplicate) {
    return sendError(
      res,
      409,
      "A delivery zone with this name already exists"
    );
  }

  const zone = await DeliveryZone.findByIdAndUpdate(
    id,
    {
      name,
      areas,
      deliveryCharge: amounts.deliveryCharge,
      minimumOrder: amounts.minimumOrder,
      freeDeliveryAbove: amounts.freeDeliveryAbove,
      status,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!zone) {
    return sendError(res, 404, "Delivery zone not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery zone updated successfully",
    zone,
  });
});

// UPDATE ZONE STATUS
const updateZoneStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery zone ID");
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const zone = await DeliveryZone.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!zone) {
    return sendError(res, 404, "Delivery zone not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery zone status updated successfully",
    zone,
  });
});

// DELETE ZONE
const deleteZone = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery zone ID");
  }

  const zone = await DeliveryZone.findByIdAndDelete(id);

  if (!zone) {
    return sendError(res, 404, "Delivery zone not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery zone deleted successfully",
    id,
  });
});

/* =====================================================
   PUBLIC DELIVERY APIs
===================================================== */

// CHECK PINCODE SERVICEABILITY
const checkPincode = asyncHandler(async (req, res) => {
  const pincode = String(req.params.pincode || "").trim();

  res.set("Cache-Control", "no-store");

  if (!/^\d{6}$/.test(pincode)) {
    return sendError(
      res,
      400,
      "Please enter a valid 6-digit PIN code"
    );
  }

  const zones = await DeliveryZone.find({
    status: "active",
  }).lean();

  const matchedZone = zones.find((zone) => {
    const pincodes = extractPincodes(zone.areas);
    return pincodes.includes(pincode);
  });

  if (!matchedZone) {
    return res.status(200).json({
      success: true,
      serviceable: false,
      message: "Sorry, delivery is not available at this PIN code.",
      zone: null,
    });
  }

  return res.status(200).json({
    success: true,
    serviceable: true,
    message: "Delivery is available at this PIN code.",
    zone: {
      _id: matchedZone._id,
      name: matchedZone.name,
      deliveryCharge: Number(matchedZone.deliveryCharge || 0),
      minimumOrder: Number(matchedZone.minimumOrder || 0),
      freeDeliveryAbove: Number(matchedZone.freeDeliveryAbove || 0),
    },
  });
});

// GET ACTIVE DELIVERY SLOTS FOR CUSTOMERS
// Every active slot accepts unlimited orders.
const getPublicSlots = asyncHandler(async (req, res) => {
  res.set("Cache-Control", "no-store");

  const slots = await DeliverySlot.find({
    status: "active",
  })
    .select("name startTime endTime")
    .sort({ startTime: 1 })
    .lean();

  return res.status(200).json({
    success: true,
    slots,
  });
});

/* =====================================================
   DELIVERY SLOTS - ADMIN
===================================================== */

// GET ALL SLOTS
const getSlots = asyncHandler(async (req, res) => {
  const slots = await DeliverySlot.find()
    .sort({ createdAt: -1 })
    .lean();

  res.set("Cache-Control", "no-store");

  return res.status(200).json({
    success: true,
    slots,
  });
});

// CREATE SLOT
const createSlot = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const name = normalizeName(body.name);
  const { startTime, endTime } = body;
  const status = body.status || "active";

  const nameError = validateName(name);

  if (nameError) {
    return sendError(res, 400, nameError);
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    !timePattern.test(startTime || "") ||
    !timePattern.test(endTime || "")
  ) {
    return sendError(
      res,
      400,
      "Start and end times must use HH:mm format"
    );
  }

  if (endTime <= startTime) {
    return sendError(
      res,
      400,
      "End time must be later than start time"
    );
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const duplicate = await checkDuplicate(DeliverySlot, name);

  if (duplicate) {
    return sendError(
      res,
      409,
      "A delivery slot with this name already exists"
    );
  }

  const slot = await DeliverySlot.create({
    name,
    startTime,
    endTime,
    status,
  });

  return res.status(201).json({
    success: true,
    message: "Delivery slot created successfully",
    slot,
  });
});

// UPDATE SLOT
const updateSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery slot ID");
  }

  const body = req.body || {};

  const name = normalizeName(body.name);
  const { startTime, endTime } = body;
  const status = body.status;

  const nameError = validateName(name);

  if (nameError) {
    return sendError(res, 400, nameError);
  }

  const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

  if (
    !timePattern.test(startTime || "") ||
    !timePattern.test(endTime || "")
  ) {
    return sendError(
      res,
      400,
      "Start and end times must use HH:mm format"
    );
  }

  if (endTime <= startTime) {
    return sendError(
      res,
      400,
      "End time must be later than start time"
    );
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const duplicate = await checkDuplicate(
    DeliverySlot,
    name,
    id
  );

  if (duplicate) {
    return sendError(
      res,
      409,
      "A delivery slot with this name already exists"
    );
  }

  const slot = await DeliverySlot.findByIdAndUpdate(
    id,
    {
      name,
      startTime,
      endTime,
      status,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!slot) {
    return sendError(res, 404, "Delivery slot not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery slot updated successfully",
    slot,
  });
});

// UPDATE SLOT STATUS
const updateSlotStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery slot ID");
  }

  if (!validStatus(status)) {
    return sendError(
      res,
      400,
      "Status must be active or inactive"
    );
  }

  const slot = await DeliverySlot.findByIdAndUpdate(
    id,
    { status },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!slot) {
    return sendError(res, 404, "Delivery slot not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery slot status updated successfully",
    slot,
  });
});

// DELETE SLOT
const deleteSlot = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validId(id)) {
    return sendError(res, 400, "Invalid delivery slot ID");
  }

  const slot = await DeliverySlot.findByIdAndDelete(id);

  if (!slot) {
    return sendError(res, 404, "Delivery slot not found");
  }

  return res.status(200).json({
    success: true,
    message: "Delivery slot deleted successfully",
    id,
  });
});

/* =====================================================
   EXPORTS
===================================================== */

module.exports = {
  // Admin zones
  getZones,
  createZone,
  updateZone,
  updateZoneStatus,
  deleteZone,

  // Admin slots
  getSlots,
  createSlot,
  updateSlot,
  updateSlotStatus,
  deleteSlot,

  // Public delivery APIs
  checkPincode,
  getPublicSlots,
};
