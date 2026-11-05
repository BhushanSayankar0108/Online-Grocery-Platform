
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RotateCcw,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const STATUS_CONFIG = {
  pending: {
    label: "Pending Review",
    icon: Clock,
    className: "pending",
  },
  approved: {
    label: "Approved",
    icon: CheckCircle,
    className: "approved",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "rejected",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    className: "completed",
  },
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const styles = `
.my-returns-page {
  min-height: 75vh;
  background: #f8fafc;
  padding: 45px 20px 65px;
  color: #1e293b;
}

.my-returns-container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
}

.my-returns-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 28px;
  transition: color .2s ease;
}

.my-returns-back:hover {
  color: #15803d;
}

.my-returns-heading-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.my-returns-eyebrow {
  display: block;
  color: #16a34a;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.5px;
  margin-bottom: 9px;
}

.my-returns-heading-row h1 {
  font-size: clamp(25px, 4vw, 34px);
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 9px;
}

.my-returns-heading-row p {
  color: #64748b;
  font-size: 15px;
  margin: 0;
}

.my-returns-refresh {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 17px;
  border: 1px solid #dbe4df;
  border-radius: 9px;
  background: white;
  color: #166534;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.my-returns-refresh:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.my-returns-spinning {
  animation: myReturnsSpin 1s linear infinite;
}

@keyframes myReturnsSpin {
  to { transform: rotate(360deg); }
}

.my-returns-error {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 22px;
  font-size: 14px;
}

.my-returns-error span {
  flex: 1;
}

.my-returns-error button {
  border: none;
  background: transparent;
  color: #991b1b;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.my-returns-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 28px;
}

.my-returns-summary > div {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.my-returns-summary span {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.my-returns-summary strong {
  font-size: 27px;
  color: #0f172a;
  font-weight: 800;
}

.my-returns-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.my-return-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, .035);
}

.my-return-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding-bottom: 20px;
  border-bottom: 1px solid #edf0f4;
}

.my-return-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1px;
}

.my-return-card-header h2 {
  margin: 6px 0 0;
  font-size: 17px;
  color: #0f172a;
  font-weight: 800;
  word-break: break-word;
}

.my-return-status {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.my-return-status.pending {
  background: #fff7ed;
  color: #c2410c;
}

.my-return-status.approved {
  background: #eff6ff;
  color: #1d4ed8;
}

.my-return-status.rejected {
  background: #fef2f2;
  color: #b91c1c;
}

.my-return-status.completed {
  background: #f0fdf4;
  color: #15803d;
}

.my-return-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  padding: 22px 0;
}

.my-return-info-grid > div {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.my-return-info-grid span,
.my-return-description > span {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 700;
}

.my-return-info-grid strong {
  font-size: 14px;
  color: #334155;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.my-return-description,
.my-return-admin-note {
  padding: 15px;
  border-radius: 9px;
  margin-bottom: 14px;
}

.my-return-description {
  background: #f8fafc;
}

.my-return-description p,
.my-return-admin-note p {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
  margin: 7px 0 0;
  overflow-wrap: anywhere;
}

.my-return-admin-note {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
}

.my-return-admin-note strong {
  font-size: 13px;
  color: #166534;
}

.my-return-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid #edf0f4;
}

.my-return-footer > span:first-child {
  font-size: 12px;
  color: #94a3b8;
}

.my-return-status-message {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}

.my-returns-empty {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 35px 20px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
}

.my-returns-empty-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #16a34a;
  margin-bottom: 18px;
}

.my-returns-empty h2 {
  color: #0f172a;
  font-size: 21px;
  margin: 0 0 10px;
}

.my-returns-empty p {
  max-width: 450px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.7;
  margin: 0 0 20px;
}

.my-returns-primary-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: #15803d;
  color: white;
  padding: 12px 22px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: background .2s ease;
}

.my-returns-primary-button:hover {
  background: #166534;
}

.my-returns-bottom-link {
  display: flex;
  justify-content: center;
  margin-top: 28px;
}

.my-returns-bottom-link a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #15803d;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
}

.my-returns-bottom-link a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .my-returns-page {
    padding: 30px 15px 45px;
  }

  .my-returns-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .my-return-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .my-return-card {
    padding: 18px;
  }
}

@media (max-width: 480px) {
  .my-returns-heading-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .my-returns-refresh {
    align-self: flex-start;
  }

  .my-return-card-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .my-return-info-grid {
    grid-template-columns: 1fr 1fr;
    gap: 18px 12px;
  }

  .my-returns-summary > div {
    padding: 15px;
  }

  .my-returns-summary strong {
    font-size: 23px;
  }

  .my-return-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .my-returns-error {
    align-items: flex-start;
    flex-wrap: wrap;
  }
}
`;

function MyReturns({ customer }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const timerId = window.setTimeout(async () => {
      try {
        if (!customer?.token) {
          throw new Error("Please log in to view your return requests.");
        }

        const response = await fetch(`${API_ROOT}/returns/customer`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${customer.token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (!response.ok || data.success === false) {
          throw new Error(
            data.message || "Unable to load your return requests."
          );
        }

        if (!cancelled) {
          setRequests(Array.isArray(data.requests) ? data.requests : []);
          setError("");
        }
      } catch (err) {
        console.error("My returns error:", err);

        if (!cancelled) {
          setError(err.message || "Unable to load return requests.");
          setRequests([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [customer?.token, refreshKey]);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey((previous) => previous + 1);
  };

  const handleRetry = () => {
    setLoading(true);
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  if (!customer) {
    return (
      <>
        <style>{styles}</style>
        <main className="my-returns-page">
          <div className="my-returns-container">
            <div className="my-returns-empty">
              <Package size={42} />
              <h2>Please log in first</h2>
              <p>Log in to view your return and refund requests.</p>
              <Link to="/login" className="my-returns-primary-button">
                Login / Sign Up
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <main className="my-returns-page">
        <div className="my-returns-container">
          <header className="my-returns-header">
            <Link to="/account" className="my-returns-back">
              <ArrowLeft size={17} />
              Back to Account
            </Link>

            <div className="my-returns-heading-row">
              <div>
                <span className="my-returns-eyebrow">
                  CUSTOMER SERVICE
                </span>
                <h1>My Returns &amp; Refunds</h1>
                <p>
                  Track the status of your return and refund requests.
                </p>
              </div>

              <button
                type="button"
                className="my-returns-refresh"
                onClick={handleRefresh}
                disabled={loading || refreshing}
              >
                <RefreshCw
                  size={16}
                  className={refreshing ? "my-returns-spinning" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </header>

          {error && (
            <div className="my-returns-error" role="alert">
              <AlertCircle size={19} />
              <span>{error}</span>
              <button type="button" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          )}

          {loading ? (
            <div className="my-returns-empty">
              <RefreshCw
                size={30}
                className="my-returns-spinning"
              />
              <p>Loading your return requests...</p>
            </div>
          ) : !error && requests.length === 0 ? (
            <div className="my-returns-empty">
              <div className="my-returns-empty-icon">
                <RotateCcw size={35} />
              </div>

              <h2>No Return Requests Yet</h2>
              <p>
                You haven't submitted any return or refund requests.
                Your requests will appear here.
              </p>

              <Link
                to="/orders"
                className="my-returns-primary-button"
              >
                View My Orders
              </Link>
            </div>
          ) : (
            <>
              <div className="my-returns-summary">
                <div>
                  <span>Total Requests</span>
                  <strong>{requests.length}</strong>
                </div>

                <div>
                  <span>Pending</span>
                  <strong>
                    {requests.filter((r) => r.status === "pending").length}
                  </strong>
                </div>

                <div>
                  <span>Approved</span>
                  <strong>
                    {requests.filter((r) => r.status === "approved").length}
                  </strong>
                </div>

                <div>
                  <span>Completed</span>
                  <strong>
                    {requests.filter((r) => r.status === "completed").length}
                  </strong>
                </div>
              </div>

              <div className="my-returns-list">
                {requests.map((request) => {
                  const status =
                    STATUS_CONFIG[
                      String(request.status || "pending").toLowerCase()
                    ] || STATUS_CONFIG.pending;

                  const StatusIcon = status.icon;

                  return (
                    <article
                      className="my-return-card"
                      key={request._id}
                    >
                      <div className="my-return-card-header">
                        <div>
                          <span className="my-return-label">
                            REQUEST ID
                          </span>
                          <h2>{request.requestNumber || "—"}</h2>
                        </div>

                        <span
                          className={`my-return-status ${status.className}`}
                        >
                          <StatusIcon size={15} />
                          {status.label}
                        </span>
                      </div>

                      <div className="my-return-info-grid">
                        <div>
                          <span>Order ID</span>
                          <strong>{request.orderNumber || "—"}</strong>
                        </div>

                        <div>
                          <span>Product</span>
                          <strong>
                            {request.productName || "Product"}
                          </strong>
                        </div>

                        <div>
                          <span>Quantity</span>
                          <strong>{request.quantity || 1}</strong>
                        </div>

                        <div>
                          <span>Return Reason</span>
                          <strong>{request.reason || "—"}</strong>
                        </div>

                        <div>
                          <span>Request Date</span>
                          <strong>{formatDate(request.createdAt)}</strong>
                        </div>
                      </div>

                      {request.description && (
                        <div className="my-return-description">
                          <span>Your Description</span>
                          <p>{request.description}</p>
                        </div>
                      )}

                      {request.adminNote && (
                        <div className="my-return-admin-note">
                          <strong>Update from our team</strong>
                          <p>{request.adminNote}</p>
                        </div>
                      )}

                      <div className="my-return-footer">
                        <span>
                          Last updated: {formatDate(request.updatedAt)}
                        </span>

                        {request.status === "pending" && (
                          <span className="my-return-status-message">
                            Your request is waiting for admin review.
                          </span>
                        )}

                        {request.status === "approved" && (
                          <span className="my-return-status-message">
                            Your request has been approved.
                          </span>
                        )}

                        {request.status === "rejected" && (
                          <span className="my-return-status-message">
                            Your request has been rejected.
                          </span>
                        )}

                        {request.status === "completed" && (
                          <span className="my-return-status-message">
                            Your return request has been completed.
                          </span>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          <div className="my-returns-bottom-link">
            <Link to="/orders">
              <Package size={17} />
              View My Orders
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export default MyReturns;
