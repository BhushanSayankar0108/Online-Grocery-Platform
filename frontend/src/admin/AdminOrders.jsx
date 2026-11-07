import { useCallback, useEffect, useMemo, useState } from "react";

import {

  ChevronDown,

  Eye,

  Search,

  ShoppingCart,

  X,

  RefreshCw,

  AlertCircle,

} from "lucide-react";

import "./AdminOrders.css";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com").replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL) ? API_BASE_URL : `${API_BASE_URL}/api`;
const ORDERS_API = `${API_ROOT}/orders`;

const ORDER_STATUS_OPTIONS = [

  { value: "placed", label: "Placed" },

  { value: "confirmed", label: "Confirmed" },

  { value: "processing", label: "Processing" },

  { value: "packed", label: "Packed" },

  { value: "shipped", label: "Shipped / Out for Delivery" },

  { value: "delivered", label: "Delivered" },

  { value: "cancelled", label: "Cancelled" },

];

const PAYMENT_STATUS_OPTIONS = [

  { value: "pending", label: "Pending" },

  { value: "paid", label: "Paid" },

  { value: "failed", label: "Failed" },

  { value: "refunded", label: "Refunded" },

];

// Must match the backend's allowedTransitions in orderController.js.

const ALLOWED_TRANSITIONS = {

  placed: ["confirmed", "cancelled"],

  confirmed: ["processing", "cancelled"],

  processing: ["packed", "cancelled"],

  packed: ["shipped", "cancelled"],

  shipped: ["delivered"],

  delivered: [],

  cancelled: [],

};

const formatCurrency = (amount) =>

  `₹${Number(amount || 0).toLocaleString("en-IN", {

    maximumFractionDigits: 2,

  })}`;

const getToken = () => {
  try {
    return (
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken") ||
      ""
    );
  } catch {
    return "";
  }
};

const getErrorMessage = (data, fallback) =>

  data?.message || data?.error || fallback;

const formatDate = (dateValue) => {

  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return String(dateValue);

  return date.toLocaleDateString("en-IN", {

    day: "2-digit",

    month: "short",

    year: "numeric",

  });

};

const getStatusLabel = (status) => {

  const normalized = String(status || "").toLowerCase();

  return (

    ORDER_STATUS_OPTIONS.find((option) => option.value === normalized)

      ?.label || normalized || "Unknown"

  );

};

const getPaymentStatusLabel = (status) => {

  const normalized = String(status || "").toLowerCase();

  return (

    PAYMENT_STATUS_OPTIONS.find((option) => option.value === normalized)

      ?.label || normalized || "Unknown"

  );

};

const getPaymentMethodLabel = (method) => {

  if (!method) return "—";

  const normalized = String(method).toLowerCase();

  const labels = {

    cod: "Cash on Delivery",

    cash: "Cash",

    cash_on_delivery: "Cash on Delivery",

    online: "Online",

    upi: "UPI",

    card: "Card",

    netbanking: "Net Banking",

    wallet: "Wallet",

  };

  return labels[normalized] || method;

};

const getDeliveryAddress = (address) => {

  if (!address) return "Address not available";

  if (typeof address === "string") return address;

  return [

    address.fullName,

    address.addressLine1,

    address.addressLine2,

    address.landmark,

    address.city,

    address.state,

    address.postalCode,

  ]

    .filter(Boolean)

    .join(", ") || "Address not available";

};

const normalizeOrderItem = (item = {}) => {

  const product = item.product || item.productId || {};

  return {

    name:

      item.productName ||

      item.name ||

      product.name ||

      "Product",

    variant:

      typeof (item.variant || item.variantName || item.unit || product.unit) ===

      "string"

        ? item.variant || item.variantName || item.unit || product.unit || ""

        : "",

    quantity: Number(item.quantity ?? item.qty ?? 1),

    price: Number(

      item.unitPrice ??

        item.price ??

        item.sellingPrice ??

        item.priceAtPurchase ??

        product.sellingPrice ??

        0

    ),

  };

};

const normalizeOrder = (order = {}) => {

  const address = order.deliveryAddress || order.address || {};

  const rawItems = Array.isArray(order.items) ? order.items : [];

  return {

    ...order,

    id: String(order._id || order.id || ""),

    orderId:

      order.orderNumber ||

      order.orderId ||

      (order._id ? `ORD-${order._id.slice(-8).toUpperCase()}` : "—"),

    customerName:

      order.customerName ||

      address.fullName ||

      order.customer?.name ||

      "Guest Customer",

    customerEmail:

      order.customerEmail ||

      order.customer?.email ||

      "—",

    customerMobile:

      order.customerMobile ||

      address.mobile ||

      order.customer?.mobile ||

      "—",

    items: rawItems.map(normalizeOrderItem),

    totalAmount: Number(

      order.totalAmount ?? order.grandTotal ?? order.total ?? 0

    ),

    paymentMethod: getPaymentMethodLabel(order.paymentMethod),

    paymentStatus: String(order.paymentStatus || "pending").toLowerCase(),

    orderStatus: String(order.status || order.orderStatus || "placed")

      .toLowerCase(),

    orderDate: formatDate(order.createdAt || order.orderDate),

    deliveryAddress: getDeliveryAddress(address),

  };

};

const getAvailableTransitions = (status) =>

  ALLOWED_TRANSITIONS[String(status || "").toLowerCase()] || [];

const AdminOrders = () => {

  const [orders, setOrders] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedOrderStatus, setSelectedOrderStatus] = useState("all");

  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState(null);

  const [loading, setLoading] = useState(true);

  const [updatingOrderIds, setUpdatingOrderIds] = useState(() => new Set());

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const loadOrders = useCallback(async () => {

    setLoading(true);

    setError("");

    try {

      const token = getToken();

      if (!token) {

        throw new Error("Admin token not found. Please sign in again.");

      }

      const response = await fetch(`${ORDERS_API}?page=1&limit=100`, {

        method: "GET",

        headers: {

          Authorization: `Bearer ${token}`,

          Accept: "application/json",

        },

      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {

        throw new Error(

          "Your admin session is invalid or expired. Please sign in again."

        );

      }

      if (!response.ok || data.success === false) {

        throw new Error(getErrorMessage(data, "Failed to load orders."));

      }

      const records = Array.isArray(data)

        ? data

        : Array.isArray(data.orders)

          ? data.orders

          : Array.isArray(data.data?.orders)

            ? data.data.orders

            : Array.isArray(data.data)

              ? data.data

              : [];

      const normalizedOrders = records

        .map(normalizeOrder)

        .filter((order) => order.id);

      setOrders(normalizedOrders);

      // Keep the open details modal synchronized with the refreshed order.

      setSelectedOrder((previous) => {

        if (!previous) return null;

        return (

          normalizedOrders.find((order) => order.id === previous.id) || null

        );

      });

    } catch (err) {

      console.error("Failed to load orders:", err);

      const isNetworkError =

        err instanceof TypeError ||

        /failed to fetch|networkerror|connection refused/i.test(

          String(err?.message || "")

        );

      setError(

        isNetworkError

          ? `Cannot connect to the backend at ${API_BASE_URL}. Start the backend server and confirm that it is listening on this port.`

          : err.message || "Unable to load orders."

      );

      setOrders([]);

      setSelectedOrder(null);

    } finally {

      setLoading(false);

    }

  }, []);

  useEffect(() => {

    let cancelled = false;

    // Defer the request to avoid synchronous state updates in the effect.

    const timerId = setTimeout(() => {

      if (!cancelled) loadOrders();

    }, 0);

    return () => {

      cancelled = true;

      clearTimeout(timerId);

    };

  }, [loadOrders, refreshKey]);

  const filteredOrders = useMemo(() => {

    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {

      const matchesSearch =

        !search ||

        order.orderId.toLowerCase().includes(search) ||

        order.customerName.toLowerCase().includes(search) ||

        order.customerEmail.toLowerCase().includes(search) ||

        order.customerMobile.toLowerCase().includes(search) ||

        order.paymentMethod.toLowerCase().includes(search);

      const matchesOrderStatus =

        selectedOrderStatus === "all" ||

        order.orderStatus === selectedOrderStatus;

      const matchesPaymentStatus =

        selectedPaymentStatus === "all" ||

        order.paymentStatus === selectedPaymentStatus;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;

    });

  }, [

    orders,

    searchTerm,

    selectedOrderStatus,

    selectedPaymentStatus,

  ]);

  const handleStatusChange = async (orderId, newStatus) => {

    // Use the MongoDB ID, not the visible order number or table row index.

    const id = String(orderId);

    const currentOrder = orders.find((order) => order.id === id);

    if (

      !currentOrder ||

      currentOrder.orderStatus === newStatus ||

      updatingOrderIds.has(id)

    ) {

      return;

    }

    const allowed = getAvailableTransitions(currentOrder.orderStatus);

    if (!allowed.includes(newStatus)) {

      window.alert(

        `This transition is not allowed. Current status: ${getStatusLabel(

          currentOrder.orderStatus

        )}.`

      );

      return;

    }

    const oldLabel = getStatusLabel(currentOrder.orderStatus);

    const newLabel = getStatusLabel(newStatus);

    const confirmed = window.confirm(

      `Change order ${currentOrder.orderId} from "${oldLabel}" to "${newLabel}"?`

    );

    if (!confirmed) return;

    setUpdatingOrderIds((previous) => {

      const next = new Set(previous);

      next.add(id);

      return next;

    });

    setError("");

    try {

      const token = getToken();

      if (!token) {

        throw new Error("Admin session missing. Please sign in again.");

      }

      // Cancellation has a dedicated endpoint because the backend restores

      // stock and records the cancellation reason there.

      const isCancellation = newStatus === "cancelled";

      const endpoint = isCancellation

        ? `${ORDERS_API}/${encodeURIComponent(id)}/cancel`

        : `${ORDERS_API}/${encodeURIComponent(id)}/status`;

      const response = await fetch(endpoint, {

        method: "PATCH",

        headers: {

          Authorization: `Bearer ${token}`,

          "Content-Type": "application/json",

          Accept: "application/json",

        },

        body: JSON.stringify(

          isCancellation

            ? { reason: "Cancelled by admin" }

            : { status: newStatus }

        ),

      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {

        throw new Error(

          "Your admin session has expired. Please sign in again."

        );

      }

      if (!response.ok || data.success === false) {

        throw new Error(

          getErrorMessage(data, "Could not update the order status.")

        );

      }

      const rawUpdatedOrder =

        data.order || data.data?.order || data.data || null;

      if (rawUpdatedOrder && (rawUpdatedOrder._id || rawUpdatedOrder.id)) {

        const updatedOrder = normalizeOrder(rawUpdatedOrder);

        setOrders((previous) =>

          previous.map((order) =>

            order.id === id ? { ...order, ...updatedOrder } : order

          )

        );

        setSelectedOrder((previous) =>

          previous?.id === id ? { ...previous, ...updatedOrder } : previous

        );

      } else {

        // If the API does not return the order, update only the matching ID.

        setOrders((previous) =>

          previous.map((order) =>

            order.id === id

              ? { ...order, status: newStatus, orderStatus: newStatus }

              : order

          )

        );

        setSelectedOrder((previous) =>

          previous?.id === id

            ? { ...previous, status: newStatus, orderStatus: newStatus }

            : previous

        );

      }

      // Reload the database result so the UI reflects the server's final state.

      setRefreshKey((value) => value + 1);

    } catch (err) {

      console.error("Failed to update order status:", err);

      const isNetworkError =

        err instanceof TypeError ||

        /failed to fetch|networkerror|connection refused/i.test(

          String(err?.message || "")

        );

      window.alert(

        isNetworkError

          ? `Cannot connect to the backend at ${API_BASE_URL}. Check that the backend is running and the API URL/port is correct.`

          : err.message || "Failed to update order status."

      );

      // No optimistic status change was made before the server accepted it.

    } finally {

      setUpdatingOrderIds((previous) => {

        const next = new Set(previous);

        next.delete(id);

        return next;

      });

    }

  };

  const getTotalItems = (order) =>

    order.items.reduce(

      (total, item) => total + Number(item.quantity || 0),

      0

    );

  const openOrderDetails = (order) => setSelectedOrder(order);

  const closeOrderDetails = () => setSelectedOrder(null);

  const handleRefresh = () => {

    setRefreshKey((value) => value + 1);

  };

  const pendingCount = orders.filter((order) =>

    ["placed", "confirmed", "processing", "packed"].includes(order.orderStatus)

  ).length;

  const outForDeliveryCount = orders.filter(

    (order) => order.orderStatus === "shipped"

  ).length;

  const deliveredCount = orders.filter(

    (order) => order.orderStatus === "delivered"

  ).length;

  const renderStatusSelect = (order, inModal = false) => {

    const availableTransitions = getAvailableTransitions(order.orderStatus);

    const isUpdating = updatingOrderIds.has(order.id);

    return (

      <div className="order-status-select-wrapper">

        <select

          value={order.orderStatus}

          disabled={isUpdating || availableTransitions.length === 0}

          onChange={(event) =>

            handleStatusChange(order.id, event.target.value)

          }

          aria-label={`Change status for ${order.orderId}`}

          title={

            availableTransitions.length === 0

              ? `No further status changes allowed from ${getStatusLabel(

                  order.orderStatus

                )}`

              : "Change order status"

          }

        >

          <option value={order.orderStatus}>

            {isUpdating

              ? "Updating..."

              : getStatusLabel(order.orderStatus)}

          </option>

          {availableTransitions.map((status) => (

            <option key={status} value={status}>

              {getStatusLabel(status)}

            </option>

          ))}

        </select>

        <ChevronDown size={inModal ? 15 : 14} />

      </div>

    );

  };

  return (

    <div className="admin-orders-page">

      <div className="admin-orders-container">

        <div className="admin-orders-header">

          <div>

            <p className="admin-orders-eyebrow">Order Management</p>

            <h1>Orders</h1>

            <p className="admin-orders-header-text">

              Manage customer orders, payments and order status.

            </p>

          </div>

          <button

            type="button"

            onClick={handleRefresh}

            disabled={loading}

            title="Refresh orders"

            aria-label="Refresh orders"

          >

            <RefreshCw

              size={16}

              className={loading ? "animate-spin" : ""}

            />{" "}

            Refresh

          </button>

        </div>

        {error && (

          <div

            role="alert"

            style={{

              padding: "12px 16px",

              marginBottom: "18px",

              borderRadius: "8px",

              background: "#fff1f0",

              color: "#b42318",

              display: "flex",

              alignItems: "center",

              gap: "10px",

            }}

          >

            <AlertCircle size={18} />

            <span>{error}</span>

          </div>

        )}

        <div className="admin-orders-stats">

          <div className="admin-orders-stat-card">

            <div className="admin-orders-stat-icon">

              <ShoppingCart size={20} />

            </div>

            <div>

              <span>Total Orders</span>

              <strong>{loading ? "…" : orders.length}</strong>

            </div>

          </div>

          <div className="admin-orders-stat-card">

            <div className="admin-orders-stat-icon">

              <ShoppingCart size={20} />

            </div>

            <div>

              <span>Pending / Processing</span>

              <strong>{loading ? "…" : pendingCount}</strong>

            </div>

          </div>

          <div className="admin-orders-stat-card">

            <div className="admin-orders-stat-icon">

              <ShoppingCart size={20} />

            </div>

            <div>

              <span>Out for Delivery</span>

              <strong>{loading ? "…" : outForDeliveryCount}</strong>

            </div>

          </div>

          <div className="admin-orders-stat-card">

            <div className="admin-orders-stat-icon">

              <ShoppingCart size={20} />

            </div>

            <div>

              <span>Delivered</span>

              <strong>{loading ? "…" : deliveredCount}</strong>

            </div>

          </div>

        </div>

        <div className="admin-orders-toolbar">

          <div className="admin-orders-search">

            <Search size={18} />

            <input

              type="search"

              placeholder="Search order ID, customer or email..."

              value={searchTerm}

              onChange={(event) => setSearchTerm(event.target.value)}

              aria-label="Search orders"

            />

            {searchTerm && (

              <button

                type="button"

                className="admin-orders-clear-search"

                onClick={() => setSearchTerm("")}

                aria-label="Clear search"

                title="Clear search"

              >

                <X size={15} />

              </button>

            )}

          </div>

          <div className="admin-orders-filter">

            <select

              value={selectedOrderStatus}

              onChange={(event) => setSelectedOrderStatus(event.target.value)}

              aria-label="Filter by order status"

            >

              <option value="all">All Order Status</option>

              {ORDER_STATUS_OPTIONS.map((option) => (

                <option key={option.value} value={option.value}>

                  {option.label}

                </option>

              ))}

            </select>

            <ChevronDown size={17} />

          </div>

          <div className="admin-orders-filter">

            <select

              value={selectedPaymentStatus}

              onChange={(event) =>

                setSelectedPaymentStatus(event.target.value)

              }

              aria-label="Filter by payment status"

            >

              <option value="all">All Payment Status</option>

              {PAYMENT_STATUS_OPTIONS.map((option) => (

                <option key={option.value} value={option.value}>

                  {option.label}

                </option>

              ))}

            </select>

            <ChevronDown size={17} />

          </div>

        </div>

        <div className="admin-orders-table-card">

          <div className="admin-orders-table-header">

            <div>

              <h2>Order List</h2>

              <p>

                {loading

                  ? "Loading orders..."

                  : `${filteredOrders.length} order${

                      filteredOrders.length !== 1 ? "s" : ""

                    } found`}

              </p>

            </div>

          </div>

          <div className="admin-orders-table-wrapper">

            <table className="admin-orders-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Order</th>

                  <th>Customer</th>

                  <th>Items</th>

                  <th>Total</th>

                  <th>Payment</th>

                  <th>Order Status</th>

                  <th>Date</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td colSpan={9} className="orders-empty-state">

                      Loading orders from the database...

                    </td>

                  </tr>

                ) : filteredOrders.length > 0 ? (

                  filteredOrders.map((order, index) => (

                    <tr key={order.id}>

                      <td className="order-number">{index + 1}</td>

                      <td>

                        <div className="order-id-cell">

                          <strong>{order.orderId}</strong>

                          <span>{order.paymentMethod}</span>

                        </div>

                      </td>

                      <td>

                        <div className="order-customer-cell">

                          <strong>{order.customerName}</strong>

                          <span>{order.customerEmail}</span>

                        </div>

                      </td>

                      <td>

                        <span className="order-items-count">

                          {getTotalItems(order)} item

                          {getTotalItems(order) !== 1 ? "s" : ""}

                        </span>

                      </td>

                      <td>

                        <strong className="order-total">

                          {formatCurrency(order.totalAmount)}

                        </strong>

                      </td>

                      <td>

                        <span

                          className={`order-payment-status ${order.paymentStatus}`}

                        >

                          {getPaymentStatusLabel(order.paymentStatus)}

                        </span>

                      </td>

                      <td>{renderStatusSelect(order)}</td>

                      <td className="order-date">{order.orderDate}</td>

                      <td>

                        <div className="order-actions">

                          <button

                            type="button"

                            className="order-view-button"

                            title="View Order"

                            aria-label={`View order ${order.orderId}`}

                            onClick={() => openOrderDetails(order)}

                          >

                            <Eye size={16} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td colSpan={9} className="orders-empty-state">

                      <div>

                        <ShoppingCart size={34} />

                        <h3>

                          {error

                            ? "Orders could not be loaded"

                            : "No orders found"}

                        </h3>

                        <p>

                          {error

                            ? "Check your admin login and backend API."

                            : "Try changing your search or filters."}

                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {selectedOrder && (

        <div

          className="admin-orders-modal-overlay"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) closeOrderDetails();

          }}

        >

          <div

            className="admin-orders-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="order-modal-title"

          >

            <div className="admin-orders-modal-header">

              <div>

                <p>Order Details</p>

                <h2 id="order-modal-title">{selectedOrder.orderId}</h2>

              </div>

              <button

                type="button"

                className="admin-orders-modal-close"

                onClick={closeOrderDetails}

                aria-label="Close order details"

              >

                <X size={20} />

              </button>

            </div>

            <div className="admin-orders-modal-body">

              <div className="order-detail-section">

                <h3>Customer Information</h3>

                <div className="order-detail-grid">

                  <div>

                    <span>Customer</span>

                    <strong>{selectedOrder.customerName}</strong>

                  </div>

                  <div>

                    <span>Email</span>

                    <strong>{selectedOrder.customerEmail}</strong>

                  </div>

                  <div>

                    <span>Mobile</span>

                    <strong>{selectedOrder.customerMobile}</strong>

                  </div>

                  <div>

                    <span>Delivery Address</span>

                    <strong>{selectedOrder.deliveryAddress}</strong>

                  </div>

                  <div>

                    <span>Order Date</span>

                    <strong>{selectedOrder.orderDate}</strong>

                  </div>

                </div>

              </div>

              <div className="order-detail-section">

                <h3>Ordered Items</h3>

                <div className="order-items-list">

                  {selectedOrder.items.length > 0 ? (

                    selectedOrder.items.map((item, index) => (

                      <div

                        className="order-item-row"

                        key={`${item.name}-${index}`}

                      >

                        <div>

                          <strong>{item.name}</strong>

                          <span>

                            {item.variant ? `${item.variant} × ` : ""}

                            {item.quantity}

                          </span>

                        </div>

                        <strong>

                          {formatCurrency(item.price * item.quantity)}

                        </strong>

                      </div>

                    ))

                  ) : (

                    <p>Item details are not available.</p>

                  )}

                </div>

              </div>

              <div className="order-detail-section">

                <h3>Payment Information</h3>

                <div className="order-payment-detail">

                  <div>

                    <span>Method</span>

                    <strong>{selectedOrder.paymentMethod}</strong>

                  </div>

                  <div>

                    <span>Status</span>

                    <span

                      className={`order-payment-status ${selectedOrder.paymentStatus}`}

                    >

                      {getPaymentStatusLabel(selectedOrder.paymentStatus)}

                    </span>

                  </div>

                  <div>

                    <span>Total Amount</span>

                    <strong className="order-detail-total">

                      {formatCurrency(selectedOrder.totalAmount)}

                    </strong>

                  </div>

                </div>

              </div>

              <div className="order-detail-section">

                <h3>Order Status</h3>

                <div className="order-detail-status-control">

                  {renderStatusSelect(selectedOrder, true)}

                  <span>

                    Current status:{" "}

                    <strong>

                      {getStatusLabel(selectedOrder.orderStatus)}

                    </strong>

                  </span>

                </div>

              </div>

            </div>

            <div className="admin-orders-modal-footer">

              <button

                type="button"

                className="order-modal-close-button"

                onClick={closeOrderDetails}

              >

                Close

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default AdminOrders;
