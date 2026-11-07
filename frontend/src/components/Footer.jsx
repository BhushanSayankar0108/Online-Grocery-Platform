
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, Clock3, ArrowUpRight } from "lucide-react";

import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const DEFAULT_SETTINGS = {
  storeName: "Online Grocery",
  email: "support@example.com",
  phone: "+91 98765 43210",
  address: "",
  websiteName: "Online Grocery",
  websiteEmail: "",
  businessHours: "Mon - Sun, 9 AM - 9 PM",
  socialLinks: {
    instagram: "",
    facebook: "",
    x: "",
  },
};

// Extract Contact Information from CMS content.
const extractContactDetails = (content = "") => {
  const segments = String(content)
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  const getValue = (pattern) => {
    const segment = segments.find((item) => pattern.test(item));

    if (!segment) return "";

    return segment.substring(segment.indexOf(":") + 1).trim();
  };

  return {
    email: getValue(/^email\s*:/i),
    phone: getValue(/^phone\s*:/i),
    businessHours: getValue(
      /^(?:hours|business hours|(?:mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)[^:]*):/i
    ),
  };
};

function Footer() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [footerDescription, setFooterDescription] = useState(
    "Fresh groceries and everyday essentials, delivered conveniently to your doorstep."
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchFooterData = async () => {
      // 1. Fetch Store Settings first.
      try {
        const settingsResponse = await fetch(
          `${API_BASE_URL}/api/settings/public`,
          {
            signal: controller.signal,
          }
        );

        if (!settingsResponse.ok) {
          throw new Error("Failed to fetch public settings");
        }

        const settingsResult = await settingsResponse.json();

        if (settingsResult.success && settingsResult.settings) {
          const store = settingsResult.settings.store || {};
          const website = settingsResult.settings.website || {};
          const socialLinks = website.socialLinks || {};

          if (!controller.signal.aborted) {
            setSettings((previous) => ({
              ...previous,

              storeName:
                store.storeName || previous.storeName,

              email:
                store.email || previous.email,

              phone:
                store.phone || previous.phone,

              address:
                store.address || previous.address,

              websiteName:
                website.websiteName ||
                store.storeName ||
                previous.websiteName,

              websiteEmail:
                website.websiteEmail ||
                store.email ||
                previous.websiteEmail,

              businessHours:
                website.businessHours ||
                previous.businessHours,

              socialLinks: {
                instagram: socialLinks.instagram || "",
                facebook: socialLinks.facebook || "",
                x: socialLinks.x || "",
              },
            }));
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Footer settings error:", error);
        }
      }

      // 2. Fetch CMS Content after Store Settings.
      try {
        const cmsResponse = await fetch(
          `${API_BASE_URL}/api/cms/public`,
          {
            signal: controller.signal,
          }
        );

        if (!cmsResponse.ok) {
          throw new Error("Failed to fetch public CMS content");
        }

        const cmsResult = await cmsResponse.json();

        if (!cmsResult.success) {
          throw new Error(
            cmsResult.message || "Unable to load CMS content"
          );
        }

        const contentItems = cmsResult.data?.contentItems || [];

        const activeContent = contentItems.filter(
          (item) =>
            String(item.status || "").toLowerCase() === "active"
        );

        // Find Contact Information by its CMS type.
        const contactContent = activeContent.find(
          (item) => item.type === "contact"
        );

        // Find Footer Content by its CMS type.
        const footerContent = activeContent.find(
          (item) => item.type === "footer"
        );

        if (controller.signal.aborted) return;

        // Update Footer Description.
        setFooterDescription(
          footerContent?.content?.trim() || ""
        );

        // Update Contact Information.
        if (contactContent?.content) {
          const contactDetails = extractContactDetails(
            contactContent.content
          );

          setSettings((previous) => ({
            ...previous,

            email:
              contactDetails.email || previous.email,

            phone:
              contactDetails.phone || previous.phone,

            businessHours:
              contactDetails.businessHours ||
              previous.businessHours,
          }));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Footer CMS error:", error);
        }
      }
    };

    fetchFooterData();

    return () => controller.abort();
  }, []);

  const displayName =
    settings.websiteName || settings.storeName;

  // CMS Contact Information takes priority over Store Settings.
  const displayEmail =
    settings.email || settings.websiteEmail;

  // Social media configuration.
  const socialLinks = [
    {
      name: "Instagram",
      url: settings.socialLinks.instagram,
      icon: <FaInstagram size={15} />,
    },
    {
      name: "Facebook",
      url: settings.socialLinks.facebook,
      icon: <FaFacebookF size={14} />,
    },
    {
      name: "X",
      url: settings.socialLinks.x,
      icon: <FaXTwitter size={14} />,
    },
  ];

  // Only show valid social URLs.
  const validSocialLinks = socialLinks.filter((social) => {
    if (!social.url) return false;

    try {
      const parsedUrl = new URL(social.url);

      return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  });

  return (
    <footer className="footer">
      <div className="footer-content">

        {/* ABOUT */}
        <div className="footer-about">
          <Link to="/" className="footer-logo">
            <span className="footer-logo-mark">OG</span>

            <span className="footer-logo-text">
              {displayName}
              <small>Freshness Delivered</small>
            </span>
          </Link>

          {footerDescription && (
            <p className="footer-about-text">
              {footerDescription}
            </p>
          )}

          <Link to="/shop" className="footer-shop-link">
            Start Shopping
            <ArrowUpRight size={15} />
          </Link>
        </div>

        {/* EXPLORE */}
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

          {displayEmail && (
            <div className="footer-contact-item">
              <Mail size={15} />
              <span>{displayEmail}</span>
            </div>
          )}

          {settings.phone && (
            <div className="footer-contact-item">
              <Phone size={15} />
              <span>{settings.phone}</span>
            </div>
          )}

          {settings.address && (
            <div className="footer-contact-item">
              <span>{settings.address}</span>
            </div>
          )}

          {settings.businessHours && (
            <div className="footer-contact-item">
              <Clock3 size={15} />
              <span>{settings.businessHours}</span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BOTTOM */}
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} {displayName}. All rights reserved.
        </p>

        {validSocialLinks.length > 0 && (
          <div className="footer-social">
            {validSocialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                aria-label={social.name}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}

export default Footer;
