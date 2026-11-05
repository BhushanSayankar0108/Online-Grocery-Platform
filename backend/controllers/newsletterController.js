const Newsletter = require("../models/Newsletter");

// ==========================================
// CUSTOMER: SUBSCRIBE TO NEWSLETTER
// POST /api/newsletter/subscribe
// ==========================================

const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please enter your email address.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (cleanEmail.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Email address is too long.",
      });
    }

    const existingSubscriber = await Newsletter.findOne({
      email: cleanEmail,
    });

    if (existingSubscriber) {
      if (existingSubscriber.status === "Subscribed") {
        return res.status(409).json({
          success: false,
          message: "This email is already subscribed to our newsletter.",
        });
      }

      existingSubscriber.status = "Subscribed";
      await existingSubscriber.save();

      return res.status(200).json({
        success: true,
        message: "You have successfully subscribed to our newsletter!",
      });
    }

    await Newsletter.create({
      email: cleanEmail,
    });

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This email is already subscribed to our newsletter.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to subscribe right now. Please try again later.",
    });
  }
};

module.exports = {
  subscribeNewsletter,
};