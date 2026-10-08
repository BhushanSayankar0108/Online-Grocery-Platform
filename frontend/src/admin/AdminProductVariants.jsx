import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronDown,
    Edit,
    ImagePlus,
    Plus,
    Search,
    Trash2,
    X
} from "lucide-react";

import "./AdminProductVariants.css";

const PRODUCT_OPTIONS = [
    {
        id: "product-1",
        name: "Fresh Red Apples",
        category: "Fruits & Vegetables",
        subcategory: "Fresh Fruits"
    },
    {
        id: "product-2",
        name: "Fresh Full Cream Milk",
        category: "Dairy & Bakery",
        subcategory: "Milk & Dairy"
    },
    {
        id: "product-3",
        name: "Basmati Rice",
        category: "Staples & Grains",
        subcategory: "Rice & Grains"
    },
    {
        id: "product-4",
        name: "Butter Cookies",
        category: "Snacks & Beverages",
        subcategory: "Biscuits & Snacks"
    }
];

const INITIAL_VARIANTS = [
    {
        id: 1,
        productId: "product-1",
        productName: "Fresh Red Apples",
        variantName: "500 g",
        sku: "APP-500G",
        unit: "g",
        quantity: "500",
        price: "120",
        discountPrice: "99",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 2,
        productId: "product-1",
        productName: "Fresh Red Apples",
        variantName: "1 kg",
        sku: "APP-1KG",
        unit: "kg",
        quantity: "1",
        price: "220",
        discountPrice: "189",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 3,
        productId: "product-2",
        productName: "Fresh Full Cream Milk",
        variantName: "1 L",
        sku: "MILK-1L",
        unit: "L",
        quantity: "1",
        price: "70",
        discountPrice: "68",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 4,
        productId: "product-3",
        productName: "Basmati Rice",
        variantName: "5 kg Pack",
        sku: "RICE-5KG",
        unit: "kg",
        quantity: "5",
        price: "650",
        discountPrice: "599",
        image: "",
        imageSize: "medium",
        status: "inactive",
        createdAt: "02 Oct 2026"
    }
];

const UNIT_OPTIONS = [
    "g",
    "kg",
    "ml",
    "L",
    "piece",
    "pack",
    "box"
];

const EMPTY_FORM = {
    productId: "",
    variantName: "",
    sku: "",
    unit: "",
    quantity: "",
    price: "",
    discountPrice: "",
    image: "",
    imageSize: "medium",
    status: "active"
};

const AdminProductVariants = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [variants, setVariants] = useState(
        INITIAL_VARIANTS
    );

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductFilter, setSelectedProductFilter] =
        useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [imagePreview, setImagePreview] = useState("");

    const filteredVariants = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return variants.filter((variant) => {
            const matchesSearch =
                !search ||
                variant.variantName
                    .toLowerCase()
                    .includes(search) ||
                variant.productName
                    .toLowerCase()
                    .includes(search) ||
                variant.sku
                    .toLowerCase()
                    .includes(search);

            const matchesProduct =
                selectedProductFilter === "all" ||
                variant.productId === selectedProductFilter;

            const matchesStatus =
                selectedStatusFilter === "all" ||
                variant.status === selectedStatusFilter;

            return (
                matchesSearch &&
                matchesProduct &&
                matchesStatus
            );
        });
    }, [
        variants,
        searchTerm,
        selectedProductFilter,
        selectedStatusFilter
    ]);

    const openAddModal = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setImagePreview("");
        setIsModalOpen(true);
    };

    const openEditModal = (variant) => {
        setEditingId(variant.id);

        setFormData({
            productId: variant.productId,
            variantName: variant.variantName,
            sku: variant.sku,
            unit: variant.unit,
            quantity: variant.quantity,
            price: variant.price,
            discountPrice: variant.discountPrice,
            image: variant.image,
            imageSize: variant.imageSize,
            status: variant.status
        });

        setImagePreview(variant.image || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setImagePreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        setFormData((previous) => ({
            ...previous,
            image: previewUrl
        }));

        setImagePreview(previewUrl);
    };

    const removeImage = () => {
        setFormData((previous) => ({
            ...previous,
            image: ""
        }));

        setImagePreview("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.productId) {
            alert("Please select a product.");
            return;
        }

        if (!formData.variantName.trim()) {
            alert("Please enter variant name.");
            return;
        }

        if (!formData.sku.trim()) {
            alert("Please enter SKU.");
            return;
        }

        if (!formData.unit) {
            alert("Please select unit.");
            return;
        }

        if (!formData.quantity) {
            alert("Please enter quantity.");
            return;
        }

        if (!formData.price) {
            alert("Please enter price.");
            return;
        }

        const product = PRODUCT_OPTIONS.find(
            (item) => item.id === formData.productId
        );

        if (!product) {
            return;
        }

        if (editingId) {
            setVariants((previous) =>
                previous.map((variant) =>
                    variant.id === editingId
                        ? {
                            ...variant,
                            productId: formData.productId,
                            productName: product.name,
                            variantName:
                                formData.variantName.trim(),
                            sku: formData.sku
                                .trim()
                                .toUpperCase(),
                            unit: formData.unit,
                            quantity: formData.quantity,
                            price: formData.price,
                            discountPrice:
                                formData.discountPrice,
                            image: formData.image,
                            imageSize:
                                formData.imageSize,
                            status: formData.status
                        }
                        : variant
                )
            );
        } else {
            const newVariant = {
                id: Date.now(),
                productId: formData.productId,
                productName: product.name,
                variantName: formData.variantName.trim(),
                sku: formData.sku
                    .trim()
                    .toUpperCase(),
                unit: formData.unit,
                quantity: formData.quantity,
                price: formData.price,
                discountPrice:
                    formData.discountPrice,
                image: formData.image,
                imageSize: formData.imageSize,
                status: formData.status,
                createdAt: new Date().toLocaleDateString(
                    "en-GB",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )
            };

            setVariants((previous) => [
                newVariant,
                ...previous
            ]);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const variant = variants.find(
            (item) => item.id === id
        );

        if (!variant) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${variant.productName} - ${variant.variantName}"?`
        );

        if (!confirmed) {
            return;
        }

        setVariants((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const getImageSizeClass = (size) => {
        if (size === "small") {
            return "variant-image-small";
        }

        if (size === "large") {
            return "variant-image-large";
        }

        return "variant-image-medium";
    };

    return (
        <div className="admin-product-variants-page">

            <div className="admin-product-variants-container">

                {/* =================================================
                    BACK BUTTON
                ================================================= */}

                <div className="admin-product-variants-back-wrapper">

                    <button
                        type="button"
                        className="admin-product-variants-back-button"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <ArrowLeft size={17} />

                        <span>
                            Back to Dashboard
                        </span>
                    </button>

                </div>

                {/* =================================================
                    HEADER
                ================================================= */}

                <div className="admin-product-variants-header">

                    <div>

                        <p className="admin-product-variants-eyebrow">
                            Catalogue Management
                        </p>

                        <h1>
                            Product Variants
                        </h1>

                        <p className="admin-product-variants-header-text">
                            Manage product sizes, quantities,
                            pricing and SKUs.
                        </p>

                    </div>

                    <button
                        type="button"
                        className="admin-product-variants-add-button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />

                        <span>
                            Add Variant
                        </span>
                    </button>

                </div>

                {/* =================================================
                    STATS
                ================================================= */}

                <div className="admin-product-variants-stats">

                    <div className="admin-product-variants-stat-card">
                        <span>
                            Total Variants
                        </span>

                        <strong>
                            {variants.length}
                        </strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>
                            Active
                        </span>

                        <strong>
                            {
                                variants.filter(
                                    (item) =>
                                        item.status ===
                                        "active"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>
                            Inactive
                        </span>

                        <strong>
                            {
                                variants.filter(
                                    (item) =>
                                        item.status ===
                                        "inactive"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>
                            Products With Variants
                        </span>

                        <strong>
                            {
                                new Set(
                                    variants.map(
                                        (item) =>
                                            item.productId
                                    )
                                ).size
                            }
                        </strong>
                    </div>

                </div>

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="admin-product-variants-toolbar">

                    <div className="admin-product-variants-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search variants, products or SKU..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-product-variants-clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <div className="admin-product-variants-filter">

                        <select
                            value={
                                selectedProductFilter
                            }
                            onChange={(event) =>
                                setSelectedProductFilter(
                                    event.target.value
                                )
                            }
                        >

                            <option value="all">
                                All Products
                            </option>

                            {PRODUCT_OPTIONS.map(
                                (product) => (
                                    <option
                                        key={product.id}
                                        value={product.id}
                                    >
                                        {product.name}
                                    </option>
                                )
                            )}

                        </select>

                        <ChevronDown size={17} />

                    </div>

                    <div className="admin-product-variants-filter">

                        <select
                            value={
                                selectedStatusFilter
                            }
                            onChange={(event) =>
                                setSelectedStatusFilter(
                                    event.target.value
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

                        <ChevronDown size={17} />

                    </div>

                </div>

                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="admin-product-variants-table-card">

                    <div className="admin-product-variants-table-header">

                        <div>

                            <h2>
                                Variant List
                            </h2>

                            <p>
                                {filteredVariants.length} variant
                                {filteredVariants.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>

                        </div>

                    </div>

                    <div className="admin-product-variants-table-wrapper">

                        <table className="admin-product-variants-table">

                            <thead>

                                <tr>
                                    <th>#</th>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Variant</th>
                                    <th>SKU</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>

                            </thead>

                            <tbody>

                                {filteredVariants.length > 0 ? (
                                    filteredVariants.map(
                                        (variant, index) => (
                                            <tr
                                                key={
                                                    variant.id
                                                }
                                            >

                                                <td className="variant-number">
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    <div
                                                        className={`variant-table-image ${getImageSizeClass(
                                                            variant.imageSize
                                                        )}`}
                                                    >

                                                        {variant.image ? (
                                                            <img
                                                                src={
                                                                    variant.image
                                                                }
                                                                alt={
                                                                    variant.variantName
                                                                }
                                                            />
                                                        ) : (
                                                            <ImagePlus
                                                                size={
                                                                    20
                                                                }
                                                            />
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="variant-product-cell">

                                                        <strong>
                                                            {
                                                                variant.productName
                                                            }
                                                        </strong>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="variant-name-badge">
                                                        {
                                                            variant.variantName
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="variant-sku">
                                                        {
                                                            variant.sku
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="variant-quantity">
                                                        {
                                                            variant.quantity
                                                        }{" "}
                                                        {
                                                            variant.unit
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="variant-price-cell">

                                                        {variant.discountPrice ? (
                                                            <>
                                                                <strong>
                                                                    ₹
                                                                    {
                                                                        variant.discountPrice
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    ₹
                                                                    {
                                                                        variant.price
                                                                    }
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <strong>
                                                                ₹
                                                                {
                                                                    variant.price
                                                                }
                                                            </strong>
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`variant-status ${
                                                            variant.status ===
                                                            "active"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {variant.status ===
                                                        "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                <td className="variant-date">
                                                    {
                                                        variant.createdAt
                                                    }
                                                </td>

                                                <td>

                                                    <div className="variant-actions">

                                                        <button
                                                            type="button"
                                                            className="variant-edit-button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    variant
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
                                                            className="variant-delete-button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    variant.id
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
                                            colSpan="10"
                                            className="variant-empty-state"
                                        >

                                            <div>

                                                <ImagePlus
                                                    size={32}
                                                />

                                                <h3>
                                                    No variants found
                                                </h3>

                                                <p>
                                                    Try changing your
                                                    search or filters.
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

            {/* =====================================================
                ADD / EDIT MODAL
            ===================================================== */}

            {isModalOpen && (
                <div
                    className="admin-product-variants-modal-overlay"
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="admin-product-variants-modal">

                        <div className="admin-product-variants-modal-header">

                            <div>

                                <p>
                                    Catalogue Management
                                </p>

                                <h2>
                                    {editingId
                                        ? "Edit Product Variant"
                                        : "Add Product Variant"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-product-variants-modal-close"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="admin-product-variants-form"
                            onSubmit={handleSubmit}
                        >

                            {/* Product */}

                            <div className="admin-product-variants-form-group">

                                <label htmlFor="variant-product">
                                    Product
                                    <span>*</span>
                                </label>

                                <div className="admin-product-variants-select-wrapper">

                                    <select
                                        id="variant-product"
                                        name="productId"
                                        value={
                                            formData.productId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select product
                                        </option>

                                        {PRODUCT_OPTIONS.map(
                                            (product) => (
                                                <option
                                                    key={
                                                        product.id
                                                    }
                                                    value={
                                                        product.id
                                                    }
                                                >
                                                    {
                                                        product.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown size={17} />

                                </div>

                            </div>

                            {/* Variant Name */}

                            <div className="admin-product-variants-form-group">

                                <label htmlFor="variant-name">
                                    Variant Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="variant-name"
                                    name="variantName"
                                    type="text"
                                    placeholder="Example: 500 g, 1 kg, 1 L"
                                    value={
                                        formData.variantName
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            {/* SKU */}

                            <div className="admin-product-variants-form-group">

                                <label htmlFor="variant-sku">
                                    SKU
                                    <span>*</span>
                                </label>

                                <input
                                    id="variant-sku"
                                    name="sku"
                                    type="text"
                                    placeholder="Example: APP-500G"
                                    value={
                                        formData.sku
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            {/* Quantity + Unit */}

                            <div className="variant-form-two-column">

                                <div className="admin-product-variants-form-group">

                                    <label htmlFor="variant-quantity">
                                        Quantity
                                        <span>*</span>
                                    </label>

                                    <input
                                        id="variant-quantity"
                                        name="quantity"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Example: 500"
                                        value={
                                            formData.quantity
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    />

                                </div>

                                <div className="admin-product-variants-form-group">

                                    <label htmlFor="variant-unit">
                                        Unit
                                        <span>*</span>
                                    </label>

                                    <div className="admin-product-variants-select-wrapper">

                                        <select
                                            id="variant-unit"
                                            name="unit"
                                            value={
                                                formData.unit
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select unit
                                            </option>

                                            {UNIT_OPTIONS.map(
                                                (unit) => (
                                                    <option
                                                        key={
                                                            unit
                                                        }
                                                        value={
                                                            unit
                                                        }
                                                    >
                                                        {unit}
                                                    </option>
                                                )
                                            )}

                                        </select>

                                        <ChevronDown
                                            size={17}
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Price + Discount Price */}

                            <div className="variant-form-two-column">

                                <div className="admin-product-variants-form-group">

                                    <label htmlFor="variant-price">
                                        Price
                                        <span>*</span>
                                    </label>

                                    <div className="variant-price-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            id="variant-price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={
                                                formData.price
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            required
                                        />

                                    </div>

                                </div>

                                <div className="admin-product-variants-form-group">

                                    <label htmlFor="variant-discount-price">
                                        Discount Price
                                    </label>

                                    <div className="variant-price-input">

                                        <span>
                                            ₹
                                        </span>

                                        <input
                                            id="variant-discount-price"
                                            name="discountPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Optional"
                                            value={
                                                formData.discountPrice
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                    </div>

                                </div>

                            </div>

                            {/* Status */}

                            <div className="admin-product-variants-form-group">

                                <label>
                                    Status
                                </label>

                                <div className="variant-status-options">

                                    <label
                                        className={`variant-status-option ${
                                            formData.status ===
                                            "active"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"
                                            name="status"
                                            value="active"
                                            checked={
                                                formData.status ===
                                                "active"
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                        <span>
                                            Active
                                        </span>

                                    </label>

                                    <label
                                        className={`variant-status-option ${
                                            formData.status ===
                                            "inactive"
                                                ? "selected"
                                                : ""
                                        }`}
                                    >

                                        <input
                                            type="radio"
                                            name="status"
                                            value="inactive"
                                            checked={
                                                formData.status ===
                                                "inactive"
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                        />

                                        <span>
                                            Inactive
                                        </span>

                                    </label>

                                </div>

                            </div>

                            {/* Image Upload */}

                            <div className="admin-product-variants-form-group">

                                <label>
                                    Variant Image
                                </label>

                                <div className="variant-upload-area">

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="variant-file-input"
                                    />

                                    {!imagePreview ? (
                                        <button
                                            type="button"
                                            className="variant-upload-button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >

                                            <ImagePlus
                                                size={22}
                                            />

                                            <div>

                                                <strong>
                                                    Upload Variant
                                                    Image
                                                </strong>

                                                <span>
                                                    Choose an image
                                                    from your
                                                    device
                                                </span>

                                            </div>

                                        </button>
                                    ) : (
                                        <div className="variant-preview-box">

                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt="Variant preview"
                                            />

                                            <div className="variant-preview-info">

                                                <strong>
                                                    Image Preview
                                                </strong>

                                                <span>
                                                    Image selected
                                                    successfully
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        removeImage
                                                    }
                                                >
                                                    Remove Image
                                                </button>

                                            </div>

                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* Image Size */}

                            <div className="admin-product-variants-form-group">

                                <label>
                                    Image Display Size
                                </label>

                                <div className="variant-size-options">

                                    {[
                                        {
                                            value: "small",
                                            title: "Small",
                                            subtitle:
                                                "Small display"
                                        },
                                        {
                                            value: "medium",
                                            title: "Medium",
                                            subtitle:
                                                "Medium display"
                                        },
                                        {
                                            value: "large",
                                            title: "Large",
                                            subtitle:
                                                "Large display"
                                        }
                                    ].map((option) => (
                                        <label
                                            key={
                                                option.value
                                            }
                                            className={`variant-size-option ${
                                                formData.imageSize ===
                                                option.value
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >

                                            <input
                                                type="radio"
                                                name="imageSize"
                                                value={
                                                    option.value
                                                }
                                                checked={
                                                    formData.imageSize ===
                                                    option.value
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                            />

                                            <div>

                                                <strong>
                                                    {
                                                        option.title
                                                    }
                                                </strong>

                                                <span>
                                                    {
                                                        option.subtitle
                                                    }
                                                </span>

                                            </div>

                                        </label>
                                    ))}

                                </div>

                                <p className="variant-size-note">
                                    These options control the
                                    image display size in the
                                    frontend UI.
                                </p>

                            </div>

                            {/* Buttons */}

                            <div className="admin-product-variants-form-actions">

                                <button
                                    type="button"
                                    className="variant-cancel-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="variant-save-button"
                                >
                                    {editingId
                                        ? "Update Variant"
                                        : "Save Variant"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

export default AdminProductVariants;