
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  Truck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import heroImage from "../assets/hero.png";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const SLIDE_INTERVAL = 5000;

const DEFAULT_TITLE = "Fresh groceries.\nDelivered simply.";

const DEFAULT_SUBTITLE =
  "Shop fresh produce, daily essentials, snacks and more — all in one place, delivered to your doorstep.";

// --------------------------------------------------
// GET BANNER IMAGE URL
// Supports uploaded CMS images and external image URLs.
// --------------------------------------------------

function getImageUrl(banner) {
  const images = Array.isArray(banner?.images)
    ? banner.images
    : [];

  const firstImage = images.find((image) => {
    if (typeof image === "string") {
      return image.trim().length > 0;
    }

    return Boolean(image?.url || image?.src);
  });

  const imageValue =
    typeof firstImage === "string"
      ? firstImage
      : firstImage?.url ||
        firstImage?.src ||
        banner?.image ||
        "";

  if (
    typeof imageValue !== "string" ||
    !imageValue.trim()
  ) {
    return heroImage;
  }

  const value = imageValue.trim();

  // Already an absolute or browser-generated image URL.
  if (
    value.startsWith("data:") ||
    value.startsWith("blob:") ||
    /^https?:\/\//i.test(value)
  ) {
    return value;
  }

  // Convert backend-relative image paths into absolute URLs.
  const imagePath = value.replace(/^\/+/, "");

  return `${API_BASE_URL}/${imagePath}`;
}

// --------------------------------------------------
// GET INTERNAL BANNER BUTTON LINK
// AdminCMS currently stores buttonText but not buttonLink.
// Therefore, /shop remains the default destination.
// --------------------------------------------------

function getBannerLink(banner) {
  const link = banner?.buttonLink || banner?.link || "/shop";

  if (
    typeof link === "string" &&
    link.startsWith("/") &&
    !link.startsWith("//")
  ) {
    return link;
  }

  return "/shop";
}

// --------------------------------------------------
// HERO COMPONENT
// --------------------------------------------------

function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failedImageKey, setFailedImageKey] = useState(null);

  // --------------------------------------------------
  // FETCH ACTIVE BANNERS FROM PUBLIC CMS API
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchBanners = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cms/public`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            `CMS API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result.success === false) {
          throw new Error(
            result.message || "Unable to load CMS banners."
          );
        }

        const allBanners = Array.isArray(
          result.data?.banners
        )
          ? result.data.banners
          : [];

        // Only display active banners with valid titles.
        const activeBanners = allBanners.filter(
          (item) =>
            String(item?.status || "").toLowerCase() ===
              "active" &&
            typeof item?.title === "string" &&
            item.title.trim().length > 0
        );

        if (!cancelled) {
          setBanners(activeBanners);
          setCurrentIndex(0);
          setFailedImageKey(null);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Hero banner loading error:",
            error.message
          );
        }
      }
    };

    fetchBanners();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // AUTOMATIC BANNER SLIDER
  // --------------------------------------------------

  useEffect(() => {
    if (banners.length <= 1) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCurrentIndex(
        (index) => (index + 1) % banners.length
      );
    }, SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length]);

  // --------------------------------------------------
  // PREVIOUS BANNER
  // --------------------------------------------------

  const goToPrevious = () => {
    if (banners.length <= 1) return;

    setCurrentIndex(
      (index) =>
        (index - 1 + banners.length) % banners.length
    );
  };

  // --------------------------------------------------
  // NEXT BANNER
  // --------------------------------------------------

  const goToNext = () => {
    if (banners.length <= 1) return;

    setCurrentIndex(
      (index) => (index + 1) % banners.length
    );
  };

  // --------------------------------------------------
  // CURRENT BANNER DATA
  // --------------------------------------------------

  const banner = banners[currentIndex] || null;

  const bannerKey = banner
    ? String(
        banner._id || banner.id || banner.title
      )
    : "default-hero";

  const title = banner?.title || DEFAULT_TITLE;

  const subtitle =
    banner?.subtitle || DEFAULT_SUBTITLE;

  const buttonText =
    banner?.buttonText || "Shop Groceries";

  const buttonLink = getBannerLink(banner);

  const bannerImage = getImageUrl(banner);

  // Use default image if CMS image fails to load.
  const displayedImage =
    failedImageKey === bannerKey
      ? heroImage
      : bannerImage;

  // Support both newline and HTML-style line breaks.
  const titleLines = title.split(/\n|<br\s*\/?>/i);

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <section className="hero">

      {/* HERO CONTENT */}
      <div className="hero-content">

        <p className="hero-label">
          YOUR EVERYDAY GROCERY STORE
        </p>

        <h1>
          {titleLines.map((line, index) => (
            <span key={`${bannerKey}-${index}`}>
              {line}

              {index < titleLines.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="hero-description">
          {subtitle}
        </p>

        {/* HERO BUTTONS */}
        <div className="hero-buttons">

          <Link
            to={buttonLink}
            className="hero-btn primary-btn"
          >
            {buttonText}
            <ArrowRight size={17} />
          </Link>

          <Link
            to="/categories"
            className="hero-btn secondary-btn"
          >
            Browse Categories
          </Link>

        </div>

        {/* TRUST INFORMATION */}
        <div className="hero-trust">

          <div>
            <Truck size={18} />
            <span>Reliable delivery</span>
          </div>

          <div>
            <ShieldCheck size={18} />
            <span>Secure checkout</span>
          </div>

        </div>

        {/* BANNER CONTROLS */}
        {banners.length > 1 && (
          <div
            className="hero-banner-controls"
            aria-label="Homepage banner controls"
          >

            <button
              type="button"
              onClick={goToPrevious}
              aria-label="Previous banner"
              title="Previous banner"
            >
              <ChevronLeft size={18} />
            </button>

            {banners.map((item, index) => (
              <button
                key={
                  item._id ||
                  item.id ||
                  `${item.title}-${index}`
                }
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Show banner ${index + 1}: ${item.title}`}
                aria-current={
                  index === currentIndex ? "true" : undefined
                }
                title={item.title}
              >
                {index + 1}
              </button>
            ))}

            <button
              type="button"
              onClick={goToNext}
              aria-label="Next banner"
              title="Next banner"
            >
              <ChevronRight size={18} />
            </button>

          </div>
        )}

      </div>

      {/* HERO IMAGE */}
      <div className="hero-image">

        <img
          key={bannerKey}
          src={displayedImage}
          alt={banner?.title || "Fresh groceries"}
          onError={() => {
            if (failedImageKey !== bannerKey) {
              setFailedImageKey(bannerKey);
            }
          }}
        />

      </div>

    </section>
  );
}

export default Hero;
