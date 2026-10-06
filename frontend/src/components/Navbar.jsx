import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  MapPin,
  User,
  Heart,
  ShoppingCart,
} from "lucide-react";

function Navbar({ cartCount, wishlistCount }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      return;
    }

    navigate(`/shop?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="navbar">
      <div className="navbar-main">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          <span className="logo-mark">OG</span>

          <span className="logo-text">
            Online Grocery
            <small>Freshness Delivered</small>
          </span>
        </Link>

        {/* SEARCH */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <Search size={19} />

          <input
            type="text"
            placeholder="Search for products, brands and more"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search products"
          />
        </form>

        {/* LOCATION */}
        <Link to="/addresses" className="navbar-location">
          <MapPin size={18} />

          <div>
            <span>Deliver to</span>
            <strong>Select location</strong>
          </div>
        </Link>

        {/* ACCOUNT */}
        <Link to="/account" className="navbar-account">
          <User size={20} />

          <div>
            <span>Hello,</span>
            <strong>Account</strong>
          </div>
        </Link>

        {/* WISHLIST */}
        <Link to="/wishlist" className="navbar-icon-link">
          <Heart size={21} />

          {wishlistCount > 0 && (
            <span className="nav-count">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* CART */}
        <Link
          to="/cart"
          className="navbar-icon-link cart-link"
        >
          <ShoppingCart size={22} />

          {cartCount > 0 && (
            <span className="nav-count">
              {cartCount}
            </span>
          )}
        </Link>
      </div>

      {/* CATEGORY NAVIGATION */}
      <div className="navbar-bottom">
        <Link to="/categories">All Categories</Link>

        <Link to="/shop">Shop</Link>

        <Link to="/offers">Offers</Link>

        <Link to="/shop?category=Fruits%20%26%20Vegetables">
          Fruits & Vegetables
        </Link>

        <Link to="/shop?category=Dairy%20%26%20Bakery">
          Dairy & Bakery
        </Link>

        <Link to="/shop?category=Staples">
          Staples
        </Link>

        <Link to="/shop?category=Snacks">
          Snacks
        </Link>

        <Link to="/shop?category=Beverages">
          Beverages
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;