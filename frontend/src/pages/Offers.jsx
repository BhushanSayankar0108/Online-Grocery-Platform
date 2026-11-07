
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgePercent,
  ShoppingBasket,
  Copy,
  Check,
  Tag,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

// Format coupon expiry date
function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Get discount text
function getDiscountText(coupon) {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% OFF`;
  }

  return `₹${coupon.discountValue} OFF`;
}

// Get offer title
function getOfferTitle(coupon) {
  return coupon.description?.trim() || `${coupon.code} Special Offer`;
}

function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedCode, setCopiedCode] = useState("");

  // Fetch offers from backend
  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/coupons/public`
      );

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(
          result?.message || "Unable to load offers."
        );
      }

      const coupons = Array.isArray(result?.coupons)
        ? result.coupons
        : [];

      setOffers(coupons);
    } catch (err) {
      console.error("Offers loading error:", err);
      setError(
        err.message || "Unable to load offers. Please try again."
      );
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial API call: state updates happen after the async request
  useEffect(() => {
    let cancelled = false;

    const loadOffers = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/coupons/public`
        );

        const result = await response.json();

        if (!response.ok || result?.success === false) {
          throw new Error(
            result?.message || "Unable to load offers."
          );
        }

        const coupons = Array.isArray(result?.coupons)
          ? result.coupons
          : [];

        if (!cancelled) {
          setOffers(coupons);
          setError("");
        }
      } catch (err) {
        console.error("Offers loading error:", err);

        if (!cancelled) {
          setError(
            err.message || "Unable to load offers. Please try again."
          );
          setOffers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOffers();

    return () => {
      cancelled = true;
    };
  }, []);

  // Copy coupon code
  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);

      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode((current) =>
          current === code ? "" : current
        );
      }, 1800);
    } catch (err) {
      console.error("Unable to copy coupon:", err);
      setCopiedCode("");
    }
  };

  return (
    <>
      <style>{`
        .offers-page {
          min-height: 100vh;
          padding: 45px 20px 60px;
          background: #f8fafc;
          color: #1f2937;
        }

        .offers-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .shop-home-link {
          display: inline-flex;
          align-items: center;
          margin-bottom: 22px;
          color: #15803d;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .shop-home-link:hover {
          color: #166534;
        }

        .offers-breadcrumb {
          margin-bottom: 20px;
          color: #94a3b8;
          font-size: 13px;
        }

        .offers-header {
          margin-bottom: 42px;
          text-align: center;
        }

        .offers-eyebrow {
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 15px;
          border-radius: 30px;
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .offers-header h1 {
          margin: 0 0 15px;
          color: #172b22;
          font-size: clamp(30px, 5vw, 46px);
          font-weight: 800;
          line-height: 1.2;
        }

        .offers-intro {
          max-width: 650px;
          margin: 0 auto;
          color: #64748b;
          font-size: 16px;
          line-height: 1.8;
        }

        .offers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 24px;
        }

        .offer-card {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .offer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.09);
        }

        .offer-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 22px 15px;
        }

        .offer-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 55px;
          height: 55px;
          border-radius: 15px;
          background: #dcfce7;
          color: #15803d;
        }

        .offer-badge {
          padding: 7px 11px;
          border-radius: 30px;
          background: #f0fdf4;
          color: #15803d;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
        }

        .offer-card-content {
          flex: 1;
          padding: 5px 22px 20px;
        }

        .offer-discount {
          margin: 8px 0;
          color: #15803d;
          font-size: 30px;
          font-weight: 800;
        }

        .offer-card-content h2 {
          margin: 8px 0;
          color: #1f2937;
          font-size: 19px;
          font-weight: 750;
          line-height: 1.4;
        }

        .offer-description {
          min-height: 48px;
          margin: 10px 0 18px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.7;
        }

        .offer-code-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 12px;
          border: 1px dashed #86efac;
          border-radius: 12px;
          background: #f0fdf4;
        }

        .offer-code {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .offer-code span {
          color: #64748b;
          font-size: 11px;
        }

        .offer-code strong {
          overflow-wrap: anywhere;
          color: #166534;
          font-size: 17px;
          letter-spacing: 1px;
        }

        .offer-copy-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 9px 12px;
          border: 0;
          border-radius: 8px;
          background: #15803d;
          color: #ffffff;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .offer-copy-button:hover {
          background: #166534;
        }

        .offer-extra-details {
          display: flex;
          flex-direction: column;
          gap: 9px;
          margin-top: 18px;
        }

        .offer-extra-details p {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          color: #64748b;
          font-size: 12px;
        }

        .offer-extra-details svg {
          flex-shrink: 0;
          color: #15803d;
        }

        .offer-card-footer {
          padding: 0 22px 22px;
        }

        .offer-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          min-height: 45px;
          padding: 11px 16px;
          border: 0;
          border-radius: 10px;
          background: #15803d;
          color: #ffffff;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .offer-button:hover {
          background: #166534;
        }

        .offers-loading,
        .offers-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          padding: 35px 20px;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          background: #ffffff;
          text-align: center;
        }

        .offers-loading {
          gap: 15px;
          color: #15803d;
        }

        .offers-loading p,
        .offers-empty p {
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .offers-empty > svg {
          margin-bottom: 14px;
          color: #15803d;
        }

        .offers-empty h2 {
          margin: 0;
          color: #1f2937;
          font-size: 22px;
        }

        .offers-empty .offer-button {
          width: auto;
          margin-top: 12px;
        }

        .offers-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
          margin-top: 55px;
          padding: 32px;
          border-radius: 18px;
          background: #14532d;
          color: #ffffff;
        }

        .offers-bottom span {
          color: #bbf7d0;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
        }

        .offers-bottom h2 {
          margin: 10px 0;
          font-size: 23px;
          font-weight: 750;
        }

        .offers-bottom p {
          margin: 0;
          color: #dcfce7;
          font-size: 14px;
          line-height: 1.7;
        }

        .offers-shop-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          flex-shrink: 0;
          padding: 13px 20px;
          border-radius: 10px;
          background: #ffffff;
          color: #166534;
          font-size: 14px;
          font-weight: 750;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .offers-shop-button:hover {
          background: #dcfce7;
        }

        @media (max-width: 900px) {
          .offers-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .offers-page {
            padding: 25px 15px 40px;
          }

          .offers-header {
            margin-bottom: 28px;
          }

          .offers-intro {
            font-size: 14px;
          }

          .offers-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .offers-bottom {
            flex-direction: column;
            align-items: flex-start;
            padding: 25px 20px;
          }

          .offers-bottom h2 {
            font-size: 20px;
          }

          .offers-shop-button {
            width: 100%;
          }
        }
      `}</style>

      <main className="offers-page">
        <div className="offers-container">
          <div className="offers-header">
            <Link to="/" className="shop-home-link">
              ← Back to Home
            </Link>

            <p className="offers-breadcrumb">Home / Offers</p>

            <span className="offers-eyebrow">
              SAVE MORE ON EVERY ORDER
            </span>

            <h1>Special offers, better savings.</h1>

            <p className="offers-intro">
              Discover our latest grocery deals and exclusive coupon
              codes. Apply your favourite coupon at checkout and save
              more.
            </p>
          </div>

          {loading ? (
            <div className="offers-loading">
              <LoaderCircle size={32} className="animate-spin" />
              <p>Loading the latest offers...</p>
            </div>
          ) : error ? (
            <div className="offers-empty">
              <Tag size={36} />
              <h2>Unable to load offers</h2>
              <p>{error}</p>

              <button
                type="button"
                className="offer-button"
                onClick={fetchOffers}
              >
                <RefreshCw size={17} />
                Try Again
              </button>
            </div>
          ) : offers.length === 0 ? (
            <div className="offers-empty">
              <BadgePercent size={40} />
              <h2>No active offers right now</h2>
              <p>
                We are preparing exciting deals for you. Please check
                back soon!
              </p>

              <Link to="/shop" className="offer-button">
                Explore Products
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <div className="offers-grid">
              {offers.map((offer) => (
                <article
                  className="offer-card"
                  key={offer._id || offer.code}
                >
                  <div className="offer-card-top">
                    <div className="offer-icon">
                      {offer.discountType === "percentage" ? (
                        <BadgePercent size={28} strokeWidth={1.8} />
                      ) : (
                        <ShoppingBasket size={28} strokeWidth={1.8} />
                      )}
                    </div>

                    <span className="offer-badge">
                      SPECIAL OFFER
                    </span>
                  </div>

                  <div className="offer-card-content">
                    <p className="offer-discount">
                      {getDiscountText(offer)}
                    </p>

                    <h2>{getOfferTitle(offer)}</h2>

                    <p className="offer-description">
                      {offer.description ||
                        "Use this exclusive coupon at checkout and enjoy savings on your order."}
                    </p>

                    <div className="offer-code-row">
                      <div className="offer-code">
                        <span>Coupon code</span>
                        <strong>{offer.code}</strong>
                      </div>

                      <button
                        type="button"
                        className="offer-copy-button"
                        onClick={() => handleCopy(offer.code)}
                        aria-label={`Copy ${offer.code}`}
                      >
                        {copiedCode === offer.code ? (
                          <>
                            <Check size={16} />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy size={16} />
                            Copy
                          </>
                        )}
                      </button>
                    </div>

                    <div className="offer-extra-details">
                      <p>
                        <ShoppingBasket size={15} />
                        Minimum order: ₹
                        {Number(offer.minOrderAmount || 0)}
                      </p>

                      <p>
                        <BadgePercent size={15} />
                        Maximum discount: ₹
                        {Number(offer.maxDiscount || 0)}
                      </p>

                      {offer.endDate && (
                        <p>
                          <CalendarDays size={15} />
                          Valid until: {formatDate(offer.endDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="offer-card-footer">
                    <Link to="/shop" className="offer-button">
                      Shop Now
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          <section className="offers-bottom">
            <div>
              <span>MORE TO EXPLORE</span>
              <h2>Looking for everyday essentials?</h2>
              <p>
                Browse our complete collection of fresh groceries and
                household essentials.
              </p>
            </div>

            <Link to="/shop" className="offers-shop-button">
              View All Products
              <ArrowRight size={17} />
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}

export default Offers;
