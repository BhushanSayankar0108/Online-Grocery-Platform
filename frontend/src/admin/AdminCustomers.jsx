
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  Search,
  Trash2,
  Users,
  X,
  RefreshCw,
} from "lucide-react";

import "./AdminCustomers.css";

const API_BASE_URL = "http://localhost:5000";
const CUSTOMERS_API = `${API_BASE_URL}/api/admin/customers`;

const getToken = () => localStorage.getItem("adminToken");

const getCustomerId = (customer) =>
  customer?._id || customer?.id || "";

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

const getAddress = (customer) => {
  if (
    typeof customer?.address === "string" &&
    customer.address.trim()
  ) {
    return customer.address;
  }

  const address =
    customer?.defaultAddress || customer?.addresses?.[0];

  if (typeof address === "string" && address.trim()) {
    return address;
  }

  if (address && typeof address === "object") {
    const formattedAddress = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ]
      .filter(Boolean)
      .join(", ");

    return formattedAddress || "No address available";
  }

  return "No address available";
};

const normalizeCustomer = (customer) => ({
  ...customer,
  id: String(getCustomerId(customer)),
  name: customer?.name || "Unnamed Customer",
  email: customer?.email || "—",
  mobile: customer?.mobile || "—",
  status: String(customer?.status || "inactive").toLowerCase(),
  registeredDate: formatDate(
    customer?.registeredDate ||
      customer?.created_at ||
      customer?.createdAt
  ),
  totalOrders: Number(customer?.totalOrders || 0),
  totalSpending: Number(customer?.totalSpending || 0),
  address: getAddress(customer),
});

const getErrorMessage = (data, fallback) =>
  data?.message || data?.error || fallback;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [updatingCustomerId, setUpdatingCustomerId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [serverStats, setServerStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
  });

  const [refreshKey, setRefreshKey] = useState(0);

  /* FETCH CUSTOMERS */

  useEffect(() => {
    let cancelled = false;

    const fetchCustomers = async () => {
      setLoading(true);

      try {
        const token = getToken();

        if (!token) {
          throw new Error(
            "Admin session not found. Please log in again."
          );
        }

        const response = await fetch(
          `${CUSTOMERS_API}?page=1&limit=100`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok || data.success !== true) {
          throw new Error(
            data.message ||
              `Failed to load customers (${response.status})`
          );
        }

        const records = Array.isArray(data.customers)
          ? data.customers
          : [];

        const normalizedCustomers = records.map(normalizeCustomer);

        if (!cancelled) {
          setCustomers(normalizedCustomers);

          setServerStats({
            totalCustomers:
              Number(data.stats?.totalCustomers) ||
              (data.stats?.totalCustomers === 0
                ? 0
                : Number(data.total ?? normalizedCustomers.length)),

            activeCustomers:
              Number(data.stats?.activeCustomers) ||
              (data.stats?.activeCustomers === 0
                ? 0
                : normalizedCustomers.filter(
                    (customer) => customer.status === "active"
                  ).length),

            inactiveCustomers:
              Number(data.stats?.inactiveCustomers) ||
              (data.stats?.inactiveCustomers === 0
                ? 0
                : normalizedCustomers.filter(
                    (customer) => customer.status === "inactive"
                  ).length),
          });

          setError("");
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError.message || "Unable to load customers."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCustomers();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  /* SEARCH AND FILTER */

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !search ||
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.mobile.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatusFilter === "all" ||
        customer.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchTerm, selectedStatusFilter]);

  /* STATISTICS */

  const totalCustomers =
    serverStats.totalCustomers ?? customers.length;

  const activeCustomers = serverStats.activeCustomers;
  const inactiveCustomers = serverStats.inactiveCustomers;

  const totalOrders = useMemo(
    () =>
      customers.reduce(
        (total, customer) =>
          total + Number(customer.totalOrders || 0),
        0
      ),
    [customers]
  );

  /* UPDATE CUSTOMER STATUS */

  const handleStatusChange = async (customerId, newStatus) => {
    const customer = customers.find(
      (item) => String(item.id) === String(customerId)
    );

    if (
      !customer ||
      customer.status === newStatus ||
      updatingCustomerId !== null
    ) {
      return;
    }

    if (!["active", "inactive"].includes(newStatus)) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "active" ? "activate" : "deactivate"
      } the account of ${customer.name}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingCustomerId(customerId);
      setError("");
      setNotice("");

      const token = getToken();

      if (!token) {
        throw new Error(
          "Admin session not found. Please log in again."
        );
      }

      const response = await fetch(
        `${CUSTOMERS_API}/${encodeURIComponent(customerId)}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        if (response.status === 401 || response.status === 403) {
          throw new Error(
            "Your admin session has expired or is unauthorized. Please log in again."
          );
        }

        throw new Error(
          getErrorMessage(
            data,
            "Unable to update customer status."
          )
        );
      }

      setCustomers((previous) =>
        previous.map((item) =>
          String(item.id) === String(customerId)
            ? { ...item, status: newStatus }
            : item
        )
      );

      setSelectedCustomer((previous) =>
        previous &&
        String(previous.id) === String(customerId)
          ? { ...previous, status: newStatus }
          : previous
      );

      setServerStats((previous) => {
        const wasActive = customer.status === "active";
        const becameActive = newStatus === "active";

        if (wasActive === becameActive) return previous;

        return {
          ...previous,
          activeCustomers: Math.max(
            0,
            previous.activeCustomers + (becameActive ? 1 : -1)
          ),
          inactiveCustomers: Math.max(
            0,
            previous.inactiveCustomers + (becameActive ? -1 : 1)
          ),
        };
      });

      setNotice(
        `${customer.name}'s account has been ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully.`
      );
    } catch (updateError) {
      setError(
        updateError.message || "Unable to update customer status."
      );
    } finally {
      setUpdatingCustomerId(null);
    }
  };

  /* DELETE PLACEHOLDER */

  const handleDelete = () => {
    window.alert(
      "Customer deletion is not available yet. No customer has been deleted."
    );
  };

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  /* REFRESH */

  const handleRefresh = () => {
    setNotice("");
    setError("");
    setRefreshKey((previous) => previous + 1);
  };

  return (
    <div className="admin-customers-page">
      <div className="admin-customers-container">

        {/* HEADER */}

        <div className="admin-customers-header">
          <div>
            <p className="admin-customers-eyebrow">
              Customer Management
            </p>

            <h1>Customers</h1>

            <p className="admin-customers-header-text">
              View and manage registered grocery platform customers.
            </p>
          </div>

          <button
            type="button"
            className="admin-customers-refresh-button"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={loading ? "refresh-spinning" : ""}
            />
            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* API FEEDBACK */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              color: "#b42318",
              background: "#fef3f2",
            }}
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              color: "#067647",
              background: "#ecfdf3",
            }}
          >
            {notice}
          </div>
        )}

        {/* STATISTICS */}

        <div className="admin-customers-stats">
          {[
            ["Total Customers", totalCustomers],
            ["Active Customers", activeCustomers],
            ["Inactive Customers", inactiveCustomers],
            ["Total Orders", totalOrders],
          ].map(([label, value]) => (
            <div className="admin-customers-stat-card" key={label}>
              <div className="admin-customers-stat-icon">
                <Users size={20} />
              </div>
              <div>
                <span>{label}</span>
                <strong>{loading ? "—" : value}</strong>
              </div>
            </div>
          ))}
        </div>

        {/* SEARCH AND FILTER */}

        <div className="admin-customers-toolbar">
          <div className="admin-customers-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search customer, email or mobile..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search customers"
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-customers-clear-search"
                onClick={() => setSearchTerm("")}
                title="Clear search"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="admin-customers-filter">
            <select
              value={selectedStatusFilter}
              onChange={(event) =>
                setSelectedStatusFilter(event.target.value)
              }
              aria-label="Filter customers by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

        {/* CUSTOMER TABLE */}

        <div className="admin-customers-table-card">
          <div className="admin-customers-table-header">
            <div>
              <h2>Customer List</h2>
              <p>
                {loading
                  ? "Loading customers..."
                  : `${filteredCustomers.length} customer${
                      filteredCustomers.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>
          </div>

          <div className="admin-customers-table-wrapper">
            <table className="admin-customers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Mobile</th>
                  <th>Orders</th>
                  <th>Total Spending</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="customers-empty-state"
                    >
                      Loading customers from the database...
                    </td>
                  </tr>
                ) : filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td className="customer-number">
                        {index + 1}
                      </td>

                      <td>
                        <div className="customer-info-cell">
                          <div className="customer-avatar">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{customer.name}</strong>
                            <span>{customer.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="customer-mobile">
                          {customer.mobile}
                        </span>
                      </td>

                      <td>
                        <span className="customer-orders-count">
                          {customer.totalOrders}
                        </span>
                      </td>

                      <td>
                        <strong className="customer-spending">
                          {formatCurrency(customer.totalSpending)}
                        </strong>
                      </td>

                      <td>
                        <div className="customer-status-select-wrapper">
                          <select
                            value={customer.status}
                            disabled={updatingCustomerId !== null}
                            onChange={(event) =>
                              handleStatusChange(
                                customer.id,
                                event.target.value
                              )
                            }
                            aria-label={`Change status for ${customer.name}`}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <ChevronDown size={14} />
                        </div>
                      </td>

                      <td className="customer-date">
                        {customer.registeredDate}
                      </td>

                      <td>
                        <div className="customer-actions">
                          <button
                            type="button"
                            className="customer-view-button"
                            title="View Customer"
                            aria-label={`View ${customer.name}`}
                            onClick={() =>
                              setSelectedCustomer({ ...customer })
                            }
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            type="button"
                            className="customer-delete-button"
                            title="Deletion is not available yet"
                            aria-label={`Customer deletion unavailable for ${customer.name}`}
                            onClick={handleDelete}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="customers-empty-state"
                    >
                      <div>
                        <Users size={34} />
                        <h3>
                          {error
                            ? "Customers could not be loaded"
                            : "No customers found"}
                        </h3>
                        <p>
                          {error
                            ? "Check your admin login and backend API."
                            : "Try changing your search or filter."}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CUSTOMER DETAILS MODAL */}

      {selectedCustomer && (
        <div
          className="admin-customers-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCustomerDetails();
            }
          }}
        >
          <div
            className="admin-customers-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-details-title"
          >
            <div className="admin-customers-modal-header">
              <div>
                <p>Customer Details</p>
                <h2 id="customer-details-title">
                  {selectedCustomer.name}
                </h2>
              </div>

              <button
                type="button"
                className="admin-customers-modal-close"
                onClick={closeCustomerDetails}
                aria-label="Close customer details"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-customers-modal-body">
              <div className="customer-profile">
                <div className="customer-profile-avatar">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h3>{selectedCustomer.name}</h3>
                  <p>{selectedCustomer.email}</p>

                  <span
                    className={`customer-profile-status ${selectedCustomer.status}`}
                  >
                    {selectedCustomer.status === "active"
                      ? "Active Customer"
                      : "Inactive Customer"}
                  </span>
                </div>
              </div>

              <div className="customer-detail-section">
                <h3>Customer Information</h3>

                <div className="customer-detail-grid">
                  <div>
                    <span>Email</span>
                    <strong>{selectedCustomer.email}</strong>
                  </div>

                  <div>
                    <span>Mobile</span>
                    <strong>{selectedCustomer.mobile}</strong>
                  </div>

                  <div>
                    <span>Registered Date</span>
                    <strong>{selectedCustomer.registeredDate}</strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>{selectedCustomer.address}</strong>
                  </div>
                </div>
              </div>

              <div className="customer-detail-section">
                <h3>Customer Summary</h3>

                <div className="customer-summary-grid">
                  <div>
                    <span>Total Orders</span>
                    <strong>{selectedCustomer.totalOrders}</strong>
                  </div>

                  <div>
                    <span>Total Spending</span>
                    <strong>
                      {formatCurrency(selectedCustomer.totalSpending)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="customer-detail-section">
                <h3>Account Status</h3>

                <div className="customer-detail-status-control">
                  <div className="customer-status-select-wrapper">
                    <select
                      value={selectedCustomer.status}
                      disabled={updatingCustomerId !== null}
                      onChange={(event) =>
                        handleStatusChange(
                          selectedCustomer.id,
                          event.target.value
                        )
                      }
                      aria-label="Change customer account status"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown size={15} />
                  </div>

                  <span>
                    Current status:{" "}
                    <strong>
                      {selectedCustomer.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="admin-customers-modal-footer">
              <button
                type="button"
                className="customer-modal-close-button"
                onClick={closeCustomerDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;