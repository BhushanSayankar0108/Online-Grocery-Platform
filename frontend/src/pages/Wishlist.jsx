
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const WISHLIST_API = `${API_BASE_URL}/api/wishlist`;
const CART_API = `${API_BASE_URL}/api/cart`;

// =====================================================
// CUSTOMER SESSION
// Supports the same customerSession.token used by
// Shop.jsx and ProductDetails.jsx, plus legacy token keys.
// =====================================================

function getCustomerToken() {
  const storage = [localStorage, sessionStorage];

  for (const store of storage) {
    try {
      const session = JSON.parse(
        store.getItem("customerSession") || "null"
      );

      if (session?.token) return session.token;
    } catch {
      // Ignore invalid session JSON and check legacy keys.
    }

    const legacyToken = store.getItem("customerToken");

    if (legacyToken) return legacyToken;
  }

  return null;
}

// =====================================================
// HELPERS
// =====================================================

function getItemId(item) {
  return String(item?.itemId || item?._id || item?.id || "");
}

function getProduct(item) {
  if (!item?.product) return null;

  // Handles populated product object or productId object.
  if (typeof item.product === "object") return item.product;

  if (typeof item.productId === "object") return item.productId;

  return null;
}

function getProductId(item, product) {
  const id =
    item?.productId?._id ||
    item?.productId ||
    product?._id ||
    product?.id;

  return id ? String(id) : "";
}

function getImageUrl(image) {
  if (!image || typeof image !== "string") return "";

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

async function readResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Your login session may have expired. Please log in again.");
    }

    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
}

// =====================================================
// COMPONENT
// =====================================================

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // LOAD CUSTOMER WISHLIST
  // =====================================================

  const fetchWishlist = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const token = getCustomerToken();

      if (!token) {
        setWishlist([]);
        setError("Please login to view your wishlist.");
        return;
      }

      const response = await fetch(WISHLIST_API, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal,
      });

      const data = await readResponse(response);

      const items = Array.isArray(data?.wishlist?.items)
        ? data.wishlist.items
        : Array.isArray(data?.items)
          ? data.items
          : [];

      setWishlist(items);
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error("Fetch wishlist error:", err);
      setError(err.message || "Unable to load your wishlist.");
      setWishlist([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    fetchWishlist(controller.signal);
  }, 0);

  return () => {
    clearTimeout(timer);
    controller.abort();
  };
}, [fetchWishlist]);

  // =====================================================
  // REMOVE PRODUCT FROM WISHLIST
  // =====================================================

  const removeFromWishlist = async (item) => {
    const itemId = getItemId(item);

    if (!itemId) {
      setError("Wishlist item ID is missing. Please refresh the page.");
      return;
    }

    try {
      setRemovingId(itemId);
      setError("");
      setSuccessMessage("");

      const token = getCustomerToken();

      if (!token) {
        throw new Error("Please login to manage your wishlist.");
      }

      const response = await fetch(
        `${WISHLIST_API}/${encodeURIComponent(itemId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await readResponse(response);

      if (Array.isArray(data?.wishlist?.items)) {
        setWishlist(data.wishlist.items);
      } else {
        setWishlist((current) =>
          current.filter((entry) => getItemId(entry) !== itemId)
        );
      }

      setSuccessMessage("Product removed from your wishlist.");
    } catch (err) {
      console.error("Remove wishlist error:", err);
      setError(err.message || "Unable to remove product.");
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // ADD PRODUCT TO CART
  // =====================================================

  const addToCart = async (item) => {
    const itemId = getItemId(item);
    const product = getProduct(item);
    const productId = getProductId(item, product);

    if (!productId) {
      setError("Product information is missing. Please refresh your wishlist.");
      return;
    }

    try {
      setAddingId(itemId);
      setError("");
      setSuccessMessage("");

      const token = getCustomerToken();

      if (!token) {
        throw new Error("Please login to add products to your cart.");
      }

      const requestBody = {
        productId,
        quantity: 1,
      };

      const variantId =
        item?.variantId?._id ||
        item?.variantId ||
        item?.variant?._id ||
        item?.variant?.id;

      if (variantId) {
        requestBody.variantId = String(variantId);
      }

      const response = await fetch(`${CART_API}/items`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await readResponse(response);

      setSuccessMessage(
        data.message || "Product added to cart successfully."
      );
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(err.message || "Unable to add product to cart.");
    } finally {
      setAddingId(null);
    }
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-container">
          <header className="wishlist-header">
            <Link to="/" className="shop-home-link">
              ← Back to Home
            </Link>

            <p className="wishlist-breadcrumb">Home / Wishlist</p>

            <span className="wishlist-eyebrow">
              YOUR SAVED PRODUCTS
            </span>

            <h1>My Wishlist</h1>
          </header>

          <section className="wishlist-empty">
            <p>Loading your wishlist...</p>
          </section>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <header className="wishlist-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="wishlist-breadcrumb">Home / Wishlist</p>

          <span className="wishlist-eyebrow">
            YOUR SAVED PRODUCTS
          </span>

          <h1>My Wishlist</h1>

          <p className="wishlist-intro">
            Keep your favorite groceries here and add them to your cart
            whenever you're ready.
          </p>
        </header>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#fff1f0",
              color: "#b42318",
            }}
          >
            {error}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              marginBottom: "18px",
              borderRadius: "8px",
              background: "#ecfdf3",
              color: "#067647",
            }}
          >
            {successMessage}
          </div>
        )}

        {wishlist.length === 0 ? (
          <section className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <Heart size={34} strokeWidth={1.6} />
            </div>

            <span className="wishlist-empty-eyebrow">
              NOTHING SAVED YET
            </span>

            <h2>Your wishlist is empty.</h2>

            <p>
              Save products you love and come back to them whenever
              you need them.
            </p>

            <Link to="/shop" className="wishlist-shop-button">
              <ShoppingBag size={17} />
              Browse Products
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <>
            <div className="wishlist-summary">
              <div>
                <span>SAVED ITEMS</span>

                <strong>
                  {wishlist.length}{" "}
                  {wishlist.length === 1 ? "product" : "products"}
                </strong>
              </div>

              <Link to="/shop" className="wishlist-continue">
                Continue Shopping
                <ArrowRight size={16} />
              </Link>
            </div>

            <section className="wishlist-grid">
              {wishlist.map((item, index) => {
                const product = getProduct(item);
                const itemId = getItemId(item) || `wishlist-${index}`;

                if (!product) {
                  return (
                    <article className="wishlist-card" key={itemId}>
                      <div className="wishlist-info">
                        <p>Product details are unavailable.</p>
                        <button
                          type="button"
                          className="wishlist-remove"
                          onClick={() => removeFromWishlist(item)}
                          disabled={removingId === itemId}
                        >
                          <Trash2 size={17} />
                          Remove
                        </button>
                      </div>
                    </article>
                  );
                }

                const variant = item.variant || null;

                const price = Number(
                  variant?.sellingPrice ??
                  variant?.price ??
                  product.sellingPrice ??
                  product.price ??
                  0
                );

                const mrp = Number(
                  variant?.mrp ??
                  product.mrp ??
                  price
                );

                const quantityLabel =
                  variant?.label ||
                  (variant?.quantityValue && variant?.quantityUnit
                    ? `${variant.quantityValue} ${variant.quantityUnit}`
                    : product.quantity ||
                      (product.quantityValue && product.quantityUnit
                        ? `${product.quantityValue} ${product.quantityUnit}`
                        : product.unit || ""));

                const image =
                  product.images?.[0] ||
                  product.image ||
                  product.thumbnail ||
                  "";

                const productId = getProductId(item, product);

                const discount =
                  mrp > price && mrp > 0
                    ? Math.round(((mrp - price) / mrp) * 100)
                    : 0;

                return (
                  <article className="wishlist-card" key={itemId}>
                    <Link
                      to={`/product/${productId}`}
                      className="wishlist-product-link"
                    >
                      <div className="wishlist-image">
                        {discount > 0 && (
                          <span className="wishlist-discount">
                            {discount}% OFF
                          </span>
                        )}

                        {image ? (
                          <img
                            src={getImageUrl(image)}
                            alt={product.name || "Wishlist product"}
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                              color: "#999",
                            }}
                          >
                            <ShoppingBag size={40} />
                          </div>
                        )}
                      </div>

                      <div className="wishlist-info">
                        <h2>{product.name || "Product"}</h2>

                        {quantityLabel && (
                          <span className="wishlist-quantity">
                            {quantityLabel}
                          </span>
                        )}

                        <div className="wishlist-price">
                          <strong>₹{price.toFixed(2)}</strong>

                          {mrp > price && (
                            <span>₹{mrp.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </Link>

                    <div className="wishlist-actions">
                      <button
                        type="button"
                        className="wishlist-cart-button"
                        onClick={() => addToCart(item)}
                        disabled={addingId === itemId}
                      >
                        <ShoppingCart size={17} />

                        {addingId === itemId
                          ? "Adding..."
                          : "Add to Cart"}
                      </button>

                      <button
                        type="button"
                        className="wishlist-remove"
                        onClick={() => removeFromWishlist(item)}
                        disabled={removingId === itemId}
                        aria-label={`Remove ${product.name || "product"} from wishlist`}
                      >
                        <Trash2 size={17} />

                        <span>
                          {removingId === itemId
                            ? "Removing..."
                            : "Remove"}
                        </span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;
