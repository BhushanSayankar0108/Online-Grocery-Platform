
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  MessageCircle,
  Clock,
  CheckCircle,
  Eye,
  X,
  AlertCircle,
  Mail,
  User,
  FileText,
} from "lucide-react";
import "./AdminSupportQueries.css";

// ==========================================
// API CONFIGURATION
// ==========================================

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

const API_ROOT = /\/api$/i.test(API_BASE_URL)
  ? API_BASE_URL
  : `${API_BASE_URL}/api`;

const SUPPORT_API = `${API_ROOT}/support`;

// ==========================================
// CONSTANTS
// ==========================================

const STATUS_OPTIONS = [
  { value: "all", label: "All Queries" },
  { value: "New", label: "New" },
  { value: "In Progress", label: "In Progress" },
  { value: "Resolved", label: "Resolved" },
];

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

const getStatusClass = (status) =>
  String(status || "New")
    .toLowerCase()
    .replace(/\s+/g, "-");

// ==========================================
// ADMIN SUPPORT QUERIES
// ==========================================

function AdminSupportQueries() {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const [selectedQuery, setSelectedQuery] = useState(null);
  const [adminNotes, setAdminNotes] = useState({});
  const [updatingId, setUpdatingId] = useState("");

  // ==========================================
  // LOAD SUPPORT QUERIES
  // GET /api/support/admin
  // ==========================================

  const loadQueries = useCallback(async (silent = false) => {
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin token not found. Please log in again.");
      }

      const response = await fetch(`${SUPPORT_API}/admin`, {
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
          data.message ||
            "Your admin session is invalid. Please log in again."
        );
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load support queries.");
      }

      const records =
        data.queries ||
        data.supportQueries ||
        data.data ||
        [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected support query response from server.");
      }

      setQueries(records);

      setSelectedQuery((previous) => {
        if (!previous) return null;

        return (
          records.find((item) => item._id === previous._id) || null
        );
      });
    } catch (err) {
      console.error("Load support queries error:", err);
      setError(err.message || "Unable to load support queries.");
      setQueries([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const timerId = setTimeout(() => {
      if (!cancelled) loadQueries();
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [loadQueries]);

  // ==========================================
  // FILTER QUERIES
  // ==========================================

  const filteredQueries = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return queries.filter((query) => {
      const matchesStatus =
        selectedStatus === "all" ||
        String(query.status || "New").toLowerCase() ===
          selectedStatus.toLowerCase();

      const searchableText = [
        query.name,
        query.email,
        query.subject,
        query.message,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesStatus && (!search || searchableText.includes(search));
    });
  }, [queries, searchTerm, selectedStatus]);

  // ==========================================
  // DASHBOARD COUNTS
  // ==========================================

  const counts = useMemo(
    () => ({
      total: queries.length,
      new: queries.filter(
        (item) => String(item.status || "New").toLowerCase() === "new"
      ).length,
      inProgress: queries.filter(
        (item) => String(item.status || "").toLowerCase() === "in progress"
      ).length,
      resolved: queries.filter(
        (item) => String(item.status || "").toLowerCase() === "resolved"
      ).length,
    }),
    [queries]
  );

  // ==========================================
  // UPDATE STATUS AND ADMIN NOTE
  // PATCH /api/support/admin/:id/status
  // ==========================================

  const updateQuery = async (query, status) => {
    const queryId = String(query?._id || "");

    if (!queryId || updatingId) return;

    if (
      !window.confirm(
        `Are you sure you want to mark this query as "${status}"?`
      )
    ) {
      return;
    }

    setUpdatingId(queryId);

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Admin session missing. Please log in again.");
      }

      const adminNote =
        adminNotes[queryId] ?? query.adminNote ?? "";

      const response = await fetch(
        `${SUPPORT_API}/admin/${encodeURIComponent(queryId)}/status`,
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

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to update support query.");
      }

      await loadQueries(true);

      window.alert(data.message || "Support query updated successfully.");
    } catch (err) {
      console.error("Update support query error:", err);
      window.alert(err.message || "Unable to update support query.");
    } finally {
      setUpdatingId("");
    }
  };

  const getNoteValue = (query) =>
    adminNotes[query._id] ?? query.adminNote ?? "";

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="admin-support-page">
      <div className="admin-support-container">
        {/* HEADER */}

        <div className="admin-support-header">
          <div>
            <p className="admin-support-eyebrow">CUSTOMER SERVICE</p>
            <h1>Support Queries</h1>
            <p>
              View customer messages, respond internally and manage query
              statuses.
            </p>
          </div>

          <button
            type="button"
            className="admin-support-refresh"
            onClick={() => loadQueries(true)}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "admin-support-spinning" : ""}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="admin-support-error" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button type="button" onClick={() => loadQueries()}>
              Retry
            </button>
          </div>
        )}

        {/* STATISTICS */}

        <div className="admin-support-stats">
          <div className="admin-support-stat-card">
            <span className="admin-support-stat-icon total">
              <MessageCircle size={21} />
            </span>
            <div>
              <span>Total Queries</span>
              <strong>{loading ? "…" : counts.total}</strong>
            </div>
          </div>

          <div className="admin-support-stat-card">
            <span className="admin-support-stat-icon new">
              <Mail size={21} />
            </span>
            <div>
              <span>New</span>
              <strong>{loading ? "…" : counts.new}</strong>
            </div>
          </div>

          <div className="admin-support-stat-card">
            <span className="admin-support-stat-icon progress">
              <Clock size={21} />
            </span>
            <div>
              <span>In Progress</span>
              <strong>{loading ? "…" : counts.inProgress}</strong>
            </div>
          </div>

          <div className="admin-support-stat-card">
            <span className="admin-support-stat-icon resolved">
              <CheckCircle size={21} />
            </span>
            <div>
              <span>Resolved</span>
              <strong>{loading ? "…" : counts.resolved}</strong>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTER */}

        <div className="admin-support-toolbar">
          <div className="admin-support-search">
            <Search size={18} />
            <input
              type="search"
              placeholder="Search customer, email, subject or message..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            className="admin-support-filter"
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            aria-label="Filter support queries by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* TABLE */}

        <div className="admin-support-table-card">
          <div className="admin-support-table-heading">
            <div>
              <h2>Customer Messages</h2>
              <p>
                {loading
                  ? "Loading queries..."
                  : `${filteredQueries.length} quer${
                      filteredQueries.length === 1 ? "y" : "ies"
                    } found`}
              </p>
            </div>
          </div>

          <div className="admin-support-table-wrapper">
            <table className="admin-support-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="admin-support-empty">
                      Loading support queries...
                    </td>
                  </tr>
                ) : filteredQueries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="admin-support-empty">
                      <MessageCircle size={32} />
                      <strong>No support queries found</strong>
                      <span>
                        Customer messages submitted through the Support
                        page will appear here.
                      </span>
                    </td>
                  </tr>
                ) : (
                  filteredQueries.map((query) => (
                    <tr key={query._id}>
                      <td>
                        <div className="admin-support-customer">
                          <strong>{query.name || "Customer"}</strong>
                          <span>{query.email || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <strong>{query.subject || "—"}</strong>
                      </td>

                      <td>
                        <span className="admin-support-message-preview">
                          {query.message || "—"}
                        </span>
                      </td>

                      <td>{formatDate(query.createdAt)}</td>

                      <td>
                        <span
                          className={`admin-support-status ${getStatusClass(
                            query.status
                          )}`}
                        >
                          {query.status || "New"}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="admin-support-view-button"
                          onClick={() => setSelectedQuery(query)}
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

      {/* QUERY DETAILS MODAL */}

      {selectedQuery && (
        <div
          className="admin-support-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedQuery(null);
            }
          }}
        >
          <div
            className="admin-support-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-support-modal-title"
          >
            <div className="admin-support-modal-header">
              <div>
                <p>Customer Support</p>
                <h2 id="admin-support-modal-title">Query Details</h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedQuery(null)}
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-support-modal-body">
              <section className="admin-support-detail-section">
                <h3>
                  <User size={17} /> Customer Information
                </h3>

                <div className="admin-support-detail-grid">
                  <div>
                    <span>Full Name</span>
                    <strong>{selectedQuery.name || "—"}</strong>
                  </div>

                  <div>
                    <span>Email Address</span>
                    <strong>{selectedQuery.email || "—"}</strong>
                  </div>

                  <div>
                    <span>Submitted On</span>
                    <strong>{formatDate(selectedQuery.createdAt)}</strong>
                  </div>

                  <div>
                    <span>Current Status</span>
                    <strong>
                      {selectedQuery.status || "New"}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="admin-support-detail-section">
                <h3>
                  <FileText size={17} /> Message Information
                </h3>

                <div className="admin-support-message-box">
                  <span>Subject</span>
                  <strong>{selectedQuery.subject || "—"}</strong>

                  <span>Customer Message</span>
                  <p>{selectedQuery.message || "No message provided."}</p>
                </div>
              </section>

              <section className="admin-support-detail-section">
                <label htmlFor="admin-support-note">Admin Note</label>

                <textarea
                  id="admin-support-note"
                  rows={4}
                  maxLength={1000}
                  placeholder="Add an internal note about this query..."
                  value={getNoteValue(selectedQuery)}
                  onChange={(event) =>
                    setAdminNotes((previous) => ({
                      ...previous,
                      [selectedQuery._id]: event.target.value,
                    }))
                  }
                />

                <small>
                  Internal note for admin reference.
                </small>
              </section>
            </div>

            <div className="admin-support-modal-footer">
              <div className="admin-support-status-actions">
                {STATUS_OPTIONS.filter(
                  (option) => option.value !== "all"
                ).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`admin-support-action-button ${
                      getStatusClass(option.value)
                    }`}
                    disabled={
                      updatingId === selectedQuery._id ||
                      String(selectedQuery.status || "New").toLowerCase() ===
                        option.value.toLowerCase()
                    }
                    onClick={() =>
                      updateQuery(selectedQuery, option.value)
                    }
                  >
                    {updatingId === selectedQuery._id
                      ? "Updating..."
                      : `Mark ${option.label}`}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="admin-support-close-button"
                onClick={() => setSelectedQuery(null)}
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

export default AdminSupportQueries;
