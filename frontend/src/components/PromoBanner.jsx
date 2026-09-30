function PromoBanner() {
  return (
    <section className="promo-banner">
      <div className="promo-content">
        <p className="promo-label">TODAY'S OFFERS</p>

        <h2>Fresh Deals, Better Savings</h2>

        <p>
          Get great discounts on your everyday grocery essentials.
        </p>

        <button>View Offers</button>
      </div>

      <div className="promo-highlight">
        <span>FREE</span>
        <strong>DELIVERY</strong>
        <small>On eligible orders</small>
      </div>
    </section>
  );
}

export default PromoBanner;