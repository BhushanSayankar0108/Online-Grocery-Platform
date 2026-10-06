import { Link } from "react-router-dom";

function OrderConfirmation() {
const orderId = "ORD100001";

  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>

        <h1>Order Placed Successfully!</h1>

        <p>
          Thank you for shopping with us. Your order has been placed
          successfully.
        </p>

        <div className="confirmation-order">
          <span>Order ID</span>
          <strong>#{orderId}</strong>
        </div>

        <div className="confirmation-status">
          <div className="status-step active">
            <span>✓</span>
            <p>Order Placed</p>
          </div>

          <div className="status-line"></div>

          <div className="status-step">
            <span>2</span>
            <p>Confirmed</p>
          </div>

          <div className="status-line"></div>

          <div className="status-step">
            <span>3</span>
            <p>Delivered</p>
          </div>
        </div>

        <p className="confirmation-message">
          You will receive updates about your order shortly.
        </p>

        <div className="confirmation-buttons">
          <Link to="/" className="confirmation-button">
            Continue Shopping
          </Link>

          <Link to="/shop" className="confirmation-secondary-button">
            Shop More
          </Link>
        </div>
      </div>
    </main>
  );
}

export default OrderConfirmation;