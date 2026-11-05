
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 150,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      required: true,
      trim: true,
      default: "Manager",
      enum: [
        "Super Admin",
        "Admin",
        "Manager",
        "Content Manager",
        "Order Manager",
      ],
    },

    status: {
      type: String,
      required: true,
      trim: true,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    permissions: {
      type: [String],
      default: ["Dashboard"],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Admin", adminSchema);
