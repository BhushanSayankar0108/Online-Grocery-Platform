function ProductCard({ name, price, mrp, discount, image, onAddToCart }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />
      </div>

      <div className="product-info">
        <h3>{name}</h3>

        <div className="product-price">
          <span className="selling-price">₹{price}</span>
          <span className="mrp">₹{mrp}</span>
          <span className="discount">{discount}% OFF</span>
        </div>

        <div className="product-actions">
<button
  onClick={(event) => {
    event.preventDefault();
    event.stopPropagation();
    onAddToCart();
  }}
>
  Add to Cart
</button>
          <button className="wishlist-btn">♡</button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;