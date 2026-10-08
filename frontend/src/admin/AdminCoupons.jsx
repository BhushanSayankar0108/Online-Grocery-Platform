import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    Edit,
    Plus,
    Search,
    TicketPercent,
    Trash2,
    X
} from "lucide-react";

import "./AdminCoupons.css";

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
        status: "active"
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
        status: "active"
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
        status: "inactive"
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
        status: "active"
    }
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
    status: "active"
};

const AdminCoupons = () => {
    const navigate = useNavigate();

    const [coupons, setCoupons] =
        useState(INITIAL_COUPONS);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState("all");

    const [selectedDiscountFilter, setSelectedDiscountFilter] =
        useState("all");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [formData, setFormData] =
        useState(EMPTY_FORM);

    const filteredCoupons = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return coupons.filter((coupon) => {
            const matchesSearch =
                !search ||
                coupon.code
                    .toLowerCase()
                    .includes(search) ||
                coupon.description
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                selectedStatusFilter === "all" ||
                coupon.status ===
                    selectedStatusFilter;

            const matchesDiscount =
                selectedDiscountFilter === "all" ||
                coupon.discountType ===
                    selectedDiscountFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesDiscount
            );
        });
    }, [
        coupons,
        searchTerm,
        selectedStatusFilter,
        selectedDiscountFilter
    ]);

    const openAddModal = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEditModal = (coupon) => {
        setEditingId(coupon.id);

        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: String(
                coupon.discountValue
            ),
            minOrderAmount: String(
                coupon.minOrderAmount
            ),
            maxDiscount: String(
                coupon.maxDiscount
            ),
            startDate: coupon.startDate,
            endDate: coupon.endDate,
            usageLimit: String(
                coupon.usageLimit
            ),
            status: coupon.status
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
    };

    const handleInputChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.code.trim()) {
            alert("Please enter coupon code.");
            return;
        }

        if (!formData.discountValue) {
            alert("Please enter discount value.");
            return;
        }

        if (!formData.minOrderAmount) {
            alert(
                "Please enter minimum order amount."
            );
            return;
        }

        if (!formData.maxDiscount) {
            alert("Please enter maximum discount.");
            return;
        }

        if (!formData.startDate) {
            alert("Please select start date.");
            return;
        }

        if (!formData.endDate) {
            alert("Please select end date.");
            return;
        }

        if (
            new Date(formData.endDate) <
            new Date(formData.startDate)
        ) {
            alert(
                "End date cannot be before start date."
            );
            return;
        }

        if (!formData.usageLimit) {
            alert("Please enter usage limit.");
            return;
        }

        if (
            formData.discountType ===
                "percentage" &&
            Number(formData.discountValue) > 100
        ) {
            alert(
                "Percentage discount cannot be greater than 100."
            );
            return;
        }

        const couponData = {
            code: formData.code
                .trim()
                .toUpperCase(),
            description:
                formData.description.trim(),
            discountType:
                formData.discountType,
            discountValue:
                Number(formData.discountValue),
            minOrderAmount:
                Number(formData.minOrderAmount),
            maxDiscount:
                Number(formData.maxDiscount),
            startDate:
                formData.startDate,
            endDate:
                formData.endDate,
            usageLimit:
                Number(formData.usageLimit),
            status:
                formData.status
        };

        if (editingId) {
            setCoupons((previous) =>
                previous.map((coupon) =>
                    coupon.id === editingId
                        ? {
                              ...coupon,
                              ...couponData
                          }
                        : coupon
                )
            );
        } else {
            const newCoupon = {
                id: Date.now(),
                ...couponData,
                usedCount: 0
            };

            setCoupons((previous) => [
                newCoupon,
                ...previous
            ]);
        }

        closeModal();
    };

    const handleDelete = (coupon) => {
        const confirmed =
            window.confirm(
                `Are you sure you want to delete coupon "${coupon.code}"?`
            );

        if (!confirmed) {
            return;
        }

        setCoupons((previous) =>
            previous.filter(
                (item) =>
                    item.id !== coupon.id
            )
        );
    };

    const handleStatusToggle = (coupon) => {
        const newStatus =
            coupon.status === "active"
                ? "inactive"
                : "active";

        setCoupons((previous) =>
            previous.map((item) =>
                item.id === coupon.id
                    ? {
                          ...item,
                          status: newStatus
                      }
                    : item
            )
        );
    };

    const formatDiscount = (coupon) => {
        if (
            coupon.discountType ===
            "percentage"
        ) {
            return `${coupon.discountValue}%`;
        }

        return `₹${coupon.discountValue}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "-";
        }

        const date = new Date(
            `${dateString}T00:00:00`
        );

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString(
            "en-GB",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    return (
        <div className="admin-coupons-page">

            <div className="admin-coupons-container">

                {/* BACK BUTTON */}

                <div className="admin-coupons-back-wrapper">
                    <button
                        type="button"
                        className="admin-coupons-back-button"
                        onClick={() =>
                            navigate(
                                "/admin/dashboard"
                            )
                        }
                    >
                        <ArrowLeft size={17} />

                        <span>
                            Back to Dashboard
                        </span>
                    </button>
                </div>

                {/* HEADER */}

                <div className="admin-coupons-header">

                    <div>
                        <p className="admin-coupons-eyebrow">
                            Marketing Management
                        </p>

                        <h1>
                            Coupons & Offers
                        </h1>

                        <p className="admin-coupons-header-text">
                            Create and manage discount
                            coupons and promotional offers.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-coupons-add-button"
                        onClick={
                            openAddModal
                        }
                    >
                        <Plus size={18} />

                        <span>
                            Add Coupon
                        </span>
                    </button>

                </div>

                {/* STATS */}

                <div className="admin-coupons-stats">

                    <div className="admin-coupons-stat-card">

                        <div className="admin-coupons-stat-icon">
                            <TicketPercent
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Total Coupons
                            </span>

                            <strong>
                                {
                                    coupons.length
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="admin-coupons-stat-card">

                        <div className="admin-coupons-stat-icon">
                            <TicketPercent
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Active
                            </span>

                            <strong>
                                {
                                    coupons.filter(
                                        (coupon) =>
                                            coupon.status ===
                                            "active"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="admin-coupons-stat-card">

                        <div className="admin-coupons-stat-icon">
                            <TicketPercent
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Percentage Offers
                            </span>

                            <strong>
                                {
                                    coupons.filter(
                                        (coupon) =>
                                            coupon.discountType ===
                                            "percentage"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                    <div className="admin-coupons-stat-card">

                        <div className="admin-coupons-stat-icon">
                            <TicketPercent
                                size={20}
                            />
                        </div>

                        <div>
                            <span>
                                Fixed Offers
                            </span>

                            <strong>
                                {
                                    coupons.filter(
                                        (coupon) =>
                                            coupon.discountType ===
                                            "fixed"
                                    ).length
                                }
                            </strong>
                        </div>

                    </div>

                </div>

                {/* TOOLBAR */}

                <div className="admin-coupons-toolbar">

                    <div className="admin-coupons-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search coupon code or description..."
                            value={
                                searchTerm
                            }
                            onChange={(
                                event
                            ) =>
                                setSearchTerm(
                                    event
                                        .target
                                        .value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-coupons-clear-search"
                                onClick={() =>
                                    setSearchTerm(
                                        ""
                                    )
                                }
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <div className="admin-coupons-filter">

                        <select
                            value={
                                selectedStatusFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedStatusFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <ChevronDown
                            size={17}
                        />

                    </div>

                    <div className="admin-coupons-filter">

                        <select
                            value={
                                selectedDiscountFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedDiscountFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="all">
                                All Discount Types
                            </option>

                            <option value="percentage">
                                Percentage
                            </option>

                            <option value="fixed">
                                Fixed Amount
                            </option>
                        </select>

                        <ChevronDown
                            size={17}
                        />

                    </div>

                </div>

                {/* TABLE */}

                <div className="admin-coupons-table-card">

                    <div className="admin-coupons-table-header">

                        <div>
                            <h2>
                                Coupon List
                            </h2>

                            <p>
                                {
                                    filteredCoupons.length
                                } coupon
                                {
                                    filteredCoupons.length !==
                                    1
                                        ? "s"
                                        : ""
                                }{" "}
                                found
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

                                {filteredCoupons.length >
                                0 ? (
                                    filteredCoupons.map(
                                        (
                                            coupon,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    coupon.id
                                                }
                                            >

                                                <td className="coupon-number">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </td>

                                                <td>
                                                    <div className="coupon-info-cell">

                                                        <div className="coupon-code">
                                                            {
                                                                coupon.code
                                                            }
                                                        </div>

                                                        <span>
                                                            {
                                                                coupon.description
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="coupon-discount-cell">

                                                        <strong>
                                                            {formatDiscount(
                                                                coupon
                                                            )}
                                                        </strong>

                                                        <span>
                                                            {
                                                                coupon.discountType ===
                                                                "percentage"
                                                                    ? "Percentage"
                                                                    : "Fixed Amount"
                                                            }
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <strong className="coupon-min-order">
                                                        ₹
                                                        {coupon.minOrderAmount.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <div className="coupon-validity-cell">

                                                        <span>
                                                            {formatDate(
                                                                coupon.startDate
                                                            )}
                                                        </span>

                                                        <span>
                                                            to
                                                        </span>

                                                        <span>
                                                            {formatDate(
                                                                coupon.endDate
                                                            )}
                                                        </span>

                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="coupon-usage-cell">

                                                        <strong>
                                                            {
                                                                coupon.usedCount
                                                            }
                                                            /
                                                            {
                                                                coupon.usageLimit
                                                            }
                                                        </strong>

                                                        <div className="coupon-usage-bar">

                                                            <span
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        (coupon.usedCount /
                                                                            coupon.usageLimit) *
                                                                            100
                                                                    )}%`
                                                                }}
                                                            />

                                                        </div>

                                                    </div>
                                                </td>

                                                <td>

                                                    <button
                                                        type="button"
                                                        className={`coupon-status-button ${coupon.status}`}
                                                        onClick={() =>
                                                            handleStatusToggle(
                                                                coupon
                                                            )
                                                        }
                                                        title="Toggle status"
                                                    >
                                                        {
                                                            coupon.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"
                                                        }
                                                    </button>

                                                </td>

                                                <td>

                                                    <div className="coupon-actions">

                                                        <button
                                                            type="button"
                                                            className="coupon-edit-button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            <Edit
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="coupon-delete-button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={
                                                                    16
                                                                }
                                                            />
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        )
                                    )
                                ) : (
                                    <tr>

                                        <td
                                            colSpan="8"
                                            className="coupons-empty-state"
                                        >
                                            <div>

                                                <TicketPercent
                                                    size={
                                                        34
                                                    }
                                                />

                                                <h3>
                                                    No coupons found
                                                </h3>

                                                <p>
                                                    Try changing
                                                    your search
                                                    or filters.
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
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="admin-coupons-modal">

                        <div className="admin-coupons-modal-header">

                            <div>

                                <p>
                                    Marketing Management
                                </p>

                                <h2>
                                    {editingId
                                        ? "Edit Coupon"
                                        : "Add Coupon"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-coupons-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="admin-coupons-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* CODE */}

                            <div className="admin-coupons-form-group">

                                <label htmlFor="coupon-code">
                                    Coupon Code
                                    <span>*</span>
                                </label>

                                <input
                                    id="coupon-code"
                                    name="code"
                                    type="text"
                                    placeholder="Example: SAVE20"
                                    value={
                                        formData.code
                                    }
                                    onChange={
                                        handleInputChange
                                    }
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
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                            </div>

                            {/* DISCOUNT TYPE + VALUE */}

                            <div className="coupon-form-two-column">

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-discount-type">
                                        Discount Type
                                        <span>*</span>
                                    </label>

                                    <div className="admin-coupons-select-wrapper">

                                        <select
                                            id="coupon-discount-type"
                                            name="discountType"
                                            value={
                                                formData.discountType
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >

                                            <option value="percentage">
                                                Percentage
                                            </option>

                                            <option value="fixed">
                                                Fixed Amount
                                            </option>

                                        </select>

                                        <ChevronDown
                                            size={
                                                17
                                            }
                                        />

                                    </div>

                                </div>

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-discount-value">
                                        Discount Value
                                        <span>*</span>
                                    </label>

                                    <div className="coupon-value-input">

                                        <span>
                                            {formData.discountType ===
                                            "percentage"
                                                ? "%"
                                                : "₹"}
                                        </span>

                                        <input
                                            id="coupon-discount-value"
                                            name="discountValue"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0"
                                            value={
                                                formData.discountValue
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* MIN ORDER + MAX DISCOUNT */}

                            <div className="coupon-form-two-column">

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-min-order">
                                        Minimum Order Amount
                                        <span>*</span>
                                    </label>

                                    <div className="coupon-value-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            id="coupon-min-order"
                                            name="minOrderAmount"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="499"
                                            value={
                                                formData.minOrderAmount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-max-discount">
                                        Maximum Discount
                                        <span>*</span>
                                    </label>

                                    <div className="coupon-value-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            id="coupon-max-discount"
                                            name="maxDiscount"
                                            type="number"
                                            min="0"
                                            step="1"
                                            placeholder="250"
                                            value={
                                                formData.maxDiscount
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* DATES */}

                            <div className="coupon-form-two-column">

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-start-date">
                                        Start Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="coupon-start-date"
                                        name="startDate"
                                        type="date"
                                        value={
                                            formData.startDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-end-date">
                                        End Date
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="coupon-end-date"
                                        name="endDate"
                                        type="date"
                                        value={
                                            formData.endDate
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* USAGE + STATUS */}

                            <div className="coupon-form-two-column">

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-usage-limit">
                                        Usage Limit
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="coupon-usage-limit"
                                        name="usageLimit"
                                        type="number"
                                        min="1"
                                        step="1"
                                        placeholder="500"
                                        value={
                                            formData.usageLimit
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-coupons-form-group">

                                    <label htmlFor="coupon-status">
                                        Status
                                    </label>

                                    <div className="admin-coupons-select-wrapper">

                                        <select
                                            id="coupon-status"
                                            name="status"
                                            value={
                                                formData.status
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        >

                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>

                                        </select>

                                        <ChevronDown
                                            size={
                                                17
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* INFORMATION */}

                            <div className="coupon-info-box">

                                <strong>
                                    Coupon Rules
                                </strong>

                                <p>
                                    Percentage discounts are limited
                                    to 100%. The end date must be on
                                    or after the start date.
                                </p>

                            </div>

                            {/* ACTIONS */}

                            <div className="admin-coupons-form-actions">

                                <button
                                    type="button"
                                    className="coupon-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="coupon-save-button"
                                >
                                    {editingId
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