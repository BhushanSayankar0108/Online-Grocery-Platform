
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  MapPin,
  Clock3,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const CMS_PUBLIC_API = "http://localhost:5000/api/cms/public";

function parseShippingContent(content = "") {
  const sections = [];
  let currentSection = null;

  content.split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) return;

    const headingMatch = trimmedLine.match(/^##\s*(.*?)\s*\|\s*(.+)$/);

    if (headingMatch) {
      currentSection = {
        number: headingMatch[1],
        title: headingMatch[2],
        paragraphs: [],
      };

      sections.push(currentSection);
    } else if (currentSection) {
      currentSection.paragraphs.push(trimmedLine);
    }
  });

  return sections;
}

function ShippingPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchShippingPolicy = async () => {
      try {
        const response = await fetch(CMS_PUBLIC_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load Shipping Policy.");
        }

        const result = await response.json();

        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const activePolicy = contentItems.find(
          (item) =>
            item.title?.trim().toLowerCase() === "shipping policy" &&
            item.status?.toLowerCase() === "active"
        );

        setPolicy(activePolicy || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Shipping Policy error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchShippingPolicy();

    return () => controller.abort();
  }, []);

  const shippingSections = parseShippingContent(policy?.content || "");

  return (
    <main className="info-page shipping-policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            <Link to="/">Home</Link> / Shipping Policy
          </p>

          <span className="info-eyebrow">DELIVERY INFORMATION</span>

          <h1>Shipping & delivery made simple.</h1>

          <p className="info-intro">
            {policy?.intro ||
              "Everything you need to know about delivery availability, delivery slots, charges and receiving your order."}
          </p>
        </div>

        <section className="shipping-grid">
          <article className="shipping-card">
            <div className="shipping-icon">
              <MapPin size={25} />
            </div>

            <h2>Delivery Areas</h2>

            <p>
              Delivery is available only in supported service areas. Your
              delivery location is checked during the shopping and checkout
              process.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <Clock3 size={25} />
            </div>

            <h2>Delivery Slots</h2>

            <p>
              Available delivery slots are displayed during checkout. Select
              the slot that works best for you before placing your order.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <Truck size={25} />
            </div>

            <h2>Delivery Charges</h2>

            <p>
              Delivery charges may depend on your order value, delivery area
              and applicable offers. Any applicable charge is shown before
              placing the order.
            </p>
          </article>

          <article className="shipping-card">
            <div className="shipping-icon">
              <ShieldCheck size={25} />
            </div>

            <h2>Safe Delivery</h2>

            <p>
              Please make sure someone is available at the selected delivery
              address to receive the order during the chosen delivery slot.
            </p>
          </article>
        </section>

        <section className="shipping-details">
          <div className="info-section-heading">
            <span className="info-eyebrow">DELIVERY PROCESS</span>
            <h2>What happens after you place an order?</h2>
          </div>

          {loading ? (
            <p className="policy-message">
              Loading Shipping Policy...
            </p>
          ) : error ? (
            <p className="policy-message" role="alert">
              {error}
            </p>
          ) : shippingSections.length > 0 ? (
            <div className="shipping-steps">
              {shippingSections.map((section, index) => (
                <div
                  className="shipping-step"
                  key={`${section.number}-${index}`}
                >
                  <span>{section.number}</span>

                  <div>
                    <h3>{section.title}</h3>

                    {section.paragraphs.map((paragraph, paragraphIndex) => (
                      <p key={paragraphIndex}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="policy-message">
              Shipping Policy content is currently unavailable.
            </p>
          )}
        </section>

        <section className="shipping-note">
          <div>
            <span className="info-eyebrow">PLEASE NOTE</span>

            <h2>
              Delivery times may vary depending on location and availability.
            </h2>

            <p>
              Delivery availability, charges and time slots are confirmed
              during checkout based on your selected location.
            </p>
          </div>

          <Link to="/shop" className="info-cta-button">
            Continue Shopping
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default ShippingPolicy;
