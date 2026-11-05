
import { useEffect } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNotificationBell from "./AdminNotificationBell";
import "./AdminLayout.css";

const ALLOWED_ADMIN_ROLES = [
  "admin",
  "superadmin",
  "super_admin",
  "manager",
  "content_manager",
  "order_manager",
];

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const ROUTE_PERMISSIONS = [
  { path: "/admin/dashboard", permission: "Dashboard" },
  { path: "/admin/products", permission: "Products" },
  { path: "/admin/product-variants", permission: "Products" },
  { path: "/admin/categories", permission: "Categories" },
  { path: "/admin/subcategories", permission: "Categories" },
  { path: "/admin/inventory", permission: "Inventory" },
  { path: "/admin/orders", permission: "Orders" },
  { path: "/admin/customers", permission: "Customers" },
  { path: "/admin/coupons", permission: "Coupons & Offers" },
  { path: "/admin/delivery", permission: "Delivery" },
  { path: "/admin/reviews", permission: "Reviews" },
  { path: "/admin/notifications", permission: "Notifications" },
  { path: "/admin/cms", permission: "Website CMS" },
  { path: "/admin/reports", permission: "Reports" },
  { path: "/admin/settings", permission: "Settings" },
];

const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  localStorage.removeItem("adminLoggedIn");
};

const getAdminSession = () => {
  try {
    const token = localStorage.getItem("adminToken");
    const loggedIn = localStorage.getItem("adminLoggedIn");
    const savedAdmin = localStorage.getItem("adminUser");

    if (!token || loggedIn !== "true" || !savedAdmin) {
      return null;
    }

    const admin = JSON.parse(savedAdmin);
    const role = normalizeRole(admin?.role);
    const status = String(admin?.status || "")
      .trim()
      .toLowerCase();

    if (
      !admin ||
      !(admin.id || admin._id) ||
      !ALLOWED_ADMIN_ROLES.includes(role) ||
      status !== "active"
    ) {
      return null;
    }

    return {
      ...admin,
      role,
      permissions: Array.isArray(admin.permissions)
        ? admin.permissions
        : [],
    };
  } catch (error) {
    console.error("Admin session validation error:", error);
    return null;
  }
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const admin = getAdminSession();

  const role = normalizeRole(admin?.role);

  const isSuperAdmin =
    role === "super_admin" || role === "superadmin";

  const permissions = admin?.permissions || [];

  const canAccess = (permission) =>
    Boolean(admin) &&
    (isSuperAdmin || permissions.includes(permission));

  // Validate admin session.
  useEffect(() => {
    if (!admin) {
      clearAdminSession();
      navigate("/admin/login", { replace: true });
    }
  }, [admin, navigate, location.pathname]);

  if (!admin) {
    return null;
  }

  // Normalize current route.
  const currentPath =
    location.pathname.replace(/\/+$/, "") || "/admin";

  // Admin Management is restricted to Super Admin.
  const isAdminManagementRoute =
    currentPath === "/admin/admin-management" ||
    currentPath.startsWith("/admin/admin-management/");

  // Find permission required for the current route.
  const route = ROUTE_PERMISSIONS.find(
    (item) =>
      currentPath === item.path ||
      currentPath.startsWith(`${item.path}/`)
  );

  // Determine whether current page is accessible.
  const accessDenied =
    (isAdminManagementRoute && !isSuperAdmin) ||
    (route && !canAccess(route.permission));

  // Redirect to first permitted page if available.
  const fallback = ROUTE_PERMISSIONS.find((item) =>
    canAccess(item.permission)
  );

  if (accessDenied && fallback) {
    return (
      <Navigate
        to={fallback.path}
        replace
        state={{ accessDenied: true }}
      />
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <AdminSidebar />

      <div className="admin-layout-main">
        {/* Common Admin Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-info">
            <h2>Admin Portal</h2>
            <span>Manage your grocery platform</span>
          </div>

          <div className="admin-topbar-actions">
            {/* Notification Bell on every Admin page */}
            <AdminNotificationBell />
          </div>
        </header>

        {/* Page Content */}
        <main
          className="admin-main-content"
          key={location.pathname}
        >
          {accessDenied ? (
            <div className="admin-access-denied">
              <h2>Access Denied</h2>

              <p>
                No page permissions have been assigned to
                your account.
              </p>

              <button
                type="button"
                onClick={() => {
                  clearAdminSession();
                  navigate("/admin/login", {
                    replace: true,
                  });
                }}
              >
                Log Out
              </button>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
