import { Link } from "react-router-dom";

function OrderConfirmation() {
  return (
    <main className="confirmation-page">
      <div className="confirmation-card">
        <div className="confirmation-icon">✓</div>

        <h1>Order Placed Successfully!</h1>

        <p>
          Thank you for shopping with us. Your order has been placed
          successfully.
        </p>

        <p className="confirmation-message">
          You will receive updates about your order shortly.
        </p>

        <Link to="/" className="confirmation-button">
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}

export default OrderConfirmation;