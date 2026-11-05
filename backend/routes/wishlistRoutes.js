
const express = require("express");

const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
} = require("../controllers/wishlistController");

const {
    protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// ==========================================
// CUSTOMER WISHLIST ROUTES
// ==========================================

// Get logged-in customer's wishlist
router.get("/", protectCustomer, getWishlist);

// Add product to wishlist
router.post("/", protectCustomer, addToWishlist);

// Remove product from wishlist
router.delete("/:itemId", protectCustomer, removeFromWishlist);

module.exports = router;
