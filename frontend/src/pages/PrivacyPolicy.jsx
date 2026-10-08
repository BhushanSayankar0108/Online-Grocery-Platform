import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";

function PrivacyPolicy() {
  return (
    <main className="info-page policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">Home / Privacy Policy</p>

          <span className="info-eyebrow">YOUR PRIVACY MATTERS</span>

          <h1>Privacy Policy</h1>

          <p className="info-intro">
            This policy explains how Online Grocery may collect, use and
            protect information provided while using the platform.
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <ShieldCheck size={24} />
            <h3>Privacy focused</h3>
            <p>Your information should be handled responsibly.</p>
          </article>

          <article className="policy-highlight">
            <UserRound size={24} />
            <h3>Your information</h3>
            <p>Only information needed for the platform experience.</p>
          </article>

          <article className="policy-highlight">
            <LockKeyhole size={24} />
            <h3>Secure access</h3>
            <p>Account information should be protected appropriately.</p>
          </article>
        </section>

        <section className="policy-content">
          <div className="policy-section">
            <span className="policy-number">01</span>
            <div>
              <h2>Information We Collect</h2>
              <p>
                When using the platform, information may be provided such as
                your name, mobile number, email address, delivery address and
                order details.
              </p>
              <p>
                Information may also be generated through your interaction
                with products, cart, wishlist, orders and other platform
                features.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">02</span>
            <div>
              <h2>How Information Is Used</h2>
              <p>
                Information may be used to provide account services, process
                orders, arrange deliveries, provide customer support and
                improve the shopping experience.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">03</span>
            <div>
              <h2>Account Information</h2>
              <p>
                Customers are responsible for keeping their account
                information accurate and protecting access to their account.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">04</span>
            <div>
              <h2>Orders & Payments</h2>
              <p>
                Order and payment-related information may be required to
                process purchases, confirm transactions and provide support
                for orders.
              </p>
              <p>
                Sensitive payment information should be handled through the
                appropriate payment service provider rather than stored
                unnecessarily by the platform.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">05</span>
            <div>
              <h2>Data Protection</h2>
              <p>
                Reasonable technical and organizational measures should be
                used to protect information from unauthorized access, loss or
                misuse.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">06</span>
            <div>
              <h2>Cookies & Similar Technologies</h2>
              <p>
                The platform may use cookies or similar technologies to
                support functionality, preferences and basic usage analysis.
              </p>
            </div>
          </div>

          <div className="policy-section">
            <span className="policy-number">07</span>
            <div>
              <h2>Policy Updates</h2>
              <p>
                This privacy policy may be updated when platform features,
                services or requirements change. Updated information should
                be published on this page.
              </p>
            </div>
          </div>
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">QUESTIONS?</span>
            <h2>Need help with your privacy or account?</h2>
            <p>
              Contact our support team for questions about your account or
              personal information.
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

export default PrivacyPolicy;