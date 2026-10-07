import { Link } from "react-router-dom";
import {
  Apple,
  Milk,
  Wheat,
  Cookie,
  Coffee,
  SprayCan,
  HeartPulse,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Fruits & Vegetables",
    description: "Fresh fruits, vegetables and leafy greens",
    items: "Fresh Fruits • Vegetables • Leafy Vegetables • Exotic Vegetables",
    icon: <Apple size={30} strokeWidth={1.8} />,
  },
  {
    name: "Dairy & Bakery",
    description: "Daily dairy and bakery essentials",
    items: "Milk • Curd • Paneer • Cheese • Bread • Bakery",
    icon: <Milk size={30} strokeWidth={1.8} />,
  },
  {
    name: "Staples",
    description: "Everyday kitchen essentials",
    items: "Rice • Wheat • Flour • Pulses • Dal • Sugar • Salt",
    icon: <Wheat size={30} strokeWidth={1.8} />,
  },
  {
    name: "Snacks",
    description: "Tasty snacks for every occasion",
    items: "Biscuits • Chips • Namkeen • Chocolates",
    icon: <Cookie size={30} strokeWidth={1.8} />,
  },
  {
    name: "Beverages",
    description: "Refreshing drinks for every day",
    items: "Tea • Coffee • Juices • Soft Drinks",
    icon: <Coffee size={30} strokeWidth={1.8} />,
  },
  {
    name: "Household",
    description: "Keep your home clean and fresh",
    items: "Cleaning • Laundry • Kitchen",
    icon: <SprayCan size={30} strokeWidth={1.8} />,
  },
  {
    name: "Personal Care",
    description: "Everyday personal care essentials",
    items: "Bath & Body • Hair Care • Oral Care",
    icon: <HeartPulse size={30} strokeWidth={1.8} />,
  },
];

function Categories() {
  return (
    <main className="categories-page">
      <div className="categories-container">
        <div className="categories-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="categories-breadcrumb">
            Home / Categories
          </p>

          <span className="categories-eyebrow">
            SHOP BY CATEGORY
          </span>

          <h1>Everything you need, in one place.</h1>

          <p className="categories-intro">
            Browse fresh groceries and everyday essentials
            by category and find what you need faster.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              to={`/shop?category=${encodeURIComponent(
                category.name
              )}`}
              key={category.name}
              className="category-page-card"
            >
              <div className="category-page-top">
                <div className="category-page-icon">
                  {category.icon}
                </div>

                <ArrowRight
                  className="category-page-arrow"
                  size={20}
                />
              </div>

              <div className="category-page-content">
                <h2>{category.name}</h2>

                <p>{category.description}</p>

                <span>{category.items}</span>
              </div>

              <div className="category-page-footer">
                <strong>Shop Category</strong>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="categories-bottom">
          <div>
            <span>NEED SOMETHING ELSE?</span>
            <h2>Browse all products</h2>
            <p>
              Explore our complete grocery collection.
            </p>
          </div>

          <Link to="/shop" className="categories-shop-button">
            View All Products
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Categories;