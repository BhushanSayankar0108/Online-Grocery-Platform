import { Link } from "react-router-dom";
import { ArrowRight, Truck, ShieldCheck } from "lucide-react";
import heroImage from "../assets/hero.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-label">YOUR EVERYDAY GROCERY STORE</p>

        <h1>
          Fresh groceries.
          <br />
          Delivered simply.
        </h1>

        <p className="hero-description">
          Shop fresh produce, daily essentials, snacks and more —
          all in one place, delivered to your doorstep.
        </p>

        <div className="hero-buttons">
          <Link to="/shop" className="hero-btn primary-btn">
            Shop Groceries
            <ArrowRight size={17} />
          </Link>

          <Link to="/categories" className="hero-btn secondary-btn">
            Browse Categories
          </Link>
        </div>

        <div className="hero-trust">
          <div>
            <Truck size={18} />
            <span>Reliable delivery</span>
          </div>

          <div>
            <ShieldCheck size={18} />
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      <div className="hero-image">
        <img src={heroImage} alt="Fresh groceries" />
      </div>
    </section>
  );
}

export default Hero;