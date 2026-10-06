import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Check,
  Filter,
  Search,
  X,
} from "lucide-react";

const products = [
  {
    id: 1,
    name: "Fresh Apples",
    quantity: "1 kg",
    price: 120,
    mrp: 150,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6",
  },
  {
    id: 2,
    name: "Fresh Tomatoes",
    quantity: "1 kg",
    price: 60,
    mrp: 80,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1546094096-0df4bcaaa337",
  },
  {
    id: 3,
    name: "Fresh Milk",
    quantity: "1 litre",
    price: 55,
    mrp: 65,
    category: "Dairy & Bakery",
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b",
  },
  {
    id: 4,
    name: "Whole Wheat Bread",
    quantity: "400 g",
    price: 45,
    mrp: 55,
    category: "Dairy & Bakery",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff",
  },
  {
    id: 5,
    name: "Fresh Bananas",
    quantity: "1 dozen",
    price: 50,
    mrp: 60,
    category: "Fruits & Vegetables",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e",
  },
  {
    id: 6,
    name: "Basmati Rice",
    quantity: "5 kg",
    price: 180,
    mrp: 220,
    category: "Staples",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c",
  },
  {
    id: 7,
    name: "Potato Chips",
    quantity: "100 g",
    price: 40,
    mrp: 50,
    category: "Snacks",
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b",
  },
  {
    id: 8,
    name: "Orange Juice",
    quantity: "1 litre",
    price: 110,
    mrp: 130,
    category: "Beverages",
    image:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
  },
];

const categories = [
  "Fruits & Vegetables",
  "Dairy & Bakery",
  "Staples",
  "Snacks",
  "Beverages",
  "Household",
  "Personal Care",
];

const offerFilters = [
  {
    label: "10% Off or more",
    minimumDiscount: 10,
  },
  {
    label: "20% Off or more",
    minimumDiscount: 20,
  },
];

function Shop({ cart, setCart, wishlist, setWishlist }) {
  const [searchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search");

  const [selectedCategories, setSelectedCategories] = useState(
    categoryFromUrl ? [categoryFromUrl] : []
  );

  const [selectedOffers, setSelectedOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || "");
  const [sortBy, setSortBy] = useState("Popularity");
  const [filterOpen, setFilterOpen] = useState(false);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const alreadyWishlisted = currentWishlist.some(
        (item) => item.name === product.name
      );

      if (alreadyWishlisted) {
        return currentWishlist.filter(
          (item) => item.name !== product.name
        );
      }

      return [...currentWishlist, product];
    });
  };

  const isWishlisted = (product) => {
    return wishlist.some(
      (item) => item.name === product.name
    );
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleOfferChange = (minimumDiscount) => {
    setSelectedOffers((current) =>
      current.includes(minimumDiscount)
        ? current.filter(
            (item) => item !== minimumDiscount
          )
        : [...current, minimumDiscount]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedOffers([]);
  };

  const getDiscount = (product) => {
    return Math.round(
      ((product.mrp - product.price) / product.mrp) * 100
    );
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const productDiscount = getDiscount(product);

    const matchesOffer =
      selectedOffers.length === 0 ||
      selectedOffers.some(
        (minimumDiscount) =>
          productDiscount >= minimumDiscount
      );

    return (
      matchesCategory &&
      matchesSearch &&
      matchesOffer
    );
  });

  const sortedProducts = [...filteredProducts].sort(
    (a, b) => {
      if (sortBy === "Price: Low to High") {
        return a.price - b.price;
      }

      if (sortBy === "Price: High to Low") {
        return b.price - a.price;
      }

      return 0;
    }
  );

  const selectedFilterCount =
    selectedCategories.length +
    selectedOffers.length;

  const filterContent = (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <div>
          <p className="filter-eyebrow">
            REFINE RESULTS
          </p>

          <h2>Filters</h2>
        </div>

        {selectedFilterCount > 0 && (
          <button
            type="button"
            className="filter-clear-button"
            onClick={clearFilters}
          >
            Clear all
          </button>
        )}

        {filterOpen && (
          <button
            type="button"
            className="shop-filter-close"
            onClick={() => setFilterOpen(false)}
            aria-label="Close filters"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* CATEGORIES */}
      <div className="filter-group">
        <div className="filter-group-heading">
          <h3>Categories</h3>

          {selectedCategories.length > 0 && (
            <span>
              {selectedCategories.length} selected
            </span>
          )}
        </div>

        <div className="filter-category-list">
          {categories.map((category) => {
            const count = products.filter(
              (product) =>
                product.category === category
            ).length;

            const selected =
              selectedCategories.includes(category);

            return (
              <label
                className={`filter-category-option ${
                  selected ? "selected" : ""
                }`}
                key={category}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    handleCategoryChange(category)
                  }
                />

                <span className="filter-check">
                  {selected && (
                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  )}
                </span>

                <span className="filter-category-name">
                  {category}
                </span>

                <span className="filter-category-count">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="filter-divider" />

      {/* OFFERS */}
      <div className="filter-group">
        <div className="filter-group-heading">
          <h3>Offers</h3>

          {selectedOffers.length > 0 && (
            <span>
              {selectedOffers.length} selected
            </span>
          )}
        </div>

        <div className="filter-category-list">
          {offerFilters.map((offer) => {
            const selected = selectedOffers.includes(
              offer.minimumDiscount
            );

            return (
              <label
                className={`filter-category-option ${
                  selected ? "selected" : ""
                }`}
                key={offer.minimumDiscount}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    handleOfferChange(
                      offer.minimumDiscount
                    )
                  }
                />

                <span className="filter-check">
                  {selected && (
                    <Check
                      size={11}
                      strokeWidth={3}
                    />
                  )}
                </span>

                <span className="filter-category-name">
                  {offer.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );

  return (
    <main className="shop-page">
      {/* PAGE HEADER */}
      <div className="shop-header">
        <Link
          to="/"
          className="shop-home-link"
        >
          ← Back to Home
        </Link>

        <p className="shop-breadcrumb">
          Home / Shop
        </p>

        <h1>Shop Products</h1>

        <p className="shop-description">
          Browse fresh groceries and everyday essentials.
        </p>
      </div>

      {/* SEARCH + SORT */}
      <div className="shop-controls">
        <form
          className="shop-search"
          onSubmit={(event) =>
            event.preventDefault()
          }
        >
          <Search size={18} />

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            aria-label="Search products"
          />

          <button type="submit">
            Search
          </button>
        </form>

        {/* MOBILE FILTER */}
        <button
          type="button"
          className="mobile-filter-trigger"
          onClick={() => setFilterOpen(true)}
        >
          <Filter size={16} />
          Filters

          {selectedFilterCount > 0 && (
            <span>
              ({selectedFilterCount})
            </span>
          )}
        </button>

        {/* SORT */}
        <div className="shop-sort">
          <label htmlFor="sort">
            Sort by:
          </label>

          <select
            id="sort"
            value={sortBy}
            onChange={(event) =>
              setSortBy(event.target.value)
            }
          >
            <option>Popularity</option>
            <option>
              Price: Low to High
            </option>
            <option>
              Price: High to Low
            </option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* SHOP CONTENT */}
      <div className="shop-content">
        {filterContent}

        <div className="shop-products">
          {/* PRODUCTS HEADER */}
          <div className="shop-products-header">
            <div>
              <h2>
                {searchTerm
                  ? `Search Results for "${searchTerm}"`
                  : categoryFromUrl
                  ? categoryFromUrl
                  : "All Products"}
              </h2>
            </div>

            <div className="shop-products-meta">
              <span>
                {filteredProducts.length} products
              </span>

              <span>
                🛒 {cart.length} in cart
              </span>
            </div>
          </div>

          {/* PRODUCT GRID */}
          <div className="shop-product-grid">
            {sortedProducts.map((product) => {
              const discount = getDiscount(product);

              return (
                <div
                  className="shop-product-card"
                  key={product.id}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="product-link"
                  >
                    <div className="shop-product-image">
                      <span className="product-discount-badge">
                        {discount}% OFF
                      </span>

                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    </div>

                    <div className="shop-product-info">
                      <h3>
                        {product.name}
                      </h3>

                      <p className="product-quantity">
                        {product.quantity}
                      </p>

                      <div className="shop-product-price-row">
                        <span className="shop-product-price">
                          ₹{product.price}
                        </span>

                        <span className="shop-product-mrp">
                          ₹{product.mrp}
                        </span>
                      </div>
                    </div>
                  </Link>

                  {/* ACTIONS */}
                  <div className="shop-product-actions">
                    <button
                      type="button"
                      onClick={() =>
                        addToCart(product)
                      }
                      className="shop-add-cart"
                    >
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleWishlist(product);
                      }}
                      className={`shop-wishlist ${
                        isWishlisted(product)
                          ? "wishlisted"
                          : ""
                      }`}
                      aria-label={
                        isWishlisted(product)
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                    >
                      {isWishlisted(product)
                        ? "♥"
                        : "♡"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EMPTY STATE */}
          {sortedProducts.length === 0 && (
            <div className="no-products">
              <h3>
                No products found
              </h3>

              <p>
                Try searching for another product
                or changing your filters.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  clearFilters();
                }}
              >
                Clear search & filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {filterOpen && (
        <div
          className="shop-filter-overlay"
          onClick={() =>
            setFilterOpen(false)
          }
        >
          <div
            className="shop-filter-drawer"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {filterContent}
          </div>
        </div>
      )}
    </main>
  );
}

export default Shop;