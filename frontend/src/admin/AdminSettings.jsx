import { useState } from "react";
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
};

function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const [storeSettings, setStoreSettings] = useState(
    INITIAL_STORE_SETTINGS
  );

  const [orderSettings, setOrderSettings] = useState(
    INITIAL_ORDER_SETTINGS
  );

  const [notificationSettings, setNotificationSettings] =
    useState(INITIAL_NOTIFICATION_SETTINGS);

  const [websiteSettings, setWebsiteSettings] = useState(
    INITIAL_WEBSITE_SETTINGS
  );

  const updateStore = (field, value) => {
    setStoreSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
    setValidationError("");
  };

  const updateOrder = (field, value) => {
    setOrderSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
    setValidationError("");
  };

  const updateNotification = (field, value) => {
    setNotificationSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
    setValidationError("");
  };

  const updateWebsite = (field, value) => {
    setWebsiteSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
    setSaved(false);
    setValidationError("");
  };

  const validateSettings = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = storeSettings.phone.replace(/\D/g, "");

    if (!storeSettings.storeName.trim()) {
      setActiveTab("store");
      return "Please enter a store name.";
    }

    if (!emailPattern.test(storeSettings.email.trim())) {
      setActiveTab("store");
      return "Please enter a valid support email address.";
    }

    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      setActiveTab("store");
      return "Please enter a valid phone number containing 10 to 15 digits.";
    }

    if (!storeSettings.address.trim()) {
      setActiveTab("store");
      return "Please enter the store address.";
    }

    const minimumOrder = Number(orderSettings.minimumOrder);
    const deliveryCharge = Number(orderSettings.deliveryCharge);
    const freeDeliveryAbove = Number(orderSettings.freeDeliveryAbove);

    if (
      orderSettings.minimumOrder.trim() === "" ||
      !Number.isFinite(minimumOrder) ||
      minimumOrder < 0
    ) {
      setActiveTab("orders");
      return "Minimum order amount must be zero or greater.";
    }

    if (
      orderSettings.deliveryCharge.trim() === "" ||
      !Number.isFinite(deliveryCharge) ||
      deliveryCharge < 0
    ) {
      setActiveTab("orders");
      return "Delivery charge must be zero or greater.";
    }

    if (
      orderSettings.freeDeliveryAbove.trim() === "" ||
      !Number.isFinite(freeDeliveryAbove) ||
      freeDeliveryAbove < 0
    ) {
      setActiveTab("orders");
      return "Free delivery threshold must be zero or greater.";
    }

    if (!orderSettings.codEnabled && !orderSettings.onlinePaymentEnabled) {
      setActiveTab("orders");
      return "Enable at least one payment method.";
    }

    if (!websiteSettings.websiteName.trim()) {
      setActiveTab("website");
      return "Please enter a website name.";
    }

    if (!emailPattern.test(websiteSettings.websiteEmail.trim())) {
      setActiveTab("website");
      return "Please enter a valid website email address.";
    }

    return "";
  };

  const handleSave = () => {
    const error = validateSettings();

    if (error) {
      setValidationError(error);
      setSaved(false);
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to save these settings?"
    );

    if (!confirmed) {
      return;
    }

    // Frontend demonstration only.
    // Persistent saving will be implemented with the backend later.
    setValidationError("");
    setSaved(true);
    setLastSavedAt(new Date());

    window.setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  const handleTabChange = (nextTab) => {
    if (nextTab === activeTab) {
      return;
    }

    setActiveTab(nextTab);
    setValidationError("");
  };

  const handleToggle = (label, currentValue, onChange) => {
    const nextValue = !currentValue;

    const confirmed = window.confirm(
      nextValue
        ? `Are you sure you want to enable ${label}?`
        : `Are you sure you want to disable ${label}?`
    );

    if (confirmed) {
      onChange(nextValue);
    }
  };

  const renderSwitch = (label, checked, onChange) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={`settings-switch ${checked ? "active" : ""}`}
      onClick={() => handleToggle(label, checked, onChange)}
    >
      <span />
    </button>
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
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        {validationError && (
          <div className="settings-validation-error" role="alert">
            <strong>Unable to save settings</strong>
            <p>{validationError}</p>
          </div>
        )}

        {saved && (
          <div className="settings-success-message" role="status">
            <Check size={17} />
            <div>
              <strong>Settings saved in the current session.</strong>
              <p>
                {lastSavedAt
                  ? `Confirmed at ${lastSavedAt.toLocaleTimeString("en-IN")}.`
                  : ""}
                {" "}These changes are not yet stored in the database.
              </p>
            </div>
          </div>
        )}

        <div className="settings-layout">
          {/* Settings Navigation */}
          <aside className="settings-sidebar" aria-label="Settings sections">
            <button
              type="button"
              className={activeTab === "store" ? "active" : ""}
              aria-current={activeTab === "store" ? "page" : undefined}
              onClick={() => handleTabChange("store")}
            >
              <Store size={18} />
              Store Settings
            </button>

            <button
              type="button"
              className={activeTab === "orders" ? "active" : ""}
              aria-current={activeTab === "orders" ? "page" : undefined}
              onClick={() => handleTabChange("orders")}
            >
              <ShoppingCart size={18} />
              Order Settings
            </button>

            <button
              type="button"
              className={activeTab === "notifications" ? "active" : ""}
              aria-current={
                activeTab === "notifications" ? "page" : undefined
              }
              onClick={() => handleTabChange("notifications")}
            >
              <Bell size={18} />
              Notifications
            </button>

            <button
              type="button"
              className={activeTab === "website" ? "active" : ""}
              aria-current={activeTab === "website" ? "page" : undefined}
              onClick={() => handleTabChange("website")}
            >
              <Globe size={18} />
              Website Settings
            </button>
          </aside>

          <main className="settings-content">
            {/* Store Settings */}
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
                      onChange={(event) =>
                        updateStore("storeName", event.target.value)
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
                      onChange={(event) =>
                        updateStore("email", event.target.value)
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
                      onChange={(event) =>
                        updateStore("phone", event.target.value)
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
                      onChange={(event) =>
                        updateStore("currency", event.target.value)
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
                      onChange={(event) =>
                        updateStore("address", event.target.value)
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
                      onChange={(event) =>
                        updateStore("timezone", event.target.value)
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

            {/* Order Settings */}
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
                      onChange={(event) =>
                        updateOrder("minimumOrder", event.target.value)
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
                      onChange={(event) =>
                        updateOrder("deliveryCharge", event.target.value)
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
                      onChange={(event) =>
                        updateOrder(
                          "freeDeliveryAbove",
                          event.target.value
                        )
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
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Cash on Delivery</strong>
                      <span>
                        Allow customers to pay when their order is delivered.
                      </span>
                    </div>

                    {renderSwitch(
                      "Cash on Delivery",
                      orderSettings.codEnabled,
                      (value) => updateOrder("codEnabled", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Online Payments</strong>
                      <span>
                        Allow customers to pay using online payment methods.
                      </span>
                    </div>

                    {renderSwitch(
                      "Online Payments",
                      orderSettings.onlinePaymentEnabled,
                      (value) =>
                        updateOrder("onlinePaymentEnabled", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Auto Confirm Orders</strong>
                      <span>
                        Automatically confirm newly placed orders.
                      </span>
                    </div>

                    {renderSwitch(
                      "Auto Confirm Orders",
                      orderSettings.autoConfirmOrders,
                      (value) =>
                        updateOrder("autoConfirmOrders", value)
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Notification Settings */}
            {activeTab === "notifications" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Bell size={20} />
                  </div>

                  <div>
                    <h2>Notification Settings</h2>
                    <p>
                      Choose which events should generate admin
                      notifications.
                    </p>
                  </div>
                </div>

                <div className="settings-toggle-list">
                  <div className="settings-toggle-row">
                    <div>
                      <strong>New Order</strong>
                      <span>
                        Notify admin when a new order is received.
                      </span>
                    </div>

                    {renderSwitch(
                      "New Order Notifications",
                      notificationSettings.newOrder,
                      (value) => updateNotification("newOrder", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Low Stock Alert</strong>
                      <span>
                        Notify admin when product inventory reaches the
                        minimum level.
                      </span>
                    </div>

                    {renderSwitch(
                      "Low Stock Notifications",
                      notificationSettings.lowStock,
                      (value) => updateNotification("lowStock", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>New Customer</strong>
                      <span>
                        Notify admin when a new customer registers.
                      </span>
                    </div>

                    {renderSwitch(
                      "New Customer Notifications",
                      notificationSettings.newCustomer,
                      (value) => updateNotification("newCustomer", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>New Review</strong>
                      <span>
                        Notify admin when a customer submits a review.
                      </span>
                    </div>

                    {renderSwitch(
                      "New Review Notifications",
                      notificationSettings.newReview,
                      (value) => updateNotification("newReview", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Payment Notification</strong>
                      <span>
                        Notify admin about successful or failed payments.
                      </span>
                    </div>

                    {renderSwitch(
                      "Payment Notifications",
                      notificationSettings.paymentNotification,
                      (value) =>
                        updateNotification("paymentNotification", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Delivery Notification</strong>
                      <span>
                        Notify admin when delivery status changes.
                      </span>
                    </div>

                    {renderSwitch(
                      "Delivery Notifications",
                      notificationSettings.deliveryNotification,
                      (value) =>
                        updateNotification("deliveryNotification", value)
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Website Settings */}
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

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label htmlFor="websiteName">Website Name</label>
                    <input
                      id="websiteName"
                      type="text"
                      value={websiteSettings.websiteName}
                      onChange={(event) =>
                        updateWebsite("websiteName", event.target.value)
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
                      onChange={(event) =>
                        updateWebsite("websiteEmail", event.target.value)
                      }
                      placeholder="Enter website email"
                      maxLength={254}
                    />
                  </div>
                </div>

                <div className="settings-divider" />

                <div className="settings-section-title">
                  <h3>Website Controls</h3>
                  <p>
                    Control the visibility and functionality of public
                    website features.
                  </p>
                </div>

                <div className="settings-toggle-list">
                  <div className="settings-toggle-row warning-row">
                    <div>
                      <strong>Maintenance Mode</strong>
                      <span>
                        Temporarily disable the public website for
                        maintenance. This setting requires backend
                        integration to affect visitors.
                      </span>
                    </div>

                    {renderSwitch(
                      "Maintenance Mode",
                      websiteSettings.maintenanceMode,
                      (value) => updateWebsite("maintenanceMode", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Customer Registration</strong>
                      <span>
                        Allow new customers to create accounts.
                      </span>
                    </div>

                    {renderSwitch(
                      "Customer Registration",
                      websiteSettings.customerRegistration,
                      (value) =>
                        updateWebsite("customerRegistration", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Product Reviews</strong>
                      <span>
                        Display customer product reviews on the website.
                      </span>
                    </div>

                    {renderSwitch(
                      "Product Reviews",
                      websiteSettings.showReviews,
                      (value) => updateWebsite("showReviews", value)
                    )}
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Wishlist</strong>
                      <span>
                        Allow customers to use the wishlist feature.
                      </span>
                    </div>

                    {renderSwitch(
                      "Wishlist",
                      websiteSettings.showWishlist,
                      (value) => updateWebsite("showWishlist", value)
                    )}
                  </div>
                </div>

                <div className="settings-security-note">
                  <Lock size={18} />

                  <div>
                    <strong>Admin Security</strong>
                    <p>
                      Security credentials and password management are
                      handled through the Admin Management section.
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