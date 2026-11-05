
const mongoose = require("mongoose");
const Address = require("../models/Address");

const isValidId = (id) => mongoose.isValidObjectId(id);

const addressFields = [
  "fullName",
  "mobile",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "postalCode",
  "landmark",
  "addressType",
];

const getAddressInput = (body) => {
  const input = {};

  for (const field of addressFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      input[field] = body[field];
    }
  }

  return input;
};

// POST /api/customers/addresses
const addAddress = async (req, res) => {
  try {
    const input = getAddressInput(req.body || {});

    const requiredFields = [
      "fullName",
      "mobile",
      "addressLine1",
      "city",
      "state",
      "postalCode",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        typeof input[field] !== "string" || !input[field].trim()
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Required fields: ${missingFields.join(", ")}.`,
      });
    }

    const requestedDefault = req.body?.isDefault === true;

    const existingCount = await Address.countDocuments({
      customer: req.customer._id,
    });

    const address = await Address.create({
      ...input,
      customer: req.customer._id,
      isDefault: false,
    });

    // The first address is always the default.
    if (requestedDefault || existingCount === 0) {
      await Address.updateMany(
        { customer: req.customer._id, _id: { $ne: address._id } },
        { $set: { isDefault: false } }
      );

      address.isDefault = true;
      await address.save();
    }

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      address,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Add address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add address at this time.",
    });
  }
};

// GET /api/customers/addresses
const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({
      customer: req.customer._id,
    }).sort({ isDefault: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: addresses.length,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve addresses.",
    });
  }
};

// PUT /api/customers/addresses/:id
const updateAddress = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const input = getAddressInput(req.body || {});

    if (Object.keys(input).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one address field to update.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      customer: req.customer._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    for (const [field, value] of Object.entries(input)) {
      address[field] = value;
    }

    await address.save();

    return res.status(200).json({
      success: true,
      message: "Address updated successfully.",
      address,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Update address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update address.",
    });
  }
};

// PATCH /api/customers/addresses/:id/default
const setDefaultAddress = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      customer: req.customer._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    await Address.updateMany(
      { customer: req.customer._id },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();

    return res.status(200).json({
      success: true,
      message: "Default address updated successfully.",
      address,
    });
  } catch (error) {
    console.error("Set default address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to set the default address.",
    });
  }
};

// DELETE /api/customers/addresses/:id
const deleteAddress = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID.",
      });
    }

    const address = await Address.findOne({
      _id: req.params.id,
      customer: req.customer._id,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({
      _id: address._id,
      customer: req.customer._id,
    });

    // If the default was deleted, promote the most recently created
    // remaining address.
    if (wasDefault) {
      const replacement = await Address.findOne({
        customer: req.customer._id,
      }).sort({ createdAt: -1 });

      if (replacement) {
        await Address.updateMany(
          { customer: req.customer._id },
          { $set: { isDefault: false } }
        );

        replacement.isDefault = true;
        await replacement.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: "Address deleted successfully.",
    });
  } catch (error) {
    console.error("Delete address error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete address.",
    });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
};
