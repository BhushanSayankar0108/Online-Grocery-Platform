import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  LockKeyhole,
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

function PrivacyPolicy() {
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
          throw new Error("Unable to load Privacy Policy.");
        }

        const result = await response.json();
        const contentItems = Array.isArray(result.data?.contentItems)
          ? result.data.contentItems
          : [];

        const privacyPolicy = contentItems.find(
          (item) =>
            item.title?.trim().toLowerCase() === "privacy policy" &&
            item.status?.toLowerCase() === "active"
        );

        setPolicy(privacyPolicy || null);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Privacy Policy error:", err);
          setError(err.message);
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
            <Link to="/">Home</Link> / Privacy Policy
          </p>

          <span className="info-eyebrow">YOUR PRIVACY MATTERS</span>

          <h1>Privacy Policy</h1>

          <p className="info-intro">
            {policy?.intro ||
              "This policy explains how Online Grocery may collect, use and protect information provided while using the platform."}
          </p>
        </div>

        <section className="policy-highlights">
          <article className="policy-highlight">
            <ShieldCheck size={24} />
            <h3>Privacy focused</h3>
            <p>Your information should be handled responsibly.</p>
          </article>

          <article className="policy-highlight">
            <UserRound size={24} />
            <h3>Your information</h3>
            <p>Only information needed for the platform experience.</p>
          </article>

          <article className="policy-highlight">
            <LockKeyhole size={24} />
            <h3>Secure access</h3>
            <p>Account information should be protected appropriately.</p>
          </article>
        </section>

        <section className="policy-content">
          {loading ? (
            <p className="policy-message">Loading Privacy Policy...</p>
          ) : error ? (
            <p className="policy-message" role="alert">
              {error}
            </p>
          ) : policySections.length > 0 ? (
            policySections.map((section, index) => (
              <div className="policy-section" key={`${section.number}-${index}`}>
                <span className="policy-number">{section.number}</span>

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
              Privacy Policy content is currently unavailable.
            </p>
          )}
        </section>

        <section className="policy-contact">
          <div>
            <span className="info-eyebrow">QUESTIONS?</span>
            <h2>Need help with your privacy or account?</h2>
            <p>
              Contact our support team for questions about your account or
              personal information.
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

export default PrivacyPolicy;