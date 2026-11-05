
import { useCallback, useEffect, useMemo, useState } from "react";
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
  RefreshCw,
} from "lucide-react";
import "./AdminManagement.css";

const API_BASE_URL = "http://localhost:5000/api/admin";

const permissionOptions = [
  "Dashboard",
  "Products",
  "Categories",
  "Inventory",
  "Orders",
  "Support",
  "Customers",
  "Coupons & Offers",
  "Delivery",
  "Reviews",
  "Notifications",
  "Website CMS",
  "Reports",
  "Settings",
];

const roles = [
  "Super Admin",
  "Admin",
  "Manager",
  "Content Manager",
  "Order Manager",
];

const emptyForm = {
  name: "",
  email: "",
  mobile: "",
  password: "",
  role: "Manager",
  status: "Active",
  permissions: ["Dashboard"],
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\+?[0-9]{10,15}$/;

const getAdminToken = () =>
  localStorage.getItem("adminToken") || localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getAdminToken();

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const normalizeAdmin = (admin) => {
  const rawRole = String(admin.role || "Manager")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  const roleMap = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    MANAGER: "Manager",
    CONTENT_MANAGER: "Content Manager",
    ORDER_MANAGER: "Order Manager",
  };

  const rawStatus = String(admin.status || "Active").toLowerCase();

  return {
    ...admin,
    id: String(admin.id || admin._id),
    name: admin.name || "",
    email: admin.email || "",
    mobile: admin.mobile || "",
    role: roleMap[rawRole] || admin.role || "Manager",
    status: rawStatus === "active" ? "Active" : "Inactive",
    permissions: Array.isArray(admin.permissions)
      ? admin.permissions
      : ["Dashboard"],
    createdAt: admin.createdAt || admin.created_at
      ? String(admin.createdAt || admin.created_at).slice(0, 10)
      : "",
    lastLogin: admin.lastLogin || "Not tracked",
  };
};

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");
  const [notice, setNotice] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formDirty, setFormDirty] = useState(false);

  const [viewAdmin, setViewAdmin] = useState(null);
  const [resetAdmin, setResetAdmin] = useState(null);

  // API helper
  const apiRequest = async (path = "", options = {}) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.message || `Request failed with status ${response.status}`
      );
    }

    return result;
  };

  // Load administrators from MongoDB through the backend
  const loadAdmins = useCallback(async () => {
    setLoading(true);
    setApiError("");

    try {
      const result = await apiRequest();

      if (!Array.isArray(result.admins)) {
        throw new Error("The server response does not contain an admins array.");
      }

      setAdmins(result.admins.map(normalizeAdmin));
    } catch (error) {
      console.error("Load administrators error:", error);
      setApiError(error.message || "Unable to load administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

// Initial API load - replace the existing useEffect with this

useEffect(() => {
  let cancelled = false;

  const fetchInitialAdmins = async () => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || `Request failed with status ${response.status}`
        );
      }

      if (!Array.isArray(result.admins)) {
        throw new Error("The server response does not contain an admins array.");
      }

      if (!cancelled) {
        setAdmins(result.admins.map(normalizeAdmin));
        setApiError("");
      }
    } catch (error) {
      console.error("Load administrators error:", error);

      if (!cancelled) {
        setApiError(error.message || "Unable to load administrators.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  fetchInitialAdmins();

  return () => {
    cancelled = true;
  };
}, []);

  // Statistics
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

  // Search and filters
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

  // Open create form
  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      ...emptyForm,
      permissions: ["Dashboard"],
    });
    setFormDirty(false);
    setShowModal(true);
  };

  // Open edit form
  const openEditModal = (admin) => {
    setEditingAdmin(admin);

    setFormData({
      name: admin.name,
      email: admin.email,
      mobile: admin.mobile,
      password: "",
      role: admin.role,
      status: admin.status,
      permissions: [...admin.permissions],
    });

    setFormDirty(false);
    setShowModal(true);
  };

  const closeModal = () => {
    if (
      formDirty &&
      !window.confirm("Discard your unsaved changes?")
    ) {
      return;
    }

    setShowModal(false);
    setEditingAdmin(null);
    setFormData({ ...emptyForm, permissions: ["Dashboard"] });
    setFormDirty(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormDirty(true);
  };

  const togglePermission = (permission) => {
    setFormData((previous) => {
      const exists = previous.permissions.includes(permission);

      return {
        ...previous,
        permissions: exists
          ? previous.permissions.filter((item) => item !== permission)
          : [...previous.permissions, permission],
      };
    });

    setFormDirty(true);
  };

  // Create or update using backend API
  
const handleSubmit = async (event) => {
  event.preventDefault();

  setNotice("");
  setApiError("");

  const name = formData.name.trim();
  const email = formData.email.trim().toLowerCase();
  const mobile = formData.mobile.replace(/\s+/g, "");

  // Validate required fields
  if (!name || !email || !mobile) {
    window.alert("Please fill in all required fields.");
    return;
  }

  if (!EMAIL_PATTERN.test(email)) {
    window.alert("Please enter a valid email address.");
    return;
  }

  if (!MOBILE_PATTERN.test(mobile)) {
    window.alert(
      "Enter a valid mobile number containing 10 to 15 digits."
    );
    return;
  }

  if (!editingAdmin && formData.password.length < 8) {
    window.alert("Password must contain at least 8 characters.");
    return;
  }

  // Normalize selected permissions
  const selectedPermissions = [
    ...new Set(
      formData.permissions
        .map((permission) => String(permission).trim())
        .filter(Boolean)
    ),
  ];

  if (selectedPermissions.length === 0) {
    window.alert("Please select at least one permission.");
    return;
  }

  // Check duplicate email
  const duplicateEmail = admins.some(
    (admin) =>
      admin.email.toLowerCase() === email &&
      admin.id !== editingAdmin?.id
  );

  if (duplicateEmail) {
    window.alert("An administrator with this email already exists.");
    return;
  }

  // Protect Super Admin
  if (
    editingAdmin?.role === "Super Admin" &&
    (formData.role !== "Super Admin" ||
      formData.status !== "Active")
  ) {
    window.alert(
      "The Super Admin account cannot be demoted or deactivated."
    );
    return;
  }

  // Prevent duplicate Super Admin creation
  if (
    !editingAdmin &&
    formData.role === "Super Admin" &&
    admins.some((admin) => admin.role === "Super Admin")
  ) {
    window.alert("A Super Admin account already exists.");
    return;
  }

  // Create payload BEFORE using it
  const payload = {
    name,
    email,
    mobile,
    role: formData.role,
    status: formData.status,
    permissions: selectedPermissions,
  };

  if (!editingAdmin) {
    payload.password = formData.password;
  }

  // Debug logs - payload is now initialized
  console.log("Permissions being submitted:", selectedPermissions);
  console.log("Admin update payload:", payload);

  const confirmed = window.confirm(
    editingAdmin
      ? `Save changes to administrator "${name}"?`
      : `Create a new administrator account for "${name}"?`
  );

  if (!confirmed) return;

  setSaving(true);

  try {
    const result = editingAdmin
      ? await apiRequest(`/${encodeURIComponent(editingAdmin.id)}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await apiRequest("", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    const savedAdmin = result.admin
      ? normalizeAdmin(result.admin)
      : null;

    if (savedAdmin) {
      setAdmins((previous) => {
        if (editingAdmin) {
          return previous.map((admin) =>
            admin.id === editingAdmin.id ? savedAdmin : admin
          );
        }

        return [savedAdmin, ...previous];
      });

      setViewAdmin((previous) =>
        previous?.id === savedAdmin.id ? savedAdmin : previous
      );
    } else {
      await loadAdmins();
    }

    setNotice(
      result.message ||
        (editingAdmin
          ? "Administrator updated successfully."
          : "Administrator created successfully.")
    );

    setShowModal(false);
    setEditingAdmin(null);
    setFormData({
      ...emptyForm,
      permissions: ["Dashboard"],
    });
    setFormDirty(false);
  } catch (error) {
    console.error("Save administrator error:", error);
    setApiError(error.message || "Unable to save administrator.");
  } finally {
    setSaving(false);
  }
};


  // Delete through backend API
  const handleDelete = async (admin) => {
    if (admin.role === "Super Admin") {
      window.alert("The Super Admin account cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${admin.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setApiError("");
    setNotice("");

    try {
      const result = await apiRequest(`/${encodeURIComponent(admin.id)}`, {
        method: "DELETE",
      });

      setAdmins((previous) =>
        previous.filter((item) => item.id !== admin.id)
      );

      if (viewAdmin?.id === admin.id) setViewAdmin(null);
      if (resetAdmin?.id === admin.id) setResetAdmin(null);

      setNotice(result.message || "Administrator deleted successfully.");
    } catch (error) {
      console.error("Delete administrator error:", error);
      setApiError(error.message || "Unable to delete administrator.");
    }
  };

  // Update status through backend API
  const toggleAdminStatus = async (admin) => {
    if (admin.role === "Super Admin") {
      window.alert("The Super Admin account cannot be deactivated.");
      return;
    }

    const nextStatus =
      admin.status === "Active" ? "Inactive" : "Active";

    if (
      !window.confirm(
        `Change ${admin.name}'s status to "${nextStatus}"?`
      )
    ) {
      return;
    }

    setApiError("");
    setNotice("");

    try {
      const result = await apiRequest(
        `/${encodeURIComponent(admin.id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        }
      );

      const updatedAdmin = normalizeAdmin(
        result.admin || { ...admin, status: nextStatus }
      );

      setAdmins((previous) =>
        previous.map((item) =>
          item.id === admin.id ? updatedAdmin : item
        )
      );

      setViewAdmin((previous) =>
        previous?.id === admin.id ? updatedAdmin : previous
      );

      setNotice(result.message || `Status changed to ${nextStatus}.`);
    } catch (error) {
      console.error("Update admin status error:", error);
      setApiError(error.message || "Unable to update administrator status.");
    }
  };

  // Password reset is still a demonstration; no reset endpoint is configured.
  const handleResetPassword = () => {
    if (!resetAdmin) return;

    window.alert(
      `Password reset is not connected to a backend endpoint yet. No reset link has been sent to ${resetAdmin.email}.`
    );

    setResetAdmin(null);
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-container">
        <div className="admin-management-header">
          <div className="admin-management-heading">
            <div className="admin-management-title-row">
              <div className="admin-management-title-icon">
                <UserCog size={26} />
              </div>

              <div>
                <h1>Admin Management</h1>
                <p>
                  Manage administrator accounts, roles and permissions.
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

        {(apiError || notice) && (
          <div
            role={apiError ? "alert" : "status"}
            style={{
              padding: "12px 16px",
              marginBottom: "16px",
              borderRadius: "8px",
              background: apiError ? "#fff1f0" : "#ecfdf3",
              color: apiError ? "#b42318" : "#067647",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>{apiError || notice}</span>
            {apiError && (
              <button type="button" onClick={loadAdmins}>
                <RefreshCw size={16} /> Retry
              </button>
            )}
          </div>
        )}

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

        <div className="admin-management-toolbar">
          <div className="admin-management-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, email or mobile..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search administrators"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            aria-label="Filter by role"
          >
            <option value="All">All Roles</option>
            {roles.map((role) => (
              <option value={role} key={role}>
                {role}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

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
                {loading ? (
                  <tr>
                    <td colSpan="7" className="admin-management-empty">
                      Loading administrators...
                    </td>
                  </tr>
                ) : filteredAdmins.length > 0 ? (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-management-user">
                          <div className="admin-management-avatar">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{admin.name}</strong>
                            <span>Created: {admin.createdAt || "—"}</span>
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
                          {admin.permissions.slice(0, 3).map((permission) => (
                            <span key={permission}>{permission}</span>
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
                            admin.status === "Active" ? "active" : "inactive"
                          }`}
                          onClick={() => toggleAdminStatus(admin)}
                          type="button"
                          disabled={
                            saving ||
                            admin.role === "Super Admin"
                          }
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
                            disabled={admin.role === "Super Admin"}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="admin-management-empty">
                      <UserCog size={38} />
                      <strong>No administrators found</strong>
                      <span>
                        {apiError
                          ? "Fix the API error above and retry."
                          : "Try changing your search or filter."}
                      </span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-management-table-footer">
            Showing <strong>{filteredAdmins.length}</strong> of{" "}
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
                  {editingAdmin ? "Edit Administrator" : "Add Administrator"}
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

            <form className="admin-management-form" onSubmit={handleSubmit}>
              <div className="admin-management-form-grid">
                <label>
                  Full Name *
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
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
                    required
                    maxLength={16}
                  />
                </label>

                {!editingAdmin && (
                  <label>
                    Password *
                    <input
                      type="password"
                      name="password"
                      placeholder="Minimum 8 characters"
                      value={formData.password}
                      onChange={handleInputChange}
                      minLength={8}
                      autoComplete="new-password"
                      required
                    />
                  </label>
                )}

                <label>
                  Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={editingAdmin?.role === "Super Admin"}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={editingAdmin?.role === "Super Admin"}
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
                    <p>Select the sections this administrator can access.</p>
                  </div>
                  <span>{formData.permissions.length} selected</span>
                </div>

                <div className="admin-management-permission-grid">
                  {permissionOptions.map((permission) => (
                    <label
                      className="admin-management-permission-item"
                      key={permission}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
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
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="admin-management-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingAdmin
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
                <p>View account information and permissions.</p>
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
                <strong>{viewAdmin.createdAt || "—"}</strong>
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

      {/* Password Reset Demo Modal */}
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

            <h2 id="admin-management-reset-title">Reset Password?</h2>
            <p>A password reset request would be prepared for:</p>
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
