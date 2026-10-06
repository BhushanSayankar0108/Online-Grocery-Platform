import { useState } from "react";

function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <p className="newsletter-label">STAY UPDATED</p>

        <h2>Get Fresh Deals in Your Inbox</h2>

        <p>
          Subscribe to receive the latest offers, new products,
          and grocery deals.
        </p>

        <form className="newsletter-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <button type="submit">Subscribe</button>
        </form>

        {subscribed && (
          <p className="newsletter-success">
            Thanks for subscribing!
          </p>
        )}
      </div>
    </section>
  );
}

export default Newsletter;