
import { useState } from "react";
import { Link } from "react-router-dom";

import {
  Heart,
  ShoppingCart,
  Plus,
  Minus,
} from "lucide-react";

// --------------------------------------------------
// FALLBACK IMAGE
// --------------------------------------------------

const FALLBACK_IMAGE = "/images/product-placeholder.png";

// --------------------------------------------------
// PRICE FORMATTER
// --------------------------------------------------

function formatPrice(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number < 0) {
    return "0.00";
  }

  return number.toFixed(2);
}

// --------------------------------------------------
// PRODUCT CARD COMPONENT
// --------------------------------------------------

function ProductCard({
  product,
  name,
  price,
  mrp,
  discount,
  image,
  quantity = "1 unit",
  variants = [],
  selectedVariantId,
  onVariantChange,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  cartQuantity = 0,
  onIncreaseQuantity,
  onDecreaseQuantity,
  imagePriority = false,
}) {
  const [imageFailed, setImageFailed] = useState(false);

  // --------------------------------------------------
  // PRODUCT INFORMATION
  // --------------------------------------------------

  const productName =
    name || product?.name || product?.title || "Grocery Product";

  const productId =
    product?.id || product?._id || product?.productId;

  const productImage =
    typeof image === "string" && image.trim()
      ? image
      : FALLBACK_IMAGE;

  const validVariants = Array.isArray(variants)
    ? variants
    : [];

  // --------------------------------------------------
  // SELECTED VARIANT
  // --------------------------------------------------

  const activeVariant =
    validVariants.find(
      (variant) =>
        String(variant.id) === String(selectedVariantId)
    ) ||
    validVariants.find(
      (variant) => variant.label === quantity
    ) ||
    validVariants[0] ||
    null;

  const displayPrice =
    activeVariant?.price ?? price;

  const displayMrp =
    activeVariant?.mrp ?? mrp;

  const displayQuantity =
    activeVariant?.label ?? quantity;

  const numericPrice = Number(displayPrice);
  const numericMrp = Number(displayMrp);

  const validPrice =
    Number.isFinite(numericPrice) && numericPrice >= 0;

  const validMrp =
    Number.isFinite(numericMrp) && numericMrp >= 0;

  // --------------------------------------------------
  // DISCOUNT CALCULATION
  // --------------------------------------------------

  const calculatedDiscount =
    validPrice &&
    validMrp &&
    numericMrp > numericPrice &&
    numericMrp > 0
      ? Math.round(
          ((numericMrp - numericPrice) / numericMrp) * 100
        )
      : Number(discount) || 0;

  const discountPercent = Math.max(
    0,
    Math.min(100, calculatedDiscount)
  );

  const isInCart = Number(cartQuantity) > 0;

  // --------------------------------------------------
  // PRODUCT DETAILS URL
  // --------------------------------------------------

  const productDetailsLink = productId
    ? `/product/${productId}`
    : "/shop";

  // --------------------------------------------------
  // PREVENT EVENT PROPAGATION
  // --------------------------------------------------

  const stopCardNavigation = (event) => {
    event.stopPropagation();
  };

  // --------------------------------------------------
  // VARIANT CHANGE
  // --------------------------------------------------

  const handleVariantChange = (event) => {
    event.stopPropagation();

    onVariantChange?.(event.target.value);
  };

  // --------------------------------------------------
  // WISHLIST
  // --------------------------------------------------

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onToggleWishlist?.();
  };

  // --------------------------------------------------
  // ADD TO CART
  // --------------------------------------------------

  const handleAddToCart = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onAddToCart?.(activeVariant);
  };

  // --------------------------------------------------
  // INCREASE QUANTITY
  // --------------------------------------------------

  const handleIncreaseQuantity = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onIncreaseQuantity?.(activeVariant);
  };

  // --------------------------------------------------
  // DECREASE QUANTITY
  // --------------------------------------------------

  const handleDecreaseQuantity = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onDecreaseQuantity?.(activeVariant);
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div className="product-card">

      {/* PRODUCT IMAGE */}
      <div className="product-image">

        {/* DISCOUNT BADGE */}
        {discountPercent > 0 && (
          <span className="product-discount-badge">
            {discountPercent}% OFF
          </span>
        )}

        {/* WISHLIST BUTTON */}
        <button
          type="button"
          className={`product-wishlist ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={handleWishlist}
          aria-label={
            isWishlisted
              ? `Remove ${productName} from wishlist`
              : `Add ${productName} to wishlist`
          }
          aria-pressed={Boolean(isWishlisted)}
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* PRODUCT IMAGE LINK */}
        <Link
          to={productDetailsLink}
          className="product-image-link"
          aria-label={`View ${productName}`}
        >
          <img
            src={
              imageFailed
                ? FALLBACK_IMAGE
                : productImage
            }
            alt={productName}
            loading={imagePriority ? "eager" : "lazy"}
            fetchPriority={imagePriority ? "high" : "auto"}
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </Link>

      </div>

      {/* PRODUCT INFORMATION */}
      <div className="product-info">

        {/* PRODUCT NAME */}
        <h3>
          <Link
            to={productDetailsLink}
            className="product-name-link"
          >
            {productName}
          </Link>
        </h3>

        {/* PRODUCT VARIANTS */}
        {validVariants.length > 0 ? (
          <label className="product-variant-selector">
            <span>Choose size</span>

            <select
              value={activeVariant?.id ?? ""}
              onChange={handleVariantChange}
              onClick={stopCardNavigation}
              onKeyDown={stopCardNavigation}
              aria-label={`Choose size for ${productName}`}
            >
              {validVariants.map((variant, index) => (
                <option
                  key={variant.id ?? index}
                  value={variant.id}
                >
                  {variant.label || "Default"}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="product-quantity">
            {displayQuantity}
          </p>
        )}

        {/* PRODUCT PRICE */}
        <div className="product-price">

          <span className="selling-price">
            ₹{formatPrice(displayPrice)}
          </span>

          {validPrice &&
            validMrp &&
            numericMrp > numericPrice && (
              <span className="mrp">
                ₹{formatPrice(displayMrp)}
              </span>
            )}

        </div>

        {/* PRODUCT ACTIONS */}
        <div className="product-actions">

          {!isInCart ? (
            <button
              type="button"
              className="add-cart-btn"
              onClick={handleAddToCart}
              aria-label={`Add ${productName} to cart`}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          ) : (
            <div className="product-quantity-control">

              {/* DECREASE */}
              <button
                type="button"
                className="quantity-control-btn"
                onClick={handleDecreaseQuantity}
                aria-label={`Decrease ${productName} ${displayQuantity} quantity`}
              >
                <Minus size={16} />
              </button>

              {/* QUANTITY */}
              <span className="cart-item-quantity">
                {cartQuantity}
              </span>

              {/* INCREASE */}
              <button
                type="button"
                className="quantity-control-btn"
                onClick={handleIncreaseQuantity}
                aria-label={`Increase ${productName} ${displayQuantity} quantity`}
              >
                <Plus size={16} />
              </button>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default ProductCard;
