import { useState } from "react";
import { Link } from "react-router-dom";

function Support() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    setForm({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <main className="support-page">
      <div className="support-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p>Home / Customer Support</p>

        <h1>How Can We Help?</h1>

        <p>
          We're here to help with your orders, delivery, payments and more.
        </p>
      </div>

      <div className="support-content">
        <section className="support-options">
          <div className="support-card">
            <div className="support-icon">📦</div>
            <h2>Order Support</h2>
            <p>
              Need help with an order, delivery or order status?
            </p>
            <Link to="/orders">View My Orders →</Link>
          </div>

          <div className="support-card">
            <div className="support-icon">📍</div>
            <h2>Delivery Help</h2>
            <p>
              Questions about delivery areas, slots or addresses?
            </p>
            <Link to="/addresses">Manage Addresses →</Link>
          </div>

          <div className="support-card">
            <div className="support-icon">💳</div>
            <h2>Payment Support</h2>
            <p>
              Having trouble with payment or your transaction?
            </p>
            <span>Contact Us Below</span>
          </div>
        </section>

        <section className="support-contact">
          <div className="support-contact-info">
            <p className="support-label">CONTACT US</p>
            <h2>Send Us a Message</h2>
            <p>
              Fill out the form and our support team will get back to you.
            </p>

            <div className="support-contact-item">
              <strong>📧 Email</strong>
              <span>support@onlinegrocery.com</span>
            </div>

            <div className="support-contact-item">
              <strong>📞 Phone</strong>
              <span>+91 1800 123 4567</span>
            </div>

            <div className="support-contact-item">
              <strong>🕐 Support Hours</strong>
              <span>Monday - Sunday, 8:00 AM - 10:00 PM</span>
            </div>
          </div>

          <div className="support-form-wrapper">
            {submitted ? (
              <div className="support-success">
                <div>✓</div>
                <h2>Message Sent!</h2>
                <p>
                  Thank you for contacting us. Our support team will get
                  back to you shortly.
                </p>

                <button onClick={() => setSubmitted(false)}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form className="support-form" onSubmit={handleSubmit}>
                <label>
                  Full Name
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Email Address
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Subject
                  <input
                    type="text"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Message
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                  />
                </label>

                <button type="submit">
                  Send Message
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