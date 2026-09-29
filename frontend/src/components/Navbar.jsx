function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        Online Grocery E-Commerce Platform
      </div>

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
        <span>🛒 Cart</span>
      </div>
    </nav>
  );
}

export default Navbar;