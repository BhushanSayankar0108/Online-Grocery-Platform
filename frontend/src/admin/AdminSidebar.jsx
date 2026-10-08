import {
    LayoutDashboard,
    Package,
    Tags,
    ListTree,
    Layers,
    Boxes,
    ShoppingCart,
    Users,
    TicketPercent,
    Truck,
    Star,
    Bell,
    FileText,
    BarChart3,
    Settings,
    ShieldCheck,
    LogOut
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./AdminSidebar.css";

const AdminSidebar = () => {

    const navigate = useNavigate();

    const menuItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            path: "/admin/dashboard"
        },
        {
            label: "Products",
            icon: Package,
            path: "/admin/products"
        },
        {
            label: "Product Variants",
            icon: Layers,
            path: "/admin/product-variants"
        },
        {
            label: "Categories",
            icon: Tags,
            path: "/admin/categories"
        },
        {
            label: "Subcategories",
            icon: ListTree,
            path: "/admin/subcategories"
        },
        {
            label: "Inventory",
            icon: Boxes,
            path: "/admin/inventory"
        },
        {
            label: "Orders",
            icon: ShoppingCart,
            path: "/admin/orders"
        },
        {
            label: "Customers",
            icon: Users,
            path: "/admin/customers"
        },
        {
            label: "Coupons & Offers",
            icon: TicketPercent,
            path: "/admin/coupons"
        },
        {
            label: "Delivery",
            icon: Truck,
            path: "/admin/delivery"
        },
        {
            label: "Reviews",
            icon: Star,
            path: "/admin/reviews"
        },
        {
            label: "Notifications",
            icon: Bell,
            path: "/admin/notifications"
        },
        {
            label: "Website CMS",
            icon: FileText,
            path: "/admin/cms"
        },
        {
            label: "Reports",
            icon: BarChart3,
            path: "/admin/reports"
        }
    ];


    /* =========================================================
       NAVIGATION
    ========================================================= */

    const handleNavigation = (path) => {
        navigate(path);
    };


    /* =========================================================
       LOGOUT
    ========================================================= */

    const handleLogout = () => {

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminLoggedIn");

        navigate("/admin/login");
    };


    return (
        <aside className="admin-sidebar">


            {/* =================================================
                BRAND
            ================================================= */}

            <div className="admin-sidebar-brand">

                <div className="admin-sidebar-logo">
                    <ShoppingCart size={22} />
                </div>


                <div className="admin-sidebar-brand-text">

                    <h2>
                        Grocery Admin
                    </h2>

                    <span>
                        Management Portal
                    </span>

                </div>

            </div>


            {/* =================================================
                NAVIGATION
            ================================================= */}

            <nav className="admin-sidebar-nav">


                <p className="admin-sidebar-section-title">
                    MAIN MENU
                </p>


                {menuItems.map((item) => {

                    const Icon = item.icon;

                    return (
                        <button
                            key={item.label}
                            type="button"
                            className="admin-sidebar-menu-item"
                            onClick={() =>
                                handleNavigation(item.path)
                            }
                        >

                            <Icon size={19} />

                            <span>
                                {item.label}
                            </span>

                        </button>
                    );

                })}


                {/* =================================================
                    SYSTEM
                ================================================= */}

                <p className="admin-sidebar-section-title admin-sidebar-settings-title">
                    SYSTEM
                </p>


                <button
                    type="button"
                    className="admin-sidebar-menu-item"
                    onClick={() =>
                        handleNavigation("/admin/settings")
                    }
                >

                    <Settings size={19} />

                    <span>
                        Settings
                    </span>

                </button>


                <button
                    type="button"
                    className="admin-sidebar-menu-item"
                    onClick={() =>
                        handleNavigation("/admin/admin-management")
                    }
                >

                    <ShieldCheck size={19} />

                    <span>
                        Admin Management
                    </span>

                </button>

            </nav>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <div className="admin-sidebar-bottom">

                <button
                    type="button"
                    className="admin-sidebar-logout"
                    onClick={handleLogout}
                >

                    <LogOut size={19} />

                    <span>
                        Logout
                    </span>

                </button>

            </div>


        </aside>
    );
};

export default AdminSidebar;