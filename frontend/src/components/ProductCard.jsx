import { Heart, ShoppingCart } from "lucide-react";

function ProductCard({
  name,
  price,
  mrp,
  discount,
  image,
  quantity = "1 unit",
  onAddToCart,
  onToggleWishlist,
  isWishlisted,
}) {
  return (
    <div className="product-card">

      <div className="product-image">
        {discount > 0 && (
          <span className="product-discount-badge">
            {discount}% OFF
          </span>
        )}

        <button
          className={`product-wishlist ${
            isWishlisted ? "wishlisted" : ""
          }`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onToggleWishlist();
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

        <img src={image} alt={name} />
      </div>

      <div className="product-info">

        <h3>{name}</h3>

        <p className="product-quantity">
          {quantity}
        </p>

        <div className="product-price">
          <span className="selling-price">
            ₹{price}
          </span>

          <span className="mrp">
            ₹{mrp}
          </span>
        </div>

        <div className="product-actions">
          <button
            className="add-cart-btn"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onAddToCart();
            }}
          >
            <ShoppingCart size={16} />
            Add to Cart
          </button>
        </div>

      </div>
    </div>
  );
}

export default ProductCard;