
const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // =====================================================
    // RECIPIENT INFORMATION
    // =====================================================

    recipientType: {
      type: String,
      enum: ["customer", "admin"],
      required: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },

    // =====================================================
    // NOTIFICATION CONTENT
    // =====================================================

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // =====================================================
    // NOTIFICATION CATEGORY
    // =====================================================

    notificationType: {
      type: String,
      enum: [
        "order",
        "inventory",
        "customer",
        "payment",
        "review",
        "delivery",
        "marketing",
        "system",
      ],
      default: "system",
      required: true,
      index: true,
    },

    // =====================================================
    // READ / UNREAD STATUS
    // =====================================================

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // =====================================================
    // OPTIONAL REFERENCE INFORMATION
    // =====================================================

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceType: {
      type: String,
      enum: ["Order", "Product", "Inventory", null],
      default: null,
    },

    // =====================================================
    // ADDITIONAL INFORMATION
    // =====================================================

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// =====================================================
// RECIPIENT VALIDATION
// =====================================================

notificationSchema.pre("validate", function () {
  if (this.recipientType === "customer" && !this.customer) {
    this.invalidate(
      "customer",
      "Customer ID is required for customer notifications."
    );
  }

  if (this.recipientType === "admin" && this.customer) {
    this.invalidate(
      "customer",
      "Admin notifications should not have a customer ID."
    );
  }
});

// =====================================================
// DATABASE INDEXES
// =====================================================

notificationSchema.index({
  recipientType: 1,
  customer: 1,
  created_at: -1,
});

notificationSchema.index({
  recipientType: 1,
  customer: 1,
  isRead: 1,
});

notificationSchema.index({
  recipientType: 1,
  created_at: -1,
});

notificationSchema.index({
  recipientType: 1,
  isRead: 1,
});

// =====================================================
// MODEL EXPORT
// =====================================================

const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

module.exports = Notification;
