const express = require("express");

const {
  protectAdmin,
  requirePermission,
} = require("../middleware/authMiddleware");

const {
  getZones,
  createZone,
  updateZone,
  updateZoneStatus,
  deleteZone,
  getSlots,
  createSlot,
  updateSlot,
  updateSlotStatus,
  deleteSlot,
  checkPincode,
  getPublicSlots,
} = require("../controllers/deliveryController");

const router = express.Router();

/* =====================================================
   PUBLIC DELIVERY ROUTES
===================================================== */

router.get("/check-pincode/:pincode", checkPincode);

router.get("/public/slots", getPublicSlots);


/* =====================================================
   ADMIN DELIVERY ROUTES
===================================================== */

router.use(protectAdmin);
router.use(requirePermission("Delivery"));

// Delivery zones
router.route("/zones")
  .get(getZones)
  .post(createZone);

router.route("/zones/:id")
  .put(updateZone)
  .delete(deleteZone);

router.patch("/zones/:id/status", updateZoneStatus);

// Delivery slots
router.route("/slots")
  .get(getSlots)
  .post(createSlot);

router.route("/slots/:id")
  .put(updateSlot)
  .delete(deleteSlot);

router.patch("/slots/:id/status", updateSlotStatus);

module.exports = router;