
import { useEffect, useState } from "react";
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
  Eye,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import "./AdminDashboard.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const EMPTY_DASHBOARD = {
  totalOrders: 0,
  totalRevenue: 0,
  ordersByStatus: {
    placed: 0,
    confirmed: 0,
    processing: 0,
    packed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  },
  recentOrders: [],
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (status) => {
  const labels = {
    placed: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[String(status || "").toLowerCase()] || status || "Unknown";
};

const getStatusClass = (status) => {
  const classes = {
    placed: "pending",
    confirmed: "processing",
    processing: "processing",
    packed: "processing",
    shipped: "delivery",
    delivered: "delivered",
    cancelled: "cancelled",
  };

  return classes[String(status || "").toLowerCase()] || "pending";
};

const getProductName = (item) => {
  if (item?.productName) return item.productName;
  if (item?.product?.name) return item.product.name;
  return "Product";
};

const getOrderItemCount = (order) => {
  if (!Array.isArray(order?.items)) return 0;

  return order.items.reduce(
    (total, item) => total + (Number(item?.quantity) || 0),
    0
  );
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read the saved administrator directly during initialization.
  const [adminUser] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem("adminUser");
      return savedAdmin ? JSON.parse(savedAdmin) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAPI = async (endpoint, token) => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      let result;

      try {
        result = await response.json();
      } catch {
        throw new Error("The server returned an invalid response.");
      }

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || `Request failed (${response.status}).`
        );
      }

      return result;
    };

    const loadDashboard = async () => {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        if (isMounted) {
          setError("Admin session not found. Please log in again.");
          setLoading(false);
        }
        return;
      }

      try {
        const results = await Promise.allSettled([
          fetchAPI("/api/orders/dashboard-stats", token),
          fetchAPI("/api/products/admin/all?limit=100", token),
          fetchAPI("/api/admin/customers?limit=1", token),
          fetchAPI("/api/inventory?lowStock=true&limit=100", token),
        ]);

        if (!isMounted) return;

        const [
          ordersResult,
          productsResult,
          customersResult,
          inventoryResult,
        ] = results;

        const failedRequests = [];

        if (ordersResult.status === "fulfilled") {
          const result = ordersResult.value;
          const data = result.data || result;

          setDashboard({
            ...EMPTY_DASHBOARD,
            ...data,
            ordersByStatus: {
              ...EMPTY_DASHBOARD.ordersByStatus,
              ...(data.ordersByStatus || {}),
            },
            recentOrders: Array.isArray(data.recentOrders)
              ? data.recentOrders
              : [],
          });
        } else {
          failedRequests.push("orders");
          setDashboard(EMPTY_DASHBOARD);
          console.error(
            "Dashboard orders request failed:",
            ordersResult.reason
          );
        }

        if (productsResult.status === "fulfilled") {
          const result = productsResult.value;

          setTotalProducts(
            Number(
              result.total ??
                result.count ??
                result.products?.length ??
                0
            ) || 0
          );
        } else {
          failedRequests.push("products");
          setTotalProducts(0);
          console.error(
            "Dashboard products request failed:",
            productsResult.reason
          );
        }

        if (customersResult.status === "fulfilled") {
          const result = customersResult.value;

          setTotalCustomers(
            Number(
              result.stats?.totalCustomers ??
                result.total ??
                result.count ??
                0
            ) || 0
          );
        } else {
          failedRequests.push("customers");
          setTotalCustomers(0);
          console.error(
            "Dashboard customers request failed:",
            customersResult.reason
          );
        }

        if (inventoryResult.status === "fulfilled") {
          const result = inventoryResult.value;

          setLowStockCount(
            Number(
              result.total ??
                result.count ??
                result.inventory?.length ??
                0
            ) || 0
          );

          setLowStockItems(
            Array.isArray(result.inventory) ? result.inventory : []
          );
        } else {
          failedRequests.push("inventory");
          setLowStockCount(0);
          setLowStockItems([]);
          console.error(
            "Dashboard inventory request failed:",
            inventoryResult.reason
          );
        }

        if (failedRequests.length > 0) {
          setError(
            `Unable to load ${failedRequests.join(
              ", "
            )}. Check the backend routes and admin authentication.`
          );
        } else {
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setError(
            requestError.message || "Unable to load dashboard information."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const navigateTo = (path) => {
    navigate(path);
  };

  const statusCounts = dashboard.ordersByStatus;

  const statistics = [
    {
      title: "Total Orders",
      value: loading ? "…" : String(dashboard.totalOrders || 0),
      icon: ShoppingCart,
      type: "blue",
      path: "/admin/orders",
    },
    {
      title: "Total Products",
      value: loading ? "…" : String(totalProducts),
      icon: Package,
      type: "green",
      path: "/admin/products",
    },
    {
      title: "Total Customers",
      value: loading ? "…" : String(totalCustomers),
      icon: Users,
      type: "purple",
      path: "/admin/customers",
    },
    {
      title: "Non-cancelled Order Value",
      value: loading ? "…" : formatCurrency(dashboard.totalRevenue),
      icon: IndianRupee,
      type: "orange",
      path: "/admin/reports",
    },
  ];

  const orderStatus = [
    {
      title: "Pending",
      value: statusCounts.placed || 0,
      icon: Clock,
      type: "orange",
    },
    {
      title: "Processing",
      value:
        (statusCounts.confirmed || 0) +
        (statusCounts.processing || 0) +
        (statusCounts.packed || 0),
      icon: Package,
      type: "blue",
    },
    {
      title: "Out for Delivery",
      value: statusCounts.shipped || 0,
      icon: Truck,
      type: "purple",
    },
    {
      title: "Delivered",
      value: statusCounts.delivered || 0,
      icon: CheckCircle,
      type: "green",
    },
  ];

  const quickActions = [
    {
      title: "Add Product",
      description: "Add a new product to your store",
      icon: Plus,
      path: "/admin/products",
    },
    {
      title: "Manage Categories",
      description: "Organize your product categories",
      icon: Tags,
      path: "/admin/categories",
    },
    {
      title: "Manage Subcategories",
      description: "Manage product subcategories",
      icon: Layers,
      path: "/admin/subcategories",
    },
    {
      title: "Create Coupon",
      description: "Manage promotional offers",
      icon: TicketPercent,
      path: "/admin/coupons",
    },
  ];

  const recentOrders = dashboard.recentOrders;

  const displayName =
    adminUser?.name ||
    adminUser?.fullName ||
    adminUser?.email ||
    "Administrator";

  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="admin-dashboard">
      <AdminSidebar />

      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <div className="admin-dashboard-welcome">
            <h1 className="admin-dashboard-title">Dashboard</h1>
            <p>Welcome back! Here's what's happening with your store.</p>
          </div>

          <div className="admin-dashboard-user">
            <div className="admin-dashboard-avatar">{avatarLetter}</div>
            <div className="admin-dashboard-user-info">
              <strong>{displayName}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="admin-dashboard-content">
          {error && (
            <div
              role="alert"
              style={{
                marginBottom: "20px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "#fff4e5",
                color: "#8a4b08",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          <section className="admin-dashboard-section">
            <div className="admin-dashboard-section-heading">
              <h2>Store Overview</h2>
            </div>

            <div className="admin-dashboard-stat-grid">
              {statistics.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`admin-dashboard-stat-card ${item.type}`}
                    key={item.title}
                    onClick={() => navigateTo(item.path)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigateTo(item.path);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="admin-dashboard-stat-top">
                      <div className="admin-dashboard-stat-icon">
                        <Icon size={22} />
                      </div>
                    </div>

                    <div className="admin-dashboard-stat-value">
                      {item.value}
                    </div>

                    <div className="admin-dashboard-stat-title">
                      {item.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="admin-dashboard-section-heading">
              <h2>Order Status</h2>
            </div>

            <div className="admin-dashboard-order-grid">
              {orderStatus.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className={`admin-dashboard-order-card ${item.type}`}
                    key={item.title}
                  >
                    <div className="admin-dashboard-order-icon">
                      <Icon size={22} />
                    </div>

                    <div className="admin-dashboard-order-content">
                      <div className="admin-dashboard-order-value">
                        {loading ? "…" : item.value}
                      </div>
                      <div className="admin-dashboard-order-title">
                        {item.title}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="admin-dashboard-section-heading">
              <h2>Quick Actions</h2>
            </div>

            <div className="admin-dashboard-quick-grid">
              {quickActions.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    className="admin-dashboard-quick-card"
                    key={item.title}
                    onClick={() => navigateTo(item.path)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigateTo(item.path);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="admin-dashboard-quick-icon">
                      <Icon size={22} />
                    </div>

                    <div className="admin-dashboard-quick-content">
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="admin-dashboard-section-heading">
              <h2>Recent Orders</h2>

              <button
                type="button"
                className="admin-dashboard-view-all-button"
                onClick={() => navigateTo("/admin/orders")}
              >
                <Eye size={16} />
                View All
              </button>
            </div>

            <div className="admin-dashboard-orders-wrapper">
              <table className="admin-dashboard-orders-table">
                <thead>
                  <tr className="admin-dashboard-orders-header">
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        Loading recent orders…
                      </td>
                    </tr>
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center" }}>
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order, index) => (
                      <tr
                        className="admin-dashboard-order-row"
                        key={order._id || order.orderNumber || index}
                      >
                        <td className="admin-dashboard-order-id">
                          {order.orderNumber ||
                            (order._id
                              ? `#${order._id.slice(-6).toUpperCase()}`
                              : "—")}
                        </td>

                        <td className="admin-dashboard-order-customer">
                          {order.customerName || "Guest Customer"}
                        </td>

                        <td className="admin-dashboard-order-items">
                          {getOrderItemCount(order)}
                        </td>

                        <td className="admin-dashboard-order-amount">
                          {formatCurrency(order.totalAmount)}
                        </td>

                        <td>
                          <span
                            className={`admin-dashboard-order-status ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td className="admin-dashboard-order-date">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-dashboard-section">
            <div className="admin-dashboard-section-heading">
              <h2>Inventory Alerts</h2>
            </div>

            <div className="admin-dashboard-alert-grid">
              <div className="admin-dashboard-alert-card">
                <div className="admin-dashboard-alert-icon">
                  <AlertTriangle size={22} />
                </div>

                <div className="admin-dashboard-alert-content">
                  <h3>Low Stock Products</h3>
                  <p>
                    {loading
                      ? "Checking inventory…"
                      : `${lowStockCount} inventory record(s) need attention.`}
                  </p>
                </div>
              </div>
            </div>

            {!loading && lowStockItems.length > 0 && (
              <div className="admin-dashboard-orders-wrapper">
                <table className="admin-dashboard-orders-table">
                  <thead>
                    <tr className="admin-dashboard-orders-header">
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Available Stock</th>
                      <th>Low Stock Threshold</th>
                    </tr>
                  </thead>

                  <tbody>
                    {lowStockItems.slice(0, 5).map((item, index) => {
                      const product = item.product || {};
                      const stockQuantity = Number(item.stockQuantity) || 0;
                      const reservedQuantity =
                        Number(item.reservedQuantity) || 0;
                      const availableStock = Math.max(
                        0,
                        stockQuantity - reservedQuantity
                      );

                      return (
                        <tr
                          className="admin-dashboard-order-row"
                          key={item._id || product._id || index}
                        >
                          <td className="admin-dashboard-order-customer">
                            {getProductName(item)}
                          </td>

                          <td>{product.sku || item.sku || "—"}</td>

                          <td>{availableStock}</td>

                          <td>{Number(item.lowStockThreshold) || 0}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && lowStockCount === 0 && !error && (
              <p>No low-stock inventory records were found.</p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
