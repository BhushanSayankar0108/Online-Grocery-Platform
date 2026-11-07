import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductReviewSection from "../components/ProductReviewSection";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const PRODUCTS_API = `${API_BASE_URL}/api/products`;
const CART_API = `${API_BASE_URL}/api/cart`;
const WISHLIST_API = `${API_BASE_URL}/api/wishlist`;

const getCategoryName = (category) => {
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || "";
};

const getProductImage = (image) => {
  if (!image || typeof image !== "string") return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) return image;

  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const normalizeProduct = (item) => {
  const images = Array.isArray(item.images)
    ? item.images.map(getProductImage).filter(Boolean)
    : [];
  const singleImage = getProductImage(item.image || item.thumbnail || "");
  if (images.length === 0 && singleImage) images.push(singleImage);

  const productPrice = Number(item.sellingPrice ?? item.price ?? 0);
  const productMrp = Number(item.mrp ?? productPrice);

  const variants = Array.isArray(item.variants)
    ? item.variants
        .filter((variant) => variant.status !== "inactive")
        .map((variant, index) => ({
          id: String(variant._id || variant.id || index),
          label:
            variant.label ||
            `${variant.quantityValue ?? ""} ${variant.quantityUnit ?? ""}`.trim() ||
            item.quantity ||
            `${item.quantityValue ?? ""} ${item.quantityUnit ?? item.unit ?? ""}`.trim() ||
            "Standard",
          price: Number(variant.sellingPrice ?? variant.price ?? productPrice),
          mrp: Number(variant.mrp ?? productMrp),
          stockQuantity: Number(variant.stockQuantity ?? 0),
          sku: variant.sku || "",
        }))
    : [];

  if (variants.length === 0) {
    variants.push({
      id: "default",
      label:
        item.quantity ||
        `${item.quantityValue ?? ""} ${item.quantityUnit ?? item.unit ?? ""}`.trim() ||
        item.unit ||
        "Standard",
      price: productPrice,
      mrp: productMrp,
      stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),
      sku: item.sku || "",
    });
  }

  return {
    ...item,
    id: String(item._id || item.id || ""),
    name: item.name || "Unnamed product",
    category: getCategoryName(item.category),
    description: item.description || "No description is available for this product.",
    images,
    variants,
    stockQuantity: Number(item.stockQuantity ?? item.stock ?? 0),
    gstPercentage: Number(item.gstPercentage ?? 0),
  };
};

function getCustomerSession() {
  try {
    const persistentSession = JSON.parse(localStorage.getItem("customerSession") || "null");
    if (persistentSession?.token) return persistentSession;
  } catch (error) {
    console.error("Unable to read persistent customer session:", error);
  }

  try {
    const temporarySession = JSON.parse(sessionStorage.getItem("customerSession") || "null");
    if (temporarySession?.token) return temporarySession;
  } catch (error) {
    console.error("Unable to read temporary customer session:", error);
  }

  return null;
}

function normalizeCartItem(item) {
  const product = item.product || {};
  const variant = item.variant || null;
  const variantId = item.variantId || variant?.id || null;
  const productId = String(product._id || product.id || item.productId || item._id || "");
  const price = Number(
    item.unitPrice ?? variant?.sellingPrice ?? product.sellingPrice ?? item.price ?? 0
  );

  return {
    ...product,
    id: productId,
    _id: productId,
    name: product.name || item.name || "Product",
    image: getProductImage(product.images?.[0] || "") || item.image || "",
    images: (product.images || []).map(getProductImage).filter(Boolean),
    price,
    mrp: Number(variant?.mrp ?? product.mrp ?? item.mrp ?? price),
    quantity: Number(item.quantity || 1),
    variantId,
    variantLabel: variant?.label || item.variantLabel || "",
    cartKey: `${productId}-${variantId || "default"}`,
    cartItemId: item.cartItemId || item._id || "",
    lineTotal: Number(item.lineTotal ?? price * Number(item.quantity || 1)),
  };
}

export default function ProductDetails({ setCart, setWishlist }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [cartError, setCartError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [backendWishlist, setBackendWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistActionLoading, setWishlistActionLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      setLoading(true);
      setApiError("");
      setProduct(null);
      setSelectedImage(0);
      setSelectedVariantId("");
      setQuantity(1);
      setAdded(false);
      setCartError("");

      try {
        if (!id) throw new Error("No product ID was provided.");

        const response = await fetch(`${PRODUCTS_API}/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            data?.message ||
              (response.status === 404
                ? "This product was not found or is no longer available."
                : `Unable to load product (${response.status}).`)
          );
        }

        const rawProduct = data?.product || data?.data || data;
        if (!rawProduct || !(rawProduct._id || rawProduct.id)) {
          throw new Error("The server response did not contain a valid product.");
        }

        const normalized = normalizeProduct(rawProduct);
        setProduct(normalized);
        setSelectedVariantId(normalized.variants[0]?.id || "");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Product details fetch error:", error);
        setApiError(error.message || "Unable to load this product. Please try again.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchProduct();
    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    const session = getCustomerSession();
    if (!session?.token) {
      return;
    }

    const controller = new AbortController();

    const loadWishlist = async () => {
      setWishlistLoading(true);
      try {
        const response = await fetch(WISHLIST_API, {
          headers: { Authorization: `Bearer ${session.token}` },
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Unable to load wishlist.");
        }

        const items = Array.isArray(data.wishlist?.items) ? data.wishlist.items : [];
        setBackendWishlist(items);

        if (typeof setWishlist === "function") {
          setWishlist(items.map((item) => ({
            ...(item.product || {}),
            id: String(item.productId || item.product?._id || ""),
            itemId: String(item.itemId || ""),
            variantId: item.variantId ? String(item.variantId) : null,
            variantLabel: item.variant?.label || "",
          })));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Product wishlist loading error:", error);
        }
      } finally {
        if (!controller.signal.aborted) setWishlistLoading(false);
      }
    };

    loadWishlist();
    return () => controller.abort();
  }, [setWishlist]);

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find((variant) => variant.id === selectedVariantId) ||
      product?.variants?.[0] ||
      null,
    [product, selectedVariantId]
  );

  const currentPrice = selectedVariant?.price ?? 0;
  const currentMrp = selectedVariant?.mrp ?? currentPrice;
  const discount = currentMrp > 0
    ? Math.max(0, Math.round(((currentMrp - currentPrice) / currentMrp) * 100))
    : 0;
  const availableStock = selectedVariant?.stockQuantity ?? 0;
  const isOutOfStock = availableStock <= 0;

  const selectedWishlistVariantId =
    selectedVariant?.id && selectedVariant.id !== "default"
      ? String(selectedVariant.id)
      : null;

  const existingWishlistItem = backendWishlist.find(
    (item) =>
      String(item.productId) === String(product?.id) &&
      String(item.variantId || "") === String(selectedWishlistVariantId || "")
  );
  const isWishlisted = Boolean(existingWishlistItem);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || isOutOfStock || addingToCart) return;

    setCartError("");
    setAdded(false);
    const customerSession = getCustomerSession();

    if (!customerSession?.token) {
      navigate("/login", { state: { from: `/product/${product.id}` } });
      return;
    }

    if (typeof setCart !== "function") {
      setCartError("Cart is currently unavailable. Please try again.");
      console.error("ProductDetails requires a setCart function.");
      return;
    }

    if (
      selectedVariant.id === "default" &&
      product.variants.some((variant) => variant.id !== "default")
    ) {
      setCartError("Please select a valid product size.");
      return;
    }

    try {
      setAddingToCart(true);
      const payload = { productId: product.id, quantity };
      if (selectedVariant.id !== "default") payload.variantId = selectedVariant.id;

      const response = await fetch(`${CART_API}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customerSession.token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        setCartError("Your login session may have expired. Please log in again.");
        return;
      }
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to add this product to your cart.");
      }

      if (data.cart && Array.isArray(data.cart.items)) {
        setCart(data.cart.items.map(normalizeCartItem));
      } else {
        const cartResponse = await fetch(CART_API, {
          headers: { Authorization: `Bearer ${customerSession.token}` },
        });
        const cartData = await cartResponse.json().catch(() => ({}));
        if (!cartResponse.ok || !cartData.success) {
          throw new Error(
            cartData.message || "Product was added, but the cart could not be refreshed."
          );
        }
        setCart((cartData.cart?.items || []).map(normalizeCartItem));
      }
      setAdded(true);
    } catch (error) {
      console.error("Add to cart error:", error);
      setCartError(error.message || "Unable to add this product to your cart.");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!product || wishlistActionLoading) return;
    const customerSession = getCustomerSession();

    if (!customerSession?.token) {
      navigate("/login", { state: { from: `/product/${product.id}` } });
      return;
    }

    if (
      selectedVariant?.id === "default" &&
      product.variants.some((variant) => variant.id !== "default")
    ) {
      setCartError("Please select a valid product size.");
      return;
    }

    setWishlistActionLoading(true);
    setCartError("");

    try {
      const variantId = selectedVariant?.id && selectedVariant.id !== "default"
        ? String(selectedVariant.id)
        : null;

      const existing = backendWishlist.find(
        (item) =>
          String(item.productId) === String(product.id) &&
          String(item.variantId || "") === String(variantId || "")
      );

      const response = await fetch(
        existing
          ? `${WISHLIST_API}/${encodeURIComponent(existing.itemId)}`
          : WISHLIST_API,
        {
          method: existing ? "DELETE" : "POST",
          headers: {
            Authorization: `Bearer ${customerSession.token}`,
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

      const items = Array.isArray(data.wishlist?.items) ? data.wishlist.items : [];
      setBackendWishlist(items);

      if (typeof setWishlist === "function") {
        setWishlist(items.map((item) => ({
          ...(item.product || {}),
          id: String(item.productId || item.product?._id || ""),
          itemId: String(item.itemId || ""),
          variantId: item.variantId ? String(item.variantId) : null,
          variantLabel: item.variant?.label || "",
        })));
      }
    } catch (error) {
      console.error("Wishlist update error:", error);
      setCartError(error.message || "Unable to update wishlist.");
    } finally {
      setWishlistActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <h1>Loading product...</h1>
          <p>Please wait while we load the latest product details.</p>
        </div>
      </main>
    );
  }

  if (apiError || !product) {
    return (
      <main className="product-details-page">
        <div className="product-not-found">
          <h1>{apiError ? "Unable to Load Product" : "Product Not Found"}</h1>
          {apiError && <p>{apiError}</p>}
          <Link to="/shop">Back to Shop</Link>
        </div>
      </main>
    );
  }

  const images = product.images.length > 0 ? product.images : [""];
  const safeSelectedImage = Math.min(selectedImage, images.length - 1);

  return (
    <main className="product-details-page">
      <div className="product-details-container">
        <Link to="/shop" className="back-to-shop">← Back to Shop</Link>

        <div className="product-details-card">
          {/* Product Gallery */}
          <div className="product-gallery">
            <div className="product-main-image">
              {images[safeSelectedImage] ? (
                <img
                  src={images[safeSelectedImage]}
                  alt={`${product.name} view ${safeSelectedImage + 1}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "https://placehold.co/600x600?text=Product";
                  }}
                />
              ) : (
                <div className="product-image-placeholder">No image available</div>
              )}
            </div>

            {product.images.length > 1 && (
              <div className="product-thumbnails">
                {product.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={`product-thumbnail ${safeSelectedImage === index ? "active" : ""}`}
                    onClick={() => setSelectedImage(index)}
                    aria-label={`View ${product.name} image ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "https://placehold.co/120x120?text=Product";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="product-details-info">
            <span className="product-category">{product.category || "Groceries"}</span>
            <h1>{product.name}</h1>
            <p className="product-description">{product.description}</p>

            {product.variants.length > 1 && (
              <div className="quantity-section product-variant-section">
                <label htmlFor="product-variant">Choose size</label>
                <select
                  id="product-variant"
                  value={selectedVariant?.id || ""}
                  onChange={(event) => {
                    setSelectedVariantId(event.target.value);
                    setQuantity(1);
                    setAdded(false);
                    setCartError("");
                  }}
                >
                  {product.variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>
                      {variant.label}{variant.stockQuantity <= 0 ? " (Out of Stock)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="details-price">
              <span className="details-selling-price">₹{currentPrice}</span>
              {currentMrp > currentPrice && <span className="details-mrp">₹{currentMrp}</span>}
              {discount > 0 && <span className="details-discount">{discount}% OFF</span>}
            </div>

            <p className="product-tax">
              Inclusive of applicable taxes
              {product.gstPercentage > 0 ? ` (GST ${product.gstPercentage}%)` : ""}
            </p>

            <p className="product-stock-status">
              {isOutOfStock
                ? "Out of Stock"
                : availableStock <= 5
                  ? `Only ${availableStock} left in stock`
                  : "In Stock"}
            </p>

            <div className="quantity-section">
              <span>Quantity</span>
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  disabled={quantity <= 1}
                  aria-label="Decrease quantity"
                >−</button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(availableStock, current + 1))}
                  disabled={isOutOfStock || quantity >= availableStock}
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            {cartError && (
              <p role="alert" aria-live="polite" style={{ color: "#dc2626", fontSize: "14px" }}>
                {cartError}
              </p>
            )}

            {/* Product Actions */}
            <div className="product-action-row">
              <button
                type="button"
                className="details-add-button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || addingToCart}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : addingToCart
                    ? "Adding..."
                    : added
                      ? "Added to Cart ✓"
                      : "Add to Cart"}
              </button>

              <button
                type="button"
                className={`details-wishlist-button ${isWishlisted ? "wishlisted" : ""}`}
                onClick={handleWishlist}
                disabled={wishlistLoading || wishlistActionLoading}
                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={21} fill={isWishlisted ? "currentColor" : "none"} />
                <span>
                  {wishlistActionLoading
                    ? "Updating..."
                    : isWishlisted
                      ? "Wishlisted"
                      : "Wishlist"}
                </span>
              </button>
            </div>

            {added && <Link to="/cart" className="view-cart-link">View Cart →</Link>}
          </div>
        </div>

        {/* Product Reviews */}
        <ProductReviewSection productId={product.id} />
      </div>
    </main>
  );
}
