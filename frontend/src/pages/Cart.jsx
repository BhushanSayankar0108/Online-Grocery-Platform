import { Link } from "react-router-dom";
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
  return (
    <main className="cart-page">
      <div className="cart-header">
        <h1>Your Cart</h1>
        <p>Review the products you've added to your cart.</p>
      </div>

<div className="cart-content">
  {cart.length === 0 ? (
    <h2>Your cart is currently empty.</h2>
  ) : (
<div className="cart-items">
  {cart.map((product, index) => (
    <div className="cart-item" key={`${product.name}-${index}`}>
      <div className="cart-item-image">
        <img
          src={product.image}
          alt={product.name}
        />
      </div>

<div className="cart-item-info">
  <h3>{product.name}</h3>

  <p>₹{product.price}</p>

<div className="cart-quantity">
  <button onClick={() => decreaseQuantity(index)}>-</button>

  <span>{product.quantity}</span>

  <button onClick={() => increaseQuantity(index)}>+</button>
</div>

<button
  className="remove-cart-item"
  onClick={() => removeFromCart(index)}
>
  Remove
</button>
</div>
    </div>
  ))}
<div className="cart-summary">
  <h2>Cart Summary</h2>

  <p>
    Subtotal: <strong>₹{cartSubtotal}</strong>
  </p>

<Link to="/checkout" className="checkout-button">
  Proceed to Checkout
</Link>
</div>
</div>
  )}
</div>
    </main>
  );
}

export default Cart;