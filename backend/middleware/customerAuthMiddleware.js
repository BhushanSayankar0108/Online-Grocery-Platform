
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const protectCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Customer authentication token is required.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token || !process.env.JWT_SECRET) {
      return res.status(401).json({
        success: false,
        message: "Invalid or missing authentication configuration.",
      });
    }

let decoded;

try {
  decoded = jwt.verify(token, process.env.JWT_SECRET);
} catch (jwtError) {
  console.error("Customer JWT verification failed:", {
    name: jwtError.name,
    message: jwtError.message,
  });

  throw jwtError;
}

console.log("Customer JWT verified:", {
  hasId: Boolean(decoded.id),
  role: decoded.role,
  type: decoded.type,
  expired: decoded.exp
    ? decoded.exp < Math.floor(Date.now() / 1000)
    : null,
});
    // Prevent Admin tokens or other token types from accessing
    // customer-only endpoints.
    if (
      decoded.type !== "customer" ||
      decoded.role !== "customer" ||
      !decoded.id ||
      !mongoose.isValidObjectId(decoded.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "A valid customer token is required.",
      });
    }

    const customer = await Customer.findById(decoded.id);

    if (!customer || customer.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Customer account not found or inactive.",
      });
    }

    req.customer = customer;

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired customer token.",
      });
    }

    console.error("Customer authentication error:", error);

    return res.status(500).json({
      success: false,
      message: "Customer authentication failed.",
    });
  }
};

module.exports = { protectCustomer };
 