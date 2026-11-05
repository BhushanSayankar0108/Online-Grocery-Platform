const mongoose = require("mongoose");
const wishlistItemSchema = require("./WishlistItem");

const wishlistSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
            unique: true,
            index: true,
        },

        items: {
            type: [wishlistItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Wishlist", wishlistSchema);