import { Link } from "react-router-dom";
import {
  CheckCircle2,
  PackageCheck,
  Truck,
  ArrowRight,
  ShoppingBag,
  Clock3,
  ShieldCheck,
} from "lucide-react";

function OrderConfirmation() {
  const orderId = "ORD100001";

  return (
    <main className="confirmation-page">
      <div className="confirmation-container">
        <section className="confirmation-card">
          <div className="confirmation-success-icon">
            <CheckCircle2 size={42} strokeWidth={1.7} />
          </div>

          <span className="confirmation-eyebrow">
            ORDER CONFIRMED
          </span>

          <h1>Thanks for your order!</h1>

          <p className="confirmation-intro">
            Your order has been placed successfully. We'll keep you
            updated as it moves towards your doorstep.
          </p>

          <div className="confirmation-order">
            <div>
              <span>ORDER ID</span>
              <strong>#{orderId}</strong>
            </div>

            <div className="confirmation-order-icon">
              <PackageCheck size={22} />
            </div>
          </div>

          <div className="confirmation-status">
            <div className="status-step active">
              <div className="status-icon">
                <CheckCircle2 size={18} />
              </div>
              <strong>Order Placed</strong>
              <span>Confirmed</span>
            </div>

            <div className="status-line active"></div>

            <div className="status-step">
              <div className="status-icon">
                <PackageCheck size={18} />
              </div>
              <strong>Preparing</strong>
              <span>Coming next</span>
            </div>

            <div className="status-line"></div>

            <div className="status-step">
              <div className="status-icon">
                <Truck size={18} />
              </div>
              <strong>Delivered</strong>
              <span>To your doorstep</span>
            </div>
          </div>

          <div className="confirmation-delivery-note">
            <Clock3 size={18} />

            <div>
              <strong>We'll keep you updated</strong>
              <span>
                You can track your order anytime from your orders
                section.
              </span>
            </div>
          </div>

          <div className="confirmation-buttons">
            <Link
              to={`/order-tracking/${orderId}`}
              className="confirmation-button"
            >
              Track My Order
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/shop"
              className="confirmation-secondary-button"
            >
              <ShoppingBag size={17} />
              Continue Shopping
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