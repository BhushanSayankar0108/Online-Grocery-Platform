import { Link } from "react-router-dom";
function Navbar({ cartCount }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Online Grocery E-Commerce Platform
      </Link>

      <div className="navbar-search">
        <input
          type="text"
          placeholder="Search for products..."
        />
        <button>Search</button>
      </div>

      <div className="navbar-links">
        <span>Categories</span>
        <span>Login</span>
        <span>Sign Up</span>
        <span>♡ Wishlist</span>
<Link to="/cart" className="navbar-cart">
  🛒 Cart ({cartCount})
</Link>
      </div>
    </nav>
  );
}

export default Navbar;