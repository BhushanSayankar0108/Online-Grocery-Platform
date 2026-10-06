import { Link, useParams } from "react-router-dom";

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

function OrderTracking() {
  const { orderId } = useParams();

  const currentStep = orderId === "ORD1001" ? 5 : 4;

  return (
    <main className="tracking-page">
      <div className="tracking-header">
        <Link to="/orders" className="shop-home-link">
          ← Back to My Orders
        </Link>

        <p>Home / My Orders / Tracking</p>

        <h1>Track Your Order</h1>

        <p>Follow your groceries from our store to your doorstep.</p>
      </div>

      <section className="tracking-card">
        <div className="tracking-order-info">
          <div>
            <span>Order ID</span>
            <h2>#{orderId}</h2>
          </div>

          <span className="tracking-current-status">
            {trackingSteps[currentStep].title}
          </span>
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
                <div className="tracking-marker">
                  {completed ? "✓" : index + 1}
                </div>

                <div className="tracking-step-content">
                  <h3>{step.title}</h3>

                  <p>{step.description}</p>

                  {current && <span>Current Status</span>}
                </div>
              </div>
            );
          })}
        </div>

        <Link to="/orders" className="tracking-back-button">
          Back to My Orders
        </Link>
      </section>
    </main>
  );
}

export default OrderTracking;