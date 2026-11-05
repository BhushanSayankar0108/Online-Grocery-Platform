
const mongoose = require("mongoose");

const storeSettingsSchema = new mongoose.Schema(
  {
    store: {
      storeName: { type: String, default: "Fresh Grocery" },
      email: { type: String, default: "support@grocery.com" },
      phone: { type: String, default: "+91 98765 43210" },
      address: {
        type: String,
        default: "Pimpri-Chinchwad, Maharashtra, India",
      },
      currency: { type: String, default: "INR" },
      timezone: { type: String, default: "Asia/Kolkata" },
    },

    orders: {
      minimumOrder: { type: String, default: "299" },
      deliveryCharge: { type: String, default: "40" },
      freeDeliveryAbove: { type: String, default: "799" },
      codEnabled: { type: Boolean, default: true },
      onlinePaymentEnabled: { type: Boolean, default: true },
      autoConfirmOrders: { type: Boolean, default: false },
    },

    notifications: {
      newOrder: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newCustomer: { type: Boolean, default: true },
      newReview: { type: Boolean, default: true },
      paymentNotification: { type: Boolean, default: true },
      deliveryNotification: { type: Boolean, default: true },
    },

    website: {
      websiteName: { type: String, default: "Fresh Grocery" },
      websiteEmail: { type: String, default: "support@grocery.com" },
      maintenanceMode: { type: Boolean, default: false },
      customerRegistration: { type: Boolean, default: true },
      showReviews: { type: Boolean, default: true },
      showWishlist: { type: Boolean, default: true },

      // Footer social media URLs
      socialLinks: {
        instagram: { type: String, default: "" },
        facebook: { type: String, default: "" },
        x: { type: String, default: "" },
      },

      // Footer business hours
      businessHours: {
        type: String,
        default: "Monday - Sunday, 9:00 AM - 9:00 PM",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StoreSettings", storeSettingsSchema);
