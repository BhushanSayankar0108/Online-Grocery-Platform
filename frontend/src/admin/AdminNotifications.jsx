import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Bell,
    Check,
    ChevronDown,
    Eye,
    Search,
    Trash2,
    X,
} from "lucide-react";

import "./AdminNotifications.css";


const INITIAL_NOTIFICATIONS = [
    {
        id: 1,
        title: "New Order Received",
        message:
            "Order #ORD-1006 has been placed by Rahul Sharma.",
        type: "order",
        audience: "Admin",
        date: "2026-10-03 10:30",
        status: "unread",
    },
    {
        id: 2,
        title: "Low Stock Alert",
        message:
            "Basmati Rice 5kg is running low on inventory.",
        type: "inventory",
        audience: "Admin",
        date: "2026-10-03 09:45",
        status: "unread",
    },
    {
        id: 3,
        title: "New Customer Registration",
        message:
            "A new customer account has been registered.",
        type: "customer",
        audience: "Admin",
        date: "2026-10-02 18:20",
        status: "read",
    },
    {
        id: 4,
        title: "Payment Successful",
        message:
            "Payment for order #ORD-1003 was successfully completed.",
        type: "payment",
        audience: "Admin",
        date: "2026-10-02 16:10",
        status: "read",
    },
    {
        id: 5,
        title: "New Product Review",
        message:
            "A new customer review has been submitted for Fresh Organic Apples.",
        type: "review",
        audience: "Admin",
        date: "2026-10-02 14:35",
        status: "unread",
    },
    {
        id: 6,
        title: "Delivery Update",
        message:
            "Order #ORD-1001 has been marked as out for delivery.",
        type: "delivery",
        audience: "Admin",
        date: "2026-10-01 17:15",
        status: "read",
    },
    {
        id: 7,
        title: "System Maintenance",
        message:
            "Scheduled maintenance reminder for the platform.",
        type: "system",
        audience: "Admin",
        date: "2026-10-01 11:00",
        status: "read",
    },
];


function AdminNotifications() {
    const navigate = useNavigate();

    const [notifications, setNotifications] =
        useState(INITIAL_NOTIFICATIONS);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [typeFilter, setTypeFilter] =
        useState("all");

    const [statusFilter, setStatusFilter] =
        useState("all");

    const [selectedNotification, setSelectedNotification] =
        useState(null);


    const filteredNotifications = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return notifications.filter(
            (notification) => {
                const matchesSearch =
                    !search ||
                    notification.title
                        .toLowerCase()
                        .includes(search) ||
                    notification.message
                        .toLowerCase()
                        .includes(search) ||
                    notification.audience
                        .toLowerCase()
                        .includes(search);

                const matchesType =
                    typeFilter === "all" ||
                    notification.type ===
                        typeFilter;

                const matchesStatus =
                    statusFilter === "all" ||
                    notification.status ===
                        statusFilter;

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesStatus
                );
            }
        );
    }, [
        notifications,
        searchTerm,
        typeFilter,
        statusFilter,
    ]);


    const stats = useMemo(() => {
        return {
            total: notifications.length,

            unread: notifications.filter(
                (notification) =>
                    notification.status ===
                    "unread"
            ).length,

            read: notifications.filter(
                (notification) =>
                    notification.status ===
                    "read"
            ).length,

            orderAlerts: notifications.filter(
                (notification) =>
                    notification.type ===
                    "order"
            ).length,
        };
    }, [notifications]);


    const getTypeLabel = (type) => {
        const labels = {
            order: "Order",
            inventory: "Inventory",
            customer: "Customer",
            payment: "Payment",
            review: "Review",
            delivery: "Delivery",
            system: "System",
        };

        return labels[type] || type;
    };


    const markAsRead = (id) => {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === id
                    ? {
                          ...notification,
                          status: "read",
                      }
                    : notification
            )
        );

        if (
            selectedNotification &&
            selectedNotification.id === id
        ) {
            setSelectedNotification(
                (previous) => ({
                    ...previous,
                    status: "read",
                })
            );
        }
    };


    const markAsUnread = (id) => {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === id
                    ? {
                          ...notification,
                          status: "unread",
                      }
                    : notification
            )
        );

        if (
            selectedNotification &&
            selectedNotification.id === id
        ) {
            setSelectedNotification(
                (previous) => ({
                    ...previous,
                    status: "unread",
                })
            );
        }
    };


    const toggleNotificationStatus = (
        notification
    ) => {
        if (
            notification.status === "unread"
        ) {
            markAsRead(notification.id);
        } else {
            markAsUnread(notification.id);
        }
    };


    const deleteNotification = (id) => {
        const notification =
            notifications.find(
                (item) => item.id === id
            );

        if (!notification) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${notification.title}"?`
        );

        if (!confirmed) {
            return;
        }

        setNotifications((previous) =>
            previous.filter(
                (item) => item.id !== id
            )
        );

        if (
            selectedNotification &&
            selectedNotification.id === id
        ) {
            setSelectedNotification(null);
        }
    };


    const clearSearch = () => {
        setSearchTerm("");
    };


    const openNotification = (
        notification
    ) => {
        setSelectedNotification(
            notification
        );

        if (notification.status === "unread") {
            markAsRead(notification.id);
        }
    };


    const markAllAsRead = () => {
        setNotifications((previous) =>
            previous.map((notification) => ({
                ...notification,
                status: "read",
            }))
        );

        if (selectedNotification) {
            setSelectedNotification(
                (previous) => ({
                    ...previous,
                    status: "read",
                })
            );
        }
    };


    return (
        <div className="admin-notifications-page">
            <div className="admin-notifications-container">

                {/* Back Button */}
                <div className="admin-notifications-back-wrapper">
                    <button
                        type="button"
                        className="admin-notifications-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </button>
                </div>


                {/* Header */}
                <div className="admin-notifications-header">

                    <div>
                        <p className="admin-notifications-eyebrow">
                            Communication Center
                        </p>

                        <h1>
                            Notifications
                        </h1>

                        <p className="admin-notifications-header-text">
                            View and manage important
                            alerts and system
                            notifications.
                        </p>
                    </div>


                    {stats.unread > 0 && (
                        <button
                            type="button"
                            className="admin-notifications-mark-all"
                            onClick={
                                markAllAsRead
                            }
                        >
                            <Check size={16} />
                            Mark All as Read
                        </button>
                    )}

                </div>


                {/* Statistics */}
                <div className="admin-notifications-stats">

                    <div className="admin-notifications-stat-card">
                        <div className="admin-notifications-stat-icon">
                            <Bell size={20} />
                        </div>

                        <div>
                            <span>
                                Total Notifications
                            </span>

                            <strong>
                                {stats.total}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-notifications-stat-card">
                        <div className="admin-notifications-stat-icon">
                            <Bell size={20} />
                        </div>

                        <div>
                            <span>
                                Unread
                            </span>

                            <strong>
                                {stats.unread}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-notifications-stat-card">
                        <div className="admin-notifications-stat-icon">
                            <Check size={20} />
                        </div>

                        <div>
                            <span>
                                Read
                            </span>

                            <strong>
                                {stats.read}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-notifications-stat-card">
                        <div className="admin-notifications-stat-icon">
                            <Bell size={20} />
                        </div>

                        <div>
                            <span>
                                Order Alerts
                            </span>

                            <strong>
                                {stats.orderAlerts}
                            </strong>
                        </div>
                    </div>

                </div>


                {/* Toolbar */}
                <div className="admin-notifications-toolbar">

                    <div className="admin-notifications-search">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder="Search notifications..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-notifications-clear-search"
                                onClick={
                                    clearSearch
                                }
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>


                    <div className="admin-notifications-filter">

                        <select
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Types
                            </option>

                            <option value="order">
                                Order
                            </option>

                            <option value="inventory">
                                Inventory
                            </option>

                            <option value="customer">
                                Customer
                            </option>

                            <option value="payment">
                                Payment
                            </option>

                            <option value="review">
                                Review
                            </option>

                            <option value="delivery">
                                Delivery
                            </option>

                            <option value="system">
                                System
                            </option>
                        </select>

                        <ChevronDown size={16} />

                    </div>


                    <div className="admin-notifications-filter">

                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="unread">
                                Unread
                            </option>

                            <option value="read">
                                Read
                            </option>
                        </select>

                        <ChevronDown size={16} />

                    </div>

                </div>


                {/* Notifications Table */}
                <div className="admin-notifications-table-card">

                    <div className="admin-notifications-table-header">

                        <div>
                            <h2>
                                Notification Center
                            </h2>

                            <p>
                                {
                                    filteredNotifications.length
                                }{" "}
                                notification
                                {filteredNotifications.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                found
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
                                    <th>Date & Time</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>


                            <tbody>

                                {filteredNotifications.length >
                                0 ? (
                                    filteredNotifications.map(
                                        (
                                            notification,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    notification.id
                                                }
                                                className={
                                                    notification.status ===
                                                    "unread"
                                                        ? "notification-unread-row"
                                                        : ""
                                                }
                                            >

                                                <td className="notification-number">
                                                    {index +
                                                        1}
                                                </td>


                                                <td>
                                                    <div className="notification-info">

                                                        <div className="notification-icon">
                                                            <Bell
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {
                                                                    notification.title
                                                                }
                                                            </strong>

                                                            <p>
                                                                {
                                                                    notification.message
                                                                }
                                                            </p>
                                                        </div>

                                                    </div>
                                                </td>


                                                <td>
                                                    <span
                                                        className={`notification-type-badge ${notification.type}`}
                                                    >
                                                        {getTypeLabel(
                                                            notification.type
                                                        )}
                                                    </span>
                                                </td>


                                                <td>
                                                    <span className="notification-audience">
                                                        {
                                                            notification.audience
                                                        }
                                                    </span>
                                                </td>


                                                <td>
                                                    <span className="notification-date">
                                                        {new Date(
                                                            notification.date
                                                        ).toLocaleString(
                                                            "en-IN",
                                                            {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )}
                                                    </span>
                                                </td>


                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`notification-status-button ${notification.status}`}
                                                        onClick={() =>
                                                            toggleNotificationStatus(
                                                                notification
                                                            )
                                                        }
                                                    >
                                                        {notification.status ===
                                                        "unread"
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
                                                            onClick={() =>
                                                                openNotification(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            <Eye
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="notification-toggle-button"
                                                            title={
                                                                notification.status ===
                                                                "unread"
                                                                    ? "Mark as Read"
                                                                    : "Mark as Unread"
                                                            }
                                                            onClick={() =>
                                                                toggleNotificationStatus(
                                                                    notification
                                                                )
                                                            }
                                                        >
                                                            {notification.status ===
                                                            "unread" ? (
                                                                <Check
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            ) : (
                                                                <Bell
                                                                    size={
                                                                        15
                                                                    }
                                                                />
                                                            )}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            className="notification-delete-button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deleteNotification(
                                                                    notification.id
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    15
                                                                }
                                                            />
                                                        </button>

                                                    </div>
                                                </td>

                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="notifications-empty-state"
                                        >
                                            <Bell
                                                size={36}
                                            />

                                            <h3>
                                                No notifications
                                                found
                                            </h3>

                                            <p>
                                                Try changing
                                                your search
                                                or filters.
                                            </p>
                                        </td>
                                    </tr>
                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* Notification Details Modal */}
            {selectedNotification && (
                <div
                    className="admin-notifications-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            setSelectedNotification(
                                null
                            );
                        }
                    }}
                >

                    <div className="admin-notifications-modal">

                        <div className="admin-notifications-modal-header">

                            <div>
                                <p>
                                    Notification Details
                                </p>

                                <h2>
                                    {
                                        selectedNotification.title
                                    }
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-notifications-modal-close"
                                onClick={() =>
                                    setSelectedNotification(
                                        null
                                    )
                                }
                            >
                                <X size={18} />
                            </button>

                        </div>


                        <div className="admin-notifications-modal-body">

                            <div className="notification-detail-icon">
                                <Bell size={22} />
                            </div>


                            <div className="notification-detail-message">

                                <span>
                                    Message
                                </span>

                                <p>
                                    {
                                        selectedNotification.message
                                    }
                                </p>

                            </div>


                            <div className="notification-detail-grid">

                                <div>
                                    <span>
                                        Type
                                    </span>

                                    <strong>
                                        {getTypeLabel(
                                            selectedNotification.type
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Audience
                                    </span>

                                    <strong>
                                        {
                                            selectedNotification.audience
                                        }
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Date & Time
                                    </span>

                                    <strong>
                                        {new Date(
                                            selectedNotification.date
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            }
                                        )}
                                    </strong>
                                </div>


                                <div>
                                    <span>
                                        Status
                                    </span>

                                    <strong
                                        className={`notification-modal-status ${selectedNotification.status}`}
                                    >
                                        {selectedNotification.status ===
                                        "unread"
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
                                        toggleNotificationStatus(
                                            selectedNotification
                                        )
                                    }
                                >
                                    {selectedNotification.status ===
                                    "unread" ? (
                                        <>
                                            <Check
                                                size={16}
                                            />
                                            Mark as Read
                                        </>
                                    ) : (
                                        <>
                                            <Bell
                                                size={16}
                                            />
                                            Mark as Unread
                                        </>
                                    )}
                                </button>


                                <button
                                    type="button"
                                    className="notification-modal-delete"
                                    onClick={() =>
                                        deleteNotification(
                                            selectedNotification.id
                                        )
                                    }
                                >
                                    <Trash2
                                        size={16}
                                    />
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