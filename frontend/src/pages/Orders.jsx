import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "Not available";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Not available";
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDisplayStatus = (status) => {
  const statuses = {
    placed: "Order Placed",
    confirmed: "Confirmed",
    processing: "Picking / Processing",
    packed: "Packed",
    shipped: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  const normalized = String(status || "placed").toLowerCase();
  return (
    statuses[normalized] ||
    normalized.charAt(0).toUpperCase() + normalized.slice(1)
  );
};

const getStatusClass = (status) =>
  `order-status ${String(status || "placed").toLowerCase().replace(/\s+/g, "-")}`;

function getCustomerToken() {
  if (typeof window === "undefined") return "";

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const rawSession = storage.getItem("customerSession");
      if (rawSession) {
        try {
          const session = JSON.parse(rawSession);
          const token =
            session?.token ||
            session?.accessToken ||
            session?.customerToken ||
            session?.jwt;
          if (token) return token;
        } catch {
          // Continue to standalone token keys.
        }
      }

      const token =
        storage.getItem("customerToken") ||
        storage.getItem("accessToken") ||
        storage.getItem("token") ||
        storage.getItem("jwt");
      if (token) return token;
    } catch {
      // Browser storage may be unavailable.
    }
  }
  return "";
}

function getOrderProductId(item) {
  const product = item?.product;
  if (product && typeof product === "object") {
    return String(product._id || product.id || item?.productId || "");
  }
  return String(product || item?.productId || "");
}

function getOrderVariantId(item) {
  const variant = item?.variant;
  if (variant && typeof variant === "object") {
    return String(item?.variantId || variant._id || variant.id || "");
  }
  return String(item?.variantId || variant || "");
}

function getProductList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload?.data?.products)) return payload.data.products;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeCatalogProduct(product) {
  const id = String(product?._id || product?.id || "");
  const price = Number(product?.sellingPrice ?? product?.price ?? 0);

  const variants = Array.isArray(product?.variants)
    ? product.variants
        .filter(
          (variant) =>
            String(variant?.status || "active").toLowerCase() === "active"
        )
        .map((variant, index) => ({
          id: String(variant?._id || variant?.id || index),
          label:
            variant?.label ||
            [variant?.quantityValue, variant?.quantityUnit]
              .filter(Boolean)
              .join(" ") ||
            product?.quantity ||
            product?.unit ||
            "1 item",
          price: Number(variant?.sellingPrice ?? variant?.price ?? price),
          mrp: Number(variant?.mrp ?? product?.mrp ?? price),
          stockQuantity: Number(variant?.stockQuantity ?? 0),
        }))
    : [];

  if (variants.length === 0) {
    variants.push({
      id: "default",
      label:
        product?.quantity ||
        [product?.quantityValue, product?.quantityUnit]
          .filter(Boolean)
          .join(" ") ||
        product?.unit ||
        "1 item",
      price,
      mrp: Number(product?.mrp ?? price),
      stockQuantity: Number(product?.stockQuantity ?? product?.stock ?? 0),
    });
  }

  return {
    ...product,
    id,
    _id: id,
    name: product?.name || product?.productName || "Product",
    price,
    sellingPrice: price,
    mrp: Number(product?.mrp ?? price),
    image: product?.image || product?.images?.[0] || product?.thumbnail || "",
    images: Array.isArray(product?.images) ? product.images : [],
    variants,
    stockQuantity: Number(product?.stockQuantity ?? product?.stock ?? 0),
  };
}

function mapBackendCart(backendCart) {
  const items = Array.isArray(backendCart?.items) ? backendCart.items : [];

  return items.map((item) => {
    const product = item?.product || {};
    const variant = item?.variant || null;
    const productId = String(
      product?._id || product?.id || item?.productId || ""
    );
    const variantId = item?.variantId || variant?._id || variant?.id || null;
    const price = Number(
      item?.unitPrice ??
        variant?.sellingPrice ??
        variant?.price ??
        product?.sellingPrice ??
        product?.price ??
        0
    );
    const variantLabel =
      variant?.label ||
      [variant?.quantityValue, variant?.quantityUnit]
        .filter(Boolean)
        .join(" ") ||
      product?.quantity ||
      product?.unit ||
      "";

    return {
      ...product,
      id: productId,
      _id: productId,
      productId,
      name: product?.name || product?.productName || "Product",
      cartItemId: String(item?.cartItemId || item?._id || ""),
      variantId: variantId ? String(variantId) : null,
      variantLabel,
      variantStockQuantity: variant?.stockQuantity,
      price,
      sellingPrice: price,
      mrp: Number(variant?.mrp ?? product?.mrp ?? price),
      quantity: Math.max(1, Number(item?.quantity) || 1),
      image: product?.image || product?.images?.[0] || "",
      images: Array.isArray(product?.images) ? product.images : [],
      stockQuantity: product?.stockQuantity,
      cartKey: `${productId}-${variantId || variantLabel || "default"}`,
    };
  });
}

function Orders({ setCart }) {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [reorderingId, setReorderingId] = useState("");

  const fetchOrders = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const token = getCustomerToken();
      if (!token) throw new Error("Please log in to view your orders.");

      const response = await fetch(`${API_ROOT}/orders/customer`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to retrieve your orders.");
      }

      setOrders(Array.isArray(data.orders) ? data.orders : []);
      setError("");
    } catch (err) {
      if (!silent) setError(err.message || "Something went wrong.");
    } finally {
      if (!silent) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    // Defer the initial request so React's effect lint rule does not flag
    // a synchronous state update initiated directly from the effect body.
    const initialRequestId = window.setTimeout(() => {
      if (isActive) fetchOrders();
    }, 0);

    const refreshId = window.setInterval(() => {
      if (isActive) fetchOrders(true);
    }, 15000);

    const onFocus = () => {
      if (isActive) fetchOrders(true);
    };

    window.addEventListener("focus", onFocus);

    return () => {
      isActive = false;
      window.clearTimeout(initialRequestId);
      window.clearInterval(refreshId);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchOrders]);

  const loadCurrentProducts = async () => {
    const response = await fetch(
      `${API_ROOT}/products?page=1&limit=100&sort=newest`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );
    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.success === false) {
      throw new Error(
        payload?.message || "Unable to load the current shop catalogue."
      );
    }

    return getProductList(payload)
      .filter(
        (product) =>
          String(product?.status || "active").toLowerCase() === "active"
      )
      .map(normalizeCatalogProduct);
  };

  const handleReorder = async (order) => {
    setError("");
    const orderKey = String(
      order?._id || order?.orderNumber || order?.id || ""
    );
    setReorderingId(orderKey);

    try {
      if (typeof setCart !== "function") {
        throw new Error("Cart is unavailable. Please refresh the page.");
      }

      const orderItems = Array.isArray(order?.items) ? order.items : [];
      if (orderItems.length === 0) {
        throw new Error("This order has no items to reorder.");
      }

      const catalog = await loadCurrentProducts();
      const token = getCustomerToken();
      const unmatched = [];
      const outOfStock = [];
      const failedItems = [];
      const matched = [];

      for (const orderItem of orderItems) {
        const orderProductId = getOrderProductId(orderItem);
        const orderName = String(
          orderItem?.productName ||
            orderItem?.name ||
            orderItem?.product?.name ||
            ""
        )
          .trim()
          .toLowerCase();

        const product =
          catalog.find(
            (candidate) =>
              orderProductId && candidate.id === orderProductId
          ) ||
          (!orderProductId && orderName
            ? catalog.find(
                (candidate) =>
                  candidate.name.trim().toLowerCase() === orderName
              )
            : null);

        if (!product) {
          unmatched.push(
            orderItem?.productName ||
              orderItem?.name ||
              "An unavailable product"
          );
          continue;
        }

        const requestedVariantId = getOrderVariantId(orderItem);
        const variant =
          product.variants.find(
            (candidate) =>
              requestedVariantId && candidate.id === requestedVariantId
          ) || product.variants[0];

        const quantity = Math.max(1, Number(orderItem?.quantity) || 1);
        const stock = Number(
          variant?.stockQuantity ?? product.stockQuantity ?? 0
        );

        if (!variant || stock <= 0) {
          outOfStock.push(product.name);
          continue;
        }

        matched.push({
          product,
          variant,
          quantity: Math.min(quantity, stock),
        });
      }

      if (matched.length === 0) {
        const details = [
          unmatched.length ? `Not found: ${unmatched.join(", ")}.` : "",
          outOfStock.length ? `Out of stock: ${outOfStock.join(", ")}.` : "",
        ]
          .filter(Boolean)
          .join(" ");
        throw new Error(
          details || "No items from this order are currently available."
        );
      }

      if (token) {
        let latestCart = null;

        for (const entry of matched) {
          try {
            const realVariantId =
              entry.variant.id && entry.variant.id !== "default"
                ? entry.variant.id
                : null;

            const response = await fetch(`${API_ROOT}/cart/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
              body: JSON.stringify({
                productId: entry.product.id,
                quantity: entry.quantity,
                ...(realVariantId ? { variantId: realVariantId } : {}),
              }),
            });
            const result = await response.json().catch(() => ({}));

            if (
              !response.ok ||
              result?.success === false ||
              !result?.cart
            ) {
              throw new Error(
                result?.message || result?.error || "Could not add item."
              );
            }

            latestCart = result.cart;
          } catch {
            failedItems.push(entry.product.name);
          }
        }

        if (latestCart) {
          setCart(mapBackendCart(latestCart));
        }

        if (!latestCart) {
          throw new Error(
            `Unable to add products to your server cart${
              failedItems.length ? `: ${failedItems.join(", ")}` : ""
            }.`
          );
        }
      } else {
        setCart((currentCart) => {
          let updatedCart = Array.isArray(currentCart)
            ? [...currentCart]
            : [];

          matched.forEach(({ product, variant, quantity }) => {
            const cartKey = `${product.id}-${variant.id || product.quantity || "default"}`;
            const existingIndex = updatedCart.findIndex(
              (item) =>
                item.cartKey === cartKey ||
                (String(item.productId || item._id || item.id || "") ===
                  product.id &&
                  String(item.variantId || "default") ===
                    String(variant.id || "default"))
            );

            const addition = {
              ...product,
              productId: product.id,
              id: product.id,
              _id: product.id,
              quantity: Math.min(
                quantity,
                Number(variant.stockQuantity) || quantity
              ),
              variantId: variant.id === "default" ? null : variant.id,
              variantLabel: variant.label,
              variantStockQuantity: variant.stockQuantity,
              price: variant.price,
              sellingPrice: variant.price,
              mrp: variant.mrp,
              cartKey,
            };

            if (existingIndex >= 0) {
              const existing = updatedCart[existingIndex];
              const stock = Number(variant.stockQuantity) || quantity;
              updatedCart[existingIndex] = {
                ...existing,
                ...addition,
                quantity: Math.min(
                  (Number(existing.quantity) || 0) + quantity,
                  stock
                ),
              };
            } else {
              updatedCart.push(addition);
            }
          });

          return updatedCart;
        });
      }

      const notes = [];
      if (unmatched.length) {
        notes.push(`Unavailable products skipped: ${unmatched.join(", ")}.`);
      }
      if (outOfStock.length) {
        notes.push(`Out-of-stock products skipped: ${outOfStock.join(", ")}.`);
      }
      if (failedItems.length) {
        notes.push(`Could not add: ${failedItems.join(", ")}.`);
      }
      if (notes.length) setError(notes.join(" "));

      navigate("/cart");
    } catch (err) {
      setError(err.message || "Unable to reorder this order.");
    } finally {
      setReorderingId("");
    }
  };

  if (loading) {
    return (
      <main className="orders-page">
        <div className="orders-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>
          <p>Home / My Orders</p>
          <h1>My Orders</h1>
        </div>
        <div className="orders-content">
          <p className="py-10 text-center text-gray-600" role="status">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="orders-page">
      <div className="orders-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>
        <p>Home / My Orders</p>
        <h1>My Orders</h1>
        <p>View and manage your grocery orders.</p>
        <button
          type="button"
          onClick={() => fetchOrders()}
          disabled={refreshing}
          className="mt-3 rounded-lg border border-current px-4 py-2 text-sm disabled:opacity-60"
        >
          {refreshing ? "Refreshing..." : "Refresh Orders"}
        </button>
      </div>

      <div className="orders-content">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => fetchOrders()}
              className="mt-3 rounded-md border border-red-300 px-4 py-2 hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {!error && orders.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <h2>No Orders Yet</h2>
            <p>Your orders will appear here after you place an order.</p>
            <Link to="/shop" className="orders-shop-button">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items) ? order.items : [];
              const totalQuantity = items.reduce(
                (total, item) => total + (Number(item.quantity) || 0),
                0
              );
              const identifier =
                order.orderNumber || order._id || order.id;
              const status = String(order.status || "placed").toLowerCase();
              const trackingId =
                order._id || order.id || order.orderNumber;

              return (
                <article
                  className="order-card"
                  key={order._id || order.orderNumber || order.id}
                >
                  <div className="order-card-header">
                    <div>
                      <span>Order ID</span>
                      <h2>#{identifier}</h2>
                    </div>
                    <div className={getStatusClass(order.status)}>
                      {getDisplayStatus(order.status)}
                    </div>
                  </div>

                  <div className="order-info">
                    <div>
                      <span>Order Date</span>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>
                    <div>
                      <span>Total Amount</span>
                      <strong>
                        {formatCurrency(
                          order.totalAmount ??
                            order.total ??
                            order.grandTotal
                        )}
                      </strong>
                    </div>
                    <div>
                      <span>Items</span>
                      <strong>
                        {totalQuantity} {totalQuantity === 1 ? "item" : "items"}
                      </strong>
                    </div>
                  </div>

                  <div className="order-items">
                    <h3>Order Items</h3>
                    {items.map((item, index) => (
                      <div
                        className="order-item"
                        key={
                          item._id ||
                          item.product?._id ||
                          item.product ||
                          index
                        }
                      >
                        <span>
                          {item.productName ||
                            item.name ||
                            item.product?.name ||
                            "Product"}
                        </span>
                        <span>Qty: {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-actions">
                    {trackingId && (
                      <Link
                        to={`/order-tracking/${encodeURIComponent(trackingId)}`}
                        className="order-track-button"
                      >
                        Track Order
                      </Link>
                    )}
                    {status !== "cancelled" && (
                      <button
                        type="button"
                        className="order-reorder-button"
                        onClick={() => handleReorder(order)}
                        disabled={
                          reorderingId ===
                          String(order._id || order.orderNumber || order.id || "")
                        }
                      >
                        {reorderingId ===
                        String(order._id || order.orderNumber || order.id || "")
                          ? "Adding..."
                          : "Reorder"}
                      </button>
                    )}
                    {status === "delivered" && (
                      <Link to="/returns" className="order-return-button">
                        Return / Refund
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default Orders;
