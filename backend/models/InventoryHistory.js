const mongoose = require("mongoose");

const inventoryHistorySchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        // Embedded variant ID from Product.variants
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            index: true
        },

        // Snapshot of the variant name at the time of stock change
        variantLabel: {
            type: String,
            trim: true,
            default: ""
        },

        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },

        changeType: {
            type: String,
            enum: [
                "initial_stock",
                "stock_in",
                "stock_out",
                "adjustment"
            ],
            required: true
        },

        quantityChange: {
            type: Number,
            required: true
        },

        previousStock: {
            type: Number,
            required: true,
            min: 0
        },

        newStock: {
            type: Number,
            required: true,
            min: 0
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 500
        },

        performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            default: null
        }
    },
    { timestamps: true }
);

// Product-wise history
inventoryHistorySchema.index({
    product: 1,
    createdAt: -1
});

// Variant-wise history
inventoryHistorySchema.index({
    product: 1,
    variantId: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    "InventoryHistory",
    inventoryHistorySchema
);