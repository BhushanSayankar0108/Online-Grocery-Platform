import { Heart, ShoppingCart, Plus, Minus } from "lucide-react";

function ProductCard({
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
  isWishlisted,
  cartQuantity = 0,
  onIncreaseQuantity,
  onDecreaseQuantity,
  imagePriority = false,
}) {
  const activeVariant =
    variants.find((variant) => variant.id === selectedVariantId) ||
    variants.find((variant) => variant.label === quantity) ||
    variants[0] ||
    null;

  const displayPrice = activeVariant?.price ?? price;
  const displayMrp = activeVariant?.mrp ?? mrp;
  const displayQuantity = activeVariant?.label ?? quantity;

  const discountPercent =
    displayMrp > 0
      ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
      : discount;

  const isInCart = cartQuantity > 0;

  const stopCardNavigation = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="product-card">
      <div className="product-image">
        {discountPercent > 0 && (
          <span className="product-discount-badge">
            {discountPercent}% OFF
          </span>
        )}

        <button
          type="button"
          className={`product-wishlist ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={(event) => {
            stopCardNavigation(event);
            onToggleWishlist?.();
          }}
          aria-label={
            isWishlisted
              ? `Remove ${name} from wishlist`
              : `Add ${name} to wishlist`
          }
        >
          <Heart
            size={18}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        <img
          src={image}
          alt={name}
          loading={imagePriority ? "eager" : "lazy"}
          fetchPriority={imagePriority ? "high" : "auto"}
          decoding="async"
        />
      </div>

      <div className="product-info">
        <h3>{name}</h3>

        {variants.length > 0 ? (
          <label
            className="product-variant-selector"
            onClick={stopCardNavigation}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <span>Choose size</span>
            <select
              value={activeVariant?.id ?? ""}
              onChange={(event) => {
                event.stopPropagation();
                onVariantChange?.(event.target.value);
              }}
              onClick={stopCardNavigation}
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              aria-label={`Choose size for ${name}`}
            >
              {variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="product-quantity">{displayQuantity}</p>
        )}

        <div className="product-price">
          <span className="selling-price">₹{displayPrice}</span>
          {displayMrp > displayPrice && (
            <span className="mrp">₹{displayMrp}</span>
          )}
        </div>

        <div className="product-actions">
          {!isInCart ? (
            <button
              type="button"
              className="add-cart-btn"
              onClick={(event) => {
                stopCardNavigation(event);
                onAddToCart?.(activeVariant);
              }}
            >
              <ShoppingCart size={16} />
              Add to Cart
            </button>
          ) : (
            <div
              className="product-quantity-control"
              onClick={stopCardNavigation}
            >
              <button
                type="button"
                className="quantity-control-btn"
                onClick={(event) => {
                  stopCardNavigation(event);
                  onDecreaseQuantity?.(activeVariant);
                }}
                aria-label={`Decrease ${name} ${displayQuantity} quantity`}
              >
                <Minus size={16} />
              </button>

              <span className="cart-item-quantity">
                {cartQuantity}
              </span>

              <button
                type="button"
                className="quantity-control-btn"
                onClick={(event) => {
                  stopCardNavigation(event);
                  onIncreaseQuantity?.(activeVariant);
                }}
                aria-label={`Increase ${name} ${displayQuantity} quantity`}
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