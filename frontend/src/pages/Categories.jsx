import { Link } from "react-router-dom";

const categories = [
  {
    name: "Fruits & Vegetables",
    description: "Fresh fruits, vegetables and leafy greens",
    items:
      "Fresh Fruits • Vegetables • Leafy Vegetables • Exotic Vegetables",
    emoji: "🥦",
  },
  {
    name: "Dairy & Bakery",
    description: "Daily dairy and bakery essentials",
    items: "Milk • Curd • Paneer • Cheese • Bread • Bakery",
    emoji: "🥛",
  },
  {
    name: "Staples",
    description: "Everyday kitchen essentials",
    items: "Rice • Wheat • Flour • Pulses • Dal • Sugar • Salt",
    emoji: "🌾",
  },
  {
    name: "Snacks",
    description: "Tasty snacks for every occasion",
    items: "Biscuits • Chips • Namkeen • Chocolates",
    emoji: "🍪",
  },
  {
    name: "Beverages",
    description: "Refreshing drinks for every day",
    items: "Tea • Coffee • Juices • Soft Drinks",
    emoji: "☕",
  },
  {
    name: "Household",
    description: "Keep your home clean and fresh",
    items: "Cleaning • Laundry • Kitchen",
    emoji: "🧹",
  },
  {
    name: "Personal Care",
    description: "Everyday personal care essentials",
    items: "Bath & Body • Hair Care • Oral Care",
    emoji: "🧴",
  },
];

function Categories() {
  return (
    <main className="categories-page">
      <div className="categories-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p>Home / Categories</p>

        <h1>Shop by Category</h1>

        <p>
          Explore our wide range of fresh groceries and everyday essentials.
        </p>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <Link
            to={`/shop?category=${encodeURIComponent(category.name)}`}
            key={category.name}
            className="category-page-card"
          >
            <div className="category-page-icon">
              {category.emoji}
            </div>

            <h2>{category.name}</h2>

            <p>{category.description}</p>

            <span>{category.items}</span>

            <strong>Shop Now →</strong>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Categories;