
import { Outlet, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import "./AdminLayout.css";

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <div className="admin-layout-main">
        <main
          className="admin-main-content"
          key={location.pathname}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
