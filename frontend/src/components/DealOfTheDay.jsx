
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock3, Tag } from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function DealOfTheDay() {
  const [sectionActive, setSectionActive] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadCMSSection = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/cms/public`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`CMS API returned ${response.status}`);
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(result.message || "Unable to load CMS.");
        }

        const sections = Array.isArray(result?.data?.sections)
          ? result.data.sections
          : [];

        const dealSection = sections.find((section) =>
          String(section?.name || "")
            .trim()
            .toLowerCase() === "deal of the day"
        );

        if (!cancelled) {
          // If CMS is not configured yet, keep the default section visible.
          // Otherwise, show it only when Admin has activated it.
          setSectionActive(
            sections.length === 0 ? true : Boolean(dealSection)
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Unable to load Deal of the Day CMS:", error);
        }

        // Keep the section visible if CMS is temporarily unavailable.
        if (!cancelled) {
          setSectionActive(true);
        }
      }
    };

    loadCMSSection();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  if (!sectionActive) {
    return null;
  }

  return (
    <section className="deal-section">
      <div className="deal-content">

        <div className="deal-text">
          <div className="deal-label">
            <Tag size={15} />
            <span>LIMITED TIME OFFER</span>
          </div>

          <h2>
            Deals worth
            <br />
            <span>grabbing today.</span>
          </h2>

          <p>
            Save more on everyday essentials with our handpicked deals.
            Shop before today's offers end.
          </p>

          <div className="deal-timer">
            <div className="deal-time">
              <strong>Today's</strong>
              <span>Offers</span>
            </div>

            <div className="deal-separator">•</div>

            <div className="deal-time">
              <strong>Fresh</strong>
              <span>Products</span>
            </div>

            <div className="deal-separator">•</div>

            <div className="deal-time">
              <strong>Better</strong>
              <span>Prices</span>
            </div>
          </div>

          <Link to="/offers" className="deal-button">
            Shop Today's Deals
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="deal-visual">
          <div className="deal-visual-content">
            <Clock3 size={20} />

            <span>Today's Savings</span>

            <strong>Fresh picks.</strong>
            <strong>Better prices.</strong>
          </div>
        </div>

      </div>
    </section>
  );
}

export default DealOfTheDay;
