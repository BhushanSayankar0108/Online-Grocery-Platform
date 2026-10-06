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
  {
    name: "Fruits & Vegetables",
    icon: <Apple size={32} />,
  },
  {
    name: "Dairy & Bakery",
    icon: <Milk size={32} />,
  },
  {
    name: "Staples",
    icon: <Wheat size={32} />,
  },
  {
    name: "Snacks",
    icon: <Cookie size={32} />,
  },
  {
    name: "Beverages",
    icon: <Coffee size={32} />,
  },
  {
    name: "Household",
    icon: <SprayCan size={32} />,
  },
  {
    name: "Personal Care",
    icon: <HeartPulse size={32} />,
  },
];

function CategorySection() {
  return (
    <section className="category-section">
      <div className="section-heading">
        <p>SHOP BY CATEGORY</p>
        <h2>Everything You Need</h2>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <Link
            to={`/shop?category=${encodeURIComponent(category.name)}`}
            className="category-card"
            key={category.name}
          >
            <div className="category-icon">{category.icon}</div>

            <h3>{category.name}</h3>

            <span>Shop Now →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategorySection;