const express = require("express");

const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} = require("../controllers/cartController");

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

router.get("/", protectCustomer, getCart);
router.post("/items", protectCustomer, addToCart);
router.patch("/items/:itemId", protectCustomer, updateCartItem);
router.delete("/items/:itemId", protectCustomer, removeCartItem);
router.delete("/", protectCustomer, clearCart);

module.exports = router;