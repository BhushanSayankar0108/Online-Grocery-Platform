import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Check,
  Globe,
  Lock,
  Save,
  Settings,
  ShoppingCart,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminSettings.css";

function AdminSettings() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("store");
  const [saved, setSaved] = useState(false);

  const [storeSettings, setStoreSettings] = useState({
    storeName: "Fresh Grocery",
    email: "support@grocery.com",
    phone: "+91 98765 43210",
    address: "Pimpri-Chinchwad, Maharashtra, India",
    currency: "INR",
    timezone: "Asia/Kolkata",
  });

  const [orderSettings, setOrderSettings] = useState({
    minimumOrder: "299",
    deliveryCharge: "40",
    freeDeliveryAbove: "799",
    codEnabled: true,
    onlinePaymentEnabled: true,
    autoConfirmOrders: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrder: true,
    lowStock: true,
    newCustomer: true,
    newReview: true,
    paymentNotification: true,
    deliveryNotification: true,
  });

  const [websiteSettings, setWebsiteSettings] = useState({
    websiteName: "Fresh Grocery",
    websiteEmail: "support@grocery.com",
    maintenanceMode: false,
    customerRegistration: true,
    showReviews: true,
    showWishlist: true,
  });

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const updateStore = (field, value) => {
    setStoreSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateOrder = (field, value) => {
    setOrderSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateNotification = (field, value) => {
    setNotificationSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateWebsite = (field, value) => {
    setWebsiteSettings((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  return (
    <div className="admin-settings-page">
      <div className="settings-container">
        <div className="settings-top-row">
          <button
            className="settings-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>

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
            className={`settings-save-button ${
              saved ? "saved" : ""
            }`}
            onClick={handleSave}
          >
            {saved ? <Check size={18} /> : <Save size={18} />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        <div className="settings-layout">
          <aside className="settings-sidebar">
            <button
              className={activeTab === "store" ? "active" : ""}
              onClick={() => setActiveTab("store")}
            >
              <Store size={18} />
              Store Settings
            </button>

            <button
              className={activeTab === "orders" ? "active" : ""}
              onClick={() => setActiveTab("orders")}
            >
              <ShoppingCart size={18} />
              Order Settings
            </button>

            <button
              className={activeTab === "notifications" ? "active" : ""}
              onClick={() => setActiveTab("notifications")}
            >
              <Bell size={18} />
              Notifications
            </button>

            <button
              className={activeTab === "website" ? "active" : ""}
              onClick={() => setActiveTab("website")}
            >
              <Globe size={18} />
              Website Settings
            </button>
          </aside>

          <main className="settings-content">
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
                    <label>Store Name</label>

                    <input
                      type="text"
                      value={storeSettings.storeName}
                      onChange={(event) =>
                        updateStore(
                          "storeName",
                          event.target.value
                        )
                      }
                      placeholder="Enter store name"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Support Email</label>

                    <input
                      type="email"
                      value={storeSettings.email}
                      onChange={(event) =>
                        updateStore("email", event.target.value)
                      }
                      placeholder="Enter support email"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Phone Number</label>

                    <input
                      type="text"
                      value={storeSettings.phone}
                      onChange={(event) =>
                        updateStore("phone", event.target.value)
                      }
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Currency</label>

                    <select
                      value={storeSettings.currency}
                      onChange={(event) =>
                        updateStore(
                          "currency",
                          event.target.value
                        )
                      }
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div className="settings-form-group full-width">
                    <label>Store Address</label>

                    <textarea
                      value={storeSettings.address}
                      onChange={(event) =>
                        updateStore(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Enter store address"
                      rows="4"
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Timezone</label>

                    <select
                      value={storeSettings.timezone}
                      onChange={(event) =>
                        updateStore(
                          "timezone",
                          event.target.value
                        )
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
                    <label>Minimum Order Amount (₹)</label>

                    <input
                      type="number"
                      min="0"
                      value={orderSettings.minimumOrder}
                      onChange={(event) =>
                        updateOrder(
                          "minimumOrder",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Delivery Charge (₹)</label>

                    <input
                      type="number"
                      min="0"
                      value={orderSettings.deliveryCharge}
                      onChange={(event) =>
                        updateOrder(
                          "deliveryCharge",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Free Delivery Above (₹)</label>

                    <input
                      type="number"
                      min="0"
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

                <div className="settings-divider"></div>

                <div className="settings-section-title">
                  <h3>Payment & Order Options</h3>
                  <p>Enable or disable customer order options.</p>
                </div>

                <div className="settings-toggle-list">
                  <div className="settings-toggle-row">
                    <div>
                      <strong>Cash on Delivery</strong>
                      <span>
                        Allow customers to pay when their order is
                        delivered.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        orderSettings.codEnabled ? "active" : ""
                      }`}
                      onClick={() =>
                        updateOrder(
                          "codEnabled",
                          !orderSettings.codEnabled
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Online Payments</strong>
                      <span>
                        Allow customers to pay using online payment
                        methods.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        orderSettings.onlinePaymentEnabled
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateOrder(
                          "onlinePaymentEnabled",
                          !orderSettings.onlinePaymentEnabled
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Auto Confirm Orders</strong>
                      <span>
                        Automatically confirm newly placed orders.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        orderSettings.autoConfirmOrders
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateOrder(
                          "autoConfirmOrders",
                          !orderSettings.autoConfirmOrders
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>
                </div>
              </section>
            )}

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

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.newOrder
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "newOrder",
                          !notificationSettings.newOrder
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Low Stock Alert</strong>
                      <span>
                        Notify admin when product inventory reaches
                        the minimum level.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.lowStock
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "lowStock",
                          !notificationSettings.lowStock
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>New Customer</strong>
                      <span>
                        Notify admin when a new customer registers.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.newCustomer
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "newCustomer",
                          !notificationSettings.newCustomer
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>New Review</strong>
                      <span>
                        Notify admin when a customer submits a review.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.newReview
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "newReview",
                          !notificationSettings.newReview
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Payment Notification</strong>
                      <span>
                        Notify admin about successful or failed
                        payments.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.paymentNotification
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "paymentNotification",
                          !notificationSettings.paymentNotification
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Delivery Notification</strong>
                      <span>
                        Notify admin when delivery status changes.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        notificationSettings.deliveryNotification
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateNotification(
                          "deliveryNotification",
                          !notificationSettings.deliveryNotification
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>
                </div>
              </section>
            )}

            {activeTab === "website" && (
              <section className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">
                    <Globe size={20} />
                  </div>

                  <div>
                    <h2>Website Settings</h2>
                    <p>
                      Configure public website behaviour and
                      visibility.
                    </p>
                  </div>
                </div>

                <div className="settings-form-grid">
                  <div className="settings-form-group">
                    <label>Website Name</label>

                    <input
                      type="text"
                      value={websiteSettings.websiteName}
                      onChange={(event) =>
                        updateWebsite(
                          "websiteName",
                          event.target.value
                        )
                      }
                    />
                  </div>

                  <div className="settings-form-group">
                    <label>Website Email</label>

                    <input
                      type="email"
                      value={websiteSettings.websiteEmail}
                      onChange={(event) =>
                        updateWebsite(
                          "websiteEmail",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div className="settings-divider"></div>

                <div className="settings-section-title">
                  <h3>Website Controls</h3>
                  <p>
                    Control the visibility and functionality of
                    public website features.
                  </p>
                </div>

                <div className="settings-toggle-list">
                  <div className="settings-toggle-row warning-row">
                    <div>
                      <strong>Maintenance Mode</strong>
                      <span>
                        Temporarily disable the public website for
                        maintenance.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        websiteSettings.maintenanceMode
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateWebsite(
                          "maintenanceMode",
                          !websiteSettings.maintenanceMode
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Customer Registration</strong>
                      <span>
                        Allow new customers to create accounts.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        websiteSettings.customerRegistration
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateWebsite(
                          "customerRegistration",
                          !websiteSettings.customerRegistration
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Product Reviews</strong>
                      <span>
                        Display customer product reviews on the
                        website.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        websiteSettings.showReviews
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateWebsite(
                          "showReviews",
                          !websiteSettings.showReviews
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>

                  <div className="settings-toggle-row">
                    <div>
                      <strong>Wishlist</strong>
                      <span>
                        Allow customers to use the wishlist feature.
                      </span>
                    </div>

                    <button
                      type="button"
                      className={`settings-switch ${
                        websiteSettings.showWishlist
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        updateWebsite(
                          "showWishlist",
                          !websiteSettings.showWishlist
                        )
                      }
                    >
                      <span></span>
                    </button>
                  </div>
                </div>

                <div className="settings-security-note">
                  <Lock size={18} />

                  <div>
                    <strong>Admin Security</strong>
                    <p>
                      Security credentials and password management
                      will be handled through the Admin Management
                      section.
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