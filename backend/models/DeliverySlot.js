
const mongoose = require("mongoose");

const deliverySlotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Slot name is required"],
      trim: true,
      maxlength: [100, "Slot name cannot exceed 100 characters"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm for start time"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:mm for end time"],
      validate: {
        validator(value) {
          return !this.startTime || value > this.startTime;
        },
        message: "End time must be later than start time",
      },
    },
    maxOrders: {
      type: Number,
      required: [true, "Maximum orders is required"],
      min: [1, "Maximum orders must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Maximum orders must be a whole number",
      },
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
    collection: "deliveryslots",
  }
);

deliverySlotSchema.index({ name: 1 });

module.exports = mongoose.model("DeliverySlot", deliverySlotSchema);
