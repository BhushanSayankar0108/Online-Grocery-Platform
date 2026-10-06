import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-about">
          <h2>Online Grocery</h2>
          <p>
            Fresh groceries and everyday essentials delivered
            conveniently to your doorstep.
          </p>
        </div>

        <div className="footer-column">
          <h3>Quick Links</h3>
          <Link to="/about">About Us</Link>
          <Link to="/support">Contact Us</Link>
          <Link to="/faq">FAQ</Link>
        </div>

        <div className="footer-column">
          <h3>Policies</h3>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms">Terms & Conditions</Link>
          <Link to="/return-policy">Return Policy</Link>
        </div>

        <div className="footer-column">
          <h3>Contact</h3>
          <span>support@example.com</span>
          <span>+91 98765 43210</span>
          <span>Mon - Sun, 9 AM - 9 PM</span>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2026 Online Grocery. All rights reserved.</p>

        <div className="footer-social">
          <span>Instagram</span>
          <span>Facebook</span>
          <span>Twitter</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;