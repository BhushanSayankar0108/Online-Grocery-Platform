import { useMemo, useState } from "react";
import {
  ChevronDown,
  Eye,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import "./AdminCustomers.css";

/* =========================================================
   INITIAL CUSTOMERS
========================================================= */

const INITIAL_CUSTOMERS = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    mobile: "+91 98765 43210",
    registeredDate: "15 Sep 2026",
    totalOrders: 8,
    totalSpending: 4250,
    status: "active",
    address: "Wardha, Maharashtra",
  },
  {
    id: 2,
    name: "Priya Patil",
    email: "priya@example.com",
    mobile: "+91 98234 56781",
    registeredDate: "18 Sep 2026",
    totalOrders: 5,
    totalSpending: 2890,
    status: "active",
    address: "Nagpur, Maharashtra",
  },
  {
    id: 3,
    name: "Amit Verma",
    email: "amit@example.com",
    mobile: "+91 97654 32109",
    registeredDate: "20 Sep 2026",
    totalOrders: 3,
    totalSpending: 1399,
    status: "active",
    address: "Pune, Maharashtra",
  },
  {
    id: 4,
    name: "Sneha Joshi",
    email: "sneha@example.com",
    mobile: "+91 98123 45670",
    registeredDate: "22 Sep 2026",
    totalOrders: 6,
    totalSpending: 3180,
    status: "inactive",
    address: "Amravati, Maharashtra",
  },
  {
    id: 5,
    name: "Vikas Gupta",
    email: "vikas@example.com",
    mobile: "+91 98987 65432",
    registeredDate: "25 Sep 2026",
    totalOrders: 2,
    totalSpending: 1198,
    status: "active",
    address: "Mumbai, Maharashtra",
  },
  {
    id: 6,
    name: "Neha Deshmukh",
    email: "neha@example.com",
    mobile: "+91 97531 86420",
    registeredDate: "28 Sep 2026",
    totalOrders: 0,
    totalSpending: 0,
    status: "active",
    address: "Nashik, Maharashtra",
  },
];

/* =========================================================
   ADMIN CUSTOMERS
========================================================= */

const AdminCustomers = () => {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState("all");

  const [selectedCustomer, setSelectedCustomer] = useState(null);

  /* =========================================================
     FILTER CUSTOMERS
  ========================================================= */

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

  /* =========================================================
     CHANGE CUSTOMER STATUS
  ========================================================= */

  const handleStatusChange = (customerId, newStatus) => {
    const customer = customers.find(
      (item) => item.id === customerId
    );

    if (!customer || customer.status === newStatus) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "active" ? "activate" : "deactivate"
      } the account of ${customer.name}?`
    );

    if (!confirmed) {
      return;
    }

    setCustomers((previous) =>
      previous.map((item) =>
        item.id === customerId
          ? { ...item, status: newStatus }
          : item
      )
    );

    setSelectedCustomer((previous) =>
      previous && previous.id === customerId
        ? { ...previous, status: newStatus }
        : previous
    );

    window.alert(
      `${customer.name}'s account has been ${
        newStatus === "active" ? "activated" : "deactivated"
      } successfully.`
    );
  };

  /* =========================================================
     DELETE CUSTOMER
  ========================================================= */

  const handleDelete = (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${customer.name}" from the customer list? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setCustomers((previous) =>
      previous.filter((item) => item.id !== customer.id)
    );

    if (selectedCustomer?.id === customer.id) {
      setSelectedCustomer(null);
    }

    window.alert(
      `Customer "${customer.name}" has been removed successfully.`
    );
  };

  /* =========================================================
     CLOSE CUSTOMER DETAILS
  ========================================================= */

  const closeCustomerDetails = () => {
    setSelectedCustomer(null);
  };

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

  /* =========================================================
     PAGE UI
  ========================================================= */

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
              View and manage registered grocery platform
              customers.
            </p>
          </div>
        </div>

        {/* STATISTICS */}

        <div className="admin-customers-stats">
          <div className="admin-customers-stat-card">
            <div className="admin-customers-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Total Customers</span>
              <strong>{customers.length}</strong>
            </div>
          </div>

          <div className="admin-customers-stat-card">
            <div className="admin-customers-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Active Customers</span>
              <strong>
                {
                  customers.filter(
                    (customer) => customer.status === "active"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="admin-customers-stat-card">
            <div className="admin-customers-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Inactive Customers</span>
              <strong>
                {
                  customers.filter(
                    (customer) => customer.status === "inactive"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="admin-customers-stat-card">
            <div className="admin-customers-stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>
                {customers.reduce(
                  (total, customer) =>
                    total + Number(customer.totalOrders || 0),
                  0
                )}
              </strong>
            </div>
          </div>
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
                {filteredCustomers.length} customer
                {filteredCustomers.length !== 1 ? "s" : ""} found
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
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, index) => (
                    <tr key={customer.id}>
                      <td className="customer-number">
                        {index + 1}
                      </td>

                      <td>
                        <div className="customer-info-cell">
                          <div className="customer-avatar">
                            {customer.name
                              .charAt(0)
                              .toUpperCase()}
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
                            title="Delete Customer"
                            aria-label={`Delete ${customer.name}`}
                            onClick={() => handleDelete(customer)}
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

                        <h3>No customers found</h3>

                        <p>
                          Try changing your search or filter.
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
            {/* MODAL HEADER */}

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

            {/* MODAL BODY */}

            <div className="admin-customers-modal-body">

              {/* CUSTOMER PROFILE */}

              <div className="customer-profile">
                <div className="customer-profile-avatar">
                  {selectedCustomer.name
                    .charAt(0)
                    .toUpperCase()}
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

              {/* CUSTOMER INFORMATION */}

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
                    <strong>
                      {selectedCustomer.registeredDate}
                    </strong>
                  </div>

                  <div>
                    <span>Address</span>
                    <strong>{selectedCustomer.address}</strong>
                  </div>
                </div>
              </div>

              {/* CUSTOMER SUMMARY */}

              <div className="customer-detail-section">
                <h3>Customer Summary</h3>

                <div className="customer-summary-grid">
                  <div>
                    <span>Total Orders</span>
                    <strong>
                      {selectedCustomer.totalOrders}
                    </strong>
                  </div>

                  <div>
                    <span>Total Spending</span>
                    <strong>
                      {formatCurrency(
                        selectedCustomer.totalSpending
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              {/* ACCOUNT STATUS */}

              <div className="customer-detail-section">
                <h3>Account Status</h3>

                <div className="customer-detail-status-control">
                  <div className="customer-status-select-wrapper">
                    <select
                      value={selectedCustomer.status}
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

            {/* MODAL FOOTER */}

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