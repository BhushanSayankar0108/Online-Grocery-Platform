
import { useCallback, useEffect, useState } from "react";
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

const API_BASE_URL = "http://localhost:5000/api/reviews";

const STATUS_LABELS = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
};

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  average: 0,
};

function formatDate(date, options = {}) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

async function apiRequest(url, options = {}) {
  const token = localStorage.getItem("adminToken");

  if (!token) {
    throw new Error("Admin session not found. Please log in again.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        data.message || "Access denied. Check your admin login and Reviews permission."
      );
    }

    throw new Error(data.message || "The request could not be completed.");
  }

  return data;
}

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }

      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (ratingFilter !== "all") {
        params.set("rating", ratingFilter);
      }

      const query = params.toString();
      const url = `${API_BASE_URL}/admin${query ? `?${query}` : ""}`;

      const data = await apiRequest(url);

      const fetchedReviews = Array.isArray(data.reviews)
        ? data.reviews
        : [];

      setReviews(fetchedReviews);
      setStats({
        ...EMPTY_STATS,
        ...(data.stats || {}),
        average: Number(data.stats?.average || 0).toFixed(1),
      });

      setSelectedReview((current) => {
        if (!current) return null;

        return (
          fetchedReviews.find((review) => review.id === current.id) || null
        );
      });
    } catch (err) {
      setError(err.message || "Failed to load reviews.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, ratingFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviews();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadReviews]);

  const renderStars = (rating, size = 14) => (
    <div
      className="review-stars"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={size}
          fill={number <= rating ? "currentColor" : "none"}
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

  const updateStatus = async (id, newStatus) => {
    const review = reviews.find((item) => item.id === id);

    if (!review || review.status === newStatus || actionLoading) return;

    const actionLabel = newStatus === "approved" ? "approve" : "reject";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} the review from "${review.customer}"?`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`${API_BASE_URL}/admin/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      setNotice(data.message || "Review status updated successfully.");
      await loadReviews();
    } catch (err) {
      setError(err.message || "Failed to update review status.");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteReview = async (id) => {
    const review = reviews.find((item) => item.id === id);

    if (!review || actionLoading) return;

    if (
      !window.confirm(
        `Are you sure you want to permanently delete the review from "${review.customer}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const data = await apiRequest(`${API_BASE_URL}/admin/${id}`, {
        method: "DELETE",
      });

      setSelectedReview((current) =>
        current?.id === id ? null : current
      );

      setNotice(data.message || "Review deleted successfully.");
      await loadReviews();
    } catch (err) {
      setError(err.message || "Failed to delete review.");
    } finally {
      setActionLoading(false);
    }
  };

  const openReview = (review) => setSelectedReview(review);
  const closeReview = () => setSelectedReview(null);

  return (
    <div className="admin-reviews-page">
      <div className="admin-reviews-container">
        <div className="admin-reviews-header">
          <div>
            <p className="admin-reviews-eyebrow">Customer Feedback</p>
            <h1>Reviews Management</h1>
            <p className="admin-reviews-header-text">
              Review, moderate and manage customer feedback for your products.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              borderRadius: 8,
              background: "#fef2f2",
              color: "#b91c1c",
              fontSize: 13,
            }}
          >
            {error}
            <button
              type="button"
              onClick={loadReviews}
              style={{
                marginLeft: 12,
                border: 0,
                background: "transparent",
                color: "inherit",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              marginBottom: 16,
              borderRadius: 8,
              background: "#ecfdf3",
              color: "#15803d",
              fontSize: 13,
            }}
          >
            {notice}
          </div>
        )}

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

        <div className="admin-reviews-toolbar">
          <div className="admin-reviews-search">
            <Search size={17} aria-hidden="true" />

            <input
              type="search"
              aria-label="Search customer reviews"
              placeholder="Search customer, product or review..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
              onChange={(event) => setStatusFilter(event.target.value)}
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
              onChange={(event) => setRatingFilter(event.target.value)}
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

        <div className="admin-reviews-table-card">
          <div className="admin-reviews-table-header">
            <div>
              <h2>Customer Reviews</h2>
              <p>
                {loading
                  ? "Loading reviews..."
                  : `${reviews.length} ${
                      reviews.length === 1 ? "review" : "reviews"
                    } found`}
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
                {loading ? (
                  <tr>
                    <td colSpan={8} className="reviews-empty-state">
                      Loading reviews from the server...
                    </td>
                  </tr>
                ) : reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <tr key={review.id}>
                      <td className="review-number">{index + 1}</td>

                      <td>
                        <div className="review-customer">
                          <div className="review-avatar">
                            {(review.customer || "?")
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
                          {review.comment || "No written comment"}
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
                          {STATUS_LABELS[review.status] || review.status}
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
                              disabled={actionLoading}
                              onClick={() =>
                                updateStatus(review.id, "approved")
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
                              disabled={actionLoading}
                              onClick={() =>
                                updateStatus(review.id, "rejected")
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
                            disabled={actionLoading}
                            onClick={() => deleteReview(review.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="reviews-empty-state">
                      <Star size={36} />
                      <h3>No reviews found</h3>
                      <p>
                        {error
                          ? "Check the error message above and try again."
                          : "No reviews match your current search or filters."}
                      </p>
                      {(searchTerm ||
                        statusFilter !== "all" ||
                        ratingFilter !== "all") && (
                        <button type="button" onClick={clearFilters}>
                          Clear filters
                        </button>
                      )}
                      {!error && (
                        <button
                          type="button"
                          onClick={loadReviews}
                          style={{ marginLeft: 8 }}
                        >
                          Refresh
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

      {selectedReview && (
        <div
          className="admin-reviews-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeReview();
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
                <h2 id="review-modal-title">Customer Feedback</h2>
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
                  {(selectedReview.customer || "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>{selectedReview.customer}</strong>
                  <span>{selectedReview.product}</span>
                </div>
              </div>

              <div className="review-detail-rating">
                <div>{renderStars(selectedReview.rating, 18)}</div>
                <strong>{selectedReview.rating} / 5</strong>
              </div>

              <div className="review-detail-section">
                <span>Review</span>
                <p>{selectedReview.comment || "No written comment."}</p>
              </div>

              <div className="review-detail-grid">
                <div>
                  <span>Review Date</span>
                  <strong>
                    {formatDate(selectedReview.date, { month: "long" })}
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
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus(selectedReview.id, "approved")
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
                    disabled={actionLoading}
                    onClick={() =>
                      updateStatus(selectedReview.id, "rejected")
                    }
                  >
                    <X size={16} />
                    Reject
                  </button>
                )}

                <button
                  type="button"
                  className="review-delete-button"
                  disabled={actionLoading}
                  onClick={() => deleteReview(selectedReview.id)}
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
