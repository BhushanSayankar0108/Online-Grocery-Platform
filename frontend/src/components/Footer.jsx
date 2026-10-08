import { Link } from "react-router-dom";
import { Mail, Phone, Clock3, ArrowUpRight } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-about">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">OG</span>

            <span className="footer-logo-text">
              Online Grocery
              <small>Freshness Delivered</small>
            </span>
          </Link>

          <p className="footer-about-text">
            Fresh groceries and everyday essentials, delivered
            conveniently to your doorstep.
          </p>

          <Link to="/shop" className="footer-shop-link">
            Start Shopping
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="footer-column">
          <h3>Explore</h3>

          <Link to="/shop">Shop</Link>
          <Link to="/categories">Categories</Link>
          <Link to="/offers">Offers</Link>
          <Link to="/about">About Us</Link>
        </div>

        <div className="footer-column">
          <h3>Customer Service</h3>

          <Link to="/support">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/support">Help & Support</Link>
        </div>

        <div className="footer-column">
          <h3>Policies</h3>

          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/return-policy">Return & Refund</Link>
          <Link to="/shipping-policy">Shipping Policy</Link>
        </div>

        <div className="footer-column footer-contact">
          <h3>Get in Touch</h3>

          <div className="footer-contact-item">
            <Mail size={15} />
            <span>support@example.com</span>
          </div>

          <div className="footer-contact-item">
            <Phone size={15} />
            <span>+91 98765 43210</span>
          </div>

          <div className="footer-contact-item">
            <Clock3 size={15} />
            <span>Mon - Sun, 9 AM - 9 PM</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2026 Online Grocery. All rights reserved.
        </p>

        <div className="footer-social">
          <a
            href="#"
            aria-label="Instagram"
            onClick={(event) => event.preventDefault()}
          >
            <FaInstagram size={15} />
          </a>

          <a
            href="#"
            aria-label="Facebook"
            onClick={(event) => event.preventDefault()}
          >
            <FaFacebookF size={14} />
          </a>

          <a
            href="#"
            aria-label="X"
            onClick={(event) => event.preventDefault()}
          >
            <FaXTwitter size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;