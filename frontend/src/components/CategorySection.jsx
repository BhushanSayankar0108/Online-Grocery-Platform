import { Link } from "react-router-dom";
import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  SprayCan,
  HeartPulse,
} from "lucide-react";

const categories = [
  { name: "Fruits & Vegetables", icon: <Apple size={28} /> },
  { name: "Dairy & Bakery", icon: <Milk size={28} /> },
  { name: "Staples", icon: <Wheat size={28} /> },
  { name: "Snacks", icon: <Cookie size={28} /> },
  { name: "Beverages", icon: <Coffee size={28} /> },
  { name: "Household", icon: <SprayCan size={28} /> },
  { name: "Personal Care", icon: <HeartPulse size={28} /> },
];

function CategorySection() {
  return (
    <section className="category-section">
      <div className="section-heading category-heading">
        <div>
          <p>SHOP BY CATEGORY</p>
          <h2>Shop your everyday essentials</h2>
        </div>

        <Link to="/categories" className="view-all-link">
          View all categories →
        </Link>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            to={`/shop?category=${encodeURIComponent(category.name)}`}
            className="category-card"
            key={category.name}
          >
            <div className="category-icon">
              {category.icon}
            </div>

            <h3>{category.name}</h3>

            <span>Explore</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;