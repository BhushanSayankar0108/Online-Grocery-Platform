
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Package,
  Tag,
  Check,
  Trash2,
  ArrowRight,
  CheckCheck,
  RefreshCw,
  CreditCard,
  Truck,
  User,
  AlertCircle,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

// Get customer authentication token

const getCustomerToken = () => {
  const extractToken = (session) => {
    if (!session) return "";

    return (
      session.token ||
      session.accessToken ||
      session.jwt ||
      session.customer?.token ||
      session.customer?.accessToken ||
      session.customer?.jwt ||
      ""
    );
  };

  // Check direct token
  const directToken =
    localStorage.getItem("customerToken") ||
    sessionStorage.getItem("customerToken");

  if (directToken) return directToken;

  // Check persistent customer session
  try {
    const localSession = JSON.parse(
      localStorage.getItem("customerSession") || "null"
    );

    const localToken = extractToken(localSession);

    if (localToken) return localToken;
  } catch (error) {
    console.error("Unable to read local customer session:", error);
  }

  // Check temporary browser-tab customer session
  try {
    const temporarySession = JSON.parse(
      sessionStorage.getItem("customerSession") || "null"
    );

    const temporaryToken = extractToken(temporarySession);

    if (temporaryToken) return temporaryToken;
  } catch (error) {
    console.error("Unable to read temporary customer session:", error);
  }

  return "";
};


// Notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case "marketing":
      return <Tag size={21} strokeWidth={1.8} />;

    case "payment":
      return <CreditCard size={21} strokeWidth={1.8} />;

    case "delivery":
      return <Truck size={21} strokeWidth={1.8} />;

    case "customer":
      return <User size={21} strokeWidth={1.8} />;

    case "inventory":
    case "order":
      return <Package size={21} strokeWidth={1.8} />;

    default:
      return <Bell size={21} strokeWidth={1.8} />;
  }
};

// Notification type label
const getTypeLabel = (type) => {
  const labels = {
    order: "Order",
    inventory: "Inventory",
    customer: "Account",
    payment: "Payment",
    review: "Review",
    delivery: "Delivery",
    marketing: "Offer",
    system: "System",
  };

  return labels[type] || "Notification";
};

// Format notification date
const formatNotificationTime = (date) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  const seconds = Math.floor(
    (Date.now() - parsedDate.getTime()) / 1000
  );

  if (seconds < 60 && seconds >= 0) return "Just now";

  if (seconds < 3600 && seconds >= 0) {
    return `${Math.floor(seconds / 60)} minutes ago`;
  }

  if (seconds < 86400 && seconds >= 0) {
    return `${Math.floor(seconds / 3600)} hours ago`;
  }

  if (seconds < 604800 && seconds >= 0) {
    return `${Math.floor(seconds / 86400)} days ago`;
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Normalize backend notification response
const normalizeNotification = (item) => ({
  ...item,
  id: String(item._id || item.id),
  title: item.title || "Notification",
  message: item.message || "",
  type: item.notificationType || item.type || "system",
  date: item.created_at || item.createdAt,
  isRead: Boolean(item.isRead),
});

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const token = getCustomerToken();

  // Common API request handler
  const apiRequest = useCallback(
    async (url, options = {}) => {
      if (!token) {
        throw new Error("Please log in to view your notifications.");
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(options.headers || {}),
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your session has expired. Please log in again."
          );
        }

        throw new Error(
          data.message || `Request failed (${response.status}).`
        );
      }

      return data;
    },
    [token]
  );

  // Fetch customer notifications
  // Important: State updates happen only after the API request resolves.
  const fetchNotifications = useCallback(async () => {
    try {
      const data = await apiRequest(
        `${API_BASE_URL}/api/notifications/customer?page=1&limit=100`
      );

      const records = (data.notifications || []).map(
        normalizeNotification
      );

      setNotifications(records);

      setUnreadCount(
        Number.isFinite(Number(data.unreadCount))
          ? Number(data.unreadCount)
          : records.filter((item) => !item.isRead).length
      );

      setError("");
    } catch (err) {
      console.error("Fetch customer notifications error:", err);

      setError(
        err.message || "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  // Initial API call
  // Initial API call
useEffect(() => {
  const timer = setTimeout(() => {
    fetchNotifications();
  }, 0);

  return () => clearTimeout(timer);
}, [fetchNotifications]);

  // Retry handler
  const handleRetry = () => {
    setLoading(true);
    fetchNotifications();
  };

  // Mark one notification as read
  const markAsRead = async (notification) => {
    if (notification.isRead || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/customer/${notification.id}/read`,
        { method: "PATCH" }
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? { ...item, isRead: true }
            : item
        )
      );

      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Mark notification read error:", err);

      setError(
        err.message || "Unable to update notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (unreadCount === 0 || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/customer/read-all`,
        { method: "PATCH" }
      );

      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          isRead: true,
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all notifications read error:", err);

      setError(
        err.message || "Unable to update notifications."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (notification) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/customer/${notification.id}`,
        { method: "DELETE" }
      );

      setNotifications((current) =>
        current.filter((item) => item.id !== notification.id)
      );

      if (!notification.isRead) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
    } catch (err) {
      console.error("Delete notification error:", err);

      setError(
        err.message || "Unable to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate unread notifications
  const displayedUnreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <header className="notifications-header">
          <Link to="/account" className="shop-home-link">
            ← Back to Account
          </Link>

          <p className="notifications-breadcrumb">
            Home / Account / Notifications
          </p>

          <span className="notifications-eyebrow">
            ACCOUNT UPDATES
          </span>

          <div className="notifications-title-row">
            <div>
              <h1>Stay in the loop.</h1>

              <p>
                Keep track of your orders, offers and important
                account updates.
              </p>
            </div>

            {displayedUnreadCount > 0 && (
              <button
                type="button"
                className="mark-all-button"
                onClick={markAllAsRead}
                disabled={actionLoading}
              >
                <CheckCheck size={16} />
                Mark All as Read
              </button>
            )}
          </div>

          {!loading && !error && notifications.length > 0 && (
            <div className="notifications-summary">
              <Bell size={17} />

              <span>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${
                      unreadCount > 1 ? "s" : ""
                    }`
                  : "You're all caught up"}
              </span>
            </div>
          )}
        </header>

        {error && (
          <div className="notifications-error" role="alert">
            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <section className="notifications-content">
          {loading ? (
            <div className="notifications-empty">
              <RefreshCw
                size={28}
                className="animate-spin"
              />

              <h2>Loading notifications...</h2>

              <p>
                Please wait while we fetch your updates.
              </p>
            </div>
          ) : !token ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <User size={30} strokeWidth={1.7} />
              </div>

              <h2>Please log in</h2>

              <p>
                Log in to your customer account to view your
                notifications.
              </p>

              <Link
                to="/login"
                className="notifications-shop-button"
              >
                Login to Account
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notifications-empty">
              <div className="notifications-empty-icon">
                <Bell size={30} strokeWidth={1.7} />
              </div>

              <span>ALL CAUGHT UP</span>

              <h2>No notifications right now</h2>

              <p>
                We'll let you know when there is something important
                to share.
              </p>

              <Link
                to="/shop"
                className="notifications-shop-button"
              >
                Continue Shopping
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <article
                  className={`notification-card ${
                    !notification.isRead ? "unread" : ""
                  }`}
                  key={notification.id}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="notification-details">
                    <div className="notification-top">
                      <div>
                        <span className="notification-type">
                          {getTypeLabel(notification.type)}
                        </span>

                        <h2>{notification.title}</h2>
                      </div>

                      {!notification.isRead && (
                        <span
                          className="unread-dot"
                          aria-label="Unread"
                        />
                      )}
                    </div>

                    <p>{notification.message}</p>

                    <span className="notification-time">
                      {formatNotificationTime(notification.date)}
                    </span>

                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notification)}
                          disabled={actionLoading}
                        >
                          <Check size={15} />
                          Mark as Read
                        </button>
                      )}

                      <button
                        type="button"
                        className="notification-delete"
                        onClick={() =>
                          deleteNotification(notification)
                        }
                        disabled={actionLoading}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Notifications;
