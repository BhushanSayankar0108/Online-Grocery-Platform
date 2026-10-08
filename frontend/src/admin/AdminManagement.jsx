import { useMemo, useState } from "react";
import {
  Activity,
  ArrowLeft,
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
import { useNavigate } from "react-router-dom";
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

function AdminManagement() {
  const navigate = useNavigate();

  const [admins, setAdmins] = useState(initialAdmins);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [viewAdmin, setViewAdmin] = useState(null);
  const [resetAdmin, setResetAdmin] = useState(null);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const search = searchTerm.toLowerCase().trim();

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

  const openAddModal = () => {
    setEditingAdmin(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

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
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingAdmin(null);
    setFormData(emptyForm);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePermission = (permission) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(permission);

      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((item) => item !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim()
    ) {
      alert("Please fill all required fields.");
      return;
    }

    if (formData.permissions.length === 0) {
      alert("Please select at least one permission.");
      return;
    }

    if (editingAdmin) {
      setAdmins((prev) =>
        prev.map((admin) =>
          admin.id === editingAdmin.id
            ? {
                ...admin,
                ...formData,
              }
            : admin
        )
      );
    } else {
      const newAdmin = {
        id: Date.now(),
        ...formData,
        lastLogin: "Never",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setAdmins((prev) => [newAdmin, ...prev]);
    }

    closeModal();
  };

  const handleDelete = (admin) => {
    if (admin.role === "Super Admin") {
      alert("Super Admin cannot be deleted.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${admin.name}?`
    );

    if (!confirmed) return;

    setAdmins((prev) => prev.filter((item) => item.id !== admin.id));
  };

  const toggleAdminStatus = (admin) => {
    setAdmins((prev) =>
      prev.map((item) =>
        item.id === admin.id
          ? {
              ...item,
              status: item.status === "Active" ? "Inactive" : "Active",
            }
          : item
      )
    );
  };

  const handleResetPassword = () => {
    if (!resetAdmin) return;

    alert(
      `Password reset link would be sent to ${resetAdmin.email}.`
    );

    setResetAdmin(null);
  };

  return (
    <div className="admin-management-page">
      <div className="admin-management-container">
        {/* Header */}
        <div className="admin-management-header">
          <div className="admin-management-heading">
            <button
              className="admin-management-back-button"
              onClick={() => navigate("/admin/dashboard")}
              type="button"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>

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
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Manager">Manager</option>
            <option value="Content Manager">Content Manager</option>
            <option value="Order Manager">Order Manager</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
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
                          onClick={() => toggleAdminStatus(admin)}
                          type="button"
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
                            onClick={() => setViewAdmin(admin)}
                            type="button"
                          >
                            <Eye size={16} />
                          </button>

                          <button
                            className="admin-management-action edit"
                            title="Edit Admin"
                            onClick={() => openEditModal(admin)}
                            type="button"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            className="admin-management-action password"
                            title="Reset Password"
                            onClick={() => setResetAdmin(admin)}
                            type="button"
                          >
                            <KeyRound size={16} />
                          </button>

                          <button
                            className="admin-management-action delete"
                            title="Delete Admin"
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
          <div className="admin-management-modal">
            <div className="admin-management-modal-header">
              <div>
                <h2>
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
                  />
                </label>

                <label>
                  Role
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                  >
                    <option value="Super Admin">Super Admin</option>
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
                >
                  Cancel
                </button>

                <button
                  className="admin-management-save-button"
                  type="submit"
                >
                  {editingAdmin ? "Update Admin" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewAdmin && (
        <div className="admin-management-modal-overlay">
          <div className="admin-management-view-modal">
            <div className="admin-management-modal-header">
              <div>
                <h2>Administrator Details</h2>
                <p>View account information and permissions.</p>
              </div>

              <button
                className="admin-management-modal-close"
                onClick={() => setViewAdmin(null)}
                type="button"
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
          <div className="admin-management-reset-modal">
            <div className="admin-management-reset-icon">
              <KeyRound size={28} />
            </div>

            <h2>Reset Password?</h2>

            <p>
              A password reset link would be sent to:
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
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminManagement;