
import { useEffect, useState } from "react";
import { Send, Star } from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "") + "/api/reviews";

function getCustomerToken() {
  try {
    const localSession = JSON.parse(
      localStorage.getItem("customerSession") || "null"
    );

    if (localSession?.token) return localSession.token;
  } catch (error) {
    console.error("Unable to read customer session:", error);
  }

  try {
    const session = JSON.parse(
      sessionStorage.getItem("customerSession") || "null"
    );

    if (session?.token) return session.token;
  } catch (error) {
    console.error("Unable to read temporary customer session:", error);
  }

  return (
    localStorage.getItem("customerToken") ||
    sessionStorage.getItem("customerToken") ||
    ""
  );
}

const styles = {
  section: {
    width: "100%",
    maxWidth: 1200,
    margin: "40px auto",
    padding: 28,
    boxSizing: "border-box",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    color: "#1f2937",
    fontFamily: "Arial, sans-serif",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 20,
    marginBottom: 28,
  },
  eyebrow: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    margin: "0 0 8px",
  },
  title: {
    fontSize: 28,
    margin: "0 0 8px",
    color: "#111827",
  },
  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: 14,
  },
  summary: {
    minWidth: 120,
    textAlign: "center",
    padding: 16,
    borderRadius: 12,
    background: "#f0fdf4",
  },
  average: {
    display: "block",
    fontSize: 26,
    color: "#15803d",
    fontWeight: 700,
  },
  summaryText: {
    color: "#6b7280",
    fontSize: 13,
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 0.9fr) minmax(0, 1.1fr)",
    gap: 28,
    alignItems: "start",
  },
  form: {
    padding: 22,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    minWidth: 0,
  },
  heading: {
    fontSize: 20,
    margin: "0 0 20px",
  },
  label: {
    display: "block",
    fontWeight: 600,
    fontSize: 14,
    margin: "18px 0 10px",
  },
  textarea: {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    padding: 12,
    border: "1px solid #d1d5db",
    borderRadius: 8,
    resize: "vertical",
    font: "inherit",
    background: "#fff",
  },
  submit: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    marginTop: 18,
    padding: "13px 16px",
    background: "#15803d",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
  },
  note: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.6,
    margin: "14px 0 0",
  },
  error: {
    color: "#b91c1c",
    background: "#fef2f2",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
    overflowWrap: "anywhere",
  },
  success: {
    color: "#166534",
    background: "#f0fdf4",
    borderRadius: 6,
    padding: 10,
    fontSize: 13,
  },
  reviewList: {
    minWidth: 0,
  },
  reviewCard: {
    padding: "18px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  reviewHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  reviewComment: {
    color: "#4b5563",
    lineHeight: 1.7,
    overflowWrap: "anywhere",
    whiteSpace: "pre-wrap",
  },
  date: {
    color: "#9ca3af",
    fontSize: 12,
  },
  empty: {
    padding: 30,
    textAlign: "center",
    background: "#f9fafb",
    borderRadius: 10,
    color: "#6b7280",
  },
};

export default function ProductReviewSection({ productId }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(Boolean(productId));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!productId) return undefined;

    let cancelled = false;

    async function fetchReviews() {
      try {
        const response = await fetch(
          `${API_URL}/product/${encodeURIComponent(productId)}`
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || "Unable to load reviews.");
        }

        if (!cancelled) {
          setReviews(Array.isArray(data.reviews) ? data.reviews : []);
          setAverage(Number(data.average) || 0);
          setTotal(Number(data.total) || 0);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchReviews();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    const token = getCustomerToken();

    if (!token) {
      setError("Please log in before submitting a review.");
      return;
    }

    if (!productId) {
      setError("Product information is unavailable. Please refresh.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    if (comment.trim().length > 2000) {
      setError("Your comment cannot exceed 2000 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Unable to submit your review.");
      }

      setMessage(
        data.message ||
          "Review submitted successfully. It will appear after admin approval."
      );

      setRating(0);
      setComment("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="prs-responsive-section" style={styles.section}>
      <style>{`
        @media (max-width: 700px) {
          .prs-responsive-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .prs-responsive-section {
            padding: 18px !important;
          }
        }
      `}</style>

      <div style={styles.titleRow}>
        <div>
          <p style={styles.eyebrow}>YOUR FEEDBACK MATTERS</p>
          <h2 style={styles.title}>Customer Reviews</h2>
          <p style={styles.subtitle}>
            Share your experience with this product.
          </p>
        </div>

        <div style={styles.summary}>
          <strong style={styles.average}>
            {average.toFixed(1)} / 5
          </strong>
          <span style={styles.summaryText}>
            {total} {total === 1 ? "review" : "reviews"}
          </span>
        </div>
      </div>

      <div className="prs-responsive-layout" style={styles.layout}>
        <form style={styles.form} onSubmit={handleSubmit}>
          <h3 style={styles.heading}>Write a Review</h3>

          <label style={styles.label}>Rate this product</label>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 5,
            }}
          >
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rate ${value} stars`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                  padding: 3,
                  color: value <= rating ? "#f59e0b" : "#9ca3af",
                }}
              >
                <Star
                  size={29}
                  fill={value <= rating ? "currentColor" : "none"}
                />
              </button>
            ))}

            <span style={{ fontSize: 13, color: "#6b7280" }}>
              {rating ? `${rating}/5 selected` : "Select stars"}
            </span>
          </div>

          <label htmlFor="prs-comment" style={styles.label}>
            Your comment (optional)
          </label>

          <textarea
            id="prs-comment"
            rows={5}
            maxLength={2000}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="How was the quality, freshness and overall experience?"
            style={styles.textarea}
          />

          <div
            style={{
              textAlign: "right",
              fontSize: 12,
              color: "#6b7280",
            }}
          >
            {comment.length}/2000
          </div>

          {error && (
            <p role="alert" style={styles.error}>
              {error}
            </p>
          )}

          {message && (
            <p role="status" style={styles.success}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              ...styles.submit,
              opacity: submitting ? 0.65 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            <Send size={17} />
            {submitting ? "Submitting..." : "Submit Review"}
          </button>

          <p style={styles.note}>
            You must have a delivered order containing this product to
            submit a review. Reviews appear publicly after admin approval.
          </p>
        </form>

        <div style={styles.reviewList}>
          <h3 style={styles.heading}>What customers say</h3>

          {!productId ? (
            <p style={styles.error}>
              Product information is unavailable.
            </p>
          ) : loading ? (
            <p>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div style={styles.empty}>
              <Star size={30} />
              <p>No approved reviews yet.</p>
              <span>Be the first to share your experience!</span>
            </div>
          ) : (
            reviews.map((review, index) => {
              const stars = Math.min(
                5,
                Math.max(0, Number(review.rating) || 0)
              );

              return (
                <article
                  style={styles.reviewCard}
                  key={review.id || review._id || index}
                >
                  <div style={styles.reviewHeading}>
                    <strong>
                      {typeof review.customer === "string"
                        ? review.customer
                        : review.customer?.name ||
                          review.customer?.fullName ||
                          "Customer"}
                    </strong>

                    <span
                      aria-label={`${stars} out of 5 stars`}
                      style={{ color: "#f59e0b", letterSpacing: 2 }}
                    >
                      {"★".repeat(stars)}
                      {"☆".repeat(5 - stars)}
                    </span>
                  </div>

                  {review.comment && (
                    <p style={styles.reviewComment}>
                      {review.comment}
                    </p>
                  )}

                  <small style={styles.date}>
                    {review.createdAt || review.date
                      ? new Date(
                          review.createdAt || review.date
                        ).toLocaleDateString("en-IN")
                      : ""}
                  </small>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
