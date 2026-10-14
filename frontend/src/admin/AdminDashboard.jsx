import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    ShoppingCart,
    Package,
    Users,
    IndianRupee,
    AlertTriangle,
    Truck,
    Clock,
    CheckCircle,
    Plus,
    Tags,
    Layers,
    TicketPercent,
    Eye
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

import "./AdminDashboard.css";


const AdminDashboard = () => {

    /* =========================================================
       NAVIGATION
    ========================================================= */

    const navigate = useNavigate();


    /* =========================================================
       ADMIN USER
    ========================================================= */

    const [adminUser] = useState(() => {

        const storedAdmin = localStorage.getItem("adminUser");

        if (!storedAdmin) {
            return null;
        }

        try {
            return JSON.parse(storedAdmin);
        } catch (error) {

            console.error(
                "Failed to read admin user:",
                error
            );

            return null;
        }
    });


    /* =========================================================
       DASHBOARD STATISTICS
    ========================================================= */

    const statistics = [
        {
            title: "Total Orders",
            value: "0",
            icon: ShoppingCart,
            type: "orders",
            path: "/admin/orders"
        },
        {
            title: "Total Products",
            value: "0",
            icon: Package,
            type: "products",
            path: "/admin/products"
        },
        {
            title: "Total Customers",
            value: "0",
            icon: Users,
            type: "customers",
            path: "/admin/customers"
        },
        {
            title: "Total Revenue",
            value: "₹0",
            icon: IndianRupee,
            type: "revenue",
            path: "/admin/reports"
        }
    ];


    /* =========================================================
       ORDER STATUS
    ========================================================= */

    const orderStatus = [
        {
            title: "Pending Orders",
            value: "0",
            icon: Clock,
            type: "pending"
        },
        {
            title: "Processing",
            value: "0",
            icon: Package,
            type: "processing"
        },
        {
            title: "Out for Delivery",
            value: "0",
            icon: Truck,
            type: "delivery"
        },
        {
            title: "Delivered",
            value: "0",
            icon: CheckCircle,
            type: "delivered"
        }
    ];


    /* =========================================================
       QUICK ACTIONS
    ========================================================= */

    const quickActions = [
        {
            title: "Add Product",
            description: "Create a new grocery product",
            icon: Plus,
            path: "/admin/products"
        },
        {
            title: "Manage Categories",
            description: "Add or update categories",
            icon: Tags,
            path: "/admin/categories"
        },
        {
            title: "Manage Subcategories",
            description: "Organize product subcategories",
            icon: Layers,
            path: "/admin/subcategories"
        },
        {
            title: "Create Coupon",
            description: "Add a new offer or coupon",
            icon: TicketPercent,
            path: "/admin/coupons"
        }
    ];


    /* =========================================================
       RECENT ORDERS
       FRONTEND SAMPLE DATA ONLY
    ========================================================= */

    const recentOrders = [
        {
            id: "#ORD-1001",
            customer: "Rahul Sharma",
            items: 4,
            amount: "₹850",
            status: "Delivered",
            statusType: "delivered",
            date: "08 Oct 2026"
        },
        {
            id: "#ORD-1002",
            customer: "Priya Patil",
            items: 2,
            amount: "₹420",
            status: "Processing",
            statusType: "processing",
            date: "08 Oct 2026"
        },
        {
            id: "#ORD-1003",
            customer: "Amit Kumar",
            items: 6,
            amount: "₹1,240",
            status: "Pending",
            statusType: "pending",
            date: "07 Oct 2026"
        },
        {
            id: "#ORD-1004",
            customer: "Sneha Joshi",
            items: 3,
            amount: "₹675",
            status: "Out for Delivery",
            statusType: "delivery",
            date: "07 Oct 2026"
        }
    ];


    /* =========================================================
       QUICK ACTION NAVIGATION
    ========================================================= */

    const handleQuickAction = (path) => {
        navigate(path);
    };


    /* =========================================================
       STAT CARD NAVIGATION
    ========================================================= */

    const handleStatisticClick = (path) => {
        navigate(path);
    };


    /* =========================================================
       STAT CARD KEYBOARD NAVIGATION
    ========================================================= */

    const handleStatisticKeyDown = (event, path) => {

        if (event.key === "Enter" || event.key === " ") {

            event.preventDefault();

            navigate(path);
        }
    };


    /* =========================================================
       VIEW ALL ORDERS
    ========================================================= */

    const handleViewAllOrders = () => {
        navigate("/admin/orders");
    };


    /* =========================================================
       RENDER
    ========================================================= */

    return (

        <div className="admin-dashboard">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <AdminSidebar />


            {/* =================================================
                MAIN DASHBOARD AREA
            ================================================= */}

            <div className="admin-dashboard-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="admin-dashboard-header">

                    <div className="admin-dashboard-header-left">

                        <p className="admin-dashboard-welcome">
                            Welcome back
                        </p>

                        <h1 className="admin-dashboard-title">
                            Admin Dashboard
                        </h1>

                    </div>


                    {/* =================================================
                        ADMIN PROFILE
                    ================================================= */}

                    <div className="admin-dashboard-user">

                        <div className="admin-dashboard-avatar">

                            {adminUser?.name
                                ? adminUser.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "A"}

                        </div>


                        <div className="admin-dashboard-user-info">

                            <strong>
                                {adminUser?.name ||
                                    "Administrator"}
                            </strong>

                            <span>
                                {adminUser?.role ||
                                    "ADMIN"}
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    DASHBOARD CONTENT
                ================================================= */}

                <main className="admin-dashboard-content">


                    {/* =================================================
                        OVERVIEW
                    ================================================= */}

                    <section className="admin-dashboard-section">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <h2>
                                    Overview
                                </h2>

                                <p>
                                    Your grocery platform at a glance
                                </p>

                            </div>

                        </div>


                        <div className="admin-dashboard-stat-grid">

                            {statistics.map((item) => {

                                const Icon = item.icon;

                                return (

                                    <article
                                        className={`admin-dashboard-stat-card ${item.type}`}
                                        key={item.title}
                                        onClick={() =>
                                            handleStatisticClick(item.path)
                                        }
                                        onKeyDown={(event) =>
                                            handleStatisticKeyDown(
                                                event,
                                                item.path
                                            )
                                        }
                                        role="button"
                                        tabIndex={0}
                                        title={`Open ${item.title}`}
                                    >

                                        <div className="admin-dashboard-stat-top">

                                            <div className="admin-dashboard-stat-icon">

                                                <Icon size={21} />

                                            </div>

                                        </div>


                                        <div className="admin-dashboard-stat-value">
                                            {item.value}
                                        </div>


                                        <div className="admin-dashboard-stat-title">
                                            {item.title}
                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    </section>


                    {/* =================================================
                        ORDER STATUS
                    ================================================= */}

                    <section className="admin-dashboard-section">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <h2>
                                    Order Status
                                </h2>

                                <p>
                                    Current order processing overview
                                </p>

                            </div>

                        </div>


                        <div className="admin-dashboard-order-grid">

                            {orderStatus.map((item) => {

                                const Icon = item.icon;

                                return (

                                    <article
                                        className={`admin-dashboard-order-card ${item.type}`}
                                        key={item.title}
                                    >

                                        <div className="admin-dashboard-order-icon">

                                            <Icon size={20} />

                                        </div>


                                        <div className="admin-dashboard-order-content">

                                            <div className="admin-dashboard-order-value">
                                                {item.value}
                                            </div>

                                            <div className="admin-dashboard-order-title">
                                                {item.title}
                                            </div>

                                        </div>

                                    </article>

                                );

                            })}

                        </div>

                    </section>


                    {/* =================================================
                        QUICK ACTIONS
                    ================================================= */}

                    <section className="admin-dashboard-section">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <h2>
                                    Quick Actions
                                </h2>

                                <p>
                                    Frequently used administration actions
                                </p>

                            </div>

                        </div>


                        <div className="admin-dashboard-quick-grid">

                            {quickActions.map((action) => {

                                const Icon = action.icon;

                                return (

                                    <button
                                        type="button"
                                        className="admin-dashboard-quick-card"
                                        key={action.title}
                                        onClick={() =>
                                            handleQuickAction(action.path)
                                        }
                                    >

                                        <div className="admin-dashboard-quick-icon">

                                            <Icon size={21} />

                                        </div>


                                        <div className="admin-dashboard-quick-content">

                                            <strong>
                                                {action.title}
                                            </strong>

                                            <span>
                                                {action.description}
                                            </span>

                                        </div>

                                    </button>

                                );

                            })}

                        </div>

                    </section>


                    {/* =================================================
                        RECENT ORDERS
                    ================================================= */}

                    <section className="admin-dashboard-section">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <h2>
                                    Recent Orders
                                </h2>

                                <p>
                                    Latest orders placed on the grocery platform
                                </p>

                            </div>


                            <button
                                type="button"
                                className="admin-dashboard-view-all-button"
                                onClick={handleViewAllOrders}
                            >
                                <Eye size={16} />
                                View All Orders
                            </button>

                        </div>


                        <div className="admin-dashboard-orders-wrapper">

                            <div className="admin-dashboard-orders-table">

                                <div className="admin-dashboard-orders-header">

                                    <div>
                                        Order ID
                                    </div>

                                    <div>
                                        Customer
                                    </div>

                                    <div>
                                        Items
                                    </div>

                                    <div>
                                        Amount
                                    </div>

                                    <div>
                                        Status
                                    </div>

                                    <div>
                                        Date
                                    </div>

                                </div>


                                {recentOrders.map((order) => (

                                    <div
                                        className="admin-dashboard-order-row"
                                        key={order.id}
                                    >

                                        <div className="admin-dashboard-order-id">
                                            {order.id}
                                        </div>


                                        <div className="admin-dashboard-order-customer">
                                            {order.customer}
                                        </div>


                                        <div className="admin-dashboard-order-items">
                                            {order.items}
                                        </div>


                                        <div className="admin-dashboard-order-amount">
                                            {order.amount}
                                        </div>


                                        <div>

                                            <span
                                                className={`admin-dashboard-order-status ${order.statusType}`}
                                            >
                                                {order.status}
                                            </span>

                                        </div>


                                        <div className="admin-dashboard-order-date">
                                            {order.date}
                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        ATTENTION REQUIRED
                    ================================================= */}

                    <section className="admin-dashboard-section">

                        <div className="admin-dashboard-section-heading">

                            <div>

                                <h2>
                                    Attention Required
                                </h2>

                                <p>
                                    Items that may require admin action
                                </p>

                            </div>

                        </div>


                        <div className="admin-dashboard-alert-grid">


                            {/* =================================================
                                LOW STOCK
                            ================================================= */}

                            <article className="admin-dashboard-alert-card">

                                <div className="admin-dashboard-alert-icon">

                                    <AlertTriangle size={20} />

                                </div>


                                <div className="admin-dashboard-alert-content">

                                    <strong>
                                        Low Stock Products
                                    </strong>

                                    <p>
                                        No low-stock products currently.
                                    </p>

                                </div>

                            </article>


                            {/* =================================================
                                NEW ORDERS
                            ================================================= */}

                            <article className="admin-dashboard-alert-card">

                                <div className="admin-dashboard-alert-icon">

                                    <ShoppingCart size={20} />

                                </div>


                                <div className="admin-dashboard-alert-content">

                                    <strong>
                                        New Orders
                                    </strong>

                                    <p>
                                        No new orders currently.
                                    </p>

                                </div>

                            </article>


                        </div>

                    </section>


                </main>

            </div>

        </div>

    );

};


export default AdminDashboard;