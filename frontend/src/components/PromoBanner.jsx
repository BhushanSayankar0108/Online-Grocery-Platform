
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

// --------------------------------------------------
// PROMOTIONAL BANNER COMPONENT
// --------------------------------------------------

function PromoBanner() {
  const [banner, setBanner] = useState(null);
  const [sectionActive, setSectionActive] = useState(true);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // LOAD PROMOTIONAL BANNER FROM CMS
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadPromotionalBanner = async () => {
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

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load promotional banner."
          );
        }

        const cmsData = result?.data || {};

        const sections = Array.isArray(cmsData.sections)
          ? cmsData.sections
          : [];

        const banners = Array.isArray(cmsData.banners)
          ? cmsData.banners
          : [];

        // Find Promotional Banner CMS section
        const promotionalSection = sections.find(
          (section) =>
            String(section?.name ?? section?.title ?? "")
              .trim()
              .toLowerCase() === "promotional banner"
        );

        // Respect CMS section visibility
        const isSectionActive =
          sections.length === 0
            ? true
            : Boolean(promotionalSection);

        // Get active promotional banner
        const activeBanners = banners.filter(
          (item) =>
            String(item?.status || "active").toLowerCase() ===
            "active"
        );

        // Prefer explicitly promotional banners when placement/type
        // is available. Otherwise use the first active CMS banner.
        const promotionalBanners = activeBanners.filter(
          (item) => {
            const placement = String(
              item?.placement ??
              item?.type ??
              item?.section ??
              ""
            ).toLowerCase();

            return (
              placement.includes("promotional") ||
              placement.includes("promo")
            );
          }
        );

        const selectedBanner =
          promotionalBanners[0] || activeBanners[0] || null;

        if (!cancelled) {
          setSectionActive(isSectionActive);
          setBanner(selectedBanner);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to load promotional banner:",
            error.message
          );
        }

        // Keep the default promotional banner visible
        // if the CMS request fails.
        if (!cancelled) {
          setSectionActive(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPromotionalBanner();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // CMS CONTENT WITH DEFAULT FALLBACK
  // --------------------------------------------------

  const title =
    banner?.title || "Fresh Deals, Better Savings";

  const description =
    banner?.subtitle ||
    "Get great discounts on your everyday grocery essentials.";

  const buttonText =
    banner?.buttonText || "View Offers";

  // Current Admin CMS banner form does not provide buttonLink.
  const buttonLink = banner?.buttonLink || "/offers";

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  if (!sectionActive || loading) {
    return null;
  }

  return (
    <section className="promo-banner">
      <div className="promo-content">
        <p className="promo-label">TODAY'S OFFERS</p>

        <h2>{title}</h2>

        <p>{description}</p>

        <Link
          to={buttonLink}
          className="promo-button"
        >
          {buttonText}
        </Link>
      </div>

      <div className="promo-highlight">
        <span>FRESH</span>
        <strong>EVERY DAY</strong>
        <small>Grocery essentials</small>
      </div>
    </section>
  );
}

export default PromoBanner;
