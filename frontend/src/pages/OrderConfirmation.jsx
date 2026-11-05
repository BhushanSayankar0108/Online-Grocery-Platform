
import { useMemo } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock3,
  ShieldCheck,
  MapPin,
  CreditCard,
  QrCode,
  Copy,
  AlertCircle,
} from "lucide-react";

function readLastOrder() {
  try {
    const value = localStorage.getItem("lastOrder");
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatExpiry(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getOrderStatus(status) {
  const value = String(status || "placed").toLowerCase();

  const labels = {
    placed: "Order placed",
    confirmed: "Confirmed",
    processing: "Preparing",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };

  return labels[value] || "Order placed";
}

function getPaymentMethod(method) {
  const value = String(method || "").toLowerCase();

  if (value === "cod") return "Cash on Delivery";
  if (value === "online") return "Online payment";

  return method || "Not specified";
}

function getPaymentStatus(status) {
  const value = String(status || "pending").toLowerCase();

  const labels = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  };

  return labels[value] || value;
}

function OrderConfirmation() {
  const location = useLocation();

  const order = useMemo(
    () => location.state?.order || readLastOrder(),
    [location.state]
  );

  // QR details returned by the backend when the order is created.
  const paymentQr =
    location.state?.qrCode ||
    location.state?.paymentQr ||
    (order?.razorpayQrCodeId
      ? {
          id: order.razorpayQrCodeId,
          imageUrl: order.paymentQrImageUrl,
          expiresAt: order.paymentQrExpiresAt,
        }
      : null);

  if (!order) {
    return <Navigate to="/shop" replace />;
  }

  const orderNumber =
    order.orderNumber || order._id || order.id || "Order received";

  const orderIdForTracking = order._id || order.id || order.orderNumber;

  const trackingPath = orderIdForTracking
    ? `/order-tracking/${encodeURIComponent(
        String(orderIdForTracking)
      )}`
    : "/shop";

  const address = order.deliveryAddress || order.address || {};

  const addressLine1 =
    address.addressLine1 ||
    address.address ||
    address.streetAddress ||
    "";

  const addressLine2 = address.addressLine2 || "";

  const postalCode =
    address.postalCode ||
    address.pinCode ||
    address.zipCode ||
    "";

  const customerName =
    address.fullName ||
    address.name ||
    order.customerName ||
    "";

  const paymentMethod = getPaymentMethod(order.paymentMethod);
  const paymentStatus = String(
    order.paymentStatus || "pending"
  ).toLowerCase();

  const isOnlinePayment =
    String(order.paymentMethod || "").toLowerCase() === "online";

  const isPaid = paymentStatus === "paid";
  const isPending = paymentStatus === "pending";

  const status = String(order.status || "placed").toLowerCase();
  const isCancelled = status === "cancelled";
  const isDelivered = status === "delivered";
  const isShipped = status === "shipped";
  const isPacked = status === "packed";

  const isPreparing =
    status === "processing" || status === "confirmed";

  const subtotal = order.subtotal;
  const deliveryCharge = order.deliveryCharge;
  const discount = order.discountAmount ?? order.discount ?? 0;
  const total = order.totalAmount ?? order.total;

  const qrImageUrl =
    paymentQr?.imageUrl ||
    paymentQr?.image_url ||
    order.paymentQrImageUrl ||
    "";

  const qrExpiry =
    paymentQr?.expiresAt ||
    paymentQr?.closeBy ||
    order.paymentQrExpiresAt;

  return (
    <main className="confirmation-page">
      <div className="confirmation-container">
        <section className="confirmation-card">
          <div className="confirmation-success-icon">
            {isCancelled ? (
              <AlertCircle size={42} strokeWidth={1.7} />
            ) : (
              <CheckCircle2 size={42} strokeWidth={1.7} />
            )}
          </div>

          <span className="confirmation-eyebrow">
            {isCancelled
              ? "ORDER CANCELLED"
              : "ORDER CONFIRMATION"}
          </span>

          <h1>
            {isCancelled
              ? "This order was cancelled."
              : isOnlinePayment && isPending
                ? "Your order is awaiting payment"
                : "Thanks for your order!"}
          </h1>

          <p className="confirmation-intro">
            {isCancelled
              ? "This order is currently marked as cancelled. Please contact support if you need help."
              : isOnlinePayment && isPending
                ? "Your order has been created. Complete your payment using the QR code below. Payment confirmation may take a moment."
                : "Your order has been placed successfully. We'll keep you updated as it moves towards your doorstep."}
          </p>

          <div className="confirmation-order">
            <div>
              <span>ORDER NUMBER</span>
              <strong>#{orderNumber}</strong>
              <small style={{ display: "block", marginTop: 6 }}>
                Status: {getOrderStatus(order.status)}
              </small>
            </div>

            <div className="confirmation-order-icon">
              <PackageCheck size={22} />
            </div>
          </div>

          {/* Razorpay QR payment */}
          {isOnlinePayment && isPending && !isCancelled && (
            <div
              style={{
                margin: "24px 0",
                padding: 20,
                border: "1px solid #e5e7eb",
                borderRadius: 16,
                textAlign: "center",
              }}
            >
              <QrCode
                size={30}
                style={{ margin: "0 auto 10px" }}
              />

              <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>
                Scan to pay
              </h2>

              <p style={{ margin: "0 0 16px", color: "#6b7280" }}>
                Scan this Razorpay QR code using a supported UPI app.
              </p>

              {qrImageUrl ? (
                <img
                  src={qrImageUrl}
                  alt="Razorpay payment QR code"
                  style={{
                    display: "block",
                    width: "100%",
                    maxWidth: 260,
                    margin: "0 auto 16px",
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <p style={{ color: "#b45309" }}>
                  The QR code is not available on this page.
                  Please check your order details or contact support.
                </p>
              )}

              <p
                style={{
                  fontSize: 14,
                  color: "#6b7280",
                  marginBottom: 6,
                }}
              >
                Amount to pay
              </p>

              <strong style={{ fontSize: 26 }}>
                {formatCurrency(total)}
              </strong>

              {qrExpiry && (
                <p
                  style={{
                    margin: "12px 0",
                    fontSize: 13,
                    color: "#6b7280",
                  }}
                >
                  QR expiry: {formatExpiry(qrExpiry)}
                </p>
              )}

              {paymentQr?.id && (
                <button
                  type="button"
                  onClick={() =>
                    navigator.clipboard?.writeText(paymentQr.id)
                  }
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <Copy size={15} />
                  Copy QR reference
                </button>
              )}

              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: 13,
                  color: "#92400e",
                }}
              >
                Your order will show as paid only after the
                payment is verified by the server. Do not pay
                again if your UPI app already shows a successful
                transaction.
              </p>
            </div>
          )}

          {isOnlinePayment && !paymentQr && isPending && !isCancelled && (
            <div
              style={{
                padding: 14,
                margin: "20px 0",
                border: "1px solid #fcd34d",
                borderRadius: 10,
                color: "#92400e",
              }}
            >
              <AlertCircle
                size={18}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: 8,
                }}
              />
              Payment QR information was not received. Do not
              create another order or pay an unverified QR code.
              Please contact support.
            </div>
          )}

          <div className="confirmation-status">
            <div className={`status-step ${!isCancelled ? "active" : ""}`}>
              <div className="status-icon">
                <CheckCircle2 size={18} />
              </div>
              <strong>Order Placed</strong>
              <span>{isCancelled ? "Order cancelled" : "Complete"}</span>
            </div>

            <div
              className={`status-line ${
                isPreparing || isPacked || isShipped || isDelivered
                  ? "active"
                  : ""
              }`}
            />

            <div
              className={`status-step ${
                isPreparing || isPacked || isShipped || isDelivered
                  ? "active"
                  : ""
              }`}
            >
              <div className="status-icon">
                <PackageCheck size={18} />
              </div>
              <strong>Preparing</strong>
              <span>
                {isPacked || isShipped || isDelivered
                  ? "Complete"
                  : isPreparing
                    ? "In progress"
                    : "Coming next"}
              </span>
            </div>

            <div
              className={`status-line ${isDelivered ? "active" : ""}`}
            />

            <div className={`status-step ${isDelivered ? "active" : ""}`}>
              <div className="status-icon">
                <Truck size={18} />
              </div>
              <strong>Delivered</strong>
              <span>
                {isDelivered ? "Complete" : "To your doorstep"}
              </span>
            </div>
          </div>

          <div className="confirmation-delivery-note">
            <Clock3 size={18} />
            <div>
              <strong>
                {order.deliverySlot
                  ? `Delivery slot: ${order.deliverySlot}`
                  : "We'll keep you updated"}
              </strong>
              <span>
                {order.deliveryInstructions ||
                  "You can check the order status from your orders section."}
              </span>
            </div>
          </div>

          {(customerName || addressLine1 || address.city) && (
            <div className="confirmation-delivery-note">
              <MapPin size={18} />
              <div>
                <strong>Delivery address</strong>
                <span>
                  {[
                    customerName,
                    addressLine1,
                    addressLine2,
                    [address.city, address.state]
                      .filter(Boolean)
                      .join(", "),
                    postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            </div>
          )}

          <div className="confirmation-delivery-note">
            <CreditCard size={18} />
            <div>
              <strong>{paymentMethod}</strong>
              <span>
                Payment status: {getPaymentStatus(paymentStatus)}
                {isOnlinePayment && isPaid
                  ? " — Payment verified"
                  : ""}
              </span>
            </div>
          </div>

          <div
            className="confirmation-order-breakdown"
            style={{ textAlign: "left", margin: "20px 0" }}
          >
            {subtotal !== undefined && subtotal !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <span>Subtotal</span>
                <strong>{formatCurrency(subtotal)}</strong>
              </div>
            )}

            {Number(discount) > 0 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <span>Discount</span>
                <strong>−{formatCurrency(discount)}</strong>
              </div>
            )}

            {deliveryCharge !== undefined && deliveryCharge !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <span>Delivery charge</span>
                <strong>{formatCurrency(deliveryCharge)}</strong>
              </div>
            )}

            {order.taxAmount !== undefined && order.taxAmount !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  marginBottom: 8,
                }}
              >
                <span>Tax</span>
                <strong>{formatCurrency(order.taxAmount)}</strong>
              </div>
            )}

            {total !== undefined && total !== null && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 12,
                  marginTop: 12,
                }}
              >
                <strong>Order total</strong>
                <strong>{formatCurrency(total)}</strong>
              </div>
            )}
          </div>

          <div className="confirmation-buttons">
            <Link to={trackingPath} className="confirmation-button">
              Track My Order <ArrowRight size={17} />
            </Link>

            <Link
              to="/shop"
              className="confirmation-secondary-button"
            >
              <ShoppingBag size={17} /> Continue Shopping
            </Link>
          </div>

          <div className="confirmation-trust">
            <ShieldCheck size={16} />
            <span>Thank you for choosing Online Grocery.</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderConfirmation;
