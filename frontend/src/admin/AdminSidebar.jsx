
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
  LogOut,
  RotateCcw,
  MessageCircle,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

// ==========================================
// MAIN MENU ITEMS
// ==========================================

const MENU_ITEMS = [
  {
    label: "Dashboard",
    permission: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    label: "Products",
    permission: "Products",
    icon: Package,
    path: "/admin/products",
  },
  {
    label: "Product Variants",
    permission: "Products",
    icon: Layers,
    path: "/admin/product-variants",
  },
  {
    label: "Categories",
    permission: "Categories",
    icon: Tags,
    path: "/admin/categories",
  },
  {
    label: "Subcategories",
    permission: "Categories",
    icon: ListTree,
    path: "/admin/subcategories",
  },
  {
    label: "Inventory",
    permission: "Inventory",
    icon: Boxes,
    path: "/admin/inventory",
  },
  {
    label: "Orders",
    permission: "Orders",
    icon: ShoppingCart,
    path: "/admin/orders",
  },
  {
    label: "Customers",
    permission: "Customers",
    icon: Users,
    path: "/admin/customers",
  },
  {
    label: "Coupons & Offers",
    permission: "Coupons & Offers",
    icon: TicketPercent,
    path: "/admin/coupons",
  },
  {
    label: "Delivery",
    permission: "Delivery",
    icon: Truck,
    path: "/admin/delivery",
  },
  {
    label: "Reviews",
    permission: "Reviews",
    icon: Star,
    path: "/admin/reviews",
  },
  {
    label: "Notifications",
    permission: "Notifications",
    icon: Bell,
    path: "/admin/notifications",
  },
  {
    label: "Website CMS",
    permission: "Website CMS",
    icon: FileText,
    path: "/admin/cms",
  },
  {
    label: "Reports",
    permission: "Reports",
    icon: BarChart3,
    path: "/admin/reports",
  },
  {
    label: "Returns & Refund",
    permission: "Orders",
    icon: RotateCcw,
    path: "/admin/returns",
  },
  {
  label: "Support Queries",
  permission: "Support",
  icon: MessageCircle,
  path: "/admin/support-queries",
},
];

// ==========================================
// SYSTEM MENU ITEMS
// ==========================================

const SYSTEM_ITEMS = [
  {
    label: "Settings",
    permission: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

// ==========================================
// ROLE HELPERS
// ==========================================

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

// ==========================================
// GET CURRENT ADMIN
// ==========================================

const getCurrentAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("adminUser") || "null");
  } catch {
    return null;
  }
};

// ==========================================
// ADMIN SIDEBAR COMPONENT
// ==========================================

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const admin = getCurrentAdmin();

  const role = normalizeRole(admin?.role);

  const isSuperAdmin =
    role === "super_admin" || role === "superadmin";

  const permissions = Array.isArray(admin?.permissions)
    ? admin.permissions
    : [];

  // Check admin permissions
  const canAccess = (permission) =>
    isSuperAdmin || permissions.includes(permission);

  // Filter visible menu items
  const visibleMenuItems = MENU_ITEMS.filter((item) =>
    canAccess(item.permission)
  );

  const visibleSystemItems = SYSTEM_ITEMS.filter((item) =>
    canAccess(item.permission)
  );

  // ==========================================
  // ACTIVE ROUTE CHECK
  // ==========================================

  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/dashboard"
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    if (!window.confirm("Are you sure you want to log out?")) {
      return;
    }

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminLoggedIn");

    navigate("/admin/login", { replace: true });
  };

  // ==========================================
  // RENDER MENU ITEM
  // ==========================================

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.path}
        type="button"
        className={`admin-sidebar-menu-item${
          active ? " active" : ""
        }`}
        onClick={() => navigate(item.path)}
        aria-current={active ? "page" : undefined}
        title={item.label}
      >
        <Icon size={19} aria-hidden="true" />

        <span>{item.label}</span>
      </button>
    );
  };

  // ==========================================
  // SIDEBAR UI
  // ==========================================

  return (
    <aside className="admin-sidebar">

      {/* BRAND */}

      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">
          <ShoppingCart size={22} />
        </div>

        <div className="admin-sidebar-brand-text">
          <h2>Grocery Admin</h2>

          <span>
            {isSuperAdmin
              ? "Super Admin Portal"
              : "Management Portal"}
          </span>
        </div>
      </div>

      {/* NAVIGATION */}

      <nav
        className="admin-sidebar-nav"
        aria-label="Admin navigation"
      >
        {visibleMenuItems.length > 0 && (
          <>
            <p className="admin-sidebar-section-title">
              MAIN MENU
            </p>

            {visibleMenuItems.map(renderMenuItem)}
          </>
        )}

        {/* SYSTEM MENU */}

        {(visibleSystemItems.length > 0 || isSuperAdmin) && (
          <>
            <p className="admin-sidebar-section-title admin-sidebar-settings-title">
              SYSTEM
            </p>

            {visibleSystemItems.map(renderMenuItem)}

            {isSuperAdmin &&
              renderMenuItem({
                label: "Admin Management",
                permission: "Super Admin",
                icon: ShieldCheck,
                path: "/admin/admin-management",
              })}
          </>
        )}
      </nav>

      {/* LOGOUT */}

      <div className="admin-sidebar-bottom">
        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={19} aria-hidden="true" />

          <span>Logout</span>
        </button>
      </div>

    </aside>
  );
};

export default AdminSidebar;
