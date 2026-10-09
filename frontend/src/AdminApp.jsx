import { HashRouter, Routes, Route, Navigate } from "react-router-dom";

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
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/subcategories" element={<AdminSubCategories />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/product-variants" element={<AdminProductVariants />} />
        <Route path="/admin/inventory" element={<AdminInventory />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/coupons" element={<AdminCoupons />} />
        <Route path="/admin/delivery" element={<AdminDelivery />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/cms" element={<AdminCMS />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/admin-management" element={<AdminManagement />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

