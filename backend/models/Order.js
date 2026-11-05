const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    variantLabel: {
      type: String,
      default: "",
      trim: true,
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true }
);

const addressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const orderStatusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    customerMobile: {
      type: String,
      required: true,
      trim: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length > 0,
        message: "An order must contain at least one item.",
      },
    },

    deliveryAddress: {
      type: addressSchema,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    paymentType: {
      type: String,
      enum: ["cod", "card", "upi_id", "qr_code"],
      default: "cod",
    },

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    razorpayQrCodeId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    paymentQrImageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    paymentQrExpiresAt: {
      type: Date,
      default: null,
    },

    // =========================================
    // DELIVERY SLOT
    // =========================================

    deliverySlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeliverySlot",
      required: true,
    },

    deliverySlotName: {
      type: String,
      required: true,
      trim: true,
    },

    deliverySlotStartTime: {
      type: String,
      default: "",
      trim: true,
    },

    deliverySlotEndTime: {
      type: String,
      default: "",
      trim: true,
    },

    // =========================================
    // INVENTORY RESERVATION TRACKING
    // =========================================

    inventoryReservationStatus: {
      type: String,
      enum: ["none", "reserved", "committed", "released"],
      default: "none",
      index: true,
    },

    inventoryReservedAt: {
      type: Date,
      default: null,
    },

    inventoryCommittedAt: {
      type: Date,
      default: null,
    },

    inventoryReleasedAt: {
      type: Date,
      default: null,
    },

    reservationExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    // =========================================
    // ORDER AMOUNTS
    // =========================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
      min: 0,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================================
// COUPON RESERVATION TRACKING
// =========================================

coupon: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Coupon",
  default: null,
},

couponReservationStatus: {
  type: String,
  enum: ["none", "reserved", "released"],
  default: "none",
  index: true,
},

couponReservedAt: {
  type: Date,
  default: null,
},

couponReleasedAt: {
  type: Date,
  default: null,
},

    // =========================================
    // ORDER STATUS
    // =========================================

    status: {
      type: String,
      enum: [
        "placed",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "placed",
      required: true,
      index: true,
    },

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    statusHistory: {
      type: [orderStatusHistorySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// =========================================
// INDEXES
// =========================================

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customerMobile: 1, createdAt: -1 });

orderSchema.index({
  inventoryReservationStatus: 1,
  reservationExpiresAt: 1,
});

module.exports = mongoose.model("Order", orderSchema);