const mongoose = require("mongoose");

const supportQuerySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      maxlength: 150,
    },

    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, "Message is required."],
      trim: true,
      maxlength: 3000,
    },

    status: {
      type: String,
      enum: ["New", "In Progress", "Resolved"],
      default: "New",
    },

    adminNote: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

supportQuerySchema.index({ status: 1, createdAt: -1 });
supportQuerySchema.index({ email: 1 });

module.exports = mongoose.model("SupportQuery", supportQuerySchema);