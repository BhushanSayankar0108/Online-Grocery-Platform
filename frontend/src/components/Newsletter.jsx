function Newsletter() {
  return (
    <section className="newsletter-section">
      <div className="newsletter-content">
        <p className="newsletter-label">STAY UPDATED</p>

        <h2>Get Fresh Deals in Your Inbox</h2>

        <p>
          Subscribe to receive the latest offers, new products,
          and grocery deals.
        </p>

        <div className="newsletter-form">
          <input
            type="email"
            placeholder="Enter your email address"
          />

          <button>Subscribe</button>
        </div>
      </div>
    </section>
  );
}

export default Newsletter;