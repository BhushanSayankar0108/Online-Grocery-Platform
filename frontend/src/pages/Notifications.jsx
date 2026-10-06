import { useState } from "react";
import { Link } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Order Out for Delivery",
      message: "Your order #ORD1002 is out for delivery.",
      type: "Order",
      time: "10 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      title: "Special Offer",
      message: "Get up to 30% OFF on snacks and beverages.",
      type: "Offer",
      time: "2 hours ago",
      isRead: false,
    },
    {
      id: 3,
      title: "Order Delivered",
      message: "Your order #ORD1001 has been delivered successfully.",
      type: "Order",
      time: "2 days ago",
      isRead: true,
    },
  ]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const markAsRead = (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  return (
    <main className="notifications-page">
      <div className="notifications-header">
        <Link to="/account" className="shop-home-link">
          ← Back to Account
        </Link>

        <p>Home / Account / Notifications</p>

        <div className="notifications-title-row">
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your orders and offers.</p>
          </div>

          {unreadCount > 0 && (
            <button
              className="mark-all-button"
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
      </div>

      <div className="notifications-content">
        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>
            <h2>No Notifications</h2>
            <p>You are all caught up.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                className={`notification-card ${
                  !notification.isRead ? "unread" : ""
                }`}
                key={notification.id}
              >
                <div className="notification-icon">
                  {notification.type === "Order" ? "📦" : "🏷️"}
                </div>

                <div className="notification-details">
                  <div className="notification-top">
                    <h2>{notification.title}</h2>

                    {!notification.isRead && (
                      <span className="unread-dot"></span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <span className="notification-time">
                    {notification.time}
                  </span>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button onClick={() => markAsRead(notification.id)}>
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={() =>
                        deleteNotification(notification.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Notifications;