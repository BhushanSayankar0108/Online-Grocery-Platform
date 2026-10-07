import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Package,
  Tag,
  Check,
  Trash2,
  ArrowRight,
  CheckCheck,
} from "lucide-react";

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

  const getNotificationIcon = (type) => {
    if (type === "Offer") {
      return <Tag size={21} strokeWidth={1.8} />;
    }

    return <Package size={21} strokeWidth={1.8} />;
  };

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

            {unreadCount > 0 && (
              <button
                type="button"
                className="mark-all-button"
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                Mark All as Read
              </button>
            )}
          </div>

          {notifications.length > 0 && (
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

        <section className="notifications-content">
          {notifications.length === 0 ? (
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
                          {notification.type}
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
                      {notification.time}
                    </span>

                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          type="button"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                        >
                          <Check size={15} />
                          Mark as Read
                        </button>
                      )}

                      <button
                        type="button"
                        className="notification-delete"
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
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