import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

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
      <div className="wishlist-container">
        <header className="wishlist-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="wishlist-breadcrumb">Home / Wishlist</p>

          <span className="wishlist-eyebrow">YOUR SAVED PRODUCTS</span>

          <h1>My Wishlist</h1>

          <p className="wishlist-intro">
            Keep your favorite groceries here and add them to your cart
            whenever you're ready.
          </p>
        </header>

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
              {wishlist.map((product) => (
                <article
                  className="wishlist-card"
                  key={product.name}
                >
                  <Link
                    to={`/product/${product.id}`}
                    className="wishlist-product-link"
                  >
                    <div className="wishlist-image">
                      {product.mrp > product.price && (
                        <span className="wishlist-discount">
                          {Math.round(
                            ((product.mrp - product.price) /
                              product.mrp) *
                              100
                          )}
                          % OFF
                        </span>
                      )}

                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    </div>

                    <div className="wishlist-info">
                      <h2>{product.name}</h2>

                      {product.quantity && (
                        <span className="wishlist-quantity">
                          {product.quantity}
                        </span>
                      )}

                      <div className="wishlist-price">
                        <strong>₹{product.price}</strong>

                        {product.mrp > product.price && (
                          <span>₹{product.mrp}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  <div className="wishlist-actions">
                    <button
                      type="button"
                      className="wishlist-cart-button"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart size={17} />
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      className="wishlist-remove"
                      onClick={() =>
                        removeFromWishlist(product.name)
                      }
                      aria-label={`Remove ${product.name} from wishlist`}
                    >
                      <Trash2 size={17} />
                      <span>Remove</span>
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default Wishlist;