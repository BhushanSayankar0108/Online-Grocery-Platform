import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Eye,
  Search,
  Star,
  Trash2,
  X,
} from "lucide-react";

import "./AdminReviews.css";

const INITIAL_REVIEWS = [
  {
    id: 1,
    customer: "Rahul Sharma",
    product: "Fresh Organic Apples",
    rating: 5,
    comment:
      "Very fresh apples and good quality. Delivery was also on time.",
    date: "2026-10-01",
    status: "approved",
  },
  {
    id: 2,
    customer: "Priya Patil",
    product: "Full Cream Milk",
    rating: 4,
    comment:
      "Good product and properly packed. Overall a good experience.",
    date: "2026-10-02",
    status: "pending",
  },
  {
    id: 3,
    customer: "Amit Joshi",
    product: "Basmati Rice 5kg",
    rating: 5,
    comment:
      "The rice quality is excellent. Will definitely order again.",
    date: "2026-10-02",
    status: "approved",
  },
  {
    id: 4,
    customer: "Sneha Kulkarni",
    product: "Fresh Tomatoes",
    rating: 2,
    comment:
      "Some tomatoes were damaged when the order arrived.",
    date: "2026-10-03",
    status: "rejected",
  },
  {
    id: 5,
    customer: "Vikas More",
    product: "Whole Wheat Bread",
    rating: 4,
    comment: "Fresh bread with good packaging.",
    date: "2026-10-03",
    status: "pending",
  },
  {
    id: 6,
    customer: "Neha Deshmukh",
    product: "Alphonso Mangoes",
    rating: 5,
    comment:
      "Excellent taste and freshness. Very happy with the purchase.",
    date: "2026-10-04",
    status: "approved",
  },
];

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

function formatDate(date, options = {}) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T12:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function AdminReviews() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);

  const filteredReviews = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !search ||
        review.customer.toLowerCase().includes(search) ||
        review.product.toLowerCase().includes(search) ||
        review.comment.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" || review.status === statusFilter;

      const matchesRating =
        ratingFilter === "all" ||
        review.rating === Number(ratingFilter);

      return matchesSearch && matchesStatus && matchesRating;
    });
  }, [reviews, searchTerm, statusFilter, ratingFilter]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const pending = reviews.filter(
      (review) => review.status === "pending"
    ).length;

    const approved = reviews.filter(
      (review) => review.status === "approved"
    ).length;

    const rejected = reviews.filter(
      (review) => review.status === "rejected"
    ).length;

    const average =
      total > 0
        ? (
            reviews.reduce(
              (sum, review) => sum + review.rating,
              0
            ) / total
          ).toFixed(1)
        : "0.0";

    return {
      total,
      pending,
      approved,
      rejected,
      average,
    };
  }, [reviews]);

  const updateStatus = (id, newStatus) => {
    const review = reviews.find((item) => item.id === id);

    if (!review || review.status === newStatus) {
      return;
    }

    const actionLabel =
      newStatus === "approved"
        ? "approve"
        : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} the review from "${review.customer}"?`
    );

    if (!confirmed) {
      return;
    }

    setReviews((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSelectedReview((previous) =>
      previous?.id === id
        ? { ...previous, status: newStatus }
        : previous
    );
  };

  const deleteReview = (id) => {
    const review = reviews.find((item) => item.id === id);

    if (!review) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete the review from "${review.customer}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setReviews((previous) =>
      previous.filter((item) => item.id !== id)
    );

    setSelectedReview((previous) =>
      previous?.id === id ? null : previous
    );
  };

  const renderStars = (rating, size = 14) => (
    <div
      className="review-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((starNumber) => (
        <Star
          key={starNumber}
          size={size}
          fill={
            starNumber <= rating
              ? "currentColor"
              : "none"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setRatingFilter("all");
  };

  const openReview = (review) => {
    setSelectedReview(review);
  };

  const closeReview = () => {
    setSelectedReview(null);
  };

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-container">
        {/* Header */}
        <div className="admin-reviews-header">
          <div>
            <p className="admin-reviews-eyebrow">
              Customer Feedback
            </p>

            <h1>Reviews Management</h1>

            <p className="admin-reviews-header-text">
              Review, moderate and manage customer feedback
              for your products.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <div className="admin-reviews-stats">
          <div className="admin-reviews-stat-card">
            <div className="admin-reviews-stat-icon">
              <Star size={20} />
            </div>

            <div>
              <span>Total Reviews</span>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="admin-reviews-stat-card">
            <div className="admin-reviews-stat-icon">
              <Eye size={20} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="admin-reviews-stat-card">
            <div className="admin-reviews-stat-icon">
              <Check size={20} />
            </div>

            <div>
              <span>Approved</span>
              <strong>{stats.approved}</strong>
            </div>
          </div>

          <div className="admin-reviews-stat-card">
            <div className="admin-reviews-stat-icon">
              <Star size={20} />
            </div>

            <div>
              <span>Average Rating</span>
              <strong>{stats.average}</strong>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-reviews-toolbar">
          <div className="admin-reviews-search">
            <Search size={17} aria-hidden="true" />

            <input
              type="search"
              aria-label="Search customer reviews"
              placeholder="Search customer, product or review..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-reviews-clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="admin-reviews-filter">
            <select
              aria-label="Filter reviews by status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <ChevronDown size={16} aria-hidden="true" />
          </div>

          <div className="admin-reviews-filter">
            <select
              aria-label="Filter reviews by rating"
              value={ratingFilter}
              onChange={(event) =>
                setRatingFilter(event.target.value)
              }
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <ChevronDown size={16} aria-hidden="true" />
          </div>

          {(searchTerm ||
            statusFilter !== "all" ||
            ratingFilter !== "all") && (
            <button
              type="button"
              className="admin-reviews-reset-filters"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Reviews Table */}
        <div className="admin-reviews-table-card">
          <div className="admin-reviews-table-header">
            <div>
              <h2>Customer Reviews</h2>

              <p>
                {filteredReviews.length}{" "}
                {filteredReviews.length === 1
                  ? "review"
                  : "reviews"}{" "}
                found
              </p>
            </div>
          </div>

          <div className="admin-reviews-table-wrapper">
            <table className="admin-reviews-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.length > 0 ? (
                  filteredReviews.map((review, index) => (
                    <tr key={review.id}>
                      <td className="review-number">
                        {index + 1}
                      </td>

                      <td>
                        <div className="review-customer">
                          <div className="review-avatar">
                            {review.customer
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <strong>{review.customer}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="review-product">
                          {review.product}
                        </span>
                      </td>

                      <td>
                        <div className="review-rating-cell">
                          {renderStars(review.rating)}
                          <strong>{review.rating}</strong>
                        </div>
                      </td>

                      <td>
                        <p className="review-comment-preview">
                          {review.comment}
                        </p>
                      </td>

                      <td>
                        <span className="review-date">
                          {formatDate(review.date)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`review-status-badge ${review.status}`}
                        >
                          {STATUS_LABELS[review.status] ||
                            review.status}
                        </span>
                      </td>

                      <td>
                        <div className="review-actions">
                          <button
                            type="button"
                            className="review-view-button"
                            title="View Review"
                            aria-label={`View review from ${review.customer}`}
                            onClick={() => openReview(review)}
                          >
                            <Eye size={15} />
                          </button>

                          {review.status !== "approved" && (
                            <button
                              type="button"
                              className="review-approve-button"
                              title="Approve"
                              aria-label={`Approve review from ${review.customer}`}
                              onClick={() =>
                                updateStatus(
                                  review.id,
                                  "approved"
                                )
                              }
                            >
                              <Check size={15} />
                            </button>
                          )}

                          {review.status !== "rejected" && (
                            <button
                              type="button"
                              className="review-reject-button"
                              title="Reject"
                              aria-label={`Reject review from ${review.customer}`}
                              onClick={() =>
                                updateStatus(
                                  review.id,
                                  "rejected"
                                )
                              }
                            >
                              <X size={15} />
                            </button>
                          )}

                          <button
                            type="button"
                            className="review-delete-button"
                            title="Delete"
                            aria-label={`Delete review from ${review.customer}`}
                            onClick={() =>
                              deleteReview(review.id)
                            }
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="reviews-empty-state"
                    >
                      <Star size={36} />

                      <h3>No reviews found</h3>

                      <p>
                        Try changing your search or filters.
                      </p>

                      {(searchTerm ||
                        statusFilter !== "all" ||
                        ratingFilter !== "all") && (
                        <button
                          type="button"
                          onClick={clearFilters}
                        >
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Details Modal */}
      {selectedReview && (
        <div
          className="admin-reviews-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeReview();
            }
          }}
        >
          <div
            className="admin-reviews-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-modal-title"
          >
            <div className="admin-reviews-modal-header">
              <div>
                <p>Review Details</p>
                <h2 id="review-modal-title">
                  Customer Feedback
                </h2>
              </div>

              <button
                type="button"
                className="admin-reviews-modal-close"
                onClick={closeReview}
                aria-label="Close review details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="admin-reviews-modal-body">
              <div className="review-detail-customer">
                <div className="review-detail-avatar">
                  {selectedReview.customer
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{selectedReview.customer}</strong>
                  <span>{selectedReview.product}</span>
                </div>
              </div>

              <div className="review-detail-rating">
                <div>
                  {renderStars(selectedReview.rating, 18)}
                </div>

                <strong>
                  {selectedReview.rating} / 5
                </strong>
              </div>

              <div className="review-detail-section">
                <span>Review</span>
                <p>{selectedReview.comment}</p>
              </div>

              <div className="review-detail-grid">
                <div>
                  <span>Review Date</span>
                  <strong>
                    {formatDate(selectedReview.date, {
                      month: "long",
                    })}
                  </strong>
                </div>

                <div>
                  <span>Status</span>
                  <strong
                    className={`review-modal-status ${selectedReview.status}`}
                  >
                    {STATUS_LABELS[selectedReview.status] ||
                      selectedReview.status}
                  </strong>
                </div>
              </div>

              <div className="review-modal-actions">
                {selectedReview.status !== "approved" && (
                  <button
                    type="button"
                    className="review-modal-approve"
                    onClick={() =>
                      updateStatus(
                        selectedReview.id,
                        "approved"
                      )
                    }
                  >
                    <Check size={16} />
                    Approve
                  </button>
                )}

                {selectedReview.status !== "rejected" && (
                  <button
                    type="button"
                    className="review-modal-reject"
                    onClick={() =>
                      updateStatus(
                        selectedReview.id,
                        "rejected"
                      )
                    }
                  >
                    <X size={16} />
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  className="review-delete-button"
                  onClick={() =>
                    deleteReview(selectedReview.id)
                  }
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReviews;