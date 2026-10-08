import { Link } from "react-router-dom";
import {
  Truck,
  MapPin,
  Clock3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

function ShippingPolicy() {
  return (
    <main className="info-page shipping-policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            Home / Shipping Policy
          </p>

          <span className="info-eyebrow">DELIVERY INFORMATION</span>

          <h1>Shipping & delivery made simple.</h1>

          <p className="info-intro">
            Everything you need to know about delivery availability, delivery
            slots, charges and receiving your order.
          </p>
        </div>

        <section className="shipping-grid">
          <article className="shipping-card">
            <div className="shipping-icon">
              <MapPin size={25} />
            </div>

            <h2>Delivery Areas</h2>

            <p>
              Delivery is available only in supported service areas. Your
              delivery location is checked during the shopping and checkout
              process.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <Clock3 size={25} />
            </div>

            <h2>Delivery Slots</h2>

            <p>
              Available delivery slots are displayed during checkout. Select
              the slot that works best for you before placing your order.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <Truck size={25} />
            </div>

            <h2>Delivery Charges</h2>

            <p>
              Delivery charges may depend on your order value, delivery area
              and applicable offers. Any applicable charge is shown before
              placing the order.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <ShieldCheck size={25} />
            </div>

            <h2>Safe Delivery</h2>

            <p>
              Please make sure someone is available at the selected delivery
              address to receive the order during the chosen delivery slot.
            </p>
          </article>
        </section>

        <section className="shipping-details">
          <div className="info-section-heading">
            <span className="info-eyebrow">DELIVERY PROCESS</span>
            <h2>What happens after you place an order?</h2>
          </div>

          <div className="shipping-steps">
            <div className="shipping-step">
              <span>01</span>
              <div>
                <h3>Order Confirmed</h3>
                <p>
                  Your order is received and confirmed for processing.
                </p>
              </div>
            </div>

            <div className="shipping-step">
              <span>02</span>
              <div>
                <h3>Picking & Packing</h3>
                <p>
                  Your selected products are prepared and packed for delivery.
                </p>
              </div>
            </div>

            <div className="shipping-step">
              <span>03</span>
              <div>
                <h3>Out for Delivery</h3>
                <p>
                  Your order is handed over for delivery to your selected
                  address.
                </p>
              </div>
            </div>

            <div className="shipping-step">
              <span>04</span>
              <div>
                <h3>Delivered</h3>
                <p>
                  Your order is delivered and the order status is updated.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="shipping-note">
          <div>
            <span className="info-eyebrow">PLEASE NOTE</span>

            <h2>
              Delivery times may vary depending on location and availability.
            </h2>

            <p>
              Delivery availability, charges and time slots are confirmed
              during checkout based on your selected location.
            </p>
          </div>

          <Link to="/shop" className="info-cta-button">
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default ShippingPolicy;