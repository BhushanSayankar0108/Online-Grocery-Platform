
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Bell,
  Check,
  ChevronDown,
  Eye,
  Search,
  Trash2,
  X,
  Send,
  Megaphone,
} from "lucide-react";

import "./AdminNotifications.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const TYPE_LABELS = {
  order: "Order",
  inventory: "Inventory",
  customer: "Customer",
  payment: "Payment",
  review: "Review",
  delivery: "Delivery",
  marketing: "Marketing",
  system: "System",
};

// =====================================================
// API HELPERS
// =====================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");

  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
};

const apiRequest = async (url, options = {}) => {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin session not found. Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed with status ${response.status}.`
    );
  }

  return data;
};

// =====================================================
// NORMALIZE NOTIFICATION
// =====================================================

const normalizeNotification = (item) => ({
  ...item,
  id: String(item._id || item.id),
  title: item.title || "Notification",
  message: item.message || "",
  type: item.notificationType || item.type || "system",
  audience: "Admin",
  date: item.created_at || item.createdAt || item.date,
  status: item.isRead ? "read" : "unread",
});

// =====================================================
// DATE FORMATTER
// =====================================================

const formatDate = (date, options) => {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString("en-IN", options);
};

// =====================================================
// MAIN COMPONENT
// =====================================================

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedNotification, setSelectedNotification] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Broadcast form states
  const [showBroadcastForm, setShowBroadcastForm] = useState(false);

  const [broadcastData, setBroadcastData] = useState({
    title: "",
    message: "",
    notificationType: "marketing",
  });

  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastError, setBroadcastError] = useState("");
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  // =====================================================
  // FETCH ADMIN NOTIFICATIONS
  // =====================================================

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: "1",
        limit: "100",
      });

      if (typeFilter !== "all") {
        params.set("type", typeFilter);
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const data = await apiRequest(
        `${API_BASE_URL}/api/notifications/admin?${params.toString()}`
      );

      const records = (data.notifications || []).map(
        normalizeNotification
      );

      setNotifications(records);

      setSelectedNotification((previous) => {
        if (!previous) return null;

        return (
          records.find((item) => item.id === previous.id) || null
        );
      });
    } catch (err) {
      console.error("Fetch admin notifications error:", err);
      setError(err.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchNotifications]);

  // =====================================================
  // SEARCH AND FILTER
  // =====================================================

  const filteredNotifications = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return notifications.filter((notification) => {
      return (
        !search ||
        notification.title.toLowerCase().includes(search) ||
        notification.message.toLowerCase().includes(search) ||
        notification.audience.toLowerCase().includes(search)
      );
    });
  }, [notifications, searchTerm]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const unread = notifications.filter(
      (item) => item.status === "unread"
    ).length;

    return {
      total: notifications.length,
      unread,
      read: notifications.length - unread,
      orderAlerts: notifications.filter(
        (item) => item.type === "order"
      ).length,
    };
  }, [notifications]);

  const getTypeLabel = (type) => TYPE_LABELS[type] || type;

  // =====================================================
  // UPDATE NOTIFICATION STATUS
  // =====================================================

  const updateNotificationStatus = async (
    notification,
    nextStatus
  ) => {
    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/admin/${notification.id}/read`,
        {
          method: "PATCH",
          body: JSON.stringify({
            isRead: nextStatus === "read",
          }),
        }
      );

      const updated = {
        ...notification,
        status: nextStatus,
        isRead: nextStatus === "read",
      };

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id ? updated : item
        )
      );

      setSelectedNotification((previous) =>
        previous?.id === notification.id ? updated : previous
      );
    } catch (err) {
      console.error("Update notification error:", err);
      setError(err.message || "Unable to update notification.");
    } finally {
      setActionLoading(false);
    }
  };

  const markAsRead = (notification) => {
    if (notification.status !== "read") {
      updateNotificationStatus(notification, "read");
    }
  };

  const toggleNotificationStatus = (notification) => {
    const nextStatus =
      notification.status === "unread" ? "read" : "unread";

    updateNotificationStatus(notification, nextStatus);
  };

  // =====================================================
  // DELETE NOTIFICATION
  // =====================================================

  const deleteNotification = async (notification) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${notification.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/admin/${notification.id}`,
        {
          method: "DELETE",
        }
      );

      setNotifications((previous) =>
        previous.filter((item) => item.id !== notification.id)
      );

      setSelectedNotification((previous) =>
        previous?.id === notification.id ? null : previous
      );
    } catch (err) {
      console.error("Delete notification error:", err);
      setError(err.message || "Unable to delete notification.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CLEAR SEARCH
  // =====================================================

  const clearSearch = () => {
    setSearchTerm("");
  };

  // =====================================================
  // OPEN NOTIFICATION
  // =====================================================

  const openNotification = (notification) => {
    setSelectedNotification(notification);

    if (notification.status === "unread") {
      markAsRead(notification);
    }
  };

  // =====================================================
  // MARK ALL ADMIN NOTIFICATIONS AS READ
  // =====================================================

  const markAllAsRead = async () => {
    if (stats.unread === 0 || actionLoading) return;

    const confirmed = window.confirm(
      `Mark all ${stats.unread} unread notifications as read?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await apiRequest(
        `${API_BASE_URL}/api/notifications/admin/read-all`,
        {
          method: "PATCH",
        }
      );

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          status: "read",
          isRead: true,
        }))
      );

      setSelectedNotification((previous) =>
        previous
          ? { ...previous, status: "read", isRead: true }
          : null
      );
    } catch (err) {
      console.error("Mark all notifications read error:", err);
      setError(err.message || "Unable to update notifications.");
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // SEND NOTIFICATION TO ALL ACTIVE CUSTOMERS
  // =====================================================

  const handleBroadcastSubmit = async (event) => {
    event.preventDefault();

    if (broadcastLoading) return;

    const title = broadcastData.title.trim();
    const message = broadcastData.message.trim();

    if (!title || !message) {
      setBroadcastError("Please enter both title and message.");
      return;
    }

    if (title.length > 150) {
      setBroadcastError("Title cannot exceed 150 characters.");
      return;
    }

    if (message.length > 2000) {
      setBroadcastError("Message cannot exceed 2000 characters.");
      return;
    }

    try {
      setBroadcastLoading(true);
      setBroadcastError("");
      setBroadcastSuccess("");

      const response = await apiRequest(
        `${API_BASE_URL}/api/notifications/admin/broadcast`,
        {
          method: "POST",
          body: JSON.stringify({
            title,
            message,
            notificationType: broadcastData.notificationType,
          }),
        }
      );

      const sentCount = Number(response.sentCount || 0);

      setBroadcastSuccess(
        response.message ||
          `Notification successfully sent to ${sentCount} active customers.`
      );

      setBroadcastData({
        title: "",
        message: "",
        notificationType: "marketing",
      });

      setShowBroadcastForm(false);
    } catch (err) {
      console.error("Customer broadcast error:", err);

      setBroadcastError(
        err.message || "Unable to send customer notification."
      );
    } finally {
      setBroadcastLoading(false);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="admin-notifications-page">
      <div className="admin-notifications-container">

        {/* HEADER */}

        <div className="admin-notifications-header">
          <div>
            <p className="admin-notifications-eyebrow">
              Communication Center
            </p>

            <h1>Notifications</h1>

            <p className="admin-notifications-header-text">
              View and manage important alerts and system notifications.
            </p>
          </div>

          <div className="admin-notifications-header-actions">
            <button
              type="button"
              className="admin-broadcast-open-btn"
              onClick={() => {
                setShowBroadcastForm((previous) => !previous);
                setBroadcastError("");
                setBroadcastSuccess("");
              }}
            >
              <Megaphone size={17} />
              Send Notification
            </button>

            {stats.unread > 0 && (
              <button
                type="button"
                className="admin-notifications-mark-all"
                onClick={markAllAsRead}
                disabled={actionLoading}
              >
                <Check size={16} />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* BROADCAST SUCCESS */}

        {broadcastSuccess && (
          <div className="admin-broadcast-success" role="status">
            <Check size={18} />
            <span>{broadcastSuccess}</span>

            <button
              type="button"
              onClick={() => setBroadcastSuccess("")}
              aria-label="Dismiss success message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* CUSTOMER BROADCAST FORM */}

        {showBroadcastForm && (
          <div className="admin-broadcast-card">
            <div className="admin-broadcast-card-header">
              <div>
                <h2>
                  <Megaphone size={20} />
                  Send Customer Notification
                </h2>

                <p>
                  Send an announcement to all active customers.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowBroadcastForm(false)}
                aria-label="Close broadcast form"
              >
                <X size={19} />
              </button>
            </div>

            {broadcastError && (
              <div className="admin-broadcast-error" role="alert">
                {broadcastError}
              </div>
            )}

            <form onSubmit={handleBroadcastSubmit}>
              <div className="admin-broadcast-field">
                <label htmlFor="broadcast-title">
                  Notification Title *
                </label>

                <input
                  id="broadcast-title"
                  type="text"
                  placeholder="Enter notification title"
                  maxLength={150}
                  value={broadcastData.title}
                  onChange={(event) =>
                    setBroadcastData((previous) => ({
                      ...previous,
                      title: event.target.value,
                    }))
                  }
                  required
                />

                <small>
                  {broadcastData.title.length}/150 characters
                </small>
              </div>

              <div className="admin-broadcast-field">
                <label htmlFor="broadcast-message">
                  Notification Message *
                </label>

                <textarea
                  id="broadcast-message"
                  placeholder="Write your notification message..."
                  rows={4}
                  maxLength={2000}
                  value={broadcastData.message}
                  onChange={(event) =>
                    setBroadcastData((previous) => ({
                      ...previous,
                      message: event.target.value,
                    }))
                  }
                  required
                />

                <small>
                  {broadcastData.message.length}/2000 characters
                </small>
              </div>

              <div className="admin-broadcast-field">
                <label htmlFor="broadcast-type">
                  Notification Type *
                </label>

                <select
                  id="broadcast-type"
                  value={broadcastData.notificationType}
                  onChange={(event) =>
                    setBroadcastData((previous) => ({
                      ...previous,
                      notificationType: event.target.value,
                    }))
                  }
                >
                  <option value="marketing">Marketing / Offers</option>
                  <option value="system">System Announcement</option>
                  <option value="inventory">Inventory Update</option>
                  <option value="customer">Customer Account</option>
                  <option value="order">Order Update</option>
                  <option value="payment">Payment Update</option>
                  <option value="delivery">Delivery Update</option>
                  <option value="review">Review Update</option>
                </select>
              </div>

              <div className="admin-broadcast-note">
                <Bell size={16} />
                This notification will be sent to all active customers.
              </div>

              <div className="admin-broadcast-actions">
                <button
                  type="button"
                  className="admin-broadcast-cancel"
                  onClick={() => setShowBroadcastForm(false)}
                  disabled={broadcastLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-broadcast-submit"
                  disabled={broadcastLoading}
                >
                  {broadcastLoading ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={16} />
                      Send to Customers
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* API ERROR */}

        {error && (
          <div className="admin-notifications-error" role="alert">
            <span>{error}</span>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="admin-notifications-stats">
          <div className="admin-notifications-stat-card">
            <div className="admin-notifications-stat-icon">
              <Bell size={20} />
            </div>

            <div>
              <span>Total Notifications</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="admin-notifications-stat-card">
            <div className="admin-notifications-stat-icon">
              <Bell size={20} />
            </div>

            <div>
              <span>Unread</span>
              <strong>{stats.unread}</strong>
            </div>
          </div>

          <div className="admin-notifications-stat-card">
            <div className="admin-notifications-stat-icon">
              <Check size={20} />
            </div>

            <div>
              <span>Read</span>
              <strong>{stats.read}</strong>
            </div>
          </div>

          <div className="admin-notifications-stat-card">
            <div className="admin-notifications-stat-icon">
              <Bell size={20} />
            </div>

            <div>
              <span>Order Alerts</span>
              <strong>{stats.orderAlerts}</strong>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="admin-notifications-toolbar">
          <div className="admin-notifications-search">
            <Search size={17} />

            <input
              type="search"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search notifications"
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-notifications-clear-search"
                onClick={clearSearch}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-notifications-filter">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filter by notification type"
            >
              <option value="all">All Types</option>
              <option value="order">Order</option>
              <option value="inventory">Inventory</option>
              <option value="customer">Customer</option>
              <option value="payment">Payment</option>
              <option value="review">Review</option>
              <option value="delivery">Delivery</option>
              <option value="marketing">Marketing</option>
              <option value="system">System</option>
            </select>

            <ChevronDown size={16} />
          </div>

          <div className="admin-notifications-filter">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by notification status"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <ChevronDown size={16} />
          </div>
        </div>

        {/* NOTIFICATIONS TABLE */}

        <div className="admin-notifications-table-card">
          <div className="admin-notifications-table-header">
            <div>
              <h2>Notification Center</h2>

              <p>
                {loading
                  ? "Loading notifications..."
                  : `${filteredNotifications.length} notification${
                      filteredNotifications.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>
          </div>

          <div className="admin-notifications-table-wrapper">
            <table className="admin-notifications-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Notification</th>
                  <th>Type</th>
                  <th>Audience</th>
                  <th>Date &amp; Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="notifications-empty-state">
                      <p>Loading notifications...</p>
                    </td>
                  </tr>
                ) : filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification, index) => (
                    <tr
                      key={notification.id}
                      className={
                        notification.status === "unread"
                          ? "notification-unread-row"
                          : ""
                      }
                    >
                      <td className="notification-number">
                        {index + 1}
                      </td>

                      <td>
                        <div className="notification-info">
                          <div className="notification-icon">
                            <Bell size={16} />
                          </div>

                          <div>
                            <strong>{notification.title}</strong>
                            <p>{notification.message}</p>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`notification-type-badge ${notification.type}`}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                      </td>

                      <td>
                        <span className="notification-audience">
                          {notification.audience}
                        </span>
                      </td>

                      <td>
                        <span className="notification-date">
                          {formatDate(notification.date, {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`notification-status-button ${notification.status}`}
                          onClick={() =>
                            toggleNotificationStatus(notification)
                          }
                          disabled={actionLoading}
                        >
                          {notification.status === "unread"
                            ? "Unread"
                            : "Read"}
                        </button>
                      </td>

                      <td>
                        <div className="notification-actions">
                          <button
                            type="button"
                            className="notification-view-button"
                            title="View Notification"
                            aria-label={`View ${notification.title}`}
                            onClick={() => openNotification(notification)}
                          >
                            <Eye size={15} />
                          </button>

                          <button
                            type="button"
                            className="notification-toggle-button"
                            title={
                              notification.status === "unread"
                                ? "Mark as Read"
                                : "Mark as Unread"
                            }
                            onClick={() =>
                              toggleNotificationStatus(notification)
                            }
                            disabled={actionLoading}
                          >
                            {notification.status === "unread" ? (
                              <Check size={15} />
                            ) : (
                              <Bell size={15} />
                            )}
                          </button>

                          <button
                            type="button"
                            className="notification-delete-button"
                            title="Delete"
                            aria-label={`Delete ${notification.title}`}
                            onClick={() =>
                              deleteNotification(notification)
                            }
                            disabled={actionLoading}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="notifications-empty-state"
                    >
                      <Bell size={36} />
                      <h3>No notifications found</h3>

                      <p>
                        {error
                          ? "Notifications could not be loaded."
                          : "There are no notifications matching your search or filters."}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* NOTIFICATION DETAILS MODAL */}

      {selectedNotification && (
        <div
          className="admin-notifications-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedNotification(null);
            }
          }}
        >
          <div
            className="admin-notifications-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="notification-modal-title"
          >
            <div className="admin-notifications-modal-header">
              <div>
                <p>Notification Details</p>

                <h2 id="notification-modal-title">
                  {selectedNotification.title}
                </h2>
              </div>

              <button
                type="button"
                className="admin-notifications-modal-close"
                onClick={() => setSelectedNotification(null)}
                aria-label="Close notification details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-notifications-modal-body">
              <div className="notification-detail-icon">
                <Bell size={22} />
              </div>

              <div className="notification-detail-message">
                <span>Message</span>
                <p>{selectedNotification.message}</p>
              </div>

              <div className="notification-detail-grid">
                <div>
                  <span>Type</span>
                  <strong>
                    {getTypeLabel(selectedNotification.type)}
                  </strong>
                </div>

                <div>
                  <span>Audience</span>
                  <strong>{selectedNotification.audience}</strong>
                </div>

                <div>
                  <span>Date &amp; Time</span>
                  <strong>
                    {formatDate(selectedNotification.date, {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={`notification-modal-status ${selectedNotification.status}`}
                  >
                    {selectedNotification.status === "unread"
                      ? "Unread"
                      : "Read"}
                  </strong>
                </div>
              </div>

              <div className="notification-modal-actions">
                <button
                  type="button"
                  className="notification-modal-toggle"
                  onClick={() =>
                    toggleNotificationStatus(selectedNotification)
                  }
                  disabled={actionLoading}
                >
                  {selectedNotification.status === "unread" ? (
                    <>
                      <Check size={16} />
                      Mark as Read
                    </>
                  ) : (
                    <>
                      <Bell size={16} />
                      Mark as Unread
                    </>
                  )}
                </button>

                <button
                  type="button"
                  className="notification-modal-delete"
                  onClick={() =>
                    deleteNotification(selectedNotification)
                  }
                  disabled={actionLoading}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminNotifications;
