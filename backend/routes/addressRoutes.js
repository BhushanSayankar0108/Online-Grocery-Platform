
const express = require("express");

const {
  addAddress,
  getAddresses,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} = require("../controllers/addressController");

const {
  protectCustomer,
} = require("../middleware/customerAuthMiddleware");

const router = express.Router();

// Every address endpoint requires customer authentication.
router.use(protectCustomer);

router.post("/", addAddress);
router.get("/", getAddresses);
router.put("/:id", updateAddress);
router.patch("/:id/default", setDefaultAddress);
router.delete("/:id", deleteAddress);

module.exports = router;
