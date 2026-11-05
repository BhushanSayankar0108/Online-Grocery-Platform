
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  UserCheck,
  ShoppingCart,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const CMS_PUBLIC_API = "http://localhost:5000/api/cms/public";

function parseTermsContent(content = "") {
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

function Terms() {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchTerms = async () => {
      try {
        const response = await fetch(CMS_PUBLIC_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load Terms & Conditions.");
        }

        const result = await response.json();

        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const activeTerms = contentItems.find(
          (item) =>
            item.title?.trim().toLowerCase() === "terms & conditions" &&
            item.status?.toLowerCase() === "active"
        );

        setTerms(activeTerms || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Terms & Conditions error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTerms();

    return () => controller.abort();
  }, []);

  const termsSections = parseTermsContent(terms?.content || "");

  return (
    <main className="info-page policy-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            <Link to="/">Home</Link> / Terms & Conditions
          </p>

          <span className="info-eyebrow">PLEASE READ</span>

          <h1>Terms & Conditions</h1>

          <p className="info-intro">
            {terms?.intro ||
              "These terms describe the general rules for using the Online Grocery platform and placing orders through it."}
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <FileText size={24} />
            <h3>Platform Use</h3>
            <p>Use the platform responsibly and lawfully.</p>
          </article>

          <article className="policy-highlight">
            <ShoppingCart size={24} />
            <h3>Orders</h3>
            <p>Review your order details before confirming.</p>
          </article>

          <article className="policy-highlight">
            <UserCheck size={24} />
            <h3>Accounts</h3>
            <p>Keep your account information accurate.</p>
          </article>
        </section>

        <section className="policy-content">
          {loading ? (
            <p className="policy-message">
              Loading Terms & Conditions...
            </p>
          ) : error ? (
            <p className="policy-message" role="alert">
              {error}
            </p>
          ) : termsSections.length > 0 ? (
            termsSections.map((section, index) => (
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
              Terms & Conditions content is currently unavailable.
            </p>
          )}
        </section>

        <section className="policy-warning">
          <AlertCircle size={22} />

          <div>
            <h3>Important</h3>
            <p>
              These are general project terms and should be reviewed and
              finalized according to the actual business, payment providers,
              delivery operations and applicable laws before production use.
            </p>
          </div>
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">NEED HELP?</span>
            <h2>Have a question about an order?</h2>
            <p>
              Our support section can help you with orders, payments and
              delivery questions.
            </p>
          </div>

          <Link to="/support" className="info-cta-button">
            Contact Support
            <ArrowRight size={17} />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default Terms;
