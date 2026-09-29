import heroImage from "../assets/hero.png";
function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-label">FRESHNESS YOU CAN TRUST</p>

        <h1>
          Fresh Groceries,
          <br />
          Better Living
        </h1>

        <p className="hero-description">
          Get fresh fruits, vegetables, and daily essentials
          delivered to your doorstep.
        </p>

        <div className="hero-buttons">
          <button className="hero-btn primary-btn">
            Shop Now
          </button>

          <button className="hero-btn secondary-btn">
            Explore Categories
          </button>
        </div>
      </div>

      <div className="hero-image">
        <div className="hero-image">
         <img src={heroImage} alt="Fresh groceries" />
        </div>
      </div>
    </section>
  );
}

export default Hero;