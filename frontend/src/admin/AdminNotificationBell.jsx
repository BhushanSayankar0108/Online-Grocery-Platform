
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./AdminNotificationBell.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

export default function AdminNotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/notifications/admin/unread-count`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data.message || `Request failed with status ${response.status}`
          );
        }

        if (active && data.success) {
          setUnreadCount(Number(data.unreadCount) || 0);
        }
      } catch (error) {
        console.error("Notification count error:", error.message);
      }
    };

    fetchUnreadCount();

    const interval = window.setInterval(fetchUnreadCount, 10000);

    const handleFocus = () => fetchUnreadCount();

    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <button
      type="button"
      className="admin-notification-bell"
      onClick={() => navigate("/admin/notifications")}
      aria-label={`${unreadCount} unread notifications`}
      title="Notifications"
    >
      <Bell size={21} />

      {unreadCount > 0 && (
        <span className="admin-notification-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
