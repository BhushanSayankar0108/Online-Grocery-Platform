import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, Filter, Search, X, Plus, Minus } from "lucide-react";
import products from "../data/products";

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
  { label: "10% Off or more", minimumDiscount: 10 },
  { label: "20% Off or more", minimumDiscount: 20 },
];

function Shop({ cart = [], setCart, wishlist = [], setWishlist }) {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");
  const searchFromUrl = searchParams.get("search");

  const [selectedCategories, setSelectedCategories] = useState(
    categoryFromUrl ? [categoryFromUrl] : []
  );
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(searchFromUrl || "");
  const [sortBy, setSortBy] = useState("Popularity");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  const activeCategories = categoryFromUrl
    ? [categoryFromUrl]
    : selectedCategories;

  const activeSearchTerm =
    searchFromUrl !== null ? searchFromUrl : searchTerm;

  const getVariant = (product, variantId) =>
    product.variants?.find((variant) => variant.id === variantId) ||
    product.variants?.[0] ||
    null;

  const getSelectedVariant = (product) =>
    getVariant(
      product,
      selectedVariants[product.id] || product.variants?.[0]?.id
    );

  const getCartKey = (product, variant) =>
    `${product.id}-${variant?.id || product.quantity}`;

  const createCartProduct = (product, variant) => ({
    ...product,
    quantity: 1,
    variantId: variant?.id || null,
    variantLabel: variant?.label || product.quantity,
    price: variant?.price ?? product.price,
    mrp: variant?.mrp ?? product.mrp,
    cartKey: getCartKey(product, variant),
  });

  const addToCart = (product, variant) => {
    const cartProduct = createCartProduct(product, variant);

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item.cartKey === cartProduct.cartKey ||
          (!item.cartKey &&
            item.id === product.id &&
            item.variantId === cartProduct.variantId)
      );

      if (existing) {
        return currentCart.map((item) =>
          item === existing
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, cartProduct];
    });
  };

  const decreaseQuantity = (product, variant) => {
    const key = getCartKey(product, variant);

    setCart((currentCart) =>
      currentCart
        .map((item) =>
          (item.cartKey === key ||
            (!item.cartKey &&
              item.id === product.id &&
              item.variantId === (variant?.id || null)))
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const getCartQuantity = (product, variant) => {
    const key = getCartKey(product, variant);

    return (
      cart.find(
        (item) =>
          item.cartKey === key ||
          (!item.cartKey &&
            item.id === product.id &&
            item.variantId === (variant?.id || null))
      )?.quantity || 0
    );
  };

  const toggleWishlist = (product) => {
    setWishlist((currentWishlist) => {
      const exists = currentWishlist.some(
        (item) => item.id === product.id
      );

      return exists
        ? currentWishlist.filter((item) => item.id !== product.id)
        : [...currentWishlist, product];
    });
  };

  const isWishlisted = (product) =>
    wishlist.some((item) => item.id === product.id);

  const handleCategoryChange = (category) => {
    if (categoryFromUrl) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("category");
      setSearchParams(nextParams);
      setSelectedCategories(
        categoryFromUrl === category ? [] : [category]
      );
      return;
    }

    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
  };

  const handleOfferChange = (minimumDiscount) => {
    setSelectedOffers((current) =>
      current.includes(minimumDiscount)
        ? current.filter((item) => item !== minimumDiscount)
        : [...current, minimumDiscount]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedOffers([]);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    setSearchParams(nextParams);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (searchFromUrl !== null) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("search");
      setSearchParams(nextParams);
    }
  };

  const getDiscount = (product) =>
    product.mrp > 0
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      activeCategories.length === 0 ||
      activeCategories.includes(product.category);

    const matchesSearch = product.name
      .toLowerCase()
      .includes(activeSearchTerm.toLowerCase());

    const productDiscount = getDiscount(product);

    const matchesOffer =
      selectedOffers.length === 0 ||
      selectedOffers.some(
        (minimumDiscount) => productDiscount >= minimumDiscount
      );

    return matchesCategory && matchesSearch && matchesOffer;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "Price: Low to High") return a.price - b.price;
    if (sortBy === "Price: High to Low") return b.price - a.price;
    if (sortBy === "Newest") return (b.id || 0) - (a.id || 0);
    return 0;
  });

  const selectedFilterCount =
    activeCategories.length + selectedOffers.length;

  const filterContent = (
    <aside className="filter-sidebar">
      <div className="filter-sidebar-header">
        <div>
          <p className="filter-eyebrow">REFINE RESULTS</p>
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

      <div className="filter-group">
        <div className="filter-group-heading">
          <h3>Categories</h3>
          {activeCategories.length > 0 && (
            <span>{activeCategories.length} selected</span>
          )}
        </div>

        <div className="filter-category-list">
          {categories.map((category) => {
            const count = products.filter(
              (product) => product.category === category
            ).length;
            const selected = activeCategories.includes(category);

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
                  onChange={() => handleCategoryChange(category)}
                />
                <span className="filter-check">
                  {selected && <Check size={11} strokeWidth={3} />}
                </span>
                <span className="filter-category-name">{category}</span>
                <span className="filter-category-count">{count}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="filter-divider" />

      <div className="filter-group">
        <div className="filter-group-heading">
          <h3>Offers</h3>
          {selectedOffers.length > 0 && (
            <span>{selectedOffers.length} selected</span>
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
                    handleOfferChange(offer.minimumDiscount)
                  }
                />
                <span className="filter-check">
                  {selected && <Check size={11} strokeWidth={3} />}
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
        <form
          className="shop-search"
          onSubmit={(event) => event.preventDefault()}
        >
          <Search size={18} />
          <input
            type="text"
            placeholder="Search products..."
            value={activeSearchTerm}
            onChange={handleSearchChange}
            aria-label="Search products"
          />
          <button type="submit">Search</button>
        </form>

        <button
          type="button"
          className="mobile-filter-trigger"
          onClick={() => setFilterOpen(true)}
        >
          <Filter size={16} />
          Filters
          {selectedFilterCount > 0 && (
            <span>({selectedFilterCount})</span>
          )}
        </button>

        <div className="shop-sort">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option>Popularity</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      <div className="shop-content">
        {filterContent}

        <div className="shop-products">
          <div className="shop-products-header">
            <div>
              <h2>
                {activeSearchTerm
                  ? `Search Results for "${activeSearchTerm}"`
                  : activeCategories.length > 0
                    ? activeCategories.join(", ")
                    : "All Products"}
              </h2>
            </div>

            <div className="shop-products-meta">
              <span>{filteredProducts.length} products</span>
              <span>
                🛒{" "}
                {cart.reduce(
                  (total, item) => total + (item.quantity || 1),
                  0
                )}{" "}
                in cart
              </span>
            </div>
          </div>

          <div className="shop-product-grid">
            {sortedProducts.map((product, index) => {
              const discount = getDiscount(product);
              const variant = getSelectedVariant(product);
              const cartQuantity = getCartQuantity(product, variant);

              return (
                <div className="shop-product-card" key={product.id}>
                  <Link
                    to={`/product/${product.id}`}
                    className="product-link"
                  >
                    <div className="shop-product-image">
                      {discount > 0 && (
                        <span className="product-discount-badge">
                          {discount}% OFF
                        </span>
                      )}

                      <img
                        src={product.image}
                        alt={product.name}
                        loading={index < 2 ? "eager" : "lazy"}
                        fetchPriority={index < 2 ? "high" : "auto"}
                        decoding="async"
                      />
                    </div>

                    <div className="shop-product-info">
                      <h3>{product.name}</h3>
                    </div>
                  </Link>

                  <div className="shop-product-variant">
                    <label>
                      <span>Choose size</span>
                      <select
                        value={variant?.id || ""}
                        onChange={(event) =>
                          setSelectedVariants((current) => ({
                            ...current,
                            [product.id]: event.target.value,
                          }))
                        }
                        aria-label={`Choose size for ${product.name}`}
                      >
                        {(product.variants || []).map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                        {(!product.variants ||
                          product.variants.length === 0) && (
                          <option value="default">
                            {product.quantity}
                          </option>
                        )}
                      </select>
                    </label>

                    <div className="shop-product-price-row">
                      <span className="shop-product-price">
                        ₹{variant?.price ?? product.price}
                      </span>
                      {(variant?.mrp ?? product.mrp) >
                        (variant?.price ?? product.price) && (
                        <span className="shop-product-mrp">
                          ₹{variant?.mrp ?? product.mrp}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shop-product-actions">
                    {cartQuantity === 0 ? (
                      <button
                        type="button"
                        onClick={() => addToCart(product, variant)}
                        className="shop-add-cart"
                      >
                        Add to Cart
                      </button>
                    ) : (
                      <div className="product-quantity-control">
                        <button
                          type="button"
                          className="quantity-control-btn"
                          onClick={() => decreaseQuantity(product, variant)}
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus size={16} />
                        </button>

                        <span className="cart-item-quantity">
                          {cartQuantity}
                        </span>

                        <button
                          type="button"
                          className="quantity-control-btn"
                          onClick={() => addToCart(product, variant)}
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleWishlist(product)}
                      className={`shop-wishlist ${
                        isWishlisted(product) ? "wishlisted" : ""
                      }`}
                      aria-label={
                        isWishlisted(product)
                          ? `Remove ${product.name} from wishlist`
                          : `Add ${product.name} to wishlist`
                      }
                    >
                      {isWishlisted(product) ? "♥" : "♡"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {sortedProducts.length === 0 && (
            <div className="no-products">
              <h3>No products found</h3>
              <p>
                Try searching for another product or changing your filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  clearFilters();
                }}
              >
                Clear search &amp; filters
              </button>
            </div>
          )}
        </div>
      </div>

      {filterOpen && (
        <div
          className="shop-filter-overlay"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="shop-filter-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            {filterContent}
          </div>
        </div>
      )}
    </main>
  );
}

export default Shop;