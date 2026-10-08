import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Boxes,
    ChevronDown,
    Edit,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import "./AdminInventory.css";

const VARIANT_OPTIONS = [
    {
        id: "variant-1",
        productName: "Fresh Red Apples",
        variantName: "500 g",
        sku: "APP-500G"
    },
    {
        id: "variant-2",
        productName: "Fresh Red Apples",
        variantName: "1 kg",
        sku: "APP-1KG"
    },
    {
        id: "variant-3",
        productName: "Fresh Full Cream Milk",
        variantName: "1 L",
        sku: "MILK-1L"
    },
    {
        id: "variant-4",
        productName: "Basmati Rice",
        variantName: "5 kg Pack",
        sku: "RICE-5KG"
    },
    {
        id: "variant-5",
        productName: "Butter Cookies",
        variantName: "200 g",
        sku: "COOKIE-200G"
    }
];

const INITIAL_INVENTORY = [
    {
        id: 1,
        variantId: "variant-1",
        productName: "Fresh Red Apples",
        variantName: "500 g",
        sku: "APP-500G",
        stock: 85,
        minStock: 20,
        maxStock: 150,
        batchNumber: "APP-B001",
        expiryDate: "20 Oct 2026",
        status: "in-stock"
    },
    {
        id: 2,
        variantId: "variant-2",
        productName: "Fresh Red Apples",
        variantName: "1 kg",
        sku: "APP-1KG",
        stock: 12,
        minStock: 20,
        maxStock: 100,
        batchNumber: "APP-B002",
        expiryDate: "18 Oct 2026",
        status: "low-stock"
    },
    {
        id: 3,
        variantId: "variant-3",
        productName: "Fresh Full Cream Milk",
        variantName: "1 L",
        sku: "MILK-1L",
        stock: 0,
        minStock: 15,
        maxStock: 80,
        batchNumber: "MILK-B001",
        expiryDate: "08 Oct 2026",
        status: "out-of-stock"
    },
    {
        id: 4,
        variantId: "variant-4",
        productName: "Basmati Rice",
        variantName: "5 kg Pack",
        sku: "RICE-5KG",
        stock: 42,
        minStock: 10,
        maxStock: 70,
        batchNumber: "RICE-B004",
        expiryDate: "15 Jan 2027",
        status: "in-stock"
    },
    {
        id: 5,
        variantId: "variant-5",
        productName: "Butter Cookies",
        variantName: "200 g",
        sku: "COOKIE-200G",
        stock: 8,
        minStock: 15,
        maxStock: 60,
        batchNumber: "COOKIE-B003",
        expiryDate: "25 Dec 2026",
        status: "low-stock"
    }
];

const EMPTY_FORM = {
    variantId: "",
    stock: "",
    minStock: "",
    maxStock: "",
    batchNumber: "",
    expiryDate: ""
};

const AdminInventory = () => {
    const navigate = useNavigate();

    const [inventory, setInventory] =
        useState(INITIAL_INVENTORY);

    const [searchTerm, setSearchTerm] = useState("");

    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState("all");

    const [selectedVariantFilter, setSelectedVariantFilter] =
        useState("all");

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [editingId, setEditingId] =
        useState(null);

    const [formData, setFormData] =
        useState(EMPTY_FORM);

    const getInventoryStatus = (
        stock,
        minStock
    ) => {
        const currentStock = Number(stock);
        const minimumStock = Number(minStock);

        if (currentStock <= 0) {
            return "out-of-stock";
        }

        if (currentStock <= minimumStock) {
            return "low-stock";
        }

        return "in-stock";
    };

    const filteredInventory = useMemo(() => {
        const search =
            searchTerm.trim().toLowerCase();

        return inventory.filter((item) => {
            const matchesSearch =
                !search ||
                item.productName
                    .toLowerCase()
                    .includes(search) ||
                item.variantName
                    .toLowerCase()
                    .includes(search) ||
                item.sku
                    .toLowerCase()
                    .includes(search) ||
                item.batchNumber
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                selectedStatusFilter === "all" ||
                item.status === selectedStatusFilter;

            const matchesVariant =
                selectedVariantFilter === "all" ||
                item.variantId === selectedVariantFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesVariant
            );
        });
    }, [
        inventory,
        searchTerm,
        selectedStatusFilter,
        selectedVariantFilter
    ]);

    const openAddModal = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);

        const variant = VARIANT_OPTIONS.find(
            (option) =>
                option.id === item.variantId
        );

        setFormData({
            variantId: item.variantId,
            stock: String(item.stock),
            minStock: String(item.minStock),
            maxStock: String(item.maxStock),
            batchNumber: item.batchNumber,
            expiryDate: variant
                ? convertDateForInput(
                      item.expiryDate
                  )
                : ""
        });

        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
    };

    const convertDateForInput = (dateString) => {
        const parts =
            dateString.split(" ");

        if (parts.length !== 3) {
            return "";
        }

        const day = parts[0];

        const monthMap = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12"
        };

        const month =
            monthMap[parts[1]];

        const year = parts[2];

        if (!month) {
            return "";
        }

        return `${year}-${month}-${day}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return "";
        }

        const date =
            new Date(
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

    const handleInputChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData(
            (previous) => ({
                ...previous,
                [name]: value
            })
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.variantId) {
            alert(
                "Please select a product variant."
            );
            return;
        }

        if (formData.stock === "") {
            alert(
                "Please enter current stock."
            );
            return;
        }

        if (formData.minStock === "") {
            alert(
                "Please enter minimum stock."
            );
            return;
        }

        if (formData.maxStock === "") {
            alert(
                "Please enter maximum stock."
            );
            return;
        }

        if (
            Number(formData.minStock) >
            Number(formData.maxStock)
        ) {
            alert(
                "Minimum stock cannot be greater than maximum stock."
            );
            return;
        }

        if (!formData.batchNumber.trim()) {
            alert(
                "Please enter batch number."
            );
            return;
        }

        if (!formData.expiryDate) {
            alert(
                "Please select expiry date."
            );
            return;
        }

        const variant =
            VARIANT_OPTIONS.find(
                (item) =>
                    item.id ===
                    formData.variantId
            );

        if (!variant) {
            return;
        }

        const status =
            getInventoryStatus(
                formData.stock,
                formData.minStock
            );

        if (editingId) {
            setInventory(
                (previous) =>
                    previous.map((item) =>
                        item.id === editingId
                            ? {
                                  ...item,
                                  variantId:
                                      variant.id,
                                  productName:
                                      variant.productName,
                                  variantName:
                                      variant.variantName,
                                  sku: variant.sku,
                                  stock:
                                      Number(
                                          formData.stock
                                      ),
                                  minStock:
                                      Number(
                                          formData.minStock
                                      ),
                                  maxStock:
                                      Number(
                                          formData.maxStock
                                      ),
                                  batchNumber:
                                      formData.batchNumber
                                          .trim()
                                          .toUpperCase(),
                                  expiryDate:
                                      formatDate(
                                          formData.expiryDate
                                      ),
                                  status
                              }
                            : item
                    )
            );
        } else {
            const newInventory = {
                id: Date.now(),
                variantId:
                    variant.id,
                productName:
                    variant.productName,
                variantName:
                    variant.variantName,
                sku: variant.sku,
                stock:
                    Number(
                        formData.stock
                    ),
                minStock:
                    Number(
                        formData.minStock
                    ),
                maxStock:
                    Number(
                        formData.maxStock
                    ),
                batchNumber:
                    formData.batchNumber
                        .trim()
                        .toUpperCase(),
                expiryDate:
                    formatDate(
                        formData.expiryDate
                    ),
                status
            };

            setInventory(
                (previous) => [
                    newInventory,
                    ...previous
                ]
            );
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const item =
            inventory.find(
                (inventoryItem) =>
                    inventoryItem.id === id
            );

        if (!item) {
            return;
        }

        const confirmed =
            window.confirm(
                `Are you sure you want to delete inventory for "${item.productName} - ${item.variantName}"?`
            );

        if (!confirmed) {
            return;
        }

        setInventory(
            (previous) =>
                previous.filter(
                    (inventoryItem) =>
                        inventoryItem.id !== id
                )
        );
    };

    return (
        <div className="admin-inventory-page">

            <div className="admin-inventory-container">

                {/* BACK BUTTON */}

                <div className="admin-inventory-back-wrapper">
                    <button
                        type="button"
                        className="admin-inventory-back-button"
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

                <div className="admin-inventory-header">

                    <div>
                        <p className="admin-inventory-eyebrow">
                            Stock Management
                        </p>

                        <h1>
                            Inventory Management
                        </h1>

                        <p className="admin-inventory-header-text">
                            Manage stock levels, batches,
                            thresholds and expiry dates.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-inventory-add-button"
                        onClick={
                            openAddModal
                        }
                    >
                        <Plus size={18} />
                        <span>
                            Add Inventory
                        </span>
                    </button>

                </div>

                {/* STATS */}

                <div className="admin-inventory-stats">

                    <div className="admin-inventory-stat-card">
                        <div className="admin-inventory-stat-icon">
                            <Boxes size={20} />
                        </div>

                        <div>
                            <span>
                                Total Items
                            </span>

                            <strong>
                                {
                                    inventory.length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="admin-inventory-stat-card">
                        <div className="admin-inventory-stat-icon">
                            <Boxes size={20} />
                        </div>

                        <div>
                            <span>
                                In Stock
                            </span>

                            <strong>
                                {
                                    inventory.filter(
                                        (item) =>
                                            item.status ===
                                            "in-stock"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="admin-inventory-stat-card">
                        <div className="admin-inventory-stat-icon">
                            <Boxes size={20} />
                        </div>

                        <div>
                            <span>
                                Low Stock
                            </span>

                            <strong>
                                {
                                    inventory.filter(
                                        (item) =>
                                            item.status ===
                                            "low-stock"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                    <div className="admin-inventory-stat-card">
                        <div className="admin-inventory-stat-icon">
                            <Boxes size={20} />
                        </div>

                        <div>
                            <span>
                                Out of Stock
                            </span>

                            <strong>
                                {
                                    inventory.filter(
                                        (item) =>
                                            item.status ===
                                            "out-of-stock"
                                    ).length
                                }
                            </strong>
                        </div>
                    </div>

                </div>

                {/* TOOLBAR */}

                <div className="admin-inventory-toolbar">

                    <div className="admin-inventory-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search product, SKU or batch..."
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
                                className="admin-inventory-clear-search"
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

                    <div className="admin-inventory-filter">

                        <select
                            value={
                                selectedVariantFilter
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectedVariantFilter(
                                    event
                                        .target
                                        .value
                                )
                            }
                        >
                            <option value="all">
                                All Variants
                            </option>

                            {VARIANT_OPTIONS.map(
                                (variant) => (
                                    <option
                                        key={
                                            variant.id
                                        }
                                        value={
                                            variant.id
                                        }
                                    >
                                        {
                                            variant.productName
                                        }{" "}
                                        -{" "}
                                        {
                                            variant.variantName
                                        }
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown
                            size={17}
                        />

                    </div>

                    <div className="admin-inventory-filter">

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
                                All Stock Status
                            </option>

                            <option value="in-stock">
                                In Stock
                            </option>

                            <option value="low-stock">
                                Low Stock
                            </option>

                            <option value="out-of-stock">
                                Out of Stock
                            </option>
                        </select>

                        <ChevronDown
                            size={17}
                        />

                    </div>

                </div>

                {/* TABLE */}

                <div className="admin-inventory-table-card">

                    <div className="admin-inventory-table-header">

                        <div>
                            <h2>
                                Inventory List
                            </h2>

                            <p>
                                {
                                    filteredInventory.length
                                } item
                                {filteredInventory.length !==
                                1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                    </div>

                    <div className="admin-inventory-table-wrapper">

                        <table className="admin-inventory-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product / Variant</th>
                                    <th>SKU</th>
                                    <th>Current Stock</th>
                                    <th>Min / Max</th>
                                    <th>Batch</th>
                                    <th>Expiry</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredInventory.length >
                                0 ? (
                                    filteredInventory.map(
                                        (
                                            item,
                                            index
                                        ) => (
                                            <tr
                                                key={
                                                    item.id
                                                }
                                            >

                                                <td className="inventory-number">
                                                    {
                                                        index +
                                                        1
                                                    }
                                                </td>

                                                <td>
                                                    <div className="inventory-product-cell">
                                                        <strong>
                                                            {
                                                                item.productName
                                                            }
                                                        </strong>

                                                        <span>
                                                            {
                                                                item.variantName
                                                            }
                                                        </span>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="inventory-sku">
                                                        {
                                                            item.sku
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <strong className="inventory-stock-value">
                                                        {
                                                            item.stock
                                                        }
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span className="inventory-threshold">
                                                        {
                                                            item.minStock
                                                        }{" "}
                                                        /{" "}
                                                        {
                                                            item.maxStock
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="inventory-batch">
                                                        {
                                                            item.batchNumber
                                                        }
                                                    </span>
                                                </td>

                                                <td className="inventory-expiry">
                                                    {
                                                        item.expiryDate
                                                    }
                                                </td>

                                                <td>
                                                    <span
                                                        className={`inventory-status ${item.status}`}
                                                    >
                                                        {item.status ===
                                                        "in-stock"
                                                            ? "In Stock"
                                                            : item.status ===
                                                              "low-stock"
                                                            ? "Low Stock"
                                                            : "Out of Stock"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="inventory-actions">

                                                        <button
                                                            type="button"
                                                            className="inventory-edit-button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    item
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
                                                            className="inventory-delete-button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    item.id
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
                                            colSpan="9"
                                            className="inventory-empty-state"
                                        >
                                            <div>
                                                <Boxes
                                                    size={
                                                        34
                                                    }
                                                />

                                                <h3>
                                                    No inventory found
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
                    className="admin-inventory-modal-overlay"
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

                    <div className="admin-inventory-modal">

                        <div className="admin-inventory-modal-header">

                            <div>
                                <p>
                                    Stock Management
                                </p>

                                <h2>
                                    {editingId
                                        ? "Edit Inventory"
                                        : "Add Inventory"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-inventory-modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="admin-inventory-form"
                            onSubmit={
                                handleSubmit
                            }
                        >

                            {/* VARIANT */}

                            <div className="admin-inventory-form-group">

                                <label htmlFor="inventory-variant">
                                    Product Variant
                                    <span>*</span>
                                </label>

                                <div className="admin-inventory-select-wrapper">

                                    <select
                                        id="inventory-variant"
                                        name="variantId"
                                        value={
                                            formData.variantId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select product variant
                                        </option>

                                        {VARIANT_OPTIONS.map(
                                            (
                                                variant
                                            ) => (
                                                <option
                                                    key={
                                                        variant.id
                                                    }
                                                    value={
                                                        variant.id
                                                    }
                                                >
                                                    {
                                                        variant.productName
                                                    }{" "}
                                                    -{" "}
                                                    {
                                                        variant.variantName
                                                    }{" "}
                                                    (
                                                    {
                                                        variant.sku
                                                    }
                                                    )
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown
                                        size={
                                            17
                                        }
                                    />

                                </div>

                            </div>

                            {/* STOCK */}

                            <div className="inventory-form-two-column">

                                <div className="admin-inventory-form-group">

                                    <label htmlFor="inventory-stock">
                                        Current Stock
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="inventory-stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Example: 50"
                                        value={
                                            formData.stock
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-inventory-form-group">

                                    <label htmlFor="inventory-min-stock">
                                        Minimum Stock
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="inventory-min-stock"
                                        name="minStock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Example: 10"
                                        value={
                                            formData.minStock
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* MAX STOCK + BATCH */}

                            <div className="inventory-form-two-column">

                                <div className="admin-inventory-form-group">

                                    <label htmlFor="inventory-max-stock">
                                        Maximum Stock
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="inventory-max-stock"
                                        name="maxStock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        placeholder="Example: 100"
                                        value={
                                            formData.maxStock
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-inventory-form-group">

                                    <label htmlFor="inventory-batch">
                                        Batch Number
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="inventory-batch"
                                        name="batchNumber"
                                        type="text"
                                        placeholder="Example: APP-B001"
                                        value={
                                            formData.batchNumber
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                            </div>

                            {/* EXPIRY */}

                            <div className="admin-inventory-form-group">

                                <label htmlFor="inventory-expiry">
                                    Expiry Date
                                    <span>*</span>
                                </label>

                                <input
                                    id="inventory-expiry"
                                    name="expiryDate"
                                    type="date"
                                    value={
                                        formData.expiryDate
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            {/* INFORMATION */}

                            <div className="inventory-info-box">
                                <strong>
                                    Stock Status
                                </strong>

                                <p>
                                    Stock status is calculated
                                    automatically from the current
                                    stock and minimum stock level.
                                </p>

                                <div className="inventory-info-statuses">
                                    <span className="inventory-info-status in-stock">
                                        In Stock
                                    </span>

                                    <span className="inventory-info-status low-stock">
                                        Low Stock
                                    </span>

                                    <span className="inventory-info-status out-of-stock">
                                        Out of Stock
                                    </span>
                                </div>
                            </div>

                            {/* ACTIONS */}

                            <div className="admin-inventory-form-actions">

                                <button
                                    type="button"
                                    className="inventory-cancel-button"
                                    onClick={
                                        closeModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inventory-save-button"
                                >
                                    {editingId
                                        ? "Update Inventory"
                                        : "Save Inventory"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminInventory;