
const mongoose = require("mongoose");

const deliveryZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Zone name is required"],
      trim: true,
      maxlength: [100, "Zone name cannot exceed 100 characters"],
    },
    areas: {
      type: String,
      required: [true, "Areas or pincodes are required"],
      trim: true,
      maxlength: [1000, "Areas cannot exceed 1000 characters"],
    },
    deliveryCharge: {
      type: Number,
      required: [true, "Delivery charge is required"],
      min: [0, "Delivery charge cannot be negative"],
    },
    minimumOrder: {
      type: Number,
      required: [true, "Minimum order is required"],
      min: [0, "Minimum order cannot be negative"],
    },

    freeDeliveryAbove: {
  type: Number,
  required: [true, "Free delivery threshold is required"],
  min: [0, "Free delivery threshold cannot be negative"],
},

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      lowercase: true,
    },
  },
  {
    timestamps: true,
    collection: "deliveryzones",
  }
);

deliveryZoneSchema.index({ name: 1 });

module.exports = mongoose.model("DeliveryZone", deliveryZoneSchema);
