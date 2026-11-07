
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const REVIEWS_API = `${API_BASE_URL}/api/reviews/public`;

// --------------------------------------------------
// HELPER: EXTRACT REVIEWS FROM API RESPONSE
// --------------------------------------------------

function getReviewList(result) {
  if (Array.isArray(result)) return result;

  if (Array.isArray(result?.reviews)) {
    return result.reviews;
  }

  if (Array.isArray(result?.data?.reviews)) {
    return result.data.reviews;
  }

  if (Array.isArray(result?.data)) {
    return result.data;
  }

  if (Array.isArray(result?.data?.data)) {
    return result.data.data;
  }

  return [];
}

// --------------------------------------------------
// HELPER: GET CUSTOMER NAME
// --------------------------------------------------

function getCustomerName(review) {
  if (typeof review?.customer === "string") {
    return review.customer;
  }

  return (
    review?.customerName ||
    review?.customer?.fullName ||
    review?.customer?.name ||
    review?.customer?.username ||
    review?.user?.fullName ||
    review?.user?.name ||
    review?.name ||
    "Customer"
  );
}

// --------------------------------------------------
// HELPER: NORMALIZE REVIEW
// --------------------------------------------------

function normalizeReview(review, index) {
  return {
    ...review,

    id:
      review?.id ??
      review?._id ??
      review?.reviewId ??
      `review-${index}`,

    customer: getCustomerName(review),

    rating: Math.min(
      5,
      Math.max(0, Number(review?.rating) || 0)
    ),

    comment:
      review?.comment ||
      review?.review ||
      review?.description ||
      "",
  };
}

// --------------------------------------------------
// CUSTOMER REVIEWS COMPONENT
// --------------------------------------------------

function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState("0.0");
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // FETCH APPROVED PUBLIC REVIEWS
  // --------------------------------------------------

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const fetchReviews = async () => {
      try {
        const response = await fetch(REVIEWS_API, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Reviews API returned ${response.status}`
          );
        }

        const result = await response.json();

        if (result?.success === false) {
          throw new Error(
            result.message || "Unable to load customer reviews."
          );
        }

        const fetchedReviews = getReviewList(result)
          .filter(
            (review) =>
              review && typeof review === "object"
          )
          .map(normalizeReview)
          .filter(
            (review) =>
              review.rating > 0 &&
              review.rating <= 5
          );

        // Use API average when provided.
        // Otherwise calculate average from returned reviews.
        const apiAverage =
          result?.average ??
          result?.data?.average ??
          result?.data?.data?.average;

        const calculatedAverage =
          fetchedReviews.length > 0
            ? fetchedReviews.reduce(
                (total, review) => total + review.rating,
                0
              ) / fetchedReviews.length
            : 0;

        const finalAverage =
          apiAverage !== null &&
          apiAverage !== undefined &&
          Number.isFinite(Number(apiAverage))
            ? Number(apiAverage)
            : calculatedAverage;

        if (!cancelled) {
          setReviews(fetchedReviews);
          setAverage(finalAverage.toFixed(1));
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error(
            "Customer reviews error:",
            error.message
          );

          if (!cancelled) {
            setReviews([]);
            setAverage("0.0");
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReviews();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  // --------------------------------------------------
  // RENDER STARS
  // --------------------------------------------------

  const renderStars = (rating) =>
    [1, 2, 3, 4, 5].map((number) => (
      <Star
        key={number}
        size={15}
        fill={
          number <= Math.round(Number(rating))
            ? "currentColor"
            : "none"
        }
        strokeWidth={1.8}
      />
    ));

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <section className="reviews-section">

      {/* SECTION HEADING */}
      <div className="section-heading reviews-heading">
        <div>
          <p>WHAT OUR CUSTOMERS SAY</p>
          <h2>
            Shopping made better for everyday needs.
          </h2>
        </div>
      </div>

      {/* REVIEWS SUMMARY */}
      <div className="reviews-summary">
        <div className="reviews-average">
          <strong>{average}</strong>

          <div>
            <div
              className="reviews-summary-stars"
              aria-label={`Average rating: ${average} out of 5`}
            >
              {renderStars(Number(average))}
            </div>

            <span>Customer love</span>
          </div>
        </div>

        <span className="reviews-summary-caption">
          Freshness • Quality • Convenience
        </span>
      </div>

      {/* REVIEWS LIST */}
      <div className="reviews-list">

        {loading ? (
          <p>Loading customer reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <article
              className="review-card"
              key={review.id}
            >
              <div className="review-top">
                <div
                  className="review-rating"
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {renderStars(review.rating)}
                </div>

                <Quote
                  className="review-quote"
                  size={22}
                  strokeWidth={1.5}
                />
              </div>

              <p className="review-text">
                {review.comment ||
                  "Great shopping experience!"}
              </p>

              <div className="review-customer">
                <div className="review-avatar">
                  {review.customer
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <h3>{review.customer}</h3>
                  <span>Customer review</span>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p>No customer reviews available yet.</p>
        )}

      </div>
    </section>
  );
}

export default CustomerReviews;
