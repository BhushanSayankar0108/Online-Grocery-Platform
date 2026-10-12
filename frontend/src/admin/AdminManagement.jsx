import { useMemo, useState } from "react";
import {
  Activity,
  Edit,
  Eye,
  KeyRound,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";

import "./AdminManagement.css";

const initialAdmins = [
  {
    id: 1,
    name: "Super Admin",
    email: "admin@grocery.com",
    mobile: "9876543210",
    role: "Super Admin",
    status: "Active",
    permissions: [
      "Dashboard",
      "Products",
      "Orders",
      "Customers",
      "Reports",
      "Settings",
    ],
    lastLogin: "2026-10-03 10:30 AM",
    createdAt: "2026-01-10",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul@grocery.com",
    mobile: "9876543211",
    role: "Manager",
    status: "Active",
    permissions: [
      "Dashboard",
      "Products",
      "Orders",
      "Inventory",
      "Customers",
    ],
    lastLogin: "2026-10-03 09:15 AM",
    createdAt: "2026-02-05",
  },
  {
    id: 3,
    name: "Priya Patil",
    email: "priya@grocery.com",
    mobile: "9876543212",
    role: "Content Manager",
    status: "Active",
    permissions: [
      "Dashboard",
      "Website CMS",
      "Reviews",
      "Notifications",
    ],
    lastLogin: "2026-10-02 06:45 PM",
    createdAt: "2026-03-12",
  },
  {
    id: 4,
    name: "Amit Joshi",
    email: "amit@grocery.com",
    mobile: "9876543213",
    role: "Order Manager",
    status: "Inactive",
    permissions: [
      "Dashboard",
      "Orders",
      "Customers",
      "Delivery",
    ],
    lastLogin: "2026-09-28 04:20 PM",
    createdAt: "2026-04-18",
  },
];

const permissionOptions = [
  "Dashboard",
  "Products",
  "Categories",
  "Inventory",
  "Orders",
  "Customers",
  "Coupons & Offers",
  "Delivery",
  "Reviews",
  "Notifications",
  "Website CMS",
  "Reports",
  "Settings",
];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  role: "Manager",
  status: "Active",
  permissions: ["Dashboard"],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AdminManagement = () => {
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formDirty, setFormDirty] = useState(false);

  const [viewAdmin, setViewAdmin] = useState(null);
  const [resetAdmin, setResetAdmin] = useState(null);

  // Filter administrators.
  const filteredAdmins = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return admins.filter((admin) => {
      const matchesSearch =
        !search ||
        admin.name.toLowerCase().includes(search) ||
        admin.email.toLowerCase().includes(search) ||
        admin.mobile.includes(search);

      const matchesRole =
        roleFilter === "All" || admin.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" || admin.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [admins, searchTerm, roleFilter, statusFilter]);

  // Statistics.
  const totalAdmins = admins.length;

  const activeAdmins = admins.filter(
    (admin) => admin.status === "Active"
  ).length;

  const inactiveAdmins = admins.filter(
    (admin) => admin.status === "Inactive"
  ).length;

  const superAdmins = admins.filter(
    (admin) => admin.role === "Super Admin"
  ).length;

  // Open add modal.
  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      ...emptyForm,
      permissions: [...emptyForm.permissions],
    });
    setFormDirty(false);
    setShowModal(true);
  };

  // Open edit modal.
  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setFormData({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.role,
      status: admin.status,
      permissions: [...admin.permissions],
    });

    setFormDirty(false);
    setShowModal(true);
  };

  // Close add/edit modal.
  const closeModal = () => {
    if (formDirty) {
      const confirmed = window.confirm(
        "Discard your unsaved changes?"
      );

      if (!confirmed) return;
    }

    setShowModal(false);
    setEditingAdmin(null);
    setFormData({
      ...emptyForm,
      permissions: [...emptyForm.permissions],
    });
    setFormDirty(false);
  };

  // Handle form changes.
  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormDirty(true);
  };

  // Toggle permissions.
  const togglePermission = (permission) => {
    setFormData((previous) => {
      const exists = previous.permissions.includes(permission);

      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter(
              (item) => item !== permission
            )
          : [...previous.permissions, permission],
      };
    });

    setFormDirty(true);
  };

  // Add or update administrator.
  const handleSubmit = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.replace(/\s+/g, "");

    if (!name || !email || !mobile) {
      window.alert("Please fill in all required fields.");
      return;
    }

    if (!EMAIL_PATTERN.test(email)) {
      window.alert("Please enter a valid email address.");
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(mobile)) {
      window.alert(
        "Please enter a valid mobile number containing 10 to 15 digits."
      );
      return;
    }

    if (formData.permissions.length === 0) {
      window.alert("Please select at least one permission.");
      return;
    }

    const duplicateEmail = admins.some(
      (admin) =>
        admin.email.toLowerCase() === email &&
        admin.id !== editingAdmin?.id
    );

    if (duplicateEmail) {
      window.alert(
        "An administrator with this email address already exists."
      );
      return;
    }

    if (
      editingAdmin?.role === "Super Admin" &&
      formData.role !== "Super Admin"
    ) {
      const confirmed = window.confirm(
        "You are changing the Super Admin role. This may affect administrative access. Continue?"
      );

      if (!confirmed) return;
    }

    if (
      editingAdmin?.role === "Super Admin" &&
      formData.status !== "Active"
    ) {
      window.alert("The Super Admin account cannot be deactivated.");
      return;
    }

    const normalizedForm = {
      ...formData,
      name,
      email,
      mobile,
      permissions: [...formData.permissions],
    };

    if (editingAdmin) {
      const confirmed = window.confirm(
        `Save changes to administrator "${name}"?`
      );

      if (!confirmed) return;

      setAdmins((previous) =>
        previous.map((admin) =>
          admin.id === editingAdmin.id
            ? {
                ...admin,
                ...normalizedForm,
              }
            : admin
        )
      );

      setViewAdmin((previous) =>
        previous?.id === editingAdmin.id
          ? { ...previous, ...normalizedForm }
          : previous
      );

      window.alert("Administrator updated successfully.");
    } else {
      const confirmed = window.confirm(
        `Create a new administrator account for "${name}"?`
      );

      if (!confirmed) return;

      const newAdmin = {
        id: Date.now(),
        ...normalizedForm,
        lastLogin: "Never",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setAdmins((previous) => [newAdmin, ...previous]);

      window.alert("Administrator created successfully.");
    }

    setShowModal(false);
    setEditingAdmin(null);
    setFormData({
      ...emptyForm,
      permissions: [...emptyForm.permissions],
    });
    setFormDirty(false);
  };

  // Delete administrator.
  const handleDelete = (admin) => {
    if (admin.role === "Super Admin") {
      window.alert("The Super Admin account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${admin.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setAdmins((previous) =>
      previous.filter((item) => item.id !== admin.id)
    );

    if (viewAdmin?.id === admin.id) {
      setViewAdmin(null);
    }

    if (resetAdmin?.id === admin.id) {
      setResetAdmin(null);
    }

    window.alert("Administrator deleted successfully.");
  };

  // Toggle active/inactive status.
  const toggleAdminStatus = (admin) => {
    if (admin.role === "Super Admin") {
      window.alert("The Super Admin account cannot be deactivated.");
      return;
    }

    const nextStatus =
      admin.status === "Active" ? "Inactive" : "Active";

    const confirmed = window.confirm(
      `Change ${admin.name}'s status to "${nextStatus}"?`
    );

    if (!confirmed) return;

    setAdmins((previous) =>
      previous.map((item) =>
        item.id === admin.id
          ? { ...item, status: nextStatus }
          : item
      )
    );

    setViewAdmin((previous) =>
      previous?.id === admin.id
        ? { ...previous, status: nextStatus }
        : previous
    );

    window.alert(
      `${admin.name}'s status changed to ${nextStatus}.`
    );
  };

  // Simulated password-reset action.
  const handleResetPassword = () => {
    if (!resetAdmin) return;

    const confirmed = window.confirm(
      `Request a password reset for ${resetAdmin.email}?`
    );

    if (!confirmed) return;

    window.alert(
      `Password reset is currently a frontend demonstration. A reset link has not actually been sent to ${resetAdmin.email}.`
    );

    setResetAdmin(null);
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-container">
        {/* Header */}
        <div className="admin-management-header">
          <div className="admin-management-heading">
            <div className="admin-management-title-row">
              <div className="admin-management-title-icon">
                <UserCog size={26} />
              </div>

              <div>
                <h1>Admin Management</h1>
                <p>
                  Manage administrator accounts, roles and
                  permissions.
                </p>
              </div>
            </div>
          </div>

          <button
            className="admin-management-add-button"
            onClick={openAddModal}
            type="button"
          >
            <Plus size={18} />
            Add Admin
          </button>
        </div>

        {/* Statistics */}
        <div className="admin-management-stats">
          <div className="admin-management-stat-card">
            <div className="admin-management-stat-icon">
              <Users size={21} />
            </div>
            <div>
              <span>Total Admins</span>
              <strong>{totalAdmins}</strong>
            </div>
          </div>

          <div className="admin-management-stat-card">
            <div className="admin-management-stat-icon">
              <Activity size={21} />
            </div>
            <div>
              <span>Active Admins</span>
              <strong>{activeAdmins}</strong>
            </div>
          </div>

          <div className="admin-management-stat-card">
            <div className="admin-management-stat-icon">
              <ShieldCheck size={21} />
            </div>
            <div>
              <span>Super Admins</span>
              <strong>{superAdmins}</strong>
            </div>
          </div>

          <div className="admin-management-stat-card">
            <div className="admin-management-stat-icon">
              <UserCog size={21} />
            </div>
            <div>
              <span>Inactive Admins</span>
              <strong>{inactiveAdmins}</strong>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-management-toolbar">
          <div className="admin-management-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              aria-label="Search administrators"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(event.target.value)
            }
            aria-label="Filter by role"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Manager">Manager</option>
            <option value="Content Manager">Content Manager</option>
            <option value="Order Manager">Order Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value)
            }
            aria-label="Filter by status"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="admin-management-table-card">
          <div className="admin-management-table-wrapper">
            <table className="admin-management-table">
              <thead>
                <tr>
                  <th>Administrator</th>
                  <th>Contact</th>
                  <th>Role</th>
                  <th>Permissions</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-management-user">
                          <div className="admin-management-avatar">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <strong>{admin.name}</strong>
                            <span>
                              Created: {admin.createdAt}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="admin-management-contact">
                          <span>
                            <Mail size={14} />
                            {admin.email}
                          </span>
                          <span>
                            <Phone size={14} />
                            {admin.mobile}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-management-role admin-management-role-${admin.role
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {admin.role}
                        </span>
                      </td>

                      <td>
                        <div className="admin-management-permissions">
                          {admin.permissions
                            .slice(0, 3)
                            .map((permission) => (
                              <span key={permission}>
                                {permission}
                              </span>
                            ))}

                          {admin.permissions.length > 3 && (
                            <span className="admin-management-more">
                              +{admin.permissions.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="admin-management-last-login">
                          {admin.lastLogin}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`admin-management-status ${
                            admin.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                          onClick={() =>
                            toggleAdminStatus(admin)
                          }
                          type="button"
                          disabled={admin.role === "Super Admin"}
                          aria-label={`Status: ${admin.status}`}
                          title={
                            admin.role === "Super Admin"
                              ? "Super Admin cannot be deactivated"
                              : "Change administrator status"
                          }
                        >
                          <span />
                          {admin.status}
                        </button>
                      </td>

                      <td>
                        <div className="admin-management-actions">
                          <button
                            className="admin-management-action view"
                            title="View Admin"
                            aria-label={`View ${admin.name}`}
                            onClick={() => setViewAdmin(admin)}
                            type="button"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="admin-management-action edit"
                            title="Edit Admin"
                            aria-label={`Edit ${admin.name}`}
                            onClick={() => openEditModal(admin)}
                            type="button"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="admin-management-action password"
                            title="Reset Password"
                            aria-label={`Reset password for ${admin.name}`}
                            onClick={() => setResetAdmin(admin)}
                            type="button"
                          >
                            <KeyRound size={16} />
                          </button>

                          <button
                            className="admin-management-action delete"
                            title="Delete Admin"
                            aria-label={`Delete ${admin.name}`}
                            onClick={() => handleDelete(admin)}
                            type="button"
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
                      colSpan="7"
                      className="admin-management-empty"
                    >
                      <UserCog size={38} />
                      <strong>No administrators found</strong>
                      <span>
                        Try changing your search or filter.
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-management-table-footer">
            Showing{" "}
            <strong>{filteredAdmins.length}</strong> of{" "}
            <strong>{admins.length}</strong> administrators
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="admin-management-modal-overlay">
          <div
            className="admin-management-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-management-form-title"
          >
            <div className="admin-management-modal-header">
              <div>
                <h2 id="admin-management-form-title">
                  {editingAdmin
                    ? "Edit Administrator"
                    : "Add Administrator"}
                </h2>
                <p>
                  {editingAdmin
                    ? "Update administrator details and permissions."
                    : "Create a new administrator account."}
                </p>
              </div>

              <button
                className="admin-management-modal-close"
                onClick={closeModal}
                type="button"
                aria-label="Close administrator form"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-management-form"
              onSubmit={handleSubmit}
            >
              <div className="admin-management-form-grid">
                <label>
                  Full Name *
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    autoComplete="name"
                    required
                    maxLength={100}
                  />
                </label>

                <label>
                  Email Address *
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                    maxLength={150}
                  />
                </label>

                <label>
                  Mobile Number *
                  <input
                    type="tel"
                    name="mobile"
                    placeholder="Enter mobile number"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    autoComplete="tel"
                    required
                    maxLength={16}
                  />
                </label>

                <label>
                  Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Super Admin">
                      Super Admin
                    </option>
                    <option value="Manager">Manager</option>
                    <option value="Content Manager">
                      Content Manager
                    </option>
                    <option value="Order Manager">
                      Order Manager
                    </option>
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={
                      editingAdmin?.role === "Super Admin"
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="admin-management-permission-section">
                <div className="admin-management-permission-heading">
                  <div>
                    <h3>Permissions</h3>
                    <p>
                      Select the sections this administrator can
                      access.
                    </p>
                  </div>

                  <span>
                    {formData.permissions.length} selected
                  </span>
                </div>

                <div className="admin-management-permission-grid">
                  {permissionOptions.map((permission) => (
                    <label
                      className="admin-management-permission-item"
                      key={permission}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(
                          permission
                        )}
                        onChange={() =>
                          togglePermission(permission)
                        }
                      />
                      <span>{permission}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-management-form-actions">
                <button
                  className="admin-management-cancel-button"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="admin-management-save-button"
                  type="submit"
                >
                  {editingAdmin
                    ? "Update Admin"
                    : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAdmin && (
        <div className="admin-management-modal-overlay">
          <div
            className="admin-management-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-management-view-title"
          >
            <div className="admin-management-modal-header">
              <div>
                <h2 id="admin-management-view-title">
                  Administrator Details
                </h2>
                <p>
                  View account information and permissions.
                </p>
              </div>

              <button
                className="admin-management-modal-close"
                onClick={() => setViewAdmin(null)}
                type="button"
                aria-label="Close administrator details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-management-profile">
              <div className="admin-management-profile-avatar">
                {viewAdmin.name.charAt(0).toUpperCase()}
              </div>

              <h3>{viewAdmin.name}</h3>

              <span className="admin-management-profile-role">
                {viewAdmin.role}
              </span>
            </div>

            <div className="admin-management-detail-grid">
              <div>
                <span>Email</span>
                <strong>{viewAdmin.email}</strong>
              </div>

              <div>
                <span>Mobile</span>
                <strong>{viewAdmin.mobile}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong>{viewAdmin.status}</strong>
              </div>

              <div>
                <span>Created</span>
                <strong>{viewAdmin.createdAt}</strong>
              </div>

              <div>
                <span>Last Login</span>
                <strong>{viewAdmin.lastLogin}</strong>
              </div>
            </div>

            <div className="admin-management-view-permissions">
              <h3>Permissions</h3>

              <div>
                {viewAdmin.permissions.map((permission) => (
                  <span key={permission}>{permission}</span>
                ))}
              </div>
            </div>

            <button
              className="admin-management-close-view-button"
              onClick={() => setViewAdmin(null)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetAdmin && (
        <div className="admin-management-modal-overlay">
          <div
            className="admin-management-reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-management-reset-title"
          >
            <div className="admin-management-reset-icon">
              <KeyRound size={28} />
            </div>

            <h2 id="admin-management-reset-title">
              Reset Password?
            </h2>

            <p>
              A password reset request would be prepared for:
            </p>

            <strong>{resetAdmin.email}</strong>

            <div className="admin-management-reset-actions">
              <button
                className="admin-management-cancel-button"
                onClick={() => setResetAdmin(null)}
                type="button"
              >
                Cancel
              </button>

              <button
                className="admin-management-save-button"
                onClick={handleResetPassword}
                type="button"
              >
                Request Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;