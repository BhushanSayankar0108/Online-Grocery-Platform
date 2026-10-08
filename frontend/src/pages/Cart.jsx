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

function Cart({ cart, setCart }) {
  const increaseQuantity = (index) => {
    setCart((currentCart) =>
      currentCart.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (index) => {
    setCart((currentCart) =>
      currentCart
        .map((item, itemIndex) =>
          itemIndex === index
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (index) => {
    setCart((currentCart) =>
      currentCart.filter((_, itemIndex) => itemIndex !== index)
    );
  };

  const cartSubtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const deliveryCharge = cartSubtotal >= 500 ? 0 : 40;
  const cartTotal = cartSubtotal + deliveryCharge;
  const freeDeliveryRemaining = Math.max(500 - cartSubtotal, 0);

  return (
    <main className="cart-page">
      <div className="cart-container">
        <header className="cart-header">
          <Link to="/shop" className="shop-home-link">
            ← Continue Shopping
          </Link>

          <p className="cart-breadcrumb">Home / Cart</p>

          <span className="cart-eyebrow">YOUR SHOPPING CART</span>

          <h1>Review your cart.</h1>

          <p className="cart-intro">
            Check your items, update quantities and continue to checkout
            when you're ready.
          </p>
        </header>

        {cart.length === 0 ? (
          <section className="cart-empty">
            <div className="cart-empty-icon">
              <ShoppingCart size={34} strokeWidth={1.6} />
            </div>

            <span className="cart-empty-eyebrow">
              YOUR CART IS EMPTY
            </span>

            <h2>Nothing here yet.</h2>

            <p>
              Browse our fresh groceries and everyday essentials
              and add something to your cart.
            </p>

            <Link to="/shop" className="cart-shop-button">
              <ShoppingBag size={17} />
              Browse Products
              <ArrowRight size={17} />
            </Link>
          </section>
        ) : (
          <div className="cart-layout">
            <section className="cart-items-section">
              <div className="cart-items-heading">
                <div>
                  <span>YOUR ITEMS</span>
                  <h2>
                    {cart.length}{" "}
                    {cart.length === 1 ? "product" : "products"}
                  </h2>
                </div>
              </div>

              {cartSubtotal < 500 && (
                <div className="cart-delivery-note">
                  <Truck size={18} />

                  <div>
                    <strong>
                      Add ₹{freeDeliveryRemaining} more for free
                      delivery
                    </strong>

                    <span>
                      Free delivery on orders above ₹500.
                    </span>
                  </div>
                </div>
              )}

              {cartSubtotal >= 500 && (
                <div className="cart-delivery-note cart-delivery-free">
                  <Truck size={18} />

                  <div>
                    <strong>You've unlocked free delivery.</strong>

                    <span>
                      Your order qualifies for free delivery.
                    </span>
                  </div>
                </div>
              )}

              <div className="cart-items">
                {cart.map((product, index) => (
                  <article
                    className="cart-item"
                    key={`${product.name}-${index}`}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      className="cart-item-image"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                      />
                    </Link>

                    <div className="cart-item-info">
                      <Link
                        to={`/product/${product.id}`}
                        className="cart-product-name"
                      >
                        <h3>{product.name}</h3>
                      </Link>

                      {product.quantity && (
                        <span className="cart-product-quantity">
                          {product.quantity}
                        </span>
                      )}

                      <div className="cart-item-price">
                        <strong>₹{product.price}</strong>

                        {product.mrp > product.price && (
                          <span>₹{product.mrp}</span>
                        )}
                      </div>

                      <div className="cart-item-bottom">
                        <div className="cart-quantity">
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(index)
                            }
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            <Minus size={15} />
                          </button>

                          <span>{product.quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(index)
                            }
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <strong className="cart-item-total">
                          ₹{product.price * product.quantity}
                        </strong>
                      </div>

                      <button
                        type="button"
                        className="remove-cart-item"
                        onClick={() => removeFromCart(index)}
                      >
                        <Trash2 size={15} />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              <Link to="/shop" className="cart-continue-link">
                <ArrowRight size={16} />
                Continue shopping
              </Link>
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-header">
                <span>ORDER SUMMARY</span>
                <h2>Cart Summary</h2>
              </div>

              <div className="cart-summary-lines">
                <div>
                  <span>Subtotal</span>
                  <strong>₹{cartSubtotal}</strong>
                </div>

                <div>
                  <span>Delivery</span>
                  <strong>
                    {deliveryCharge === 0
                      ? "FREE"
                      : `₹${deliveryCharge}`}
                  </strong>
                </div>
              </div>

              <div className="cart-total">
                <span>Total</span>
                <strong>₹{cartTotal}</strong>
              </div>

              <Link
                to="/checkout"
                className="checkout-button"
              >
                Proceed to Checkout
                <ArrowRight size={17} />
              </Link>

              <div className="cart-trust">
                <div>
                  <ShieldCheck size={17} />
                  <span>Secure checkout</span>
                </div>

                <div>
                  <Truck size={17} />
                  <span>Reliable delivery</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;