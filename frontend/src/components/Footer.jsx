import { Link } from "react-router-dom";
import { Mail, Phone, Clock3 } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">

        {/* BRAND */}
        <div className="footer-about">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">OG</span>

            <span>
              Online Grocery
              <small>Freshness Delivered</small>
            </span>
          </Link>

          <p>
            Fresh groceries and everyday essentials,
            delivered conveniently to your doorstep.
          </p>
        </div>

        {/* QUICK LINKS */}
        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/about">About Us</Link>
        </div>

        {/* CUSTOMER SERVICE */}
        <div className="footer-column">
          <h3>Customer Service</h3>

          <Link to="/support">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/support">Help & Support</Link>
        </div>

        {/* POLICIES */}
        <div className="footer-column">
          <h3>Policies</h3>

          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/return-policy">Return & Refund</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
        </div>

        {/* CONTACT */}
        <div className="footer-column footer-contact">
          <h3>Get in Touch</h3>

          <span>
            <Mail size={15} />
            support@example.com
          </span>

          <span>
            <Phone size={15} />
            +91 98765 43210
          </span>

          <span>
            <Clock3 size={15} />
            Mon - Sun, 9 AM - 9 PM
          </span>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <p>
          © 2026 Online Grocery. All rights reserved.
        </p>

        <div className="footer-social">
          <span aria-label="Instagram">
            <FaInstagram size={15} />
          </span>

          <span aria-label="Facebook">
            <FaFacebookF size={14} />
          </span>

          <span aria-label="X">
            <FaXTwitter size={14} />
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;