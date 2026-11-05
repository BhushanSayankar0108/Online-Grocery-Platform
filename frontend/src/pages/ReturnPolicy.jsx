
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw,
  PackageCheck,
  AlertCircle,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const CMS_PUBLIC_API = "http://localhost:5000/api/cms/public";

function parsePolicyContent(content = "") {
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

function ReturnPolicy() {
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchPolicy = async () => {
      try {
        const response = await fetch(CMS_PUBLIC_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load Return & Refund Policy.");
        }

        const result = await response.json();

        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const activePolicy = contentItems.find(
          (item) =>
            item.title?.trim().toLowerCase() ===
              "return & refund policy" &&
            item.status?.toLowerCase() === "active"
        );

        setPolicy(activePolicy || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Return Policy error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchPolicy();

    return () => controller.abort();
  }, []);

  const policySections = parsePolicyContent(policy?.content || "");

  return (
    <main className="info-page policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            <Link to="/">Home</Link> / Return & Refund
          </p>

          <span className="info-eyebrow">RETURNS & REFUNDS</span>

          <h1>Return & Refund Policy</h1>

          <p className="info-intro">
            {policy?.intro ||
              "Information about eligible returns, refund requests and what to do when there is an issue with your order."}
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <PackageCheck size={24} />
            <h3>Check Your Order</h3>
            <p>Review products when your order is delivered.</p>
          </article>

          <article className="policy-highlight">
            <RotateCcw size={24} />
            <h3>Request a Return</h3>
            <p>Submit an eligible return request from your order.</p>
          </article>

          <article className="policy-highlight">
            <CreditCard size={24} />
            <h3>Refund Processing</h3>
            <p>Eligible refunds are processed after review.</p>
          </article>
        </section>

        <section className="policy-content">
          {loading ? (
            <p className="policy-message">
              Loading Return & Refund Policy...
            </p>
          ) : error ? (
            <p className="policy-message" role="alert">
              {error}
            </p>
          ) : policySections.length > 0 ? (
            policySections.map((section, index) => (
              <div
                className="policy-section"
                key={`${section.number}-${index}`}
              >
                <span className="policy-number">
                  {section.number}
                </span>

                <div>
                  <h2>{section.title}</h2>

                  {section.paragraphs.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="policy-message">
              Return & Refund Policy content is currently unavailable.
            </p>
          )}
        </section>

        <section className="policy-warning">
          <AlertCircle size={22} />

          <div>
            <h3>Important</h3>
            <p>
              Return eligibility, time limits and refund procedures should be
              finalized according to the actual products, suppliers,
              operations and business policies before production launch.
            </p>
          </div>
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">HAVE AN ISSUE?</span>
            <h2>Need help with a return or refund?</h2>
            <p>
              Visit your orders or contact support for assistance with an
              existing order.
            </p>
          </div>

          <div className="policy-contact-actions">
            <Link to="/orders" className="info-secondary-button">
              My Orders
            </Link>

            <Link to="/support" className="info-cta-button">
              Contact Support
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ReturnPolicy;
