import { useState } from "react";

import {
    ShoppingCart,
    Package,
    Users,
    IndianRupee,
    AlertTriangle,
    Truck,
    Clock,
    CheckCircle
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";

import "./AdminDashboard.css";

const AdminDashboard = () => {

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
            type: "orders"
        },
        {
            title: "Total Products",
            value: "0",
            icon: Package,
            type: "products"
        },
        {
            title: "Total Customers",
            value: "0",
            icon: Users,
            type: "customers"
        },
        {
            title: "Total Revenue",
            value: "₹0",
            icon: IndianRupee,
            type: "revenue"
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


                    {/* ADMIN PROFILE */}

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


                            {/* LOW STOCK */}

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


                            {/* NEW ORDERS */}

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