
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  X,
  AlertCircle,
  Package,
} from "lucide-react";
import "./AdminReturns.css";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const RETURNS_API = `${API_ROOT}/returns`;

/* =========================================================
   CONSTANTS
========================================================= */

const STATUS_OPTIONS = [
  { value: "all", label: "All Requests" },
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "completed", label: "Completed" },
];

/* =========================================================
   HELPER FUNCTIONS
========================================================= */

const getToken = () => {
  try {
    return (
      localStorage.getItem("adminToken") ||
      sessionStorage.getItem("adminToken") ||
      ""
    );
  } catch {
    return "";
  }
};

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || fallback;

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

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending Review",
    approved: "Approved",
    rejected: "Rejected",
    completed: "Completed",
  };

  return (
    labels[String(status || "").toLowerCase()] ||
    status ||
    "Unknown"
  );
};

const getCustomerName = (request) =>
  request.customerName || request.customer?.name || "Customer";

const getCustomerEmail = (request) =>
  request.customerEmail || request.customer?.email || "—";

const getCustomerMobile = (request) =>
  request.customerMobile || request.customer?.mobile || "—";

/* =========================================================
   ADMIN RETURNS COMPONENT
========================================================= */

function AdminReturns() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [updatingId, setUpdatingId] = useState("");

  /* =======================================================
     LOAD RETURN REQUESTS
  ======================================================= */

  const loadRequests = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin token not found. Please sign in again."
        );
      }

      const response = await fetch(`${RETURNS_API}/admin`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Admin session is invalid or you do not have Orders permission."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          getErrorMessage(data, "Unable to load return requests.")
        );
      }

      const records = Array.isArray(data.requests)
        ? data.requests
        : [];

      setRequests(records);

      // Keep the details modal synchronized after refreshing.
      setSelectedRequest((previous) => {
        if (!previous) return null;

        return (
          records.find(
            (item) => item._id === previous._id
          ) || null
        );
      });
    } catch (err) {
      console.error("Load return requests error:", err);

      setError(
        err.message || "Unable to load return requests."
      );

      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD

     setTimeout avoids the synchronous setState-in-effect
     ESLint warning, following the existing AdminOrders pattern.
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const timerId = setTimeout(() => {
      if (!cancelled) {
        loadRequests();
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [loadRequests]);

  /* =======================================================
     FILTER RETURN REQUESTS
  ======================================================= */

  const filteredRequests = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus =
        selectedStatus === "all" ||
        String(request.status || "").toLowerCase() ===
          selectedStatus;

      const searchableText = [
        request.requestNumber,
        request.orderNumber,
        getCustomerName(request),
        getCustomerEmail(request),
        getCustomerMobile(request),
        request.productName,
        request.reason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!search || searchableText.includes(search))
      );
    });
  }, [requests, searchTerm, selectedStatus]);

  /* =======================================================
     DASHBOARD COUNTS
  ======================================================= */

  const counts = useMemo(
    () => ({
      total: requests.length,

      pending: requests.filter(
        (item) => item.status === "pending"
      ).length,

      approved: requests.filter(
        (item) => item.status === "approved"
      ).length,

      completed: requests.filter(
        (item) => item.status === "completed"
      ).length,

      rejected: requests.filter(
        (item) => item.status === "rejected"
      ).length,
    }),
    [requests]
  );

  /* =======================================================
     UPDATE RETURN REQUEST STATUS
  ======================================================= */

  const updateRequestStatus = async (request, status) => {
    const requestId = String(request?._id || "");

    if (!requestId || updatingId) return;

    const actionLabel =
      status === "approved"
        ? "approve"
        : status === "rejected"
          ? "reject"
          : "mark this request as completed";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel}?`
    );

    if (!confirmed) return;

    setUpdatingId(requestId);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session missing. Please sign in again."
        );
      }

      const adminNote =
        adminNotes[requestId] ??
        request.adminNote ??
        "";

      const response = await fetch(
        `${RETURNS_API}/admin/${encodeURIComponent(
          requestId
        )}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            status,
            adminNote,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Your admin session is invalid or you do not have Orders permission."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(
          getErrorMessage(data, "Unable to update return request.")
        );
      }

      await loadRequests(true);

      window.alert(
        data.message ||
          "Return request updated successfully."
      );
    } catch (err) {
      console.error("Update return request error:", err);

      window.alert(
        err.message || "Unable to update return request."
      );
    } finally {
      setUpdatingId("");
    }
  };

  /* =======================================================
     ADMIN NOTE HANDLERS
  ======================================================= */

  const updateNote = (requestId, value) => {
    setAdminNotes((previous) => ({
      ...previous,
      [requestId]: value,
    }));
  };

  const getNoteValue = (request) =>
    adminNotes[request._id] ??
    request.adminNote ??
    "";

  /* =======================================================
     OPEN / CLOSE DETAILS
  ======================================================= */

  const openRequestDetails = (request) => {
    setSelectedRequest(request);
  };

  const closeRequestDetails = () => {
    setSelectedRequest(null);
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="admin-returns-page">
      <div className="admin-returns-container">

        {/* HEADER */}

        <div className="admin-returns-header">
          <div>
            <p className="admin-returns-eyebrow">
              Customer Service
            </p>

            <h1>Return &amp; Refund Management</h1>

            <p>
              Review customer return requests and manage
              their request status.
            </p>
          </div>

          <button
            type="button"
            className="admin-returns-refresh"
            onClick={() => loadRequests(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "admin-returns-spinning"
                  : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ERROR MESSAGE */}

        {error && (
          <div
            className="admin-returns-error"
            role="alert"
          >
            <AlertCircle size={18} />

            <span>{error}</span>

            <button
              type="button"
              onClick={() => loadRequests()}
            >
              Retry
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="admin-returns-stats">

          <div className="admin-returns-stat-card">
            <span className="admin-returns-stat-icon total">
              <Package size={20} />
            </span>

            <div>
              <span>Total Requests</span>
              <strong>
                {loading ? "…" : counts.total}
              </strong>
            </div>
          </div>

          <div className="admin-returns-stat-card">
            <span className="admin-returns-stat-icon pending">
              <Clock size={20} />
            </span>

            <div>
              <span>Pending Review</span>
              <strong>
                {loading ? "…" : counts.pending}
              </strong>
            </div>
          </div>

          <div className="admin-returns-stat-card">
            <span className="admin-returns-stat-icon approved">
              <CheckCircle size={20} />
            </span>

            <div>
              <span>Approved</span>
              <strong>
                {loading ? "…" : counts.approved}
              </strong>
            </div>
          </div>

          <div className="admin-returns-stat-card">
            <span className="admin-returns-stat-icon completed">
              <CheckCircle size={20} />
            </span>

            <div>
              <span>Completed</span>
              <strong>
                {loading ? "…" : counts.completed}
              </strong>
            </div>
          </div>

        </div>

        {/* SEARCH AND FILTER */}

        <div className="admin-returns-toolbar">
          <div className="admin-returns-search">
            <Search size={18} />

            <input
              type="search"
              placeholder="Search request, order, customer or product..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>

          <select
            className="admin-returns-filter"
            value={selectedStatus}
            onChange={(event) =>
              setSelectedStatus(event.target.value)
            }
            aria-label="Filter return requests by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* REQUEST TABLE */}

        <div className="admin-returns-table-card">

          <div className="admin-returns-table-heading">
            <div>
              <h2>Return Requests</h2>

              <p>
                {loading
                  ? "Loading requests..."
                  : `${filteredRequests.length} request(s) found`}
              </p>
            </div>
          </div>

          <div className="admin-returns-table-wrapper">
            <table className="admin-returns-table">

              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="admin-returns-empty"
                    >
                      Loading return requests...
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="admin-returns-empty"
                    >
                      <RotateCcw size={30} />

                      <strong>
                        No return requests found
                      </strong>

                      <span>
                        New customer return requests will
                        appear here.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((request) => (
                    <tr key={request._id}>

                      <td>
                        <strong>
                          {request.requestNumber || "—"}
                        </strong>
                      </td>

                      <td>
                        {request.orderNumber || "—"}
                      </td>

                      <td>
                        <div className="admin-returns-customer">
                          <strong>
                            {getCustomerName(request)}
                          </strong>

                          <span>
                            {getCustomerEmail(request)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="admin-returns-product">
                          <strong>
                            {request.productName || "Product"}
                          </strong>

                          <span>
                            Qty: {request.quantity || 1}
                          </span>
                        </div>
                      </td>

                      <td>
                        {request.reason || "—"}
                      </td>

                      <td>
                        {formatDate(request.createdAt)}
                      </td>

                      <td>
                        <span
                          className={`admin-returns-status ${String(
                            request.status || "pending"
                          ).toLowerCase()}`}
                        >
                          {getStatusLabel(request.status)}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-returns-view-button"
                          onClick={() =>
                            openRequestDetails(request)
                          }
                          title="View request details"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* REQUEST DETAILS MODAL */}

      {selectedRequest && (
        <div
          className="admin-returns-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRequestDetails();
            }
          }}
        >
          <div
            className="admin-returns-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-return-modal-title"
          >

            {/* MODAL HEADER */}

            <div className="admin-returns-modal-header">
              <div>
                <p>Return Request Details</p>

                <h2 id="admin-return-modal-title">
                  {selectedRequest.requestNumber ||
                    "Return Request"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeRequestDetails}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL BODY */}

            <div className="admin-returns-modal-body">

              {/* CUSTOMER */}

              <section className="admin-returns-detail-section">
                <h3>Customer Information</h3>

                <div className="admin-returns-detail-grid">

                  <div>
                    <span>Name</span>
                    <strong>
                      {getCustomerName(selectedRequest)}
                    </strong>
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>
                      {getCustomerEmail(selectedRequest)}
                    </strong>
                  </div>

                  <div>
                    <span>Mobile</span>
                    <strong>
                      {getCustomerMobile(selectedRequest)}
                    </strong>
                  </div>

                  <div>
                    <span>Request Date</span>
                    <strong>
                      {formatDate(selectedRequest.createdAt)}
                    </strong>
                  </div>

                </div>
              </section>

              {/* ORDER AND PRODUCT */}

              <section className="admin-returns-detail-section">
                <h3>Order &amp; Product Information</h3>

                <div className="admin-returns-detail-grid">

                  <div>
                    <span>Order ID</span>
                    <strong>
                      {selectedRequest.orderNumber || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Product</span>
                    <strong>
                      {selectedRequest.productName || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>SKU</span>
                    <strong>
                      {selectedRequest.sku || "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>
                    <strong>
                      {selectedRequest.quantity || 1}
                    </strong>
                  </div>

                  <div>
                    <span>Reason</span>
                    <strong>
                      {selectedRequest.reason || "—"}
                    </strong>
                  </div>

                </div>
              </section>

              {/* CUSTOMER DESCRIPTION */}

              <section className="admin-returns-detail-section">
                <h3>Customer Description</h3>

                <p className="admin-returns-description">
                  {selectedRequest.description ||
                    "No additional description provided."}
                </p>
              </section>

              {/* STATUS */}

              <section className="admin-returns-detail-section">
                <h3>Request Status</h3>

                <span
                  className={`admin-returns-status ${String(
                    selectedRequest.status || "pending"
                  ).toLowerCase()}`}
                >
                  {getStatusLabel(selectedRequest.status)}
                </span>
              </section>

              {/* ADMIN NOTE */}

              <section className="admin-returns-detail-section">
                <label htmlFor="admin-return-note">
                  Admin Note
                </label>

                <textarea
                  id="admin-return-note"
                  rows={3}
                  maxLength={1000}
                  placeholder="Add an internal note or message for this request..."
                  value={getNoteValue(selectedRequest)}
                  onChange={(event) =>
                    updateNote(
                      selectedRequest._id,
                      event.target.value
                    )
                  }
                  disabled={
                    selectedRequest.status === "rejected" ||
                    selectedRequest.status === "completed"
                  }
                />
              </section>

            </div>

            {/* MODAL FOOTER */}

            <div className="admin-returns-modal-footer">

              {selectedRequest.status === "pending" && (
                <>
                  <button
                    type="button"
                    className="admin-returns-reject-button"
                    disabled={updatingId === selectedRequest._id}
                    onClick={() =>
                      updateRequestStatus(
                        selectedRequest,
                        "rejected"
                      )
                    }
                  >
                    <XCircle size={16} />
                    Reject
                  </button>

                  <button
                    type="button"
                    className="admin-returns-approve-button"
                    disabled={updatingId === selectedRequest._id}
                    onClick={() =>
                      updateRequestStatus(
                        selectedRequest,
                        "approved"
                      )
                    }
                  >
                    <CheckCircle size={16} />

                    {updatingId === selectedRequest._id
                      ? "Updating..."
                      : "Approve Request"}
                  </button>
                </>
              )}

              {selectedRequest.status === "approved" && (
                <button
                  type="button"
                  className="admin-returns-complete-button"
                  disabled={updatingId === selectedRequest._id}
                  onClick={() =>
                    updateRequestStatus(
                      selectedRequest,
                      "completed"
                    )
                  }
                >
                  <CheckCircle size={16} />

                  {updatingId === selectedRequest._id
                    ? "Updating..."
                    : "Mark as Completed"}
                </button>
              )}

              <button
                type="button"
                className="admin-returns-close-button"
                onClick={closeRequestDetails}
              >
                Close
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminReturns;
