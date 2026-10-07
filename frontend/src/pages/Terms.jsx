import { Link } from "react-router-dom";
import {
  FileText,
  UserCheck,
  ShoppingCart,
  CreditCard,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function Terms() {
  return (
    <main className="info-page policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            Home / Terms & Conditions
          </p>

          <span className="info-eyebrow">PLEASE READ</span>

          <h1>Terms & Conditions</h1>

          <p className="info-intro">
            These terms describe the general rules for using the Online
            Grocery platform and placing orders through it.
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <FileText size={24} />
            <h3>Platform Use</h3>
            <p>Use the platform responsibly and lawfully.</p>
          </article>

          <article className="policy-highlight">
            <ShoppingCart size={24} />
            <h3>Orders</h3>
            <p>Review your order details before confirming.</p>
          </article>

          <article className="policy-highlight">
            <UserCheck size={24} />
            <h3>Accounts</h3>
            <p>Keep your account information accurate.</p>
          </article>
        </section>

        <section className="policy-content">
          <div className="policy-section">
            <span className="policy-number">01</span>
            <div>
              <h2>Using the Platform</h2>
              <p>
                Customers should use the platform only for legitimate
                shopping and related activities. Users should not attempt to
                disrupt, misuse or gain unauthorized access to the platform.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">02</span>
            <div>
              <h2>Customer Accounts</h2>
              <p>
                Customers are responsible for providing accurate information
                and maintaining the security of their account credentials.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">03</span>
            <div>
              <h2>Products & Availability</h2>
              <p>
                Product availability, pricing, images, quantities and
                descriptions may change. Products are subject to availability
                at the time an order is processed.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">04</span>
            <div>
              <h2>Orders</h2>
              <p>
                Customers should review products, quantities, delivery
                address, delivery slot and order total before placing an
                order.
              </p>
              <p>
                An order may be subject to availability and successful order
                processing.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">05</span>
            <div>
              <h2>Payments</h2>
              <p>
                Available payment methods are displayed during checkout.
                Customers are responsible for providing valid payment
                information when required.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">06</span>
            <div>
              <h2>Delivery</h2>
              <p>
                Delivery availability, charges and time slots depend on the
                selected delivery location and available delivery capacity.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">07</span>
            <div>
              <h2>Returns & Refunds</h2>
              <p>
                Eligible products may be returned or refunded according to
                the applicable return and refund process.
              </p>
              <p>
                Customers should provide accurate information when submitting
                a return or refund request.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">08</span>
            <div>
              <h2>Changes to These Terms</h2>
              <p>
                These terms may be updated when the platform, services or
                applicable requirements change. Updated terms should be
                published on this page.
              </p>
            </div>
          </div>
        </section>

        <section className="policy-warning">
          <AlertCircle size={22} />

          <div>
            <h3>Important</h3>
            <p>
              These are general project terms and should be reviewed and
              finalized according to the actual business, payment providers,
              delivery operations and applicable laws before production use.
            </p>
          </div>
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">NEED HELP?</span>
            <h2>Have a question about an order?</h2>
            <p>
              Our support section can help you with orders, payments and
              delivery questions.
            </p>
          </div>

          <Link to="/support" className="info-cta-button">
            Contact Support
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Terms;