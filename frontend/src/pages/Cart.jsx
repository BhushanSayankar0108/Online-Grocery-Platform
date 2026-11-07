import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "https://placehold.co/240x240?text=Product";
  }
  if (/^(https?:\/\/|data:|blob:)/i.test(image)) return image;
  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
};

const getProductId = (product) =>
  String(product?.productId || product?.product?._id || product?.product?.id || product?.id || product?._id || "");

const getCartKey = (product, index) =>
  product?.cartKey ||
  `${getProductId(product)}-${product?.variantId || "default"}-${index}`;

function getCustomerToken() {
  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem("customerSession");
      if (!raw) continue;
      const session = JSON.parse(raw);
      const token = session?.token || session?.accessToken || session?.jwt;
      if (token) return token;
    } catch (error) {
      console.error("Unable to read customer session:", error);
    }
  }
  return "";
}

function normalizeServerCartItem(item) {
  const product = item?.product || {};
  const variant = item?.variant || null;
  const productId = String(product?._id || product?.id || item?.productId || "");
  const variantId = item?.variantId || variant?._id || variant?.id || null;
  const price = Number(
    item?.unitPrice ?? variant?.sellingPrice ?? variant?.price ?? product?.sellingPrice ?? product?.price ?? 0
  );
  const quantity = Math.max(1, Number(item?.quantity) || 1);
  const variantLabel =
    variant?.label ||
    [variant?.quantityValue, variant?.quantityUnit].filter(Boolean).join(" ") ||
    product?.quantity || product?.unit || "";

  return {
    ...product,
    id: productId,
    _id: productId,
    productId,
    cartItemId: String(item?.cartItemId || item?._id || ""),
    variantId: variantId ? String(variantId) : null,
    variantLabel,
    variantStockQuantity: variant?.stockQuantity,
    price,
    sellingPrice: price,
    mrp: Number(variant?.mrp ?? product?.mrp ?? price),
    quantity,
    image: product?.image || product?.images?.[0] || "",
    images: product?.images || [],
    stockQuantity: product?.stockQuantity,
    cartKey: `${productId}-${variantId || variantLabel || "default"}`,
  };
}

function Cart({ cart = [], setCart }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [cartError, setCartError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [token, setToken] = useState(() => getCustomerToken());
  const safeCart = useMemo(
    () => (Array.isArray(cart) ? cart : []),
    [cart]
  );

  // Re-read the session when the Cart page mounts or the window regains focus.
  useEffect(() => {
    const refreshToken = () => setToken(getCustomerToken());
    refreshToken();
    window.addEventListener("focus", refreshToken);
    return () => window.removeEventListener("focus", refreshToken);
  }, []);

  const applyServerCart = useCallback(
    (payload) => {
      const serverItems = Array.isArray(payload?.cart?.items)
        ? payload.cart.items
        : Array.isArray(payload?.items)
          ? payload.items
          : null;
      if (!serverItems || typeof setCart !== "function") return false;
      setCart(serverItems.map(normalizeServerCartItem));
      return true;
    },
    [setCart]
  );

  useEffect(() => {
    if (!token || typeof setCart !== "function") return undefined;
    const controller = new AbortController();
    const loadCart = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || "Unable to load your cart.");
        }
        if (!applyServerCart(result)) {
          throw new Error("The server response did not contain cart items.");
        }
        setCartError("");
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Load cart error:", error);
          setCartError(error.message || "Unable to load your cart.");
        }
      }
    };
    loadCart();
    return () => controller.abort();
  }, [token, applyServerCart, setCart, refreshKey]);

  const updateServerCartItem = async (item, quantity) => {
    if (!token || !item?.cartItemId) return false;
    setIsUpdating(true);
    setCartError("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${encodeURIComponent(item.cartItemId)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        }
      );
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || result?.error || "Unable to update cart quantity.");
      }
      if (!applyServerCart(result)) {
        setRefreshKey((key) => key + 1);
      }
      return true;
    } catch (error) {
      console.error("Update cart item error:", error);
      setCartError(error.message || "Unable to update your cart.");
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const increaseQuantity = async (index) => {
    const item = safeCart[index];
    if (!item || typeof setCart !== "function" || isUpdating) return;
    const stockValue = item.variantStockQuantity ?? item.stockQuantity ?? item.stock;
    const hasStockLimit = stockValue !== undefined && stockValue !== null && Number.isFinite(Number(stockValue));
    const stockLimit = hasStockLimit ? Math.max(0, Number(stockValue)) : Infinity;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (quantity >= stockLimit) {
      setCartError("Available stock limit reached.");
      return;
    }
    if (token && item.cartItemId) {
      await updateServerCartItem(item, Math.min(quantity + 1, stockLimit));
      return;
    }
    setCartError("");
    setCart((current) =>
      (Array.isArray(current) ? current : []).map((entry, i) =>
        i === index ? { ...entry, quantity: Math.min(quantity + 1, stockLimit) } : entry
      )
    );
  };

  const decreaseQuantity = async (index) => {
    const item = safeCart[index];
    if (!item || typeof setCart !== "function" || isUpdating) return;
    const quantity = Math.max(1, Number(item.quantity) || 1);
    if (quantity <= 1) return;
    if (token && item.cartItemId) {
      await updateServerCartItem(item, quantity - 1);
      return;
    }
    setCartError("");
    setCart((current) =>
      (Array.isArray(current) ? current : []).map((entry, i) =>
        i === index ? { ...entry, quantity: quantity - 1 } : entry
      )
    );
  };

  const removeFromCart = async (index) => {
    const item = safeCart[index];
    if (!item || typeof setCart !== "function" || isUpdating) return;
    if (token && item.cartItemId) {
      setIsUpdating(true);
      setCartError("");
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cart/items/${encodeURIComponent(item.cartItemId)}`,
          { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.success === false) {
          throw new Error(result?.message || result?.error || "Unable to remove item.");
        }
        if (!applyServerCart(result)) setRefreshKey((key) => key + 1);
      } catch (error) {
        console.error("Remove cart item error:", error);
        setCartError(error.message || "Unable to remove item from cart.");
      } finally {
        setIsUpdating(false);
      }
      return;
    }
    setCartError("");
    setCart((current) => (Array.isArray(current) ? current : []).filter((_, i) => i !== index));
  };

  const cartSubtotal = useMemo(
    () =>
      safeCart.reduce((total, item) => {
        const price = Number(item.price ?? item.sellingPrice ?? 0);
        const quantity = Math.max(0, Number(item.quantity) || 0);
        return total + price * quantity;
      }, 0),
    [safeCart]
  );

  const deliveryCharge = cartSubtotal === 0 || cartSubtotal >= 500 ? 0 : 40;
  const cartTotal = cartSubtotal + deliveryCharge;
  const freeDeliveryRemaining = Math.max(500 - cartSubtotal, 0);
  const formatPrice = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <main className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <Link to="/shop" className="shop-home-link">← Continue Shopping</Link>
          <p className="cart-breadcrumb">Home / Cart</p>
          <span className="cart-eyebrow">YOUR SHOPPING CART</span>
          <h1>Review your cart.</h1>
          <p className="cart-intro">Check your items, update quantities and continue to checkout when you're ready.</p>
        </header>

        {safeCart.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon"><ShoppingCart size={34} strokeWidth={1.6} /></div>
            <span className="cart-empty-eyebrow">YOUR CART IS EMPTY</span>
            <h2>Nothing here yet.</h2>
            <p>Browse our fresh groceries and everyday essentials and add something to your cart.</p>
            <Link to="/shop" className="cart-shop-button"><ShoppingBag size={17} />Browse Products<ArrowRight size={17} /></Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-heading">
                <div><span>YOUR ITEMS</span><h2>{safeCart.length} {safeCart.length === 1 ? "product" : "products"}</h2></div>
              </div>

              {cartSubtotal < 500 && (
                <div className="cart-delivery-note">
                  <Truck size={18} />
                  <div><strong>Add ₹{formatPrice(freeDeliveryRemaining)} more for free delivery</strong><span>Free delivery on orders above ₹500.</span></div>
                </div>
              )}
              {cartSubtotal >= 500 && (
                <div className="cart-delivery-note cart-delivery-free">
                  <Truck size={18} />
                  <div><strong>You've unlocked free delivery.</strong><span>Your order qualifies for free delivery.</span></div>
                </div>
              )}
              {cartError && <p role="alert" className="cart-stock-note">{cartError}</p>}

              <div className="cart-items">
                {safeCart.map((product, index) => {
                  const productId = getProductId(product);
                  const price = Number(product.price ?? product.sellingPrice ?? 0);
                  const mrp = Number(product.mrp ?? price);
                  const quantity = Math.max(1, Number(product.quantity) || 1);
                  const stockValue = product.variantStockQuantity ?? product.stockQuantity ?? product.stock;
                  const hasStockLimit = stockValue !== undefined && stockValue !== null && Number.isFinite(Number(stockValue));
                  const stockLimit = hasStockLimit ? Math.max(0, Number(stockValue)) : Infinity;
                  const image = getImageUrl(product.image || (Array.isArray(product.images) ? product.images[0] : ""));

                  return (
                    <article className="cart-item" key={getCartKey(product, index)}>
                      <Link to={productId ? `/product/${productId}` : "/shop"} className="cart-item-image">
                        <img src={image} alt={product.name || "Product"} onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = "https://placehold.co/240x240?text=Product";
                        }} />
                      </Link>
                      <div className="cart-item-info">
                        <Link to={productId ? `/product/${productId}` : "/shop"} className="cart-product-name"><h3>{product.name || "Product"}</h3></Link>
                        {product.variantLabel && <span className="cart-product-quantity">{product.variantLabel}</span>}
                        <div className="cart-item-price"><strong>₹{formatPrice(price)}</strong>{mrp > price && <span>₹{formatPrice(mrp)}</span>}</div>
                        <div className="cart-item-bottom">
                          <div className="cart-quantity">
                            <button type="button" onClick={() => decreaseQuantity(index)} disabled={quantity <= 1 || isUpdating} aria-label={`Decrease ${product.name || "product"} quantity`}><Minus size={15} /></button>
                            <span>{quantity}</span>
                            <button type="button" onClick={() => increaseQuantity(index)} disabled={quantity >= stockLimit || isUpdating} aria-label={`Increase ${product.name || "product"} quantity`} title={quantity >= stockLimit ? "Available stock limit reached" : "Increase quantity"}><Plus size={15} /></button>
                          </div>
                          <strong className="cart-item-total">₹{formatPrice(price * quantity)}</strong>
                        </div>
                        {hasStockLimit && quantity >= stockLimit && <span className="cart-stock-note">Maximum available quantity reached</span>}
                        <button type="button" className="remove-cart-item" onClick={() => removeFromCart(index)} disabled={isUpdating}><Trash2 size={15} />Remove</button>
                      </div>
                    </article>
                  );
                })}
              </div>
              <Link to="/shop" className="cart-continue-link"><ArrowRight size={16} />Continue shopping</Link>
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-header"><span>ORDER SUMMARY</span><h2>Cart Summary</h2></div>
              <div className="cart-summary-lines">
                <div><span>Subtotal</span><strong>₹{formatPrice(cartSubtotal)}</strong></div>
                <div><span>Delivery</span><strong>{deliveryCharge === 0 ? "FREE" : `₹${formatPrice(deliveryCharge)}`}</strong></div>
              </div>
              <div className="cart-total"><span>Total</span><strong>₹{formatPrice(cartTotal)}</strong></div>
              <Link to="/checkout" className="checkout-button">Proceed to Checkout<ArrowRight size={17} /></Link>
              <div className="cart-trust">
                <div><ShieldCheck size={17} /><span>Secure checkout</span></div>
                <div><Truck size={17} /><span>Reliable delivery</span></div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;
