import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ArrowRight } from "lucide-react";

const CMS_PUBLIC_API = "https://online-grocery-platform.onrender.com/api/cms/public";

function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const faqId = useId();

  useEffect(() => {
    const controller = new AbortController();

    const fetchFAQs = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(CMS_PUBLIC_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to fetch FAQs. Please try again later.");
        }

        const result = await response.json();

        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const activeFAQs = contentItems
          .filter(
            (item) =>
              item.type === "faq" &&
              item.status?.toLowerCase() === "active" &&
              item.title?.trim() &&
              item.content?.trim()
          )
          .sort((a, b) => {
            const orderA = Number(a.order) || 0;
            const orderB = Number(b.order) || 0;
            return orderA - orderB;
          });

        setFaqs(activeFAQs);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("FAQ loading error:", err);
          setError(err.message || "Something went wrong while loading FAQs.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFAQs();

    return () => controller.abort();
  }, []);

  const toggleFAQ = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <main className="info-page faq-page">
      <div className="info-container">
        <div className="info-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="info-breadcrumb">
            <Link to="/">Home</Link> / FAQ
          </p>

          <span className="info-eyebrow">HELP CENTER</span>

          <h1>Frequently asked questions.</h1>

          <p className="info-intro">
            Find quick answers to common questions about shopping,
            orders, delivery, payments and customer support.
          </p>
        </div>

        <section
          className="faq-list"
          aria-label="Frequently asked questions"
        >
          {loading ? (
            <div className="faq-message">
              Loading frequently asked questions...
            </div>
          ) : error ? (
            <div className="faq-message faq-error" role="alert">
              {error}
            </div>
          ) : faqs.length === 0 ? (
            <div className="faq-message">
              No frequently asked questions are available right now.
            </div>
          ) : (
            faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const questionId = `${faqId}-question-${index}`;
              const answerId = `${faqId}-answer-${index}`;

              return (
                <article
                  className={`faq-item ${isOpen ? "open" : ""}`}
                  key={faq._id || faq.id || index}
                >
                  <button
                    id={questionId}
                    type="button"
                    className="faq-question"
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span>{faq.title}</span>

                    <ChevronDown
                      size={20}
                      className="faq-chevron"
                      aria-hidden="true"
                    />
                  </button>

                  {isOpen && (
                    <div
                      id={answerId}
                      className="faq-answer"
                      role="region"
                      aria-labelledby={questionId}
                    >
                      <p>{faq.content}</p>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        <section className="info-bottom-cta">
          <div>
            <span className="info-eyebrow">STILL NEED HELP?</span>
            <h2>We're here to help.</h2>
            <p>
              Couldn't find the answer you were looking for?
              Get in touch with our support team.
            </p>
          </div>

          <Link to="/support" className="info-cta-button">
            Contact Support
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}

export default FAQ;