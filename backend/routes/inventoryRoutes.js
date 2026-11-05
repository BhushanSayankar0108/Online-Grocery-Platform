
const express = require("express");

const {
  getInventoryList,
  getInventoryByProduct,
  createInventory,
  adjustInventory,
  getInventoryHistory,
} = require("../controllers/inventoryController");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const router = express.Router();

// Public: view stock availability for an active product
router.get("/product/:productId", getInventoryByProduct);

// Admin: view inventory list
router.get(
  "/",
  protectAdmin,
  requirePermission("Inventory"),
  getInventoryList
);

// Admin: view stock history
router.get(
  "/:productId/history",
  protectAdmin,
  requirePermission("Inventory"),
  getInventoryHistory
);

// Admin: create inventory
router.post(
  "/",
  protectAdmin,
  requirePermission("Inventory"),
  createInventory
);

// Admin: adjust stock
router.patch(
  "/:productId/adjust",
  protectAdmin,
  requirePermission("Inventory"),
  adjustInventory
);

module.exports = router;
