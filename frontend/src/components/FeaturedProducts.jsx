
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { Link } from "react-router-dom";
import productsData from "../data/products";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const FEATURED_PRODUCT_LIMIT = 4;

// --------------------------------------------------
// HELPER: EXTRACT PRODUCTS FROM API RESPONSE
// --------------------------------------------------

function getProductList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.products)) {
    return result.data.products;
  }
  if (Array.isArray(result?.products)) return result.products;
  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  return [];
}

// --------------------------------------------------
// HELPER: GET NUMERIC PRICE
// --------------------------------------------------

function getNumericValue(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") {
      continue;
    }

    const number =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/[₹,\s]/g, ""));

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return null;
}

// --------------------------------------------------
// HELPER: BUILD QUANTITY LABEL
// --------------------------------------------------

function getQuantityLabel(item) {
  if (item?.label) return item.label;

  if (item?.quantity) return item.quantity;

  const value = item?.quantityValue;
  const unit = item?.quantityUnit || item?.unit;

  if (value !== null && value !== undefined && unit) {
    return `${value} ${unit}`;
  }

  return (
    item?.weight ||
    item?.size ||
    item?.name ||
    item?.unit ||
    ""
  );
}

// --------------------------------------------------
// HELPER: NORMALIZE PRODUCT AND VARIANTS
// --------------------------------------------------

function normalizeProduct(product) {
  const rawVariants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  const productPrice = getNumericValue(
    product?.sellingPrice,
    product?.selling_price,
    product?.price,
    product?.salePrice,
    product?.sale_price,
    product?.discountedPrice,
    product?.discounted_price,
    product?.finalPrice,
    product?.final_price,
    product?.unitPrice,
    product?.unit_price
  );

  const productMRP = getNumericValue(
    product?.mrp,
    product?.originalPrice,
    product?.original_price,
    product?.mrpPrice,
    product?.mrp_price,
    product?.maximumRetailPrice,
    product?.maximum_retail_price,
    product?.regularPrice,
    product?.regular_price,
    productPrice
  );

  const variants = rawVariants
    .map((variant, index) => {
      const price = getNumericValue(
        variant?.sellingPrice,
        variant?.selling_price,
        variant?.price,
        variant?.salePrice,
        variant?.sale_price,
        variant?.discountedPrice,
        variant?.discounted_price,
        variant?.finalPrice,
        variant?.final_price,
        variant?.unitPrice,
        variant?.unit_price,
        productPrice
      );

      const mrp = getNumericValue(
        variant?.mrp,
        variant?.originalPrice,
        variant?.original_price,
        variant?.mrpPrice,
        variant?.mrp_price,
        variant?.maximumRetailPrice,
        variant?.maximum_retail_price,
        variant?.regularPrice,
        variant?.regular_price,
        price,
        productMRP
      );

      return {
        ...variant,

        id:
          variant?.id ??
          variant?._id ??
          variant?.variantId ??
          variant?.variant_id ??
          `variant-${index}`,

        label: getQuantityLabel(variant) || getQuantityLabel(product),

        price,
        mrp,
      };
    })
    .filter(
      (variant) =>
        String(variant.status || "active").toLowerCase() === "active"
    );

  // Product image
  const firstImage = Array.isArray(product?.images)
    ? product.images[0]
    : null;

  const image =
    (typeof product?.image === "string" && product.image) ||
    (typeof product?.imageUrl === "string" && product.imageUrl) ||
    (typeof product?.image_url === "string" && product.image_url) ||
    (typeof product?.thumbnail === "string" && product.thumbnail) ||
    (typeof firstImage === "string" && firstImage) ||
    firstImage?.url ||
    firstImage?.imageUrl ||
    firstImage?.image ||
    "";

  return {
    ...product,

    id:
      product?.id ??
      product?._id ??
      product?.productId ??
      product?.product_id,

    name:
      product?.name ??
      product?.title ??
      product?.productName ??
      product?.product_name ??
      "Grocery Product",

    image,

    price: productPrice ?? variants[0]?.price ?? null,

    mrp:
      productMRP ??
      variants[0]?.mrp ??
      productPrice ??
      null,

    quantity: getQuantityLabel(product),

    variants,
  };
}

// --------------------------------------------------
// HELPER: LOCAL FALLBACK PRODUCTS
// Used only when the backend request fails.
// --------------------------------------------------

function getLocalProducts() {
  return getProductList(productsData)
    .filter(
      (product) => product && typeof product === "object"
    )
    .map(normalizeProduct)
    .filter(
      (product) =>
        product.id != null &&
        product.isFeatured === true &&
        String(product.status || "active").toLowerCase() === "active"
    )
    .slice(0, FEATURED_PRODUCT_LIMIT);
}

// --------------------------------------------------
// FEATURED PRODUCTS COMPONENT
// --------------------------------------------------

function FeaturedProducts({
  setCart,
  cart = [],
  wishlist = [],
  setWishlist,
}) {
  const [selectedVariants, setSelectedVariants] = useState({});

  // null = API request failed or not completed
  // [] = API successfully returned no products
  const [apiProducts, setApiProducts] = useState(null);

  const [sectionActive, setSectionActive] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);

  // --------------------------------------------------
  // LOAD PRODUCTS FROM BACKEND
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/products`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `Products API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load products."
          );
        }

        const list = getProductList(result)
          .filter(
            (product) =>
              product && typeof product === "object"
          )
          .filter((product) => {
            const status = String(
              product.status || "active"
            ).toLowerCase();

            return (
              status === "active" &&
              product.isActive !== false &&
              product.is_active !== false
            );
          })
          .map(normalizeProduct)
          .filter(
            (product) =>
              product.id != null &&
              product.isFeatured === true
          );

        if (!cancelled) {
          setApiProducts(list);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to load featured products:",
            error.message
          );

          if (!cancelled) {
            setApiProducts(null);
          }
        }
      } finally {
        if (!cancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // LOAD CMS SECTION STATUS
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadCMSSection = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cms/public`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `CMS API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load CMS sections."
          );
        }

        const sections = Array.isArray(
          result?.data?.sections
        )
          ? result.data.sections
          : [];

        const featuredSection = sections.find(
          (section) =>
            String(
              section?.name ?? section?.title ?? ""
            )
              .trim()
              .toLowerCase() === "featured products"
        );

        if (!cancelled) {
          // No configured sections: keep the default section visible.
          // Configured sections: show only if Featured Products is active.
          setSectionActive(
            sections.length === 0
              ? true
              : Boolean(featuredSection)
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to load CMS status:",
            error.message
          );
        }

        // Keep the homepage section visible if CMS request fails.
        if (!cancelled) {
          setSectionActive(true);
        }
      }
    };

    loadCMSSection();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // PRODUCT SOURCE
  // --------------------------------------------------

  const productsSource =
    apiProducts !== null
      ? apiProducts
      : getLocalProducts();

  const products = productsSource
    .filter(
      (product) =>
        product && product.id != null
    )
    .map(normalizeProduct);

  // --------------------------------------------------
  // VARIANT HELPERS
  // --------------------------------------------------

  const getVariant = (product, variantId) => {
    const variants = Array.isArray(product?.variants)
      ? product.variants
      : [];

    return (
      variants.find(
        (variant) =>
          String(variant.id) === String(variantId)
      ) ||
      variants[0] ||
      null
    );
  };

  const getSelectedVariant = (product) =>
    getVariant(
      product,
      selectedVariants[product.id] ??
        product.variants?.[0]?.id
    );

  const getCartKey = (product, variant) =>
    `${product.id}-${
      variant?.id ?? product.quantity ?? "default"
    }`;

  // --------------------------------------------------
  // CART HELPERS
  // --------------------------------------------------

  const createCartProduct = (product, variant) => ({
    ...product,

    quantity: 1,

    variantId: variant?.id ?? null,

    variantLabel:
      variant?.label || product.quantity || "",

    price: variant?.price ?? product.price,

    mrp:
      variant?.mrp ??
      product.mrp ??
      variant?.price ??
      product.price,

    cartKey: getCartKey(product, variant),
  });

  const addToCart = (product, variant) => {
    if (typeof setCart !== "function") return;

    const cartProduct = createCartProduct(
      product,
      variant
    );

    setCart((currentCart) => {
      const safeCart = Array.isArray(currentCart)
        ? currentCart
        : [];

      const existing = safeCart.find(
        (item) =>
          item.cartKey === cartProduct.cartKey ||
          (
            !item.cartKey &&
            String(item.id ?? item._id) ===
              String(product.id) &&
            String(item.variantId ?? "") ===
              String(cartProduct.variantId ?? "")
          )
      );

      if (existing) {
        return safeCart.map((item) =>
          item === existing
            ? {
                ...item,
                quantity:
                  (Number(item.quantity) || 1) + 1,
              }
            : item
        );
      }

      return [...safeCart, cartProduct];
    });
  };

  const decreaseQuantity = (product, variant) => {
    if (typeof setCart !== "function") return;

    const key = getCartKey(product, variant);

    setCart((currentCart) =>
      (Array.isArray(currentCart) ? currentCart : [])
        .map((item) => {
          const matches =
            item.cartKey === key ||
            (
              !item.cartKey &&
              String(item.id ?? item._id) ===
                String(product.id) &&
              String(item.variantId ?? "") ===
                String(variant?.id ?? "")
            );

          if (!matches) return item;

          return {
            ...item,
            quantity:
              (Number(item.quantity) || 1) - 1,
          };
        })
        .filter(
          (item) => Number(item.quantity) > 0
        )
    );
  };

  const getCartQuantity = (product, variant) => {
    const key = getCartKey(product, variant);

    const safeCart = Array.isArray(cart)
      ? cart
      : [];

    const item = safeCart.find(
      (cartItem) =>
        cartItem.cartKey === key ||
        (
          !cartItem.cartKey &&
          String(cartItem.id ?? cartItem._id) ===
            String(product.id) &&
          String(cartItem.variantId ?? "") ===
            String(variant?.id ?? "")
        )
    );

    return Number(item?.quantity) || 0;
  };

  // --------------------------------------------------
  // WISHLIST HELPERS
  // --------------------------------------------------

  const toggleWishlist = (product) => {
    if (typeof setWishlist !== "function") return;

    setWishlist((currentWishlist) => {
      const safeWishlist = Array.isArray(currentWishlist)
        ? currentWishlist
        : [];

      const exists = safeWishlist.some(
        (item) =>
          String(item.id ?? item._id) ===
          String(product.id)
      );

      return exists
        ? safeWishlist.filter(
            (item) =>
              String(item.id ?? item._id) !==
              String(product.id)
          )
        : [...safeWishlist, product];
    });
  };

  const isWishlisted = (product) =>
    (Array.isArray(wishlist) ? wishlist : []).some(
      (item) =>
        String(item.id ?? item._id) ===
        String(product.id)
    );

  // --------------------------------------------------
  // FEATURED PRODUCTS
  // --------------------------------------------------

  const featuredProducts = products
    .filter(
      (product) => product.isFeatured === true
    )
    .slice(0, FEATURED_PRODUCT_LIMIT);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  if (!sectionActive) {
    return null;
  }

  return (
    <section className="featured-section">

      {/* SECTION HEADING */}
      <div className="section-heading featured-heading">
        <div>
          <p>HANDPICKED FOR YOU</p>
          <h2>Featured Products</h2>
        </div>

        <Link
          to="/shop"
          className="view-all-link"
        >
          View all products →
        </Link>
      </div>

      {/* PRODUCT LIST */}
      <div className="product-list">

        {productsLoading ? (
          <p className="featured-empty-message">
            Loading featured products...
          </p>
        ) : featuredProducts.length > 0 ? (
          featuredProducts.map((product, index) => {
            const variant = getSelectedVariant(product);

            const price =
              variant?.price ?? product.price;

            const mrp =
              variant?.mrp ?? product.mrp ?? price;

            const validPrice =
              typeof price === "number" &&
              Number.isFinite(price);

            const validMRP =
              typeof mrp === "number" &&
              Number.isFinite(mrp);

            const discount =
              validPrice &&
              validMRP &&
              mrp > 0 &&
              price < mrp
                ? Math.round(
                    ((mrp - price) / mrp) * 100
                  )
                : 0;

            return (
              <div
                className="featured-product-wrapper"
                key={product.id}
              >
                <ProductCard
                  product={product}
                  name={product.name}
                  quantity={
                    variant?.label || product.quantity
                  }
                  price={price}
                  mrp={mrp}
                  discount={discount}
                  image={product.image}
                  variants={product.variants}
                  selectedVariantId={variant?.id}
                  onVariantChange={(variantId) =>
                    setSelectedVariants((current) => ({
                      ...current,
                      [product.id]: variantId,
                    }))
                  }
                  imagePriority={index < 2}
                  cartQuantity={getCartQuantity(
                    product,
                    variant
                  )}
                  onAddToCart={() =>
                    addToCart(product, variant)
                  }
                  onIncreaseQuantity={() =>
                    addToCart(product, variant)
                  }
                  onDecreaseQuantity={() =>
                    decreaseQuantity(product, variant)
                  }
                  onToggleWishlist={() =>
                    toggleWishlist(product)
                  }
                  isWishlisted={isWishlisted(product)}
                />
              </div>
            );
          })
        ) : (
          <p className="featured-empty-message">
            No featured products are available right now.
          </p>
        )}

      </div>
    </section>
  );
}

export default FeaturedProducts;
