import { Link } from "react-router-dom";

function Navbar({ cartCount, wishlistCount }) {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        Online Grocery E-Commerce Platform
      </Link>

      <div className="navbar-links">
        <Link to="/categories">Categories</Link>
        <Link to="/login">Login</Link>
        <Link to="/signup">Sign Up</Link>
        <Link to="/account">Account</Link>

        <Link to="/wishlist">
          ♡ Wishlist ({wishlistCount})
        </Link>

        <Link to="/cart" className="navbar-cart">
          🛒 Cart ({cartCount})
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;