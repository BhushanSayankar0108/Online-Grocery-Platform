import { useMemo, useState } from "react";
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

/* =========================================================
   INITIAL COUPONS
========================================================= */

const INITIAL_COUPONS = [
  {
    id: 1,
    code: "WELCOME100",
    description: "Welcome discount for new customers",
    discountType: "fixed",
    discountValue: 100,
    minOrderAmount: 499,
    maxDiscount: 100,
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    usageLimit: 500,
    usedCount: 86,
    status: "active",
  },
  {
    id: 2,
    code: "SAVE20",
    description: "20% discount on grocery orders",
    discountType: "percentage",
    discountValue: 20,
    minOrderAmount: 799,
    maxDiscount: 250,
    startDate: "2026-10-01",
    endDate: "2026-10-15",
    usageLimit: 300,
    usedCount: 142,
    status: "active",
  },
  {
    id: 3,
    code: "FESTIVE150",
    description: "Festive season special offer",
    discountType: "fixed",
    discountValue: 150,
    minOrderAmount: 999,
    maxDiscount: 150,
    startDate: "2026-09-25",
    endDate: "2026-10-10",
    usageLimit: 200,
    usedCount: 200,
    status: "inactive",
  },
  {
    id: 4,
    code: "FRESH10",
    description: "10% off on selected grocery orders",
    discountType: "percentage",
    discountValue: 10,
    minOrderAmount: 599,
    maxDiscount: 150,
    startDate: "2026-10-03",
    endDate: "2026-11-03",
    usageLimit: 1000,
    usedCount: 54,
    status: "active",
  },
];

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

/* =========================================================
   ADMIN COUPONS
========================================================= */

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState(INITIAL_COUPONS);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState("all");
  const [selectedDiscountFilter, setSelectedDiscountFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [originalFormData, setOriginalFormData] = useState(null);

  /* =========================================================
     FILTER COUPONS
  ========================================================= */

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

  /* =========================================================
     FORM HELPERS
  ========================================================= */

  const getNormalizedForm = (data) => ({
    ...data,
    code: data.code.trim().toUpperCase(),
    description: data.description.trim(),
    discountType: data.discountType,
    discountValue: String(data.discountValue),
    minOrderAmount: String(data.minOrderAmount),
    maxDiscount: String(data.maxDiscount),
    startDate: data.startDate,
    endDate: data.endDate,
    usageLimit: String(data.usageLimit),
    status: data.status,
  });

  const hasUnsavedChanges = () => {
    if (!originalFormData) {
      return false;
    }

    return (
      JSON.stringify(getNormalizedForm(formData)) !==
      JSON.stringify(getNormalizedForm(originalFormData))
    );
  };

  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  const openAddModal = () => {
    if (isModalOpen && hasUnsavedChanges()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Discard them and open a new coupon form?"
      );

      if (!confirmed) {
        return;
      }
    }

    const freshForm = { ...EMPTY_FORM };

    setEditingId(null);
    setFormData(freshForm);
    setOriginalFormData({ ...freshForm });
    setIsModalOpen(true);
  };

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  const openEditModal = (coupon) => {
    if (isModalOpen && hasUnsavedChanges()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Discard them and edit another coupon?"
      );

      if (!confirmed) {
        return;
      }
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
    setIsModalOpen(true);
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeModal = () => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );

      if (!confirmed) {
        return;
      }
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData(null);
  };

  /* =========================================================
     HANDLE INPUT CHANGE
  ========================================================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATE FORM
  ========================================================= */

  const validateForm = () => {
    const code = formData.code.trim().toUpperCase();

    if (!code) {
      window.alert("Please enter a coupon code.");
      return false;
    }

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      window.alert(
        "Coupon code can contain only letters, numbers, hyphens, and underscores."
      );
      return false;
    }

    const duplicateCode = coupons.some(
      (coupon) =>
        coupon.code.toUpperCase() === code &&
        coupon.id !== editingId
    );

    if (duplicateCode) {
      window.alert(
        "A coupon with this code already exists. Please use a different code."
      );
      return false;
    }

    if (!formData.discountValue.trim()) {
      window.alert("Please enter a discount value.");
      return false;
    }

    const discountValue = Number(formData.discountValue);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      window.alert("Discount value must be greater than zero.");
      return false;
    }

    if (
      formData.discountType === "percentage" &&
      discountValue > 100
    ) {
      window.alert(
        "Percentage discount cannot be greater than 100."
      );
      return false;
    }

    if (!formData.minOrderAmount.trim()) {
      window.alert("Please enter the minimum order amount.");
      return false;
    }

    const minOrderAmount = Number(formData.minOrderAmount);

    if (
      !Number.isFinite(minOrderAmount) ||
      minOrderAmount < 0
    ) {
      window.alert(
        "Minimum order amount cannot be negative."
      );
      return false;
    }

    if (!formData.maxDiscount.trim()) {
      window.alert("Please enter the maximum discount.");
      return false;
    }

    const maxDiscount = Number(formData.maxDiscount);

    if (!Number.isFinite(maxDiscount) || maxDiscount <= 0) {
      window.alert(
        "Maximum discount must be greater than zero."
      );
      return false;
    }

    if (!formData.startDate) {
      window.alert("Please select the start date.");
      return false;
    }

    if (!formData.endDate) {
      window.alert("Please select the end date.");
      return false;
    }

    const startDate = new Date(
      `${formData.startDate}T00:00:00`
    );
    const endDate = new Date(
      `${formData.endDate}T00:00:00`
    );

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      window.alert("Please select valid coupon dates.");
      return false;
    }

    if (endDate < startDate) {
      window.alert(
        "End date cannot be before the start date."
      );
      return false;
    }

    if (!formData.usageLimit.trim()) {
      window.alert("Please enter the usage limit.");
      return false;
    }

    const usageLimit = Number(formData.usageLimit);

    if (
      !Number.isInteger(usageLimit) ||
      usageLimit < 1
    ) {
      window.alert(
        "Usage limit must be a whole number greater than zero."
      );
      return false;
    }

    const existingCoupon = coupons.find(
      (coupon) => coupon.id === editingId
    );

    if (
      existingCoupon &&
      usageLimit < existingCoupon.usedCount
    ) {
      window.alert(
        `Usage limit cannot be less than the ${existingCoupon.usedCount} times this coupon has already been used.`
      );
      return false;
    }

    return true;
  };

  /* =========================================================
     SAVE / UPDATE COUPON
  ========================================================= */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

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

    if (!confirmed) {
      return;
    }

    if (isEditing) {
      setCoupons((previous) =>
        previous.map((coupon) =>
          coupon.id === editingId
            ? {
                ...coupon,
                ...couponData,
              }
            : coupon
        )
      );

      window.alert("Coupon updated successfully.");
    } else {
      const newCoupon = {
        id: Date.now(),
        ...couponData,
        usedCount: 0,
      };

      setCoupons((previous) => [
        newCoupon,
        ...previous,
      ]);

      window.alert("Coupon created successfully.");
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData(null);
  };

  /* =========================================================
     DELETE COUPON
  ========================================================= */

  const handleDelete = (coupon) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete coupon "${coupon.code}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setCoupons((previous) =>
      previous.filter((item) => item.id !== coupon.id)
    );

    window.alert(`Coupon "${coupon.code}" deleted successfully.`);
  };

  /* =========================================================
     TOGGLE COUPON STATUS
  ========================================================= */

  const handleStatusToggle = (coupon) => {
    const newStatus =
      coupon.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to ${
        newStatus === "active" ? "activate" : "deactivate"
      } coupon "${coupon.code}"?`
    );

    if (!confirmed) {
      return;
    }

    setCoupons((previous) =>
      previous.map((item) =>
        item.id === coupon.id
          ? {
              ...item,
              status: newStatus,
            }
          : item
      )
    );

    window.alert(
      `Coupon "${coupon.code}" is now ${newStatus}.`
    );
  };

  /* =========================================================
     FORMAT HELPERS
  ========================================================= */

  const formatDiscount = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}%`;
    }

    return `₹${Number(coupon.discountValue).toLocaleString(
      "en-IN"
    )}`;
  };

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    const date = new Date(`${dateString}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUsagePercentage = (coupon) => {
    if (!coupon.usageLimit || coupon.usageLimit <= 0) {
      return 0;
    }

    return Math.min(
      100,
      Math.max(
        0,
        (coupon.usedCount / coupon.usageLimit) * 100
      )
    );
  };

  /* =========================================================
     PAGE UI
  ========================================================= */

  return (
    <div className="admin-coupons-page">
      <div className="admin-coupons-container">

        {/* HEADER */}

        <div className="admin-coupons-header">
          <div>
            <p className="admin-coupons-eyebrow">
              Marketing Management
            </p>

            <h1>Coupons &amp; Offers</h1>

            <p className="admin-coupons-header-text">
              Create and manage discount coupons and
              promotional offers.
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

        {/* STATISTICS */}

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
                {
                  coupons.filter(
                    (coupon) => coupon.status === "active"
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
              <span>Percentage Offers</span>
              <strong>
                {
                  coupons.filter(
                    (coupon) =>
                      coupon.discountType === "percentage"
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
                {
                  coupons.filter(
                    (coupon) => coupon.discountType === "fixed"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* SEARCH AND FILTERS */}

        <div className="admin-coupons-toolbar">
          <div className="admin-coupons-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
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

        {/* COUPON TABLE */}

        <div className="admin-coupons-table-card">
          <div className="admin-coupons-table-header">
            <div>
              <h2>Coupon List</h2>

              <p>
                {filteredCoupons.length} coupon
                {filteredCoupons.length !== 1 ? "s" : ""} found
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
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon, index) => (
                    <tr key={coupon.id}>
                      <td className="coupon-number">
                        {index + 1}
                      </td>

                      <td>
                        <div className="coupon-info-cell">
                          <div className="coupon-code">
                            {coupon.code}
                          </div>

                          <span>
                            {coupon.description || "No description"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="coupon-discount-cell">
                          <strong>
                            {formatDiscount(coupon)}
                          </strong>

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
                          <span>
                            {formatDate(coupon.startDate)}
                          </span>

                          <span>to</span>

                          <span>
                            {formatDate(coupon.endDate)}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="coupon-usage-cell">
                          <strong>
                            {coupon.usedCount}/{coupon.usageLimit}
                          </strong>

                          <div
                            className="coupon-usage-bar"
                            aria-label={`${Math.round(
                              getUsagePercentage(coupon)
                            )}% used`}
                          >
                            <span
                              style={{
                                width: `${getUsagePercentage(
                                  coupon
                                )}%`,
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
                          title={`Click to ${
                            coupon.status === "active"
                              ? "deactivate"
                              : "activate"
                          } coupon`}
                          aria-label={`Coupon ${coupon.code} is ${coupon.status}. Change status`}
                        >
                          {coupon.status === "active"
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
                            onClick={() => openEditModal(coupon)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="coupon-delete-button"
                            title="Delete coupon"
                            aria-label={`Delete coupon ${coupon.code}`}
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
                    <td
                      colSpan="8"
                      className="coupons-empty-state"
                    >
                      <div>
                        <TicketPercent size={34} />

                        <h3>No coupons found</h3>

                        <p>
                          Try changing your search or filters.
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

      {/* ADD / EDIT MODAL */}

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
                  {editingId !== null
                    ? "Edit Coupon"
                    : "Add Coupon"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-coupons-modal-close"
                onClick={closeModal}
                aria-label="Close coupon form"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-coupons-form"
              onSubmit={handleSubmit}
            >
              {/* COUPON CODE */}

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

              {/* DESCRIPTION */}

              <div className="admin-coupons-form-group">
                <label htmlFor="coupon-description">
                  Description
                </label>

                <textarea
                  id="coupon-description"
                  name="description"
                  rows="3"
                  placeholder="Describe the offer..."
                  value={formData.description}
                  onChange={handleInputChange}
                  maxLength={300}
                />
              </div>

              {/* DISCOUNT TYPE AND VALUE */}

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
                      <option value="percentage">
                        Percentage
                      </option>

                      <option value="fixed">
                        Fixed Amount
                      </option>
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
                      {formData.discountType === "percentage"
                        ? "%"
                        : "₹"}
                    </span>

                    <input
                      id="coupon-discount-value"
                      name="discountValue"
                      type="number"
                      min="0.01"
                      max={
                        formData.discountType === "percentage"
                          ? "100"
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

              {/* MINIMUM ORDER AND MAXIMUM DISCOUNT */}

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

              {/* START DATE AND END DATE */}

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

              {/* USAGE LIMIT AND STATUS */}

              <div className="coupon-form-two-column">
                <div className="admin-coupons-form-group">
                  <label htmlFor="coupon-usage-limit">
                    Usage Limit <span>*</span>
                  </label>

                  <input
                    id="coupon-usage-limit"
                    name="usageLimit"
                    type="number"
                    min="1"
                    step="1"
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

              {/* COUPON RULES */}

              <div className="coupon-info-box">
                <strong>Coupon Rules</strong>

                <p>
                  Percentage discounts cannot exceed 100%.
                  The end date must be on or after the start
                  date. Coupon codes must be unique.
                </p>
              </div>

              {/* FORM ACTIONS */}

              <div className="admin-coupons-form-actions">
                <button
                  type="button"
                  className="coupon-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-button"
                >
                  {editingId !== null
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