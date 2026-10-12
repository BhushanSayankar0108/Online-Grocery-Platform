import { useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import "./AdminOrders.css";

const INITIAL_ORDERS = [
  {
    id: 1,
    orderId: "ORD-20261001-001",
    customerName: "Rahul Sharma",
    customerEmail: "rahul@example.com",
    items: [
      {
        name: "Fresh Red Apples",
        variant: "1 kg",
        quantity: 2,
        price: 189,
      },
      {
        name: "Fresh Full Cream Milk",
        variant: "1 L",
        quantity: 2,
        price: 68,
      },
    ],
    totalAmount: 514,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderStatus: "delivered",
    orderDate: "01 Oct 2026",
    deliveryAddress: "Wardha, Maharashtra",
  },
  {
    id: 2,
    orderId: "ORD-20261001-002",
    customerName: "Priya Patil",
    customerEmail: "priya@example.com",
    items: [
      {
        name: "Basmati Rice",
        variant: "5 kg Pack",
        quantity: 1,
        price: 599,
      },
    ],
    totalAmount: 599,
    paymentMethod: "Card",
    paymentStatus: "paid",
    orderStatus: "out-for-delivery",
    orderDate: "01 Oct 2026",
    deliveryAddress: "Nagpur, Maharashtra",
  },
  {
    id: 3,
    orderId: "ORD-20261002-003",
    customerName: "Amit Verma",
    customerEmail: "amit@example.com",
    items: [
      {
        name: "Fresh Red Apples",
        variant: "500 g",
        quantity: 1,
        price: 99,
      },
      {
        name: "Butter Cookies",
        variant: "200 g",
        quantity: 2,
        price: 120,
      },
    ],
    totalAmount: 339,
    paymentMethod: "Cash on Delivery",
    paymentStatus: "pending",
    orderStatus: "confirmed",
    orderDate: "02 Oct 2026",
    deliveryAddress: "Pune, Maharashtra",
  },
  {
    id: 4,
    orderId: "ORD-20261002-004",
    customerName: "Sneha Joshi",
    customerEmail: "sneha@example.com",
    items: [
      {
        name: "Fresh Full Cream Milk",
        variant: "1 L",
        quantity: 3,
        price: 68,
      },
    ],
    totalAmount: 204,
    paymentMethod: "UPI",
    paymentStatus: "paid",
    orderStatus: "picking",
    orderDate: "02 Oct 2026",
    deliveryAddress: "Amravati, Maharashtra",
  },
  {
    id: 5,
    orderId: "ORD-20261002-005",
    customerName: "Vikas Gupta",
    customerEmail: "vikas@example.com",
    items: [
      {
        name: "Basmati Rice",
        variant: "5 kg Pack",
        quantity: 2,
        price: 599,
      },
    ],
    totalAmount: 1198,
    paymentMethod: "Card",
    paymentStatus: "failed",
    orderStatus: "cancelled",
    orderDate: "02 Oct 2026",
    deliveryAddress: "Mumbai, Maharashtra",
  },
];

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "picking", label: "Picking" },
  { value: "packed", label: "Packed" },
  { value: "out-for-delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

const AdminOrders = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] =
    useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getOrderStatusLabel = (status) => {
    const option = ORDER_STATUS_OPTIONS.find(
      (item) => item.value === status
    );

    return option ? option.label : status;
  };

  const getPaymentStatusLabel = (status) => {
    const option = PAYMENT_STATUS_OPTIONS.find(
      (item) => item.value === status
    );

    return option ? option.label : status;
  };

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !search ||
        order.orderId.toLowerCase().includes(search) ||
        order.customerName.toLowerCase().includes(search) ||
        order.customerEmail.toLowerCase().includes(search) ||
        order.paymentMethod.toLowerCase().includes(search);

      const matchesOrderStatus =
        selectedOrderStatus === "all" ||
        order.orderStatus === selectedOrderStatus;

      const matchesPaymentStatus =
        selectedPaymentStatus === "all" ||
        order.paymentStatus === selectedPaymentStatus;

      return (
        matchesSearch &&
        matchesOrderStatus &&
        matchesPaymentStatus
      );
    });
  }, [
    orders,
    searchTerm,
    selectedOrderStatus,
    selectedPaymentStatus,
  ]);

  // Update the table and open details modal together.
  const handleStatusChange = (orderId, newStatus) => {
    const currentOrder = orders.find(
      (order) => order.id === orderId
    );

    if (!currentOrder || currentOrder.orderStatus === newStatus) {
      return;
    }

    const oldStatus = getOrderStatusLabel(
      currentOrder.orderStatus
    );
    const newStatusLabel = getOrderStatusLabel(newStatus);

    const confirmed = window.confirm(
      `Change order ${currentOrder.orderId} status from "${oldStatus}" to "${newStatusLabel}"?`
    );

    if (!confirmed) return;

    setOrders((previous) =>
      previous.map((order) =>
        order.id === orderId
          ? { ...order, orderStatus: newStatus }
          : order
      )
    );

    setSelectedOrder((previous) =>
      previous?.id === orderId
        ? { ...previous, orderStatus: newStatus }
        : previous
    );
  };

  const handleDelete = (order) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove order "${order.orderId}" from the list? This action cannot be undone.`
    );

    if (!confirmed) return;

    setOrders((previous) =>
      previous.filter((item) => item.id !== order.id)
    );

    setSelectedOrder((previous) =>
      previous?.id === order.id ? null : previous
    );

    window.alert("Order removed successfully.");
  };

  const getTotalItems = (order) =>
    order.items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );

  const openOrderDetails = (order) => {
    setSelectedOrder({ ...order });
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-container">
        {/* Header */}
        <div className="admin-orders-header">
          <div>
            <p className="admin-orders-eyebrow">
              Order Management
            </p>

            <h1>Orders</h1>

            <p className="admin-orders-header-text">
              Manage customer orders, payments and order status.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-orders-stats">
          <div className="admin-orders-stat-card">
            <div className="admin-orders-stat-icon">
              <ShoppingCart size={20} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="admin-orders-stat-card">
            <div className="admin-orders-stat-icon">
              <ShoppingCart size={20} />
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {
                  orders.filter(
                    (order) => order.orderStatus === "pending"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="admin-orders-stat-card">
            <div className="admin-orders-stat-icon">
              <ShoppingCart size={20} />
            </div>

            <div>
              <span>Out for Delivery</span>
              <strong>
                {
                  orders.filter(
                    (order) =>
                      order.orderStatus === "out-for-delivery"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="admin-orders-stat-card">
            <div className="admin-orders-stat-icon">
              <ShoppingCart size={20} />
            </div>

            <div>
              <span>Delivered</span>
              <strong>
                {
                  orders.filter(
                    (order) => order.orderStatus === "delivered"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="admin-orders-toolbar">
          <div className="admin-orders-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search order ID, customer or email..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
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
              onChange={(event) =>
                setSelectedOrderStatus(event.target.value)
              }
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

        {/* Orders table */}
        <div className="admin-orders-table-card">
          <div className="admin-orders-table-header">
            <div>
              <h2>Order List</h2>

              <p>
                {filteredOrders.length} order
                {filteredOrders.length !== 1 ? "s" : ""} found
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
                {filteredOrders.length > 0 ? (
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

                      <td>
                        <div className="order-status-select-wrapper">
                          <select
                            value={order.orderStatus}
                            onChange={(event) =>
                              handleStatusChange(
                                order.id,
                                event.target.value
                              )
                            }
                            aria-label={`Change status for ${order.orderId}`}
                          >
                            {ORDER_STATUS_OPTIONS.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>

                          <ChevronDown size={14} />
                        </div>
                      </td>

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

                          <button
                            type="button"
                            className="order-delete-button"
                            title="Delete Order"
                            aria-label={`Delete order ${order.orderId}`}
                            onClick={() => handleDelete(order)}
                          >
                            <Trash2 size={16} />
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

                        <h3>No orders found</h3>

                        <p>
                          Try changing your search or filters.
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

      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="admin-orders-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeOrderDetails();
            }
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

                <h2 id="order-modal-title">
                  {selectedOrder.orderId}
                </h2>
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
              {/* Customer information */}
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
                    <span>Delivery Address</span>
                    <strong>{selectedOrder.deliveryAddress}</strong>
                  </div>

                  <div>
                    <span>Order Date</span>
                    <strong>{selectedOrder.orderDate}</strong>
                  </div>
                </div>
              </div>

              {/* Ordered items */}
              <div className="order-detail-section">
                <h3>Ordered Items</h3>

                <div className="order-items-list">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      className="order-item-row"
                      key={`${item.name}-${item.variant}-${index}`}
                    >
                      <div>
                        <strong>{item.name}</strong>

                        <span>
                          {item.variant} × {item.quantity}
                        </span>
                      </div>

                      <strong>
                        {formatCurrency(item.price * item.quantity)}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment information */}
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
                      {getPaymentStatusLabel(
                        selectedOrder.paymentStatus
                      )}
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

              {/* Order status */}
              <div className="order-detail-section">
                <h3>Order Status</h3>

                <div className="order-detail-status-control">
                  <div className="order-status-select-wrapper">
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(event) =>
                        handleStatusChange(
                          selectedOrder.id,
                          event.target.value
                        )
                      }
                      aria-label="Change order status in details"
                    >
                      {ORDER_STATUS_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <ChevronDown size={15} />
                  </div>

                  <span>
                    Current status:{" "}
                    <strong>
                      {getOrderStatusLabel(selectedOrder.orderStatus)}
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