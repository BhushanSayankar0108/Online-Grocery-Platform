const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        // Optional reference to Product.variants._id
        variantId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        addedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
    }
);

module.exports = wishlistItemSchema;