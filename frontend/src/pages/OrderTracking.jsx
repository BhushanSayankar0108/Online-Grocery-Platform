import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  PackageCheck,
  MapPin,
  Truck,
} from "lucide-react";

const trackingSteps = [
  {
    title: "Order Placed",
    description: "Your order has been received.",
  },
  {
    title: "Order Confirmed",
    description: "Your order has been confirmed.",
  },
  {
    title: "Picking",
    description: "Your groceries are being collected.",
  },
  {
    title: "Packed",
    description: "Your groceries are packed and ready.",
  },
  {
    title: "Out for Delivery",
    description: "Your order is on its way.",
  },
  {
    title: "Delivered",
    description: "Your order has been delivered.",
  },
];

const orderDetails = {
  ORD1001: {
    status: "Delivered",
    date: "24 Sep 2026",
    total: 485,
    items: 5,
    address: "Delivery address",
  },
  ORD1002: {
    status: "Out for Delivery",
    date: "20 Sep 2026",
    total: 620,
    items: 6,
    address: "Delivery address",
  },
};

function OrderTracking() {
  const { orderId } = useParams();

  const order = orderDetails[orderId] || {
    status: "Order Confirmed",
    date: "Today",
    total: 0,
    items: 0,
    address: "Delivery address",
  };

  const currentStep =
    order.status === "Delivered"
      ? 5
      : order.status === "Out for Delivery"
        ? 4
        : order.status === "Packed"
          ? 3
          : order.status === "Picking"
            ? 2
            : order.status === "Order Confirmed"
              ? 1
              : 0;

  return (
    <main className="tracking-page">
      <div className="tracking-container">
        <div className="tracking-header">
          <Link to="/orders" className="tracking-back-link">
            <ArrowLeft size={16} />
            Back to My Orders
          </Link>

          <p className="tracking-breadcrumb">
            Home / My Orders / Tracking
          </p>

          <h1>Track Your Order</h1>

          <p className="tracking-subtitle">
            Follow your groceries from our store to your doorstep.
          </p>
        </div>

        <section className="tracking-card">
          <div className="tracking-order-header">
            <div>
              <span>ORDER ID</span>
              <h2>#{orderId}</h2>
            </div>

            <div
              className={`tracking-status tracking-status-${order.status
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {order.status}
            </div>
          </div>

          <div className="tracking-summary">
            <div className="tracking-summary-item">
              <span>Order Date</span>
              <strong>{order.date}</strong>
            </div>

            <div className="tracking-summary-item">
              <span>Items</span>
              <strong>{order.items} items</strong>
            </div>

            <div className="tracking-summary-item">
              <span>Total Amount</span>
              <strong>₹{order.total}</strong>
            </div>

            <div className="tracking-summary-item">
              <span>Delivery</span>
              <strong>Home Delivery</strong>
            </div>
          </div>

          <div className="tracking-divider" />

          <div className="tracking-progress-heading">
            <div>
              <span>ORDER STATUS</span>
              <h2>Your delivery progress</h2>
            </div>

            {order.status === "Out for Delivery" && (
              <div className="tracking-delivery-badge">
                <Truck size={17} />
                On the way
              </div>
            )}

            {order.status === "Delivered" && (
              <div className="tracking-delivery-badge">
                <PackageCheck size={17} />
                Delivered
              </div>
            )}
          </div>

          <div className="tracking-timeline">
            {trackingSteps.map((step, index) => {
              const completed = index <= currentStep;
              const current = index === currentStep;

              return (
                <div
                  className={`tracking-step ${
                    completed ? "completed" : ""
                  } ${current ? "current" : ""}`}
                  key={step.title}
                >
                  <div className="tracking-step-marker">
                    {completed ? (
                      <Check size={17} strokeWidth={2.5} />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div className="tracking-step-content">
                    <div className="tracking-step-title-row">
                      <h3>{step.title}</h3>

                      {current && (
                        <span className="tracking-current-label">
                          Current
                        </span>
                      )}
                    </div>

                    <p>{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="tracking-delivery-info">
            <div className="tracking-delivery-icon">
              <MapPin size={20} />
            </div>

            <div>
              <span>DELIVERY INFORMATION</span>
              <strong>{order.address}</strong>
              <p>
                Your delivery details will be available once an
                address is selected.
              </p>
            </div>
          </div>

          <div className="tracking-footer">
            <Link to="/orders" className="tracking-back-button">
              Back to My Orders
            </Link>

            {order.status === "Delivered" && (
              <Link
                to={`/returns?order=${orderId}`}
                className="tracking-return-button"
              >
                Return / Refund
              </Link>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default OrderTracking;