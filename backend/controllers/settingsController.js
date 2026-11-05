
const StoreSettings = require("../models/StoreSettings");

// ==========================================
// DEFAULT SETTINGS
// ==========================================

const DEFAULT_SETTINGS = {
  store: {
    storeName: "Fresh Grocery",
    email: "support@grocery.com",
    phone: "+91 98765 43210",
    address: "Pimpri-Chinchwad, Maharashtra, India",
    currency: "INR",
    timezone: "Asia/Kolkata",
  },

  orders: {
    minimumOrder: "299",
    deliveryCharge: "40",
    freeDeliveryAbove: "799",
    codEnabled: true,
    onlinePaymentEnabled: true,
    autoConfirmOrders: false,
  },

  notifications: {
    newOrder: true,
    lowStock: true,
    newCustomer: true,
    newReview: true,
    paymentNotification: true,
    deliveryNotification: true,
  },

  website: {
    websiteName: "Fresh Grocery",
    websiteEmail: "support@grocery.com",
    maintenanceMode: false,
    customerRegistration: true,
    showReviews: true,
    showWishlist: true,

    socialLinks: {
      instagram: "",
      facebook: "",
      x: "",
    },

    businessHours: "Mon - Sun, 9 AM - 9 PM",
  },
};

// ==========================================
// HELPER: CONVERT MONGOOSE SUBDOCUMENT
// ==========================================

const convertToObject = (value) => {
  if (!value) return {};

  if (typeof value.toObject === "function") {
    return value.toObject();
  }

  return value;
};

// ==========================================
// GET SETTINGS
// Public: GET /api/settings/public
// Admin:  GET /api/settings/admin
// ==========================================

const getSettings = async (req, res) => {
  try {
    const savedSettings = await StoreSettings.findOne().lean();

    // If settings do not exist, return default settings
    if (!savedSettings) {
      return res.status(200).json({
        success: true,
        settings: DEFAULT_SETTINGS,
      });
    }

    // Merge saved settings with defaults
    // This supports older MongoDB documents too.

    const settings = {
      store: {
        ...DEFAULT_SETTINGS.store,
        ...(savedSettings.store || {}),
      },

      orders: {
        ...DEFAULT_SETTINGS.orders,
        ...(savedSettings.orders || {}),
      },

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(savedSettings.notifications || {}),
      },

      website: {
        ...DEFAULT_SETTINGS.website,
        ...(savedSettings.website || {}),

        socialLinks: {
          ...DEFAULT_SETTINGS.website.socialLinks,
          ...(savedSettings.website?.socialLinks || {}),
        },

        businessHours:
          savedSettings.website?.businessHours ??
          DEFAULT_SETTINGS.website.businessHours,
      },
    };

    return res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings.",
    });
  }
};

// ==========================================
// UPDATE SETTINGS
// Admin: PUT /api/settings
// ==========================================

const updateSettings = async (req, res) => {
  try {
    const body = req.body || {};

    const allowedSections = [
      "store",
      "orders",
      "notifications",
      "website",
    ];

    // Validate main settings sections
    for (const section of allowedSections) {
      if (
        body[section] !== undefined &&
        (
          !body[section] ||
          typeof body[section] !== "object" ||
          Array.isArray(body[section])
        )
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${section} settings.`,
        });
      }
    }

    // Validate socialLinks object
    if (
      body.website?.socialLinks !== undefined &&
      (
        !body.website.socialLinks ||
        typeof body.website.socialLinks !== "object" ||
        Array.isArray(body.website.socialLinks)
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid social links settings.",
      });
    }

    // Validate socialLinks values
    if (body.website?.socialLinks) {
      const allowedSocialPlatforms = [
        "instagram",
        "facebook",
        "x",
      ];

      for (const key of Object.keys(body.website.socialLinks)) {
        if (!allowedSocialPlatforms.includes(key)) {
          return res.status(400).json({
            success: false,
            message: `Invalid social media platform: ${key}.`,
          });
        }

        const value = body.website.socialLinks[key];

        if (typeof value !== "string") {
          return res.status(400).json({
            success: false,
            message: `Invalid ${key} URL.`,
          });
        }
      }
    }

    // Get existing settings
    const current = await StoreSettings.findOne();

    const currentStore = convertToObject(current?.store);
    const currentOrders = convertToObject(current?.orders);
    const currentNotifications = convertToObject(
      current?.notifications
    );
    const currentWebsite = convertToObject(current?.website);

    const currentSocialLinks = convertToObject(
      current?.website?.socialLinks
    );

    // Merge existing settings with incoming settings
    const merged = {
      store: {
        ...DEFAULT_SETTINGS.store,
        ...currentStore,
        ...(body.store || {}),
      },

      orders: {
        ...DEFAULT_SETTINGS.orders,
        ...currentOrders,
        ...(body.orders || {}),
      },

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...currentNotifications,
        ...(body.notifications || {}),
      },

      website: {
        ...DEFAULT_SETTINGS.website,
        ...currentWebsite,
        ...(body.website || {}),

        socialLinks: {
          ...DEFAULT_SETTINGS.website.socialLinks,
          ...currentSocialLinks,
          ...(body.website?.socialLinks || {}),
        },

        businessHours:
          body.website?.businessHours ??
          currentWebsite.businessHours ??
          DEFAULT_SETTINGS.website.businessHours,
      },
    };

    // ======================================
    // VALIDATIONS
    // ======================================

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Store name
    if (!String(merged.store.storeName || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required.",
      });
    }

    // Store email
    if (
      !emailPattern.test(
        String(merged.store.email || "").trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid store email.",
      });
    }

    // Website name
    if (!String(merged.website.websiteName || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Website name is required.",
      });
    }

    // Website email
    if (
      !emailPattern.test(
        String(merged.website.websiteEmail || "").trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid website email.",
      });
    }

    // At least one payment method must be enabled
    if (
      !merged.orders.codEnabled &&
      !merged.orders.onlinePaymentEnabled
    ) {
      return res.status(400).json({
        success: false,
        message: "At least one payment method must be enabled.",
      });
    }

    // ======================================
    // SOCIAL MEDIA URL VALIDATION
    // ======================================

    const socialLinks = merged.website.socialLinks || {};

    for (const [platform, value] of Object.entries(socialLinks)) {
      const url = String(value || "").trim();

      // Empty social links are allowed
      if (!url) {
        merged.website.socialLinks[platform] = "";
        continue;
      }

      try {
        const parsedUrl = new URL(url);

        if (
          !["http:", "https:"].includes(parsedUrl.protocol) ||
          !parsedUrl.hostname.includes(".")
        ) {
          throw new Error("Invalid URL");
        }

        merged.website.socialLinks[platform] = url;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: `Please enter a valid ${platform} URL.`,
        });
      }
    }

    // ======================================
    // BUSINESS HOURS VALIDATION
    // ======================================

    if (typeof merged.website.businessHours !== "string") {
      return res.status(400).json({
        success: false,
        message: "Business hours must be text.",
      });
    }

    merged.website.businessHours =
      merged.website.businessHours.trim();

    if (merged.website.businessHours.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Business hours cannot exceed 100 characters.",
      });
    }

    // ======================================
    // SAVE SETTINGS TO MONGODB
    // ======================================

    const savedSettings = await StoreSettings.findOneAndUpdate(
      {},
      {
        $set: {
          store: merged.store,
          orders: merged.orders,
          notifications: merged.notifications,
          website: merged.website,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    // ======================================
    // SEND RESPONSE
    // ======================================

    const responseSettings = {
      store: {
        ...DEFAULT_SETTINGS.store,
        ...(savedSettings.store || {}),
      },

      orders: {
        ...DEFAULT_SETTINGS.orders,
        ...(savedSettings.orders || {}),
      },

      notifications: {
        ...DEFAULT_SETTINGS.notifications,
        ...(savedSettings.notifications || {}),
      },

      website: {
        ...DEFAULT_SETTINGS.website,
        ...(savedSettings.website || {}),

        socialLinks: {
          ...DEFAULT_SETTINGS.website.socialLinks,
          ...(savedSettings.website?.socialLinks || {}),
        },

        businessHours:
          savedSettings.website?.businessHours ??
          DEFAULT_SETTINGS.website.businessHours,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Settings saved successfully.",
      settings: responseSettings,
    });
  } catch (error) {
    console.error("Update settings error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save settings.",
      error: error.message,
    });
  }
};

// ==========================================
// EXPORT CONTROLLER FUNCTIONS
// ==========================================

module.exports = {
  getSettings,
  updateSettings,
};
