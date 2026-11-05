
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Edit,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

import "./AdminCoupons.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscount: "",
  startDate: "",
  endDate: "",
  usageLimit: "",
  status: "active",
};

const getAdminToken = () => {
  const keys = ["adminToken", "token", "accessToken", "jwt"];

  for (const key of keys) {
    const value =
      localStorage.getItem(key) || sessionStorage.getItem(key);

    if (value) return value;
  }

  return "";
};

const toDateInput = (value) => {
  if (!value) return "";

  const date = String(value);
  return date.length >= 10 ? date.slice(0, 10) : "";
};

const normalizeCoupon = (coupon) => ({
  ...coupon,
  id: coupon._id || coupon.id,
  code: String(coupon.code || "").toUpperCase(),
  description: coupon.description || "",
  discountType: coupon.discountType || "percentage",
  discountValue: Number(coupon.discountValue || 0),
  minOrderAmount: Number(coupon.minOrderAmount || 0),
  maxDiscount: Number(coupon.maxDiscount || 0),
  startDate: toDateInput(coupon.startDate),
  endDate: toDateInput(coupon.endDate),
  usageLimit: Number(coupon.usageLimit || 0),
  usedCount: Number(coupon.usedCount || 0),
  status: coupon.status || "inactive",
});

const normalizeForm = (data) => ({
  ...data,
  code: String(data.code ?? "").trim().toUpperCase(),
  description: String(data.description ?? "").trim(),
  discountValue: String(data.discountValue ?? ""),
  minOrderAmount: String(data.minOrderAmount ?? ""),
  maxDiscount: String(data.maxDiscount ?? ""),
  usageLimit: String(data.usageLimit ?? ""),
});

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedDiscountFilter, setSelectedDiscountFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [originalFormData, setOriginalFormData] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionId, setActionId] = useState(null);

  const apiRequest = useCallback(async (endpoint, options = {}) => {
    const token = getAdminToken();

    const headers = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success === false) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          data.message ||
            "Admin authentication failed. Please sign in again."
        );
      }

      throw new Error(
        data.message || `Request failed with status ${response.status}.`
      );
    }

    return data;
  }, []);

  const loadCoupons = useCallback(async () => {
    setPageError("");

    try {
      const data = await apiRequest("/api/coupons/admin");

      if (!Array.isArray(data.coupons)) {
        throw new Error("The server returned an invalid coupon list.");
      }

      setCoupons(data.coupons.map(normalizeCoupon));
    } catch (error) {
      setPageError(error.message || "Unable to load coupons.");
    } finally {
      setIsLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadCoupons();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [loadCoupons]);

  const filteredCoupons = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !search ||
        coupon.code.toLowerCase().includes(search) ||
        coupon.description.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatusFilter === "all" ||
        coupon.status === selectedStatusFilter;

      const matchesDiscount =
        selectedDiscountFilter === "all" ||
        coupon.discountType === selectedDiscountFilter;

      return matchesSearch && matchesStatus && matchesDiscount;
    });
  }, [
    coupons,
    searchTerm,
    selectedStatusFilter,
    selectedDiscountFilter,
  ]);

  const hasUnsavedChanges = () => {
    if (!originalFormData) return false;

    return (
      JSON.stringify(normalizeForm(formData)) !==
      JSON.stringify(normalizeForm(originalFormData))
    );
  };

  const openAddModal = () => {
    if (
      isModalOpen &&
      hasUnsavedChanges() &&
      !window.confirm(
        "You have unsaved changes. Discard them and open a new coupon form?"
      )
    ) {
      return;
    }

    const freshForm = { ...EMPTY_FORM };

    setEditingId(null);
    setFormData(freshForm);
    setOriginalFormData({ ...freshForm });
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    if (
      isModalOpen &&
      hasUnsavedChanges() &&
      !window.confirm(
        "You have unsaved changes. Discard them and edit another coupon?"
      )
    ) {
      return;
    }

    const editForm = {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount: String(coupon.maxDiscount),
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: String(coupon.usageLimit),
      status: coupon.status,
    };

    setEditingId(coupon.id);
    setFormData(editForm);
    setOriginalFormData({ ...editForm });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      hasUnsavedChanges() &&
      !window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      )
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData(null);
    setFormError("");
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData(null);
    setFormError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const code = formData.code.trim().toUpperCase();

    if (!code) {
      setFormError("Please enter a coupon code.");
      return false;
    }

    if (!/^[A-Z0-9_-]+$/.test(code) || code.length > 40) {
      setFormError(
        "Coupon code can contain up to 40 letters, numbers, hyphens or underscores."
      );
      return false;
    }

    const duplicateCode = coupons.some(
      (coupon) =>
        coupon.code.toUpperCase() === code &&
        String(coupon.id) !== String(editingId)
    );

    if (duplicateCode) {
      setFormError(
        "A coupon with this code already exists. Use a different code."
      );
      return false;
    }

    const discountValue = Number(formData.discountValue);
    const minOrderAmount = Number(formData.minOrderAmount);
    const maxDiscount = Number(formData.maxDiscount);
    const usageLimit = Number(formData.usageLimit);

    if (
      !formData.discountValue.trim() ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0
    ) {
      setFormError("Discount value must be greater than zero.");
      return false;
    }

    if (
      formData.discountType === "percentage" &&
      discountValue > 100
    ) {
      setFormError("Percentage discount cannot exceed 100%.");
      return false;
    }

    if (
      !formData.minOrderAmount.trim() ||
      !Number.isFinite(minOrderAmount) ||
      minOrderAmount < 0
    ) {
      setFormError("Minimum order amount must be zero or greater.");
      return false;
    }

    if (
      !formData.maxDiscount.trim() ||
      !Number.isFinite(maxDiscount) ||
      maxDiscount <= 0
    ) {
      setFormError("Maximum discount must be greater than zero.");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      setFormError("Please select both coupon dates.");
      return false;
    }

    if (formData.endDate < formData.startDate) {
      setFormError("End date cannot be before the start date.");
      return false;
    }

    if (
      !formData.usageLimit.trim() ||
      !Number.isInteger(usageLimit) ||
      usageLimit < 1
    ) {
      setFormError("Usage limit must be a positive whole number.");
      return false;
    }

    const existingCoupon = coupons.find(
      (coupon) => String(coupon.id) === String(editingId)
    );

    if (existingCoupon && usageLimit < existingCoupon.usedCount) {
      setFormError(
        `Usage limit cannot be less than the ${existingCoupon.usedCount} times this coupon has already been used.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    const couponData = {
      code: formData.code.trim().toUpperCase(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount),
      maxDiscount: Number(formData.maxDiscount),
      startDate: formData.startDate,
      endDate: formData.endDate,
      usageLimit: Number(formData.usageLimit),
      status: formData.status,
    };

    const isEditing = editingId !== null;

    const confirmed = window.confirm(
      isEditing
        ? `Are you sure you want to update coupon "${couponData.code}"?`
        : `Are you sure you want to create coupon "${couponData.code}"?`
    );

    if (!confirmed) return;

    setIsSaving(true);

    try {
      const endpoint = isEditing
        ? `/api/coupons/admin/${encodeURIComponent(editingId)}`
        : "/api/coupons/admin";

      const data = await apiRequest(endpoint, {
        method: isEditing ? "PUT" : "POST",
        body: JSON.stringify(couponData),
      });

      if (data.coupon) {
        const savedCoupon = normalizeCoupon(data.coupon);

        setCoupons((previous) =>
          isEditing
            ? previous.map((coupon) =>
                String(coupon.id) === String(editingId)
                  ? savedCoupon
                  : coupon
              )
            : [savedCoupon, ...previous]
        );
      } else {
        await loadCoupons();
      }

      window.alert(
        isEditing
          ? "Coupon updated successfully."
          : "Coupon created successfully."
      );

      resetForm();
    } catch (error) {
      setFormError(error.message || "Unable to save coupon.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (coupon) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete coupon "${coupon.code}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setActionId(coupon.id);
    setPageError("");

    try {
      await apiRequest(
        `/api/coupons/admin/${encodeURIComponent(coupon.id)}`,
        { method: "DELETE" }
      );

      setCoupons((previous) =>
        previous.filter(
          (item) => String(item.id) !== String(coupon.id)
        )
      );

      window.alert(`Coupon "${coupon.code}" deleted successfully.`);
    } catch (error) {
      setPageError(error.message || "Unable to delete coupon.");
    } finally {
      setActionId(null);
    }
  };

  const handleStatusToggle = async (coupon) => {
    const newStatus =
      coupon.status === "active" ? "inactive" : "active";

    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus === "active" ? "activate" : "deactivate"
        } coupon "${coupon.code}"?`
      )
    ) {
      return;
    }

    setActionId(coupon.id);
    setPageError("");

    try {
      const data = await apiRequest(
        `/api/coupons/admin/${encodeURIComponent(coupon.id)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const updatedCoupon = data.coupon
        ? normalizeCoupon(data.coupon)
        : { ...coupon, status: newStatus };

      setCoupons((previous) =>
        previous.map((item) =>
          String(item.id) === String(coupon.id)
            ? updatedCoupon
            : item
        )
      );

      window.alert(`Coupon "${coupon.code}" is now ${newStatus}.`);
    } catch (error) {
      setPageError(error.message || "Unable to update coupon status.");
    } finally {
      setActionId(null);
    }
  };

  const formatDiscount = (coupon) =>
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}%`
      : `₹${Number(coupon.discountValue).toLocaleString("en-IN")}`;

  const formatCurrency = (amount) =>
    `₹${Number(amount).toLocaleString("en-IN")}`;

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) return dateString;

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUsagePercentage = (coupon) => {
    if (!coupon.usageLimit || coupon.usageLimit <= 0) return 0;

    return Math.min(
      100,
      Math.max(0, (coupon.usedCount / coupon.usageLimit) * 100)
    );
  };

  return (
    <div className="admin-coupons-page">
      <div className="admin-coupons-container">
        <div className="admin-coupons-header">
          <div>
            <p className="admin-coupons-eyebrow">
              Marketing Management
            </p>
            <h1>Coupons &amp; Offers</h1>
            <p className="admin-coupons-header-text">
              Create and manage discount coupons and promotional offers.
            </p>
          </div>

          <button
            type="button"
            className="admin-coupons-add-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            <span>Add Coupon</span>
          </button>
        </div>

        {pageError && (
          <div className="coupons-empty-state" role="alert">
            <p>{pageError}</p>
            <button type="button" onClick={loadCoupons}>
              Retry
            </button>
          </div>
        )}

        <div className="admin-coupons-stats">
          <div className="admin-coupons-stat-card">
            <div className="admin-coupons-stat-icon">
              <TicketPercent size={20} />
            </div>
            <div>
              <span>Total Coupons</span>
              <strong>{coupons.length}</strong>
            </div>
          </div>

          <div className="admin-coupons-stat-card">
            <div className="admin-coupons-stat-icon">
              <TicketPercent size={20} />
            </div>
            <div>
              <span>Active</span>
              <strong>
                {coupons.filter((coupon) => coupon.status === "active").length}
              </strong>
            </div>
          </div>

          <div className="admin-coupons-stat-card">
            <div className="admin-coupons-stat-icon">
              <TicketPercent size={20} />
            </div>
            <div>
              <span>Percentage Offers</span>
              <strong>
                {
                  coupons.filter(
                    (coupon) => coupon.discountType === "percentage"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="admin-coupons-stat-card">
            <div className="admin-coupons-stat-icon">
              <TicketPercent size={20} />
            </div>
            <div>
              <span>Fixed Offers</span>
              <strong>
                {coupons.filter((coupon) => coupon.discountType === "fixed").length}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-coupons-toolbar">
          <div className="admin-coupons-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              aria-label="Search coupons"
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-coupons-clear-search"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="admin-coupons-filter">
            <select
              value={selectedStatusFilter}
              onChange={(event) =>
                setSelectedStatusFilter(event.target.value)
              }
              aria-label="Filter by status"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <ChevronDown size={17} />
          </div>

          <div className="admin-coupons-filter">
            <select
              value={selectedDiscountFilter}
              onChange={(event) =>
                setSelectedDiscountFilter(event.target.value)
              }
              aria-label="Filter by discount type"
            >
              <option value="all">All Discount Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
            <ChevronDown size={17} />
          </div>
        </div>

        <div className="admin-coupons-table-card">
          <div className="admin-coupons-table-header">
            <div>
              <h2>Coupon List</h2>
              <p>
                {isLoading
                  ? "Loading coupons..."
                  : `${filteredCoupons.length} coupon${
                      filteredCoupons.length !== 1 ? "s" : ""
                    } found`}
              </p>
            </div>
          </div>

          <div className="admin-coupons-table-wrapper">
            <table className="admin-coupons-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coupon</th>
                  <th>Discount</th>
                  <th>Min. Order</th>
                  <th>Validity</th>
                  <th>Usage</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="coupons-empty-state">
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon, index) => (
                    <tr key={coupon.id}>
                      <td className="coupon-number">{index + 1}</td>

                      <td>
                        <div className="coupon-info-cell">
                          <div className="coupon-code">{coupon.code}</div>
                          <span>{coupon.description || "No description"}</span>
                        </div>
                      </td>

                      <td>
                        <div className="coupon-discount-cell">
                          <strong>{formatDiscount(coupon)}</strong>
                          <span>
                            {coupon.discountType === "percentage"
                              ? "Percentage"
                              : "Fixed Amount"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <strong className="coupon-min-order">
                          {formatCurrency(coupon.minOrderAmount)}
                        </strong>
                      </td>

                      <td>
                        <div className="coupon-validity-cell">
                          <span>{formatDate(coupon.startDate)}</span>
                          <span>to</span>
                          <span>{formatDate(coupon.endDate)}</span>
                        </div>
                      </td>

                      <td>
                        <div className="coupon-usage-cell">
                          <strong>
                            {coupon.usedCount}/{coupon.usageLimit}
                          </strong>
                          <div
                            className="coupon-usage-bar"
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(
                              getUsagePercentage(coupon)
                            )}
                            aria-label={`Usage for ${coupon.code}`}
                          >
                            <span
                              style={{
                                width: `${getUsagePercentage(coupon)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={`coupon-status-button ${coupon.status}`}
                          onClick={() => handleStatusToggle(coupon)}
                          disabled={actionId !== null}
                          title={`Click to ${
                            coupon.status === "active"
                              ? "deactivate"
                              : "activate"
                          } coupon`}
                          aria-label={`Coupon ${coupon.code} is ${coupon.status}. Change status`}
                        >
                          {actionId === coupon.id
                            ? "Saving..."
                            : coupon.status === "active"
                              ? "Active"
                              : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <div className="coupon-actions">
                          <button
                            type="button"
                            className="coupon-edit-button"
                            title="Edit coupon"
                            aria-label={`Edit coupon ${coupon.code}`}
                            disabled={actionId !== null}
                            onClick={() => openEditModal(coupon)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="coupon-delete-button"
                            title="Delete coupon"
                            aria-label={`Delete coupon ${coupon.code}`}
                            disabled={actionId !== null}
                            onClick={() => handleDelete(coupon)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="coupons-empty-state">
                      <div>
                        <TicketPercent size={34} />
                        <h3>No coupons found</h3>
                        <p>
                          {coupons.length === 0
                            ? "Create your first coupon using Add Coupon."
                            : "Try changing your search or filters."}
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

      {isModalOpen && (
        <div
          className="admin-coupons-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="admin-coupons-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="coupon-modal-title"
          >
            <div className="admin-coupons-modal-header">
              <div>
                <p>Marketing Management</p>
                <h2 id="coupon-modal-title">
                  {editingId !== null ? "Edit Coupon" : "Add Coupon"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-coupons-modal-close"
                onClick={closeModal}
                aria-label="Close coupon form"
                title="Close"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="coupon-info-box" role="alert">
                <strong>Unable to save coupon</strong>
                <p>{formError}</p>
              </div>
            )}

            <form className="admin-coupons-form" onSubmit={handleSubmit}>
              <div className="admin-coupons-form-group">
                <label htmlFor="coupon-code">
                  Coupon Code <span>*</span>
                </label>
                <input
                  id="coupon-code"
                  name="code"
                  type="text"
                  placeholder="Example: SAVE20"
                  value={formData.code}
                  onChange={handleInputChange}
                  maxLength={40}
                  autoComplete="off"
                  required
                />
              </div>

              <div className="admin-coupons-form-group">
                <label htmlFor="coupon-description">Description</label>
                <textarea
                  id="coupon-description"
                  name="description"
                  rows={3}
                  placeholder="Describe the offer..."
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={300}
                />
              </div>

              <div className="coupon-form-two-column">
                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-discount-type">
                    Discount Type <span>*</span>
                  </label>
                  <div className="admin-coupons-select-wrapper">
                    <select
                      id="coupon-discount-type"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="percentage">Percentage</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </div>

                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-discount-value">
                    Discount Value <span>*</span>
                  </label>
                  <div className="coupon-value-input">
                    <span>
                      {formData.discountType === "percentage" ? "%" : "₹"}
                    </span>
                    <input
                      id="coupon-discount-value"
                      name="discountValue"
                      type="number"
                      min="0.01"
                      max={
                        formData.discountType === "percentage"
                          ? 100
                          : undefined
                      }
                      step="0.01"
                      placeholder="0"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="coupon-form-two-column">
                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-min-order">
                    Minimum Order Amount <span>*</span>
                  </label>
                  <div className="coupon-value-input">
                    <span>₹</span>
                    <input
                      id="coupon-min-order"
                      name="minOrderAmount"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="499"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-max-discount">
                    Maximum Discount <span>*</span>
                  </label>
                  <div className="coupon-value-input">
                    <span>₹</span>
                    <input
                      id="coupon-max-discount"
                      name="maxDiscount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="250"
                      value={formData.maxDiscount}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="coupon-form-two-column">
                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-start-date">
                    Start Date <span>*</span>
                  </label>
                  <input
                    id="coupon-start-date"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    max={formData.endDate || undefined}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-end-date">
                    End Date <span>*</span>
                  </label>
                  <input
                    id="coupon-end-date"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate || undefined}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="coupon-form-two-column">
                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-usage-limit">
                    Usage Limit <span>*</span>
                  </label>
                  <input
                    id="coupon-usage-limit"
                    name="usageLimit"
                    type="number"
                    min={1}
                    step={1}
                    placeholder="500"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-status">Status</label>
                  <div className="admin-coupons-select-wrapper">
                    <select
                      id="coupon-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </div>
              </div>

              <div className="coupon-info-box">
                <strong>Coupon Rules</strong>
                <p>
                  Percentage discounts cannot exceed 100%. The end date must
                  be on or after the start date. Coupon codes must be unique.
                </p>
              </div>

              <div className="admin-coupons-form-actions">
                <button
                  type="button"
                  className="coupon-cancel-button"
                  onClick={closeModal}
                  disabled={isSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-button"
                  disabled={isSaving}
                >
                  {isSaving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Coupon"
                      : "Save Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
