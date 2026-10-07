import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  ShoppingBasket,
  Truck,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";

const offers = [
  {
    title: "Fresh Fruits & Vegetables",
    discount: "UP TO 25% OFF",
    description:
      "Save more on fresh fruits, vegetables and everyday essentials.",
    code: "FRESH25",
    icon: <ShoppingBasket size={28} strokeWidth={1.8} />,
    category: "Fruits & Vegetables",
  },
  {
    title: "Dairy & Bakery",
    discount: "UP TO 20% OFF",
    description:
      "Get great deals on milk, bread, paneer, cheese and more.",
    code: "DAIRY20",
    icon: <BadgePercent size={28} strokeWidth={1.8} />,
    category: "Dairy & Bakery",
  },
  {
    title: "Snacks & Beverages",
    discount: "UP TO 30% OFF",
    description:
      "Grab your favorite snacks and refreshing beverages at lower prices.",
    code: "SNACK30",
    icon: <BadgePercent size={28} strokeWidth={1.8} />,
    category: "Snacks",
  },
  {
    title: "Free Delivery",
    discount: "FREE DELIVERY",
    description:
      "Enjoy free delivery on orders above ₹499.",
    code: "FREE499",
    icon: <Truck size={28} strokeWidth={1.8} />,
    category: null,
  },
];

function Offers() {
  const [copiedCode, setCopiedCode] = useState("");

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 1800);
    } catch {
      setCopiedCode("");
    }
  };

  return (
    <main className="offers-page">
      <div className="offers-container">
        <div className="offers-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="offers-breadcrumb">Home / Offers</p>

          <span className="offers-eyebrow">SAVE MORE ON EVERY ORDER</span>

          <h1>Special offers, better savings.</h1>

          <p className="offers-intro">
            Discover our latest grocery deals, exclusive coupon codes and
            delivery offers.
          </p>
        </div>

        <div className="offers-grid">
          {offers.map((offer) => (
            <article className="offer-card" key={offer.code}>
              <div className="offer-card-top">
                <div className="offer-icon">{offer.icon}</div>

                <span className="offer-badge">SPECIAL OFFER</span>
              </div>

              <div className="offer-card-content">
                <p className="offer-discount">{offer.discount}</p>

                <h2>{offer.title}</h2>

                <p className="offer-description">
                  {offer.description}
                </p>

                <div className="offer-code-row">
                  <div className="offer-code">
                    <span>Coupon code</span>
                    <strong>{offer.code}</strong>
                  </div>

                  <button
                    type="button"
                    className="offer-copy-button"
                    onClick={() => handleCopy(offer.code)}
                    aria-label={`Copy ${offer.code}`}
                  >
                    {copiedCode === offer.code ? (
                      <>
                        <Check size={16} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="offer-card-footer">
                <Link
                  to={
                    offer.category
                      ? `/shop?category=${encodeURIComponent(
                          offer.category
                        )}`
                      : "/shop"
                  }
                  className="offer-button"
                >
                  Shop Now
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <section className="offers-bottom">
          <div>
            <span>MORE TO EXPLORE</span>
            <h2>Looking for everyday essentials?</h2>
            <p>
              Browse our complete collection of fresh groceries and
              household essentials.
            </p>
          </div>

          <Link to="/shop" className="offers-shop-button">
            View All Products
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Offers;