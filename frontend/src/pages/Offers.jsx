import { Link } from "react-router-dom";

const offers = [
  {
    title: "Fresh Fruits & Vegetables",
    discount: "Up to 25% OFF",
    description: "Save more on fresh fruits, vegetables and everyday essentials.",
    code: "FRESH25",
  },
  {
    title: "Dairy & Bakery",
    discount: "Up to 20% OFF",
    description: "Get great deals on milk, bread, paneer, cheese and more.",
    code: "DAIRY20",
  },
  {
    title: "Snacks & Beverages",
    discount: "Up to 30% OFF",
    description: "Grab your favorite snacks and refreshing beverages at lower prices.",
    code: "SNACK30",
  },
  {
    title: "Free Delivery",
    discount: "FREE DELIVERY",
    description: "Enjoy free delivery on orders above ₹499.",
    code: "FREE499",
  },
];

function Offers() {
  return (
    <main className="offers-page">
      <div className="offers-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p>Home / Offers</p>

        <h1>Special Offers</h1>

        <p>Save more on your everyday grocery shopping.</p>
      </div>

      <div className="offers-content">
        <div className="offers-grid">
          {offers.map((offer) => (
            <div className="offer-card" key={offer.code}>
              <div className="offer-badge">SPECIAL OFFER</div>

              <h2>{offer.title}</h2>

              <h3>{offer.discount}</h3>

              <p>{offer.description}</p>

              <div className="offer-code">
                <span>Use Code</span>
                <strong>{offer.code}</strong>
              </div>

              <Link to="/shop" className="offer-button">
                Shop Now →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

export default Offers;