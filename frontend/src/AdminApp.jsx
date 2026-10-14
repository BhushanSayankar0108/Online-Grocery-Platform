import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminCategories from "./admin/AdminCategories";
import AdminSubCategories from "./admin/AdminSubCategories";
import AdminProducts from "./admin/AdminProducts";
import AdminProductVariants from "./admin/AdminProductVariants";
import AdminInventory from "./admin/AdminInventory";
import AdminOrders from "./admin/AdminOrders";
import AdminCustomers from "./admin/AdminCustomers";
import AdminCoupons from "./admin/AdminCoupons";
import AdminDelivery from "./admin/AdminDelivery";
import AdminReviews from "./admin/AdminReviews";
import AdminNotifications from "./admin/AdminNotifications";
import AdminCMS from "./admin/AdminCMS";
import AdminReports from "./admin/AdminReports";
import AdminSettings from "./admin/AdminSettings";
import AdminManagement from "./admin/AdminManagement";

export default function AdminApp() {
  return (
    <HashRouter>
      <Routes>
        {/* Default admin entry */}
        <Route
          path="/"
          element={<Navigate to="/admin/login" replace />}
        />

        <Route
          path="/admin"
          element={<Navigate to="/admin/login" replace />}
        />

        {/* Login without sidebar */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Shared admin layout */}
        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="subcategories"
            element={<AdminSubCategories />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="product-variants"
            element={<AdminProductVariants />}
          />

          <Route
            path="inventory"
            element={<AdminInventory />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="customers"
            element={<AdminCustomers />}
          />

          <Route
            path="coupons"
            element={<AdminCoupons />}
          />

          <Route
            path="delivery"
            element={<AdminDelivery />}
          />

          <Route
            path="reviews"
            element={<AdminReviews />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />

          <Route
            path="cms"
            element={<AdminCMS />}
          />

          <Route
            path="reports"
            element={<AdminReports />}
          />

          <Route
            path="settings"
            element={<AdminSettings />}
          />

          <Route
            path="admin-management"
            element={<AdminManagement />}
          />
        </Route>

        {/* Unknown admin routes */}
        <Route
          path="*"
          element={<Navigate to="/admin/login" replace />}
        />
      </Routes>
    </HashRouter>
  );
}