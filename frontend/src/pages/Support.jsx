
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  MapPin,
  CreditCard,
  Mail,
  Phone,
  Clock3,
  ArrowRight,
  Send,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com";

function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    "Your message has been received. Our support team will get back to you shortly."
  );

  // ==========================================
  // HANDLE FORM INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================
  // SUBMIT SUPPORT QUERY
  // POST /api/support
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/support`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to submit your query. Please try again."
        );
      }

      // Show success only after backend confirms submission.
      setSuccessMessage(
        data.message ||
          "Your message has been received. Our support team will get back to you shortly."
      );

      setSubmitted(true);

      // Reset form after successful submission.
      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Support form submission error:", err);

      setError(
        err.message ||
          "Something went wrong. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <main className="support-page">
      <div className="support-container">
        <header className="support-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="support-breadcrumb">
            Home / Customer Support
          </p>

          <span className="support-eyebrow">
            CUSTOMER SUPPORT
          </span>

          <h1>We're here to help.</h1>

          <p className="support-intro">
            Get help with your orders, delivery, payments and
            anything else you need along the way.
          </p>
        </header>

        {/* SUPPORT OPTIONS */}

        <section className="support-options">
          <Link to="/orders" className="support-card">
            <div className="support-card-top">
              <div className="support-icon">
                <Package size={22} strokeWidth={1.8} />
              </div>

              <ArrowRight size={18} />
            </div>

            <span className="support-card-label">
              ORDERS
            </span>

            <h2>Order Support</h2>

            <p>
              Need help with an order, delivery or order status?
              Check your latest orders.
            </p>

            <strong>
              View My Orders <ArrowRight size={15} />
            </strong>
          </Link>

          <Link to="/addresses" className="support-card">
            <div className="support-card-top">
              <div className="support-icon">
                <MapPin size={22} strokeWidth={1.8} />
              </div>

              <ArrowRight size={18} />
            </div>

            <span className="support-card-label">
              DELIVERY
            </span>

            <h2>Delivery Help</h2>

            <p>
              Questions about delivery areas, slots or your
              saved addresses?
            </p>

            <strong>
              Manage Addresses <ArrowRight size={15} />
            </strong>
          </Link>

          <div className="support-card">
            <div className="support-card-top">
              <div className="support-icon">
                <CreditCard size={22} strokeWidth={1.8} />
              </div>

              <MessageCircle size={18} />
            </div>

            <span className="support-card-label">
              PAYMENTS
            </span>

            <h2>Payment Support</h2>

            <p>
              Having trouble with a payment or transaction?
              Send us a message below.
            </p>

            <strong>
              Contact Support <ArrowRight size={15} />
            </strong>
          </div>
        </section>

        {/* CONTACT SECTION */}

        <section className="support-contact">
          <div className="support-contact-info">
            <span className="support-label">
              GET IN TOUCH
            </span>

            <h2>Send us a message.</h2>

            <p className="support-contact-description">
              Tell us what you need help with and our support
              team will get back to you.
            </p>

            <div className="support-contact-details">
              <div className="support-contact-item">
                <div className="support-contact-item-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>support@onlinegrocery.com</strong>
                </div>
              </div>

              <div className="support-contact-item">
                <div className="support-contact-item-icon">
                  <Phone size={18} />
                </div>

                <div>
                  <span>Phone</span>
                  <strong>+91 1800 123 4567</strong>
                </div>
              </div>

              <div className="support-contact-item">
                <div className="support-contact-item-icon">
                  <Clock3 size={18} />
                </div>

                <div>
                  <span>Support Hours</span>
                  <strong>
                    Monday - Sunday, 8:00 AM - 10:00 PM
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* SUPPORT FORM */}

          <div className="support-form-wrapper">
            {submitted ? (
              <div className="support-success">
                <div className="support-success-icon">
                  <CheckCircle2 size={38} strokeWidth={1.7} />
                </div>

                <span className="support-label">
                  MESSAGE SENT
                </span>

                <h2>Thanks for reaching out.</h2>

                <p>{successMessage}</p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setError("");
                  }}
                >
                  Send Another Message
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <form
                className="support-form"
                onSubmit={handleSubmit}
              >
                <div className="support-form-heading">
                  <span>CONTACT FORM</span>
                  <h2>How can we help?</h2>
                </div>

                {/* ERROR MESSAGE */}

                {error && (
                  <div
                    role="alert"
                    style={{
                      padding: "12px 15px",
                      marginBottom: "16px",
                      borderRadius: "8px",
                      background: "#fff1f0",
                      color: "#c62828",
                      fontSize: "14px",
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="support-form-grid">
                  <label>
                    <span>Full Name</span>

                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                      maxLength={100}
                      required
                    />
                  </label>

                  <label>
                    <span>Email Address</span>

                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={handleChange}
                      maxLength={150}
                      required
                    />
                  </label>
                </div>

                <label>
                  <span>Subject</span>

                  <input
                    type="text"
                    name="subject"
                    placeholder="What do you need help with?"
                    value={form.subject}
                    onChange={handleChange}
                    maxLength={150}
                    required
                  />
                </label>

                <label>
                  <span>Message</span>

                  <textarea
                    name="message"
                    rows="5"
                    placeholder="Describe your issue or question..."
                    value={form.message}
                    onChange={handleChange}
                    maxLength={3000}
                    required
                  />
                </label>

                <button
                  type="submit"
                  className="support-submit-button"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Send Message"}

                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Support;
