const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ID of the embedded variant inside Product.variants
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    // Snapshot for easier inventory display and history
    variantLabel: {
      type: String,
      required: true,
      trim: true,
    },

    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    reservedQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: function (value) {
          return value <= this.stockQuantity;
        },
        message: "Reserved quantity cannot exceed stock quantity.",
      },
    },

    lowStockThreshold: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  { timestamps: true }
);

// One inventory record per product variant.
inventorySchema.index(
  { product: 1, variantId: 1 },
  { unique: true }
);

inventorySchema.virtual("availableQuantity").get(function () {
  return Math.max(0, this.stockQuantity - this.reservedQuantity);
});

inventorySchema.virtual("stockStatus").get(function () {
  const available = Math.max(
    0,
    this.stockQuantity - this.reservedQuantity
  );

  if (available === 0) return "out_of_stock";
  if (available <= this.lowStockThreshold) return "low_stock";

  return "in_stock";
});

inventorySchema.set("toJSON", { virtuals: true });
inventorySchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Inventory", inventorySchema);