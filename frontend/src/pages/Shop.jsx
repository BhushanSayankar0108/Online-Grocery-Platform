import { useCallback, useEffect, useState } from "react";

import { Link, useSearchParams } from "react-router-dom";

import { Check, Filter, Search, X, Plus, Minus } from "lucide-react";

const API_BASE_URL = (

  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"

).replace(/\/+$/, "");

const PRODUCTS_API = `${API_BASE_URL}/api/products`;

const CATEGORIES_API = `${API_BASE_URL}/api/categories`;

const offerFilters = [

  { label: "10% Off or more", minimumDiscount: 10 },

  { label: "20% Off or more", minimumDiscount: 20 },

];

const getCategoryName = (category) => {

  if (!category) return "";

  if (typeof category === "string") return category;

  return (

    category.name ||

    category.categoryName ||

    category.title ||

    category.category_name ||

    ""

  );

};

const getProductImage = (product) => {

  const images = Array.isArray(product.images) ? product.images : [];

  const image =

    product.image ||

    images[0] ||

    product.thumbnail ||

    "";

  if (!image) return "/images/product-placeholder.png";

  if (

    typeof image !== "string"

  ) {

    return "/images/product-placeholder.png";

  }

  if (

    image.startsWith("http://") ||

    image.startsWith("https://") ||

    image.startsWith("data:") ||

    image.startsWith("blob:")

  ) {

    return image;

  }

  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;

};

const formatQuantity = (product) => {

  if (product.quantity) return String(product.quantity);

  const value = product.quantityValue;

  const unit = product.quantityUnit || product.unit || "";

  if (value !== undefined && value !== null) {

    return `${value} ${unit}`.trim();

  }

  return product.unit || "1 item";

};

const normalizeProduct = (item) => {

  const id = String(item._id || item.id || "");

  const price = Number(item.sellingPrice ?? item.price ?? 0);

  const mrp = Number(item.mrp ?? price);

  const quantity = formatQuantity(item);

  const variants = Array.isArray(item.variants)

    ? item.variants

        .filter(

          (variant) =>

            String(variant.status || "active").toLowerCase() === "active"

        )

        .map((variant, index) => ({

          id: String(variant._id || variant.id || index),

          label:

            variant.label ||

            `${variant.quantityValue ?? ""} ${

              variant.quantityUnit ?? ""

            }`.trim() ||

            quantity,

          price: Number(variant.sellingPrice ?? variant.price ?? price),

          mrp: Number(variant.mrp ?? mrp),

          stockQuantity: Number(variant.stockQuantity ?? 0),

        }))

    : [];

  if (variants.length === 0) {

    variants.push({

      id: "default",

      label: quantity,

      price,

      mrp,

      stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),

    });

  }

  return {

    ...item,

    id,

    name: item.name || "Unnamed product",

    quantity,

    price,

    mrp,

    category: getCategoryName(item.category),

    image: getProductImage(item),

    variants,

    createdAt: item.createdAt || null,

    stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),

  };

};

function Shop({

  cart = [],

  setCart,


  setWishlist,

  customer,

}) {

  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category");

  const searchFromUrl = searchParams.get("search");

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [apiError, setApiError] = useState("");

  const [categories, setCategories] = useState([]);

  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [categoriesError, setCategoriesError] = useState("");

  const [selectedCategories, setSelectedCategories] = useState(

    categoryFromUrl ? [categoryFromUrl] : []

  );

  const [selectedOffers, setSelectedOffers] = useState([]);

  const [searchTerm, setSearchTerm] = useState(searchFromUrl || "");

  const [sortBy, setSortBy] = useState("Popularity");

  const [filterOpen, setFilterOpen] = useState(false);

  const [selectedVariants, setSelectedVariants] = useState({});

  // Fetch products from the backend.

  useEffect(() => {

    const controller = new AbortController();

    const fetchProducts = async () => {

      setLoading(true);

      setApiError("");

      try {

        const response = await fetch(

          `${PRODUCTS_API}?page=1&limit=100&sort=newest`,

          { signal: controller.signal }

        );

        let data;

        try {

          data = await response.json();

        } catch {

          throw new Error(

            "The server returned an invalid response. Please try again."

          );

        }

        if (!response.ok) {

          throw new Error(

            data?.message ||

              `Unable to load products (${response.status}).`

          );

        }

        const productList = Array.isArray(data)

          ? data

          : Array.isArray(data?.products)

          ? data.products

          : Array.isArray(data?.data?.products)

          ? data.data.products

          : Array.isArray(data?.data)

          ? data.data

          : [];

        setProducts(

          productList

            .filter(

              (product) =>

                String(product.status || "active").toLowerCase() === "active"

            )

            .map(normalizeProduct)

        );

      } catch (error) {

        if (error.name === "AbortError") return;

        console.error("Shop product fetch error:", error);

        setApiError(

          error.message ||

            "Unable to connect to the server. Please try again."

        );

      } finally {

        if (!controller.signal.aborted) {

          setLoading(false);

        }

      }

    };

    fetchProducts();

    return () => controller.abort();

  }, []);

  // Fetch categories from the backend.

  useEffect(() => {

    const controller = new AbortController();

    const fetchCategories = async () => {

      setCategoriesLoading(true);

      setCategoriesError("");

      try {

        const response = await fetch(CATEGORIES_API, {

          signal: controller.signal,

        });

        let data;

        try {

          data = await response.json();

        } catch {

          throw new Error(

            "The server returned an invalid categories response."

          );

        }

        if (!response.ok) {

          throw new Error(

            data?.message ||

              `Unable to load categories (${response.status}).`

          );

        }

        if (data?.success === false) {

          throw new Error(

            data.message || "Unable to load categories."

          );

        }

        const categoryList = Array.isArray(data)

          ? data

          : Array.isArray(data?.categories)

          ? data.categories

          : Array.isArray(data?.data?.categories)

          ? data.data.categories

          : Array.isArray(data?.data)

          ? data.data

          : [];

        const activeCategoryNames = categoryList

          .filter((category) => {

            if (typeof category === "string") {

              return category.trim().length > 0;

            }

            if (!category) return false;

            return (

              String(category.status || "active").toLowerCase() === "active" &&

              category.isActive !== false &&

              category.is_active !== false

            );

          })

          .map((category) => String(getCategoryName(category)).trim())

          .filter(Boolean);

        setCategories([...new Set(activeCategoryNames)]);

      } catch (error) {

        if (error.name === "AbortError") return;

        console.error("Shop categories fetch error:", error);

        setCategoriesError(

          error.message || "Unable to load categories. Please try again."

        );

      } finally {

        if (!controller.signal.aborted) {

          setCategoriesLoading(false);

        }

      }

    };

    fetchCategories();

    return () => controller.abort();

  }, []);

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

  const getCustomerToken = useCallback(() => {

    try {

      const localSession = JSON.parse(

        localStorage.getItem("customerSession") || "null"

      );

      const temporarySession = JSON.parse(

        sessionStorage.getItem("customerSession") || "null"

      );

      return (

        customer?.token ||

        customer?.accessToken ||

        customer?.jwt ||

        localSession?.token ||

        localSession?.accessToken ||

        localSession?.jwt ||

        temporarySession?.token ||

        temporarySession?.accessToken ||

        temporarySession?.jwt ||

        ""

      );

    } catch (error) {

      console.error("Unable to read customer session:", error);

      return "";

    }

  }, [customer]);

  const mapBackendCart = (backendCart) => {

    const items = Array.isArray(backendCart?.items)

      ? backendCart.items

      : [];

    return items.map((item) => {

      const product = item.product || {};

      const variant = item.variant || null;

      const productId = String(

        product._id || product.id || item.productId || ""

      );

      const variantId = item.variantId ? String(item.variantId) : null;

      const quantity = Number(item.quantity) || 1;

      const price = Number(

        item.unitPrice ??

          variant?.sellingPrice ??

          variant?.price ??

          product.sellingPrice ??

          product.price ??

          0

      );

      const mrp = Number(variant?.mrp ?? product.mrp ?? price);

      const variantLabel =

        variant?.label ||

        [variant?.quantityValue, variant?.quantityUnit]

          .filter(Boolean)

          .join(" ") ||

        product.quantity ||

        product.unit ||

        "1 item";

      return {

        ...product,

        id: productId,

        productId,

        name: product.name || "Unnamed product",

        image: getProductImage(product),

        images: Array.isArray(product.images) ? product.images : [],

        quantity,

        variantId,

        variantLabel,

        price,

        mrp,

        cartItemId: String(item.cartItemId || item._id || ""),

        cartKey: `${productId}-${variantId || formatQuantity(product)}`,

        lineTotal: Number(item.lineTotal ?? price * quantity),

        variantStockQuantity: Number(

          variant?.stockQuantity ?? product.stockQuantity ?? 0

        ),

      };

    });

  };

  const syncCartFromResponse = (data) => {

    if (data?.success && data?.cart && typeof setCart === "function") {

      setCart(mapBackendCart(data.cart));

    }

  };

  const addToCart = async (product, variant) => {

    if (typeof setCart !== "function") {

      console.error("Shop requires a setCart function.");

      return;

    }

    const token = getCustomerToken();

    const cartProduct = createCartProduct(product, variant);

    // Guests keep using the local cart.

    if (!token) {

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

              ? { ...item, quantity: Number(item.quantity || 0) + 1 }

              : item

          );

        }

        return [...currentCart, cartProduct];

      });

      return;

    }

    try {

      const realVariantId =

        variant?.id && variant.id !== "default" ? variant.id : null;

      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({

          productId: product.id,

          quantity: 1,

          ...(realVariantId ? { variantId: realVariantId } : {}),

        }),

      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false || !data?.cart) {

        throw new Error(

          data?.message || data?.error || "Unable to add this product to your cart."

        );

      }

      syncCartFromResponse(data);

    } catch (error) {

      console.error("Add to cart failed:", error);

      window.alert(error.message || "Unable to add the product. Please try again.");

    }

  };

const decreaseQuantity = async (product, variant) => {

  if (typeof setCart !== "function") return;

  const productId = String(product.id || product._id || "");

  const variantId =

    variant?.id && variant.id !== "default"

      ? String(variant.id)

      : null;

  const existing = cart.find((item) => {

    const itemProductId = String(

      item.productId ||

        item.product?._id ||

        item.product?.id ||

        item.id ||

        item._id ||

        ""

    );

    const itemVariantId =

      item.variantId && item.variantId !== "default"

        ? String(item.variantId)

        : null;

    return (

      itemProductId === productId &&

      itemVariantId === variantId

    );

  });

  if (!existing) {

    console.warn("Cart item not found for decrease:", {

      productId,

      variantId,

      cart,

    });

    return;

  }

  const currentQuantity = Number(existing.quantity) || 1;

  const nextQuantity = currentQuantity - 1;

  const token = getCustomerToken();

  // Guest cart: update local state.

  if (!token || !existing.cartItemId) {

    setCart((currentCart) =>

      currentCart

        .map((item) => {

          const itemProductId = String(

            item.productId ||

              item.product?._id ||

              item.product?.id ||

              item.id ||

              item._id ||

              ""

          );

          const itemVariantId =

            item.variantId && item.variantId !== "default"

              ? String(item.variantId)

              : null;

          if (

            itemProductId === productId &&

            itemVariantId === variantId

          ) {

            return {

              ...item,

              quantity: (Number(item.quantity) || 1) - 1,

            };

          }

          return item;

        })

        .filter((item) => Number(item.quantity) > 0)

    );

    return;

  }

  // Logged-in customer: update the backend cart.

  try {

    const removingItem = nextQuantity <= 0;

    const response = await fetch(

      `${API_BASE_URL}/api/cart/items/${encodeURIComponent(

        existing.cartItemId

      )}`,

      {

        method: removingItem ? "DELETE" : "PATCH",

        headers: {

          Authorization: `Bearer ${token}`,

          ...(removingItem

            ? {}

            : { "Content-Type": "application/json" }),

        },

        ...(removingItem

          ? {}

          : {

              body: JSON.stringify({

                quantity: nextQuantity,

              }),

            }),

      }

    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data?.success === false || !data?.cart) {

      throw new Error(

        data?.message ||

          data?.error ||

          "Unable to decrease product quantity."

      );

    }

    syncCartFromResponse(data);

  } catch (error) {

    console.error("Decrease quantity failed:", error);

    window.alert(

      error.message || "Unable to update the cart. Please try again."

    );

  }

};

const getCartQuantity = (product, variant) => {

  const productId = String(product.id || product._id || "");

  const variantId =

    variant?.id && variant.id !== "default"

      ? String(variant.id)

      : null;

  const item = cart.find((item) => {

    const cartProductId = String(

      item.productId ||

      item.product?._id ||

      item.product?.id ||

      item.id ||

      item._id ||

      ""

    );

    const cartVariantId =

      item.variantId && item.variantId !== "default"

        ? String(item.variantId)

        : null;

    return (

      cartProductId === productId &&

      cartVariantId === variantId

    );

  });

  return Number(item?.quantity) || 0;

};

  const [backendWishlist, setBackendWishlist] = useState([]);
  const [wishlistActionLoading, setWishlistActionLoading] = useState({});

  const syncWishlist = (data) => {
    const items = Array.isArray(data?.wishlist?.items)
      ? data.wishlist.items
      : [];

    setBackendWishlist(items);

    if (typeof setWishlist === "function") {
      setWishlist(
        items.map((item) => ({
          ...(item.product || {}),
          id: String(item.productId || item.product?._id || ""),
          itemId: String(item.itemId || ""),
          variantId: item.variantId ? String(item.variantId) : null,
          variantLabel: item.variant?.label || "",
          image: getProductImage(item.product || {}),
        }))
      );
    }
  };

  useEffect(() => {
    const token = getCustomerToken();
    if (!token) {
      return;
    }

    const controller = new AbortController();

    const loadWishlist = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load wishlist.");
        }

        setBackendWishlist(Array.isArray(data?.wishlist?.items) ? data.wishlist.items : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Wishlist loading error:", error);
        }
      }
    };

    loadWishlist();
    return () => controller.abort();
  }, [getCustomerToken]);

  const toggleWishlist = async (product, variant) => {
    const token = getCustomerToken();

    if (!token) {
      window.location.href = `/login?returnUrl=${encodeURIComponent(
        window.location.pathname + window.location.search
      )}`;
      return;
    }

    const variantId =
      variant?.id && variant.id !== "default" ? String(variant.id) : null;

    const existing = backendWishlist.find(
      (item) =>
        String(item.productId) === String(product.id) &&
        String(item.variantId || "") === String(variantId || "")
    );

    const actionKey = `${product.id}-${variantId || "default"}`;
    if (wishlistActionLoading[actionKey]) return;

    setWishlistActionLoading((current) => ({
      ...current,
      [actionKey]: true,
    }));

    try {
      const response = await fetch(
        existing
          ? `${API_BASE_URL}/api/wishlist/${encodeURIComponent(existing.itemId)}`
          : `${API_BASE_URL}/api/wishlist`,
        {
          method: existing ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            ...(existing ? {} : { "Content-Type": "application/json" }),
          },
          ...(!existing
            ? {
                body: JSON.stringify({
                  productId: product.id,
                  ...(variantId ? { variantId } : {}),
                }),
              }
            : {}),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update wishlist.");
      }

      syncWishlist(data);
    } catch (error) {
      console.error("Wishlist update error:", error);
      window.alert(error.message || "Unable to update wishlist.");
    } finally {
      setWishlistActionLoading((current) => ({
        ...current,
        [actionKey]: false,
      }));
    }
  };

  const isWishlisted = (product, variant) => {
    const variantId =
      variant?.id && variant.id !== "default" ? String(variant.id) : null;

    return backendWishlist.some(
      (item) =>
        String(item.productId) === String(product.id) &&
        String(item.variantId || "") === String(variantId || "")
    );
  };

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

    const search = (activeSearchTerm || "").trim().toLowerCase();

    const matchesSearch =

      !search ||

      product.name.toLowerCase().includes(search) ||

      (product.description || "").toLowerCase().includes(search) ||

      (product.brand || "").toLowerCase().includes(search);

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

    if (sortBy === "Newest") {

      return (

        new Date(b.createdAt || 0).getTime() -

        new Date(a.createdAt || 0).getTime()

      );

    }

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

          {categoriesLoading && (

            <p className="filter-category-message">

              Loading categories...

            </p>

          )}

          {!categoriesLoading && categoriesError && (

            <p className="filter-category-message" role="alert">

              {categoriesError}

            </p>

          )}

          {!categoriesLoading &&

            !categoriesError &&

            categories.length === 0 && (

              <p className="filter-category-message">

                No categories available.

              </p>

            )}

          {!categoriesLoading &&

            !categoriesError &&

            categories.map((category) => {

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

              <span>

                {loading

                  ? "Loading..."

                  : `${filteredProducts.length} products`}

              </span>

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

          {loading && (

            <div className="no-products">

              <h3>Loading products...</h3>

              <p>Please wait while we load the latest products.</p>

            </div>

          )}

          {!loading && apiError && (

            <div className="no-products">

              <h3>Unable to load products</h3>

              <p>{apiError}</p>

              <button

                type="button"

                onClick={() => window.location.reload()}

              >

                Try again

              </button>

            </div>

          )}

          {!loading && !apiError && (

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

                          onError={(event) => {

                            event.currentTarget.onerror = null;

                            event.currentTarget.src =

                              "https://placehold.co/400x400?text=Product";

                          }}

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

                          disabled={

                            (variant?.stockQuantity ??

                              product.stockQuantity) <= 0

                          }

                        >

                          {(variant?.stockQuantity ??

                            product.stockQuantity) <= 0

                            ? "Out of Stock"

                            : "Add to Cart"}

                        </button>

                      ) : (

                        <div className="product-quantity-control">

                          <button

                            type="button"

                            className="quantity-control-btn"

                            onClick={() =>

                              decreaseQuantity(product, variant)

                            }

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

                            disabled={

                              cartQuantity >=

                              (variant?.stockQuantity ??

                                product.stockQuantity)

                            }

                          >

                            <Plus size={16} />

                          </button>

                        </div>

                      )}

                      <button

                        type="button"

                        onClick={() => toggleWishlist(product, variant)}

                        className={`shop-wishlist ${

                          isWishlisted(product, variant) ? "wishlisted" : ""

                        }`}

                        aria-label={

                          isWishlisted(product, variant)

                            ? `Remove ${product.name} from wishlist`

                            : `Add ${product.name} to wishlist`

                        }

                      >

                        {isWishlisted(product, variant) ? "♥" : "♡"}

                      </button>

                    </div>

                  </div>

                );

              })}

            </div>

          )}

          {!loading && !apiError && sortedProducts.length === 0 && (

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
