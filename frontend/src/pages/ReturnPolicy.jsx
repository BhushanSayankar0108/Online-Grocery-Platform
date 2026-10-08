import { Link } from "react-router-dom";
import {
  RotateCcw,
  PackageCheck,
  AlertCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";

function ReturnPolicy() {
  return (
    <main className="info-page policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            Home / Return & Refund
          </p>

          <span className="info-eyebrow">RETURNS & REFUNDS</span>

          <h1>Return & Refund Policy</h1>

          <p className="info-intro">
            Information about eligible returns, refund requests and what to
            do when there is an issue with your order.
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <PackageCheck size={24} />
            <h3>Check Your Order</h3>
            <p>Review products when your order is delivered.</p>
          </article>

          <article className="policy-highlight">
            <RotateCcw size={24} />
            <h3>Request a Return</h3>
            <p>Submit an eligible return request from your order.</p>
          </article>

          <article className="policy-highlight">
            <CreditCard size={24} />
            <h3>Refund Processing</h3>
            <p>Eligible refunds are processed after review.</p>
          </article>
        </section>

        <section className="policy-content">
          <div className="policy-section">
            <span className="policy-number">01</span>
            <div>
              <h2>Eligible Return Reasons</h2>
              <p>
                Depending on the product and order, return or refund requests
                may be submitted for issues such as damaged products,
                incorrect products, missing products, expired products or
                quality-related concerns.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">02</span>
            <div>
              <h2>Submitting a Request</h2>
              <p>
                Customers can select the relevant delivered order and submit
                a return or refund request with the appropriate reason and
                supporting details.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">03</span>
            <div>
              <h2>Product Condition</h2>
              <p>
                Where applicable, products should be kept in suitable
                condition until the request has been reviewed. Additional
                information or evidence may be requested for certain cases.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">04</span>
            <div>
              <h2>Review & Approval</h2>
              <p>
                Return and refund requests may be reviewed before approval.
                The outcome can depend on the reason for the request, product
                type and available order information.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">05</span>
            <div>
              <h2>Refunds</h2>
              <p>
                Once an eligible refund is approved, the refund process
                depends on the original payment method and applicable payment
                processing procedures.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">06</span>
            <div>
              <h2>Non-Eligible Requests</h2>
              <p>
                Requests that do not meet the applicable return requirements
                may be rejected. Customers will be informed when additional
                information is required.
              </p>
            </div>
          </div>
        </section>

        <section className="policy-warning">
          <AlertCircle size={22} />

          <div>
            <h3>Important</h3>
            <p>
              Return eligibility, time limits and refund procedures should be
              finalized according to the actual products, suppliers,
              operations and business policies before production launch.
            </p>
          </div>
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">HAVE AN ISSUE?</span>
            <h2>Need help with a return or refund?</h2>
            <p>
              Visit your orders or contact support for assistance with an
              existing order.
            </p>
          </div>

          <div className="policy-contact-actions">
            <Link to="/orders" className="info-secondary-button">
              My Orders
            </Link>

            <Link to="/support" className="info-cta-button">
              Contact Support
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ReturnPolicy;