const express = require("express");

const {
  subscribeNewsletter,
} = require("../controllers/newsletterController");

const router = express.Router();

// CUSTOMER: Subscribe to newsletter
router.post("/subscribe", subscribeNewsletter);

module.exports = router;