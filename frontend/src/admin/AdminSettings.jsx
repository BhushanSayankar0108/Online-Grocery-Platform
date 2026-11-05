import { useEffect, useState } from "react";

import {
  Bell,
  Check,
  Globe,
  Lock,
  Save,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react";

import "./AdminSettings.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const INITIAL_STORE_SETTINGS = {
  storeName: "Fresh Grocery",
  email: "support@grocery.com",
  phone: "+91 98765 43210",
  address: "Pimpri-Chinchwad, Maharashtra, India",
  currency: "INR",
  timezone: "Asia/Kolkata",
};

const INITIAL_ORDER_SETTINGS = {
  minimumOrder: "299",
  deliveryCharge: "40",
  freeDeliveryAbove: "799",
  codEnabled: true,
  onlinePaymentEnabled: true,
  autoConfirmOrders: false,
};

const INITIAL_NOTIFICATION_SETTINGS = {
  newOrder: true,
  lowStock: true,
  newCustomer: true,
  newReview: true,
  paymentNotification: true,
  deliveryNotification: true,
};

const INITIAL_WEBSITE_SETTINGS = {
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
};

const DEFAULT_SETTINGS = {
  store: INITIAL_STORE_SETTINGS,
  orders: INITIAL_ORDER_SETTINGS,
  notifications: INITIAL_NOTIFICATION_SETTINGS,
  website: INITIAL_WEBSITE_SETTINGS,
};

// Merge server data with defaults
const mergeSettings = (data = {}) => ({
  store: {
    ...INITIAL_STORE_SETTINGS,
    ...(data.store || {}),
  },

  orders: {
    ...INITIAL_ORDER_SETTINGS,
    ...(data.orders || {}),
  },

  notifications: {
    ...INITIAL_NOTIFICATION_SETTINGS,
    ...(data.notifications || {}),
  },

  website: {
    ...INITIAL_WEBSITE_SETTINGS,
    ...(data.website || {}),

    socialLinks: {
      ...INITIAL_WEBSITE_SETTINGS.socialLinks,
      ...(data.website?.socialLinks || {}),
    },
  },
});

// Get admin authentication token
const getAdminToken = () => {
  const directToken = localStorage.getItem("adminToken");

  if (directToken) {
    try {
      const parsed = JSON.parse(directToken);

      if (typeof parsed === "string") {
        return parsed;
      }

      return (
        parsed?.token ||
        parsed?.accessToken ||
        directToken
      );
    } catch {
      return directToken;
    }
  }

  const possibleKeys = [
    "adminSession",
    "adminUser",
    "admin",
  ];

  for (const key of possibleKeys) {
    try {
      const parsed = JSON.parse(
        localStorage.getItem(key) || "null"
      );

      const token =
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.adminToken ||
        parsed?.data?.token ||
        parsed?.admin?.token;

      if (token) return token;
    } catch {
      // Ignore invalid localStorage data
    }
  }

  return "";
};

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [validationError, setValidationError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const {
    store: storeSettings,
    orders: orderSettings,
    notifications: notificationSettings,
    website: websiteSettings,
  } = settings;

  // Fetch settings from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchSettings = async () => {
      try {
        const token = getAdminToken();

        if (!token) {
          throw new Error(
            "Admin login token was not found. Please log in again."
          );
        }

        const response = await fetch(
          `${API_BASE_URL}/api/settings/admin`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message ||
              "Unable to load settings from the server."
          );
        }

        if (!controller.signal.aborted) {
          setSettings(mergeSettings(result.settings));
          setValidationError("");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch settings error:", error);

          if (!controller.signal.aborted) {
            setValidationError(
              error.message || "Unable to load settings."
            );
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSettings(false);
        }
      }
    };

    fetchSettings();

    return () => controller.abort();
  }, []);

  // Hide success message after 4 seconds
  useEffect(() => {
    if (!saved) return undefined;

    const timer = window.setTimeout(() => {
      setSaved(false);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [saved]);

  // Generic settings updater
  const updateSetting = (section, field, value) => {
    setSettings((previous) => ({
      ...previous,

      [section]: {
        ...previous[section],
        [field]: value,
      },
    }));

    setSaved(false);
    setValidationError("");
  };

  const updateStore = (field, value) =>
    updateSetting("store", field, value);

  const updateOrder = (field, value) =>
    updateSetting("orders", field, value);

  const updateNotification = (field, value) =>
    updateSetting("notifications", field, value);

  const updateWebsite = (field, value) =>
    updateSetting("website", field, value);

  // Update nested social links
  const updateSocialLink = (field, value) => {
    setSettings((previous) => ({
      ...previous,

      website: {
        ...previous.website,

        socialLinks: {
          ...previous.website.socialLinks,
          [field]: value,
        },
      },
    }));

    setSaved(false);
    setValidationError("");
  };

  // Validate settings before saving
  const validateSettings = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneDigits = String(
      storeSettings.phone || ""
    ).replace(/\D/g, "");

    if (!String(storeSettings.storeName || "").trim()) {
      setActiveTab("store");
      return "Please enter a store name.";
    }

    if (
      !emailPattern.test(
        String(storeSettings.email || "").trim()
      )
    ) {
      setActiveTab("store");
      return "Please enter a valid support email address.";
    }

    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15
    ) {
      setActiveTab("store");

      return (
        "Please enter a valid phone number containing " +
        "10 to 15 digits."
      );
    }

    if (!String(storeSettings.address || "").trim()) {
      setActiveTab("store");
      return "Please enter the store address.";
    }

    const minimumOrder = Number(orderSettings.minimumOrder);
    const deliveryCharge = Number(orderSettings.deliveryCharge);
    const freeDeliveryAbove = Number(
      orderSettings.freeDeliveryAbove
    );

    if (
      String(orderSettings.minimumOrder).trim() === "" ||
      !Number.isFinite(minimumOrder) ||
      minimumOrder < 0
    ) {
      setActiveTab("orders");
      return "Minimum order amount must be zero or greater.";
    }

    if (
      String(orderSettings.deliveryCharge).trim() === "" ||
      !Number.isFinite(deliveryCharge) ||
      deliveryCharge < 0
    ) {
      setActiveTab("orders");
      return "Delivery charge must be zero or greater.";
    }

    if (
      String(orderSettings.freeDeliveryAbove).trim() === "" ||
      !Number.isFinite(freeDeliveryAbove) ||
      freeDeliveryAbove < 0
    ) {
      setActiveTab("orders");
      return "Free delivery threshold must be zero or greater.";
    }

    if (
      !orderSettings.codEnabled &&
      !orderSettings.onlinePaymentEnabled
    ) {
      setActiveTab("orders");
      return "Enable at least one payment method.";
    }

    if (!String(websiteSettings.websiteName || "").trim()) {
      setActiveTab("website");
      return "Please enter a website name.";
    }

    if (
      !emailPattern.test(
        String(websiteSettings.websiteEmail || "").trim()
      )
    ) {
      setActiveTab("website");
      return "Please enter a valid website email address.";
    }

    if (
      String(websiteSettings.businessHours || "").length > 100
    ) {
      setActiveTab("website");
      return "Business hours cannot exceed 100 characters.";
    }

    // Validate social profile URLs
    const socialLinks = websiteSettings.socialLinks || {};

    for (const [platform, value] of Object.entries(socialLinks)) {
      const url = String(value || "").trim();

      if (!url) continue;

      try {
        const parsedUrl = new URL(url);

        if (
          !["http:", "https:"].includes(parsedUrl.protocol)
        ) {
          throw new Error("Invalid URL");
        }
      } catch {
        setActiveTab("website");

        return `Please enter a valid ${platform} profile URL.`;
      }
    }

    return "";
  };

  // Save settings
  const handleSave = async () => {
    const error = validateSettings();

    if (error) {
      setValidationError(error);
      setSaved(false);
      return;
    }

    if (saving || loadingSettings) return;

    const token = getAdminToken();

    if (!token) {
      setValidationError(
        "Admin login token was not found. Please log in again."
      );

      setSaved(false);
      return;
    }

    setSaving(true);
    setSaved(false);
    setValidationError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(settings),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Unable to save settings."
        );
      }

      setSettings(mergeSettings(result.settings));
      setLastSavedAt(new Date());
      setSaved(true);
    } catch (error) {
      console.error("Save settings error:", error);

      setValidationError(
        error.message || "Unable to save settings."
      );

      setSaved(false);
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setValidationError("");
  };

  // Reusable toggle switch
  const renderSwitch = (label, checked, onChange) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-switch ${checked ? "active" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );

  // Reusable toggle row
  const renderToggleRow = (
    title,
    description,
    checked,
    onChange,
    extraClass = ""
  ) => (
    <div className={`settings-toggle-row ${extraClass}`}>
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      {renderSwitch(title, checked, onChange)}
    </div>
  );

  return (
    <div className="admin-settings-page">
      <div className="settings-container">

        {/* Header */}
        <div className="settings-header">
          <div className="settings-title-wrapper">
            <div className="settings-title-icon">
              <Settings size={25} />
            </div>

            <div>
              <h1>Settings</h1>

              <p>
                Configure store, order, notification and website settings.
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`settings-save-button ${saved ? "saved" : ""}`}
            onClick={handleSave}
            disabled={saving || loadingSettings}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}

            {loadingSettings
              ? "Loading..."
              : saving
                ? "Saving..."
                : saved
                  ? "Saved"
                  : "Save Changes"}
          </button>
        </div>

        {loadingSettings && (
          <div className="settings-success-message" role="status">
            Loading settings from server...
          </div>
        )}

        {/* Validation Message */}
        {validationError && (
          <div className="settings-validation-error" role="alert">
            <strong>Unable to process settings</strong>
            <p>{validationError}</p>
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <div className="settings-success-message" role="status">
            <Check size={17} />

            <div>
              <strong>Settings saved successfully!</strong>

              <p>
                {lastSavedAt
                  ? `Saved at ${lastSavedAt.toLocaleTimeString("en-IN")}.`
                  : ""}
                {" "}
                Settings are saved in the database.
              </p>
            </div>
          </div>
        )}

        <div className="settings-layout">

          {/* Sidebar */}
          <aside
            className="settings-sidebar"
            aria-label="Settings sections"
          >
            <button
              type="button"
              className={activeTab === "store" ? "active" : ""}
              onClick={() => handleTabChange("store")}
            >
              <Store size={18} />
              Store Settings
            </button>

            <button
              type="button"
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => handleTabChange("orders")}
            >
              <ShoppingCart size={18} />
              Order Settings
            </button>

            <button
              type="button"
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => handleTabChange("notifications")}
            >
              <Bell size={18} />
              Notifications
            </button>

            <button
              type="button"
              className={activeTab === "website" ? "active" : ""}
              onClick={() => handleTabChange("website")}
            >
              <Globe size={18} />
              Website Settings
            </button>
          </aside>

          <main className="settings-content">

            {/* STORE SETTINGS */}
            {activeTab === "store" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Store size={20} />
                  </div>

                  <div>
                    <h2>Store Settings</h2>
                    <p>Manage your grocery store information.</p>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label htmlFor="storeName">Store Name</label>

                    <input
                      id="storeName"
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(e) =>
                        updateStore("storeName", e.target.value)
                      }
                      placeholder="Enter store name"
                      maxLength={100}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="storeEmail">Support Email</label>

                    <input
                      id="storeEmail"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) =>
                        updateStore("email", e.target.value)
                      }
                      placeholder="Enter support email"
                      maxLength={254}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="storePhone">Phone Number</label>

                    <input
                      id="storePhone"
                      type="tel"
                      value={storeSettings.phone}
                      onChange={(e) =>
                        updateStore("phone", e.target.value)
                      }
                      placeholder="Enter phone number"
                      maxLength={20}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="storeCurrency">Currency</label>

                    <select
                      id="storeCurrency"
                      value={storeSettings.currency}
                      onChange={(e) =>
                        updateStore("currency", e.target.value)
                      }
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div className="settings-form-group full-width">
                    <label htmlFor="storeAddress">Store Address</label>

                    <textarea
                      id="storeAddress"
                      value={storeSettings.address}
                      onChange={(e) =>
                        updateStore("address", e.target.value)
                      }
                      placeholder="Enter store address"
                      rows={4}
                      maxLength={500}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="storeTimezone">Timezone</label>

                    <select
                      id="storeTimezone"
                      value={storeSettings.timezone}
                      onChange={(e) =>
                        updateStore("timezone", e.target.value)
                      }
                    >
                      <option value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">
                        America/New_York
                      </option>
                    </select>
                  </div>
                </div>
              </section>
            )}

            {/* ORDER SETTINGS */}
            {activeTab === "orders" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <ShoppingCart size={20} />
                  </div>

                  <div>
                    <h2>Order Settings</h2>
                    <p>
                      Configure order and delivery payment preferences.
                    </p>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label htmlFor="minimumOrder">
                      Minimum Order Amount (₹)
                    </label>

                    <input
                      id="minimumOrder"
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderSettings.minimumOrder}
                      onChange={(e) =>
                        updateOrder("minimumOrder", e.target.value)
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="deliveryCharge">
                      Delivery Charge (₹)
                    </label>

                    <input
                      id="deliveryCharge"
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderSettings.deliveryCharge}
                      onChange={(e) =>
                        updateOrder("deliveryCharge", e.target.value)
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="freeDeliveryAbove">
                      Free Delivery Above (₹)
                    </label>

                    <input
                      id="freeDeliveryAbove"
                      type="number"
                      min="0"
                      step="0.01"
                      value={orderSettings.freeDeliveryAbove}
                      onChange={(e) =>
                        updateOrder("freeDeliveryAbove", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                <div className="settings-section-title">
                  <h3>Payment &amp; Order Options</h3>
                  <p>Enable or disable customer order options.</p>
                </div>

                <div className="settings-toggle-list">
                  {renderToggleRow(
                    "Cash on Delivery",
                    "Allow customers to pay when their order is delivered.",
                    orderSettings.codEnabled,
                    (value) => updateOrder("codEnabled", value)
                  )}

                  {renderToggleRow(
                    "Online Payments",
                    "Allow customers to pay using online payment methods.",
                    orderSettings.onlinePaymentEnabled,
                    (value) =>
                      updateOrder("onlinePaymentEnabled", value)
                  )}

                  {renderToggleRow(
                    "Auto Confirm Orders",
                    "Automatically confirm newly placed orders.",
                    orderSettings.autoConfirmOrders,
                    (value) =>
                      updateOrder("autoConfirmOrders", value)
                  )}
                </div>
              </section>
            )}

            {/* NOTIFICATION SETTINGS */}
            {activeTab === "notifications" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Bell size={20} />
                  </div>

                  <div>
                    <h2>Notification Settings</h2>
                    <p>
                      Choose which events should generate admin notifications.
                    </p>
                  </div>
                </div>

                <div className="settings-toggle-list">
                  {renderToggleRow(
                    "New Order",
                    "Notify admin when a new order is received.",
                    notificationSettings.newOrder,
                    (value) =>
                      updateNotification("newOrder", value)
                  )}

                  {renderToggleRow(
                    "Low Stock Alert",
                    "Notify admin when product inventory reaches the minimum level.",
                    notificationSettings.lowStock,
                    (value) =>
                      updateNotification("lowStock", value)
                  )}

                  {renderToggleRow(
                    "New Customer",
                    "Notify admin when a new customer registers.",
                    notificationSettings.newCustomer,
                    (value) =>
                      updateNotification("newCustomer", value)
                  )}

                  {renderToggleRow(
                    "New Review",
                    "Notify admin when a customer submits a review.",
                    notificationSettings.newReview,
                    (value) =>
                      updateNotification("newReview", value)
                  )}

                  {renderToggleRow(
                    "Payment Notification",
                    "Notify admin about successful or failed payments.",
                    notificationSettings.paymentNotification,
                    (value) =>
                      updateNotification("paymentNotification", value)
                  )}

                  {renderToggleRow(
                    "Delivery Notification",
                    "Notify admin when delivery status changes.",
                    notificationSettings.deliveryNotification,
                    (value) =>
                      updateNotification("deliveryNotification", value)
                  )}
                </div>
              </section>
            )}

            {/* WEBSITE SETTINGS */}
            {activeTab === "website" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Globe size={20} />
                  </div>

                  <div>
                    <h2>Website Settings</h2>
                    <p>
                      Configure public website behaviour and visibility.
                    </p>
                  </div>
                </div>

                {/* Website name and email */}
                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label htmlFor="websiteName">Website Name</label>

                    <input
                      id="websiteName"
                      type="text"
                      value={websiteSettings.websiteName}
                      onChange={(e) =>
                        updateWebsite("websiteName", e.target.value)
                      }
                      placeholder="Enter website name"
                      maxLength={100}
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="websiteEmail">Website Email</label>

                    <input
                      id="websiteEmail"
                      type="email"
                      value={websiteSettings.websiteEmail}
                      onChange={(e) =>
                        updateWebsite("websiteEmail", e.target.value)
                      }
                      placeholder="Enter website email"
                      maxLength={254}
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Social media links */}
                <div className="settings-section-title">
                  <h3>Social Media Links</h3>
                  <p>
                    Add your official social media profile URLs.
                    Leave a field empty to hide its icon from the Footer.
                  </p>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label htmlFor="instagram">
                      Instagram URL
                    </label>

                    <input
                      id="instagram"
                      type="url"
                      value={
                        websiteSettings.socialLinks?.instagram || ""
                      }
                      onChange={(e) =>
                        updateSocialLink("instagram", e.target.value)
                      }
                      placeholder="https://www.instagram.com/yourpage"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="facebook">
                      Facebook URL
                    </label>

                    <input
                      id="facebook"
                      type="url"
                      value={
                        websiteSettings.socialLinks?.facebook || ""
                      }
                      onChange={(e) =>
                        updateSocialLink("facebook", e.target.value)
                      }
                      placeholder="https://www.facebook.com/yourpage"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label htmlFor="xProfile">
                      X (Twitter) URL
                    </label>

                    <input
                      id="xProfile"
                      type="url"
                      value={websiteSettings.socialLinks?.x || ""}
                      onChange={(e) =>
                        updateSocialLink("x", e.target.value)
                      }
                      placeholder="https://x.com/yourpage"
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Business hours */}
                <div className="settings-section-title">
                  <h3>Business Hours</h3>
                  <p>
                    Set the business hours displayed in the public website Footer.
                  </p>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group full-width">
                    <label htmlFor="businessHours">
                      Business Hours
                    </label>

                    <input
                      id="businessHours"
                      type="text"
                      value={websiteSettings.businessHours || ""}
                      onChange={(e) =>
                        updateWebsite("businessHours", e.target.value)
                      }
                      placeholder="Mon - Sun, 9 AM - 9 PM"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                {/* Website controls */}
                <div className="settings-section-title">
                  <h3>Website Controls</h3>
                  <p>
                    Control the visibility and functionality of public website features.
                  </p>
                </div>

                <div className="settings-toggle-list">
                  {renderToggleRow(
                    "Maintenance Mode",
                    "Temporarily disable the public website for maintenance.",
                    websiteSettings.maintenanceMode,
                    (value) =>
                      updateWebsite("maintenanceMode", value),
                    "warning-row"
                  )}

                  {renderToggleRow(
                    "Customer Registration",
                    "Allow new customers to create accounts.",
                    websiteSettings.customerRegistration,
                    (value) =>
                      updateWebsite("customerRegistration", value)
                  )}

                  {renderToggleRow(
                    "Product Reviews",
                    "Display customer product reviews on the website.",
                    websiteSettings.showReviews,
                    (value) =>
                      updateWebsite("showReviews", value)
                  )}

                  {renderToggleRow(
                    "Wishlist",
                    "Allow customers to use the wishlist feature.",
                    websiteSettings.showWishlist,
                    (value) =>
                      updateWebsite("showWishlist", value)
                  )}
                </div>

                {/* Security note */}
                <div className="settings-security-note">
                  <Lock size={18} />

                  <div>
                    <strong>Admin Security</strong>

                    <p>
                      Security credentials and password management are handled
                      through the Admin Management section.
                    </p>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;