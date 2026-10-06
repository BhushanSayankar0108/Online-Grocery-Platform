import { Link } from "react-router-dom";

function Wishlist({ wishlist, setWishlist, setCart }) {
  const removeFromWishlist = (productName) => {
    setWishlist((currentWishlist) =>
      currentWishlist.filter((item) => item.name !== productName)
    );
  };

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingProduct = currentCart.find(
        (item) => item.name === product.name
      );

      if (existingProduct) {
        return currentCart.map((item) =>
          item.name === product.name
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...currentCart, { ...product, quantity: 1 }];
    });
  };

  return (
    <main className="wishlist-page">
      <div className="wishlist-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <h1>My Wishlist</h1>
        <p>Save your favorite products for later.</p>
      </div>

      <div className="wishlist-content">
        {wishlist.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">♡</div>
            <h2>Your Wishlist is Empty</h2>
            <p>Add products you love to your wishlist.</p>

            <Link to="/shop" className="wishlist-shop-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div className="wishlist-card" key={product.name}>
                <Link
                  to={`/product/${product.id}`}
                  className="wishlist-product-link"
                >
                  <div className="wishlist-image">
                    <img src={product.image} alt={product.name} />
                  </div>

                  <div className="wishlist-info">
                    <h3>{product.name}</h3>

                    <div className="wishlist-price">
                      <strong>₹{product.price}</strong>
                      <span>₹{product.mrp}</span>
                    </div>
                  </div>
                </Link>

                <div className="wishlist-actions">
                  <button onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>

                  <button
                    className="wishlist-remove"
                    onClick={() => removeFromWishlist(product.name)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default Wishlist;