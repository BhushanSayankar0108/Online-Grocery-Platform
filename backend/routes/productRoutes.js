
const express = require("express");

const {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  initializeMissingInventory,
  deleteProduct,
} = require("../controllers/productController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public product listing: active products only
router.get("/", getProducts);

// Admin listing: active and inactive products
// Keep this route before /:id
router.get(
  "/admin/all",
  protectAdmin,
  requirePermission("Products"),
  getAdminProducts
);

// Public product details: active products only
router.get("/:id", getProductById);

// Admin: initialize missing inventory
router.post(
  "/admin/initialize-inventory",
  protectAdmin,
  requirePermission("Products"),
  initializeMissingInventory
);

// Admin: create product
router.post(
  "/",
  protectAdmin,
  requirePermission("Products"),
  createProduct
);

// Admin: update product
router.put(
  "/:id",
  protectAdmin,
  requirePermission("Products"),
  updateProduct
);

// Admin: delete product
router.delete(
  "/:id",
  protectAdmin,
  requirePermission("Products"),
  deleteProduct
);

module.exports = router;
