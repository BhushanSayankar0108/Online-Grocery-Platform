import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const products = [
  {
    name: "Fresh Apples",
    price: 120,
    mrp: 150,
    category: "Fruits & Vegetables",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
  },
  {
    name: "Fresh Tomatoes",
    price: 60,
    mrp: 80,
    category: "Fruits & Vegetables",
    image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
  },
  {
    name: "Fresh Milk",
    price: 55,
    mrp: 65,
    category: "Dairy & Bakery",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b",
  },
  {
    name: "Whole Wheat Bread",
    price: 45,
    mrp: 55,
    category: "Dairy & Bakery",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  },
  {
    name: "Fresh Bananas",
    price: 50,
    mrp: 60,
    category: "Fruits & Vegetables",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
  },
  {
    name: "Basmati Rice",
    price: 180,
    mrp: 220,
    category: "Staples",
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
  },
  {
    name: "Potato Chips",
    price: 40,
    mrp: 50,
    category: "Snacks",
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
  },
  {
    name: "Orange Juice",
    price: 110,
    mrp: 130,
    category: "Beverages",
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
  },
];

function Shop({ cart, setCart }) {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search");

  const [selectedCategories, setSelectedCategories] = useState(
    categoryFromUrl ? [categoryFromUrl] : []
  );

  const [searchTerm, setSearchTerm] = useState(searchFromUrl || "");
  const [sortBy, setSortBy] = useState("Popularity");

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") {
      return a.price - b.price;
    }

    if (sortBy === "Price: High to Low") {
      return b.price - a.price;
    }

    return 0;
  });

  return (
    <main className="shop-page">
      <div className="shop-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p className="shop-breadcrumb">Home / Shop</p>

        <h1>Shop Products</h1>

        <p className="shop-description">
          Browse fresh groceries and everyday essentials.
        </p>
      </div>

      <div className="shop-controls">
        <div className="shop-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button type="button">Search</button>
        </div>

        <div className="shop-sort">
          <label htmlFor="sort">Sort by:</label>

          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option>Popularity</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      <div className="shop-content">
        <aside className="filter-sidebar">
          <h2>Filters</h2>

          <div className="filter-group">
            <h3>Categories</h3>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Fruits & Vegetables")}
                onChange={() =>
                  handleCategoryChange("Fruits & Vegetables")
                }
              />
              Fruits & Vegetables
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Dairy & Bakery")}
                onChange={() =>
                  handleCategoryChange("Dairy & Bakery")
                }
              />
              Dairy & Bakery
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Staples")}
                onChange={() => handleCategoryChange("Staples")}
              />
              Staples
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Snacks")}
                onChange={() => handleCategoryChange("Snacks")}
              />
              Snacks
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Beverages")}
                onChange={() => handleCategoryChange("Beverages")}
              />
              Beverages
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Household")}
                onChange={() => handleCategoryChange("Household")}
              />
              Household
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedCategories.includes("Personal Care")}
                onChange={() => handleCategoryChange("Personal Care")}
              />
              Personal Care
            </label>
          </div>
        </aside>

        <div className="shop-products">
          <div className="shop-products-header">
            <h2>
              {searchTerm
                ? `Search Results for "${searchTerm}"`
                : categoryFromUrl
                ? categoryFromUrl
                : "All Products"}
            </h2>

            <div>
              <span>{filteredProducts.length} products</span>
              <span> 🛒 {cart.length} in cart</span>
            </div>
          </div>

          <div className="shop-product-grid">
            {sortedProducts.map((product) => (
              <div
                className="shop-product-card"
                key={product.name}
              >
                <Link
                  to={`/product/${products.indexOf(product) + 1}`}
                  className="product-link"
                >
                  <div className="shop-product-image">
                    <img
                      src={product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className="shop-product-info">
                    <h3>{product.name}</h3>

                    <p>
                      ₹{product.price}

                      <span>₹{product.mrp}</span>

                      <strong>
                        {Math.round(
                          ((product.mrp - product.price) /
                            product.mrp) *
                            100
                        )}
                        % OFF
                      </strong>
                    </p>
                  </div>
                </Link>

                <button onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
              </div>
            ))}
          </div>

          {sortedProducts.length === 0 && (
            <div className="no-products">
              <h3>No products found</h3>
              <p>
                Try searching for another product or changing your filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Shop;