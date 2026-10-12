
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
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

const MENU_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Products", icon: Package, path: "/admin/products" },
  { label: "Product Variants", icon: Layers, path: "/admin/product-variants" },
  { label: "Categories", icon: Tags, path: "/admin/categories" },
  { label: "Subcategories", icon: ListTree, path: "/admin/subcategories" },
  { label: "Inventory", icon: Boxes, path: "/admin/inventory" },
  { label: "Orders", icon: ShoppingCart, path: "/admin/orders" },
  { label: "Customers", icon: Users, path: "/admin/customers" },
  { label: "Coupons & Offers", icon: TicketPercent, path: "/admin/coupons" },
  { label: "Delivery", icon: Truck, path: "/admin/delivery" },
  { label: "Reviews", icon: Star, path: "/admin/reviews" },
  { label: "Notifications", icon: Bell, path: "/admin/notifications" },
  { label: "Website CMS", icon: FileText, path: "/admin/cms" },
  { label: "Reports", icon: BarChart3, path: "/admin/reports" },
];

const SYSTEM_ITEMS = [
  { label: "Settings", icon: Settings, path: "/admin/settings" },
  {
    label: "Admin Management",
    icon: ShieldCheck,
    path: "/admin/admin-management",
  },
];

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");

    if (!confirmed) return;

    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminLoggedIn");

    navigate("/admin/login", { replace: true });
  };

  const renderMenuItem = (item) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <button
        key={item.path}
        type="button"
        className={`admin-sidebar-menu-item${active ? " active" : ""}`}
        onClick={() => navigate(item.path)}
        aria-current={active ? "page" : undefined}
        title={item.label}
      >
        <Icon size={19} aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    );
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-logo">
          <ShoppingCart size={22} />
        </div>

        <div className="admin-sidebar-brand-text">
          <h2>Grocery Admin</h2>
          <span>Management Portal</span>
        </div>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        <p className="admin-sidebar-section-title">MAIN MENU</p>

        {MENU_ITEMS.map(renderMenuItem)}

        <p className="admin-sidebar-section-title admin-sidebar-settings-title">
          SYSTEM
        </p>

        {SYSTEM_ITEMS.map(renderMenuItem)}
      </nav>

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
