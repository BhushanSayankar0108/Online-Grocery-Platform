
import { useEffect, useState } from "react";
import { ArrowRight, Mail } from "lucide-react";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// --------------------------------------------------
// NEWSLETTER COMPONENT
// --------------------------------------------------

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sectionActive, setSectionActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // --------------------------------------------------
  // LOAD NEWSLETTER CMS STATUS
  // --------------------------------------------------

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
          throw new Error(
            result.message || "Unable to load CMS sections."
          );
        }

        const sections = Array.isArray(result?.data?.sections)
          ? result.data.sections
          : [];

        const newsletterSection = sections.find(
          (section) =>
            String(section?.name ?? section?.title ?? "")
              .trim()
              .toLowerCase() === "newsletter"
        );

        if (!cancelled) {
          setSectionActive(
            sections.length === 0
              ? true
              : Boolean(newsletterSection)
          );
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Unable to load Newsletter CMS status:",
            error.message
          );
        }

        if (!cancelled) {
          // Keep the section visible if CMS is unavailable.
          setSectionActive(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCMSSection();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // HANDLE NEWSLETTER SUBSCRIPTION
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage("Please enter your email address.");
      setMessageType("error");
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      setMessage("");
      setMessageType("");

      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: cleanEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || "Unable to subscribe. Please try again."
        );
      }

      setMessage(
        result.message || "Thank you for subscribing to our newsletter!"
      );
      setMessageType("success");
      setEmail("");
    } catch (error) {
      console.error("Newsletter subscription error:", error);

      setMessage(
        error.message ||
          "Something went wrong. Please try again later."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !sectionActive) {
    return null;
  }

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <section className="newsletter-section">
      <div className="newsletter-content">

        <div className="newsletter-copy">
          <div className="newsletter-label">
            <Mail size={15} />
            <span>STAY IN THE LOOP</span>
          </div>

          <h2>
            Fresh deals,
            <br />
            straight to your inbox.
          </h2>

          <p>
            Get updates about new products, useful offers,
            and grocery deals worth checking out.
          </p>
        </div>

        <div className="newsletter-action">
          <form
            className="newsletter-form"
            onSubmit={handleSubmit}
          >
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setMessage("");
                setMessageType("");
              }}
              aria-label="Email address"
              autoComplete="email"
              maxLength={150}
              required
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Subscribing..." : "Subscribe"}
              {!submitting && <ArrowRight size={16} />}
            </button>
          </form>

          {message && (
  <div
    role="status"
    aria-live="polite"
    style={{
      display: "block",
      marginTop: "12px",
      padding: "12px 15px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      color: messageType === "success" ? "#166534" : "#b91c1c",
      backgroundColor:
        messageType === "success" ? "#dcfce7" : "#fee2e2",
      border:
        messageType === "success"
          ? "1px solid #86efac"
          : "1px solid #fca5a5",
    }}
  >
    {message}
  </div>
)}

          <span className="newsletter-note">
            No spam. Only useful grocery updates.
          </span>
        </div>

      </div>
    </section>
  );
}

export default Newsletter;
