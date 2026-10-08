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

import "./AdminProducts.css";

const CATEGORY_OPTIONS = [
    {
        id: "cat-1",
        name: "Fruits & Vegetables",
        subcategories: [
            { id: "sub-1", name: "Fresh Fruits" },
            { id: "sub-2", name: "Fresh Vegetables" }
        ]
    },
    {
        id: "cat-2",
        name: "Dairy & Bakery",
        subcategories: [
            { id: "sub-3", name: "Milk & Dairy" },
            { id: "sub-4", name: "Bakery Products" }
        ]
    },
    {
        id: "cat-3",
        name: "Staples & Grains",
        subcategories: [
            { id: "sub-5", name: "Rice & Grains" },
            { id: "sub-6", name: "Flour & Pulses" }
        ]
    },
    {
        id: "cat-4",
        name: "Snacks & Beverages",
        subcategories: [
            { id: "sub-7", name: "Biscuits & Snacks" },
            { id: "sub-8", name: "Beverages" }
        ]
    },
    {
        id: "cat-5",
        name: "Personal Care",
        subcategories: [
            { id: "sub-9", name: "Bath & Body" },
            { id: "sub-10", name: "Hair Care" }
        ]
    }
];

const BRAND_OPTIONS = [
    "Fresh Farm",
    "Amul",
    "India Gate",
    "Tata",
    "Aashirvaad",
    "Britannia",
    "Other"
];

const INITIAL_PRODUCTS = [
    {
        id: 1,
        name: "Fresh Red Apples",
        categoryId: "cat-1",
        categoryName: "Fruits & Vegetables",
        subcategoryId: "sub-1",
        subcategoryName: "Fresh Fruits",
        brand: "Fresh Farm",
        description: "Fresh and naturally sweet red apples.",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 2,
        name: "Fresh Full Cream Milk",
        categoryId: "cat-2",
        categoryName: "Dairy & Bakery",
        subcategoryId: "sub-3",
        subcategoryName: "Milk & Dairy",
        brand: "Amul",
        description: "Fresh full cream milk for everyday use.",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 3,
        name: "Basmati Rice",
        categoryId: "cat-3",
        categoryName: "Staples & Grains",
        subcategoryId: "sub-5",
        subcategoryName: "Rice & Grains",
        brand: "India Gate",
        description: "Premium quality long-grain basmati rice.",
        image: "",
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026"
    },
    {
        id: 4,
        name: "Butter Cookies",
        categoryId: "cat-4",
        categoryName: "Snacks & Beverages",
        subcategoryId: "sub-7",
        subcategoryName: "Biscuits & Snacks",
        brand: "Britannia",
        description: "Crispy and delicious butter cookies.",
        image: "",
        imageSize: "medium",
        status: "inactive",
        createdAt: "02 Oct 2026"
    }
];

const EMPTY_FORM = {
    name: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    description: "",
    image: "",
    imageSize: "medium",
    status: "active"
};

const AdminProducts = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [products, setProducts] = useState(INITIAL_PRODUCTS);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] =
        useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [imagePreview, setImagePreview] = useState("");

    const selectedCategory = CATEGORY_OPTIONS.find(
        (category) => category.id === formData.categoryId
    );

    const availableSubcategories =
        selectedCategory?.subcategories || [];

    const filteredProducts = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return products.filter((product) => {
            const matchesSearch =
                !search ||
                product.name.toLowerCase().includes(search) ||
                product.brand.toLowerCase().includes(search) ||
                product.categoryName.toLowerCase().includes(search) ||
                product.subcategoryName
                    .toLowerCase()
                    .includes(search);

            const matchesCategory =
                selectedCategoryFilter === "all" ||
                product.categoryId === selectedCategoryFilter;

            const matchesStatus =
                selectedStatusFilter === "all" ||
                product.status === selectedStatusFilter;

            return (
                matchesSearch &&
                matchesCategory &&
                matchesStatus
            );
        });
    }, [
        products,
        searchTerm,
        selectedCategoryFilter,
        selectedStatusFilter
    ]);

    const openAddModal = () => {
        setEditingId(null);
        setFormData(EMPTY_FORM);
        setImagePreview("");
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        setEditingId(product.id);

        setFormData({
            name: product.name,
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId,
            brand: product.brand,
            description: product.description,
            image: product.image,
            imageSize: product.imageSize,
            status: product.status
        });

        setImagePreview(product.image || "");
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

        setFormData((previous) => {
            const updated = {
                ...previous,
                [name]: value
            };

            if (name === "categoryId") {
                updated.subcategoryId = "";
            }

            return updated;
        });
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

        if (!formData.name.trim()) {
            alert("Please enter product name.");
            return;
        }

        if (!formData.categoryId) {
            alert("Please select category.");
            return;
        }

        if (!formData.subcategoryId) {
            alert("Please select subcategory.");
            return;
        }

        const category = CATEGORY_OPTIONS.find(
            (item) => item.id === formData.categoryId
        );

        const subcategory = category?.subcategories.find(
            (item) => item.id === formData.subcategoryId
        );

        if (!category || !subcategory) {
            return;
        }

        if (editingId) {
            setProducts((previous) =>
                previous.map((product) =>
                    product.id === editingId
                        ? {
                            ...product,
                            name: formData.name.trim(),
                            categoryId: formData.categoryId,
                            categoryName: category.name,
                            subcategoryId:
                                formData.subcategoryId,
                            subcategoryName:
                                subcategory.name,
                            brand: formData.brand,
                            description:
                                formData.description.trim(),
                            image: formData.image,
                            imageSize: formData.imageSize,
                            status: formData.status
                        }
                        : product
                )
            );
        } else {
            const newProduct = {
                id: Date.now(),
                name: formData.name.trim(),
                categoryId: formData.categoryId,
                categoryName: category.name,
                subcategoryId: formData.subcategoryId,
                subcategoryName: subcategory.name,
                brand: formData.brand,
                description: formData.description.trim(),
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

            setProducts((previous) => [
                newProduct,
                ...previous
            ]);
        }

        closeModal();
    };

    const handleDelete = (id) => {
        const product = products.find(
            (item) => item.id === id
        );

        if (!product) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete "${product.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setProducts((previous) =>
            previous.filter((item) => item.id !== id)
        );
    };

    const getImageSizeClass = (size) => {
        if (size === "small") {
            return "product-image-small";
        }

        if (size === "large") {
            return "product-image-large";
        }

        return "product-image-medium";
    };

    return (
        <div className="admin-products-page">
            <div className="admin-products-container">

                {/* Back Button */}

                <div className="admin-products-back-wrapper">
                    <button
                        type="button"
                        className="admin-products-back-button"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <ArrowLeft size={17} />
                        <span>Back to Dashboard</span>
                    </button>
                </div>

                {/* Header */}

                <div className="admin-products-header">

                    <div>
                        <p className="admin-products-eyebrow">
                            Catalogue Management
                        </p>

                        <h1>Products</h1>

                        <p className="admin-products-header-text">
                            Manage your grocery products,
                            categories and product information.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-products-add-button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        <span>Add Product</span>
                    </button>

                </div>

                {/* Stats */}

                <div className="admin-products-stats">

                    <div className="admin-products-stat-card">
                        <span>Total Products</span>
                        <strong>{products.length}</strong>
                    </div>

                    <div className="admin-products-stat-card">
                        <span>Active</span>
                        <strong>
                            {
                                products.filter(
                                    (item) =>
                                        item.status === "active"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-products-stat-card">
                        <span>Inactive</span>
                        <strong>
                            {
                                products.filter(
                                    (item) =>
                                        item.status === "inactive"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-products-stat-card">
                        <span>Categories Used</span>
                        <strong>
                            {
                                new Set(
                                    products.map(
                                        (item) =>
                                            item.categoryId
                                    )
                                ).size
                            }
                        </strong>
                    </div>

                </div>

                {/* Toolbar */}

                <div className="admin-products-toolbar">

                    <div className="admin-products-search">

                        <Search size={18} />

                        <input
                            type="text"
                            placeholder="Search products..."
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
                                className="admin-products-clear-search"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                <X size={15} />
                            </button>
                        )}

                    </div>

                    <div className="admin-products-filter">

                        <select
                            value={selectedCategoryFilter}
                            onChange={(event) =>
                                setSelectedCategoryFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Categories
                            </option>

                            {CATEGORY_OPTIONS.map(
                                (category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                )
                            )}
                        </select>

                        <ChevronDown size={17} />

                    </div>

                    <div className="admin-products-filter">

                        <select
                            value={selectedStatusFilter}
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

                {/* Product Table */}

                <div className="admin-products-table-card">

                    <div className="admin-products-table-header">

                        <div>
                            <h2>Product List</h2>

                            <p>
                                {filteredProducts.length} product
                                {filteredProducts.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>
                        </div>

                    </div>

                    <div className="admin-products-table-wrapper">

                        <table className="admin-products-table">

                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Image</th>
                                    <th>Product</th>
                                    <th>Category</th>
                                    <th>Subcategory</th>
                                    <th>Brand</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>

                                {filteredProducts.length > 0 ? (
                                    filteredProducts.map(
                                        (product, index) => (
                                            <tr key={product.id}>

                                                <td className="product-number">
                                                    {index + 1}
                                                </td>

                                                <td>

                                                    <div
                                                        className={`product-table-image ${getImageSizeClass(
                                                            product.imageSize
                                                        )}`}
                                                    >

                                                        {product.image ? (
                                                            <img
                                                                src={
                                                                    product.image
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />
                                                        ) : (
                                                            <ImagePlus
                                                                size={20}
                                                            />
                                                        )}

                                                    </div>

                                                </td>

                                                <td>

                                                    <div className="product-name-cell">

                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>

                                                        <p>
                                                            {
                                                                product.description
                                                            }
                                                        </p>

                                                    </div>

                                                </td>

                                                <td>

                                                    <span className="product-category-badge">
                                                        {
                                                            product.categoryName
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="product-subcategory-text">
                                                        {
                                                            product.subcategoryName
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span className="product-brand-text">
                                                        {
                                                            product.brand ||
                                                            "—"
                                                        }
                                                    </span>

                                                </td>

                                                <td>

                                                    <span
                                                        className={`product-status ${
                                                            product.status ===
                                                            "active"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {product.status ===
                                                        "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </span>

                                                </td>

                                                <td className="product-date">
                                                    {
                                                        product.createdAt
                                                    }
                                                </td>

                                                <td>

                                                    <div className="product-actions">

                                                        <button
                                                            type="button"
                                                            className="product-edit-button"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    product
                                                                )
                                                            }
                                                        >
                                                            <Edit
                                                                size={16}
                                                            />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="product-delete-button"
                                                            title="Delete"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    product.id
                                                                )
                                                            }
                                                        >
                                                            <Trash2
                                                                size={16}
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
                                            className="product-empty-state"
                                        >
                                            <div>

                                                <PackageIcon />

                                                <h3>
                                                    No products found
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

            {/* Add/Edit Modal */}

            {isModalOpen && (
                <div
                    className="admin-products-modal-overlay"
                    onMouseDown={(event) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >

                    <div className="admin-products-modal">

                        <div className="admin-products-modal-header">

                            <div>

                                <p>
                                    Catalogue Management
                                </p>

                                <h2>
                                    {editingId
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>

                            </div>

                            <button
                                type="button"
                                className="admin-products-modal-close"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <form
                            className="admin-products-form"
                            onSubmit={handleSubmit}
                        >

                            {/* Product Name */}

                            <div className="admin-products-form-group">

                                <label htmlFor="product-name">
                                    Product Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="product-name"
                                    name="name"
                                    type="text"
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={
                                        handleInputChange
                                    }
                                    required
                                />

                            </div>

                            {/* Category */}

                            <div className="admin-products-form-group">

                                <label htmlFor="product-category">
                                    Parent Category
                                    <span>*</span>
                                </label>

                                <div className="admin-products-select-wrapper">

                                    <select
                                        id="product-category"
                                        name="categoryId"
                                        value={
                                            formData.categoryId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select category
                                        </option>

                                        {CATEGORY_OPTIONS.map(
                                            (category) => (
                                                <option
                                                    key={
                                                        category.id
                                                    }
                                                    value={
                                                        category.id
                                                    }
                                                >
                                                    {
                                                        category.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown size={17} />

                                </div>

                            </div>

                            {/* Subcategory */}

                            <div className="admin-products-form-group">

                                <label htmlFor="product-subcategory">
                                    Subcategory
                                    <span>*</span>
                                </label>

                                <div className="admin-products-select-wrapper">

                                    <select
                                        id="product-subcategory"
                                        name="subcategoryId"
                                        value={
                                            formData.subcategoryId
                                        }
                                        onChange={
                                            handleInputChange
                                        }
                                        disabled={
                                            !formData.categoryId
                                        }
                                        required
                                    >

                                        <option value="">
                                            {formData.categoryId
                                                ? "Select subcategory"
                                                : "Select category first"}
                                        </option>

                                        {availableSubcategories.map(
                                            (subcategory) => (
                                                <option
                                                    key={
                                                        subcategory.id
                                                    }
                                                    value={
                                                        subcategory.id
                                                    }
                                                >
                                                    {
                                                        subcategory.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown size={17} />

                                </div>

                            </div>

                            {/* Brand */}

                            <div className="admin-products-form-group">

                                <label htmlFor="product-brand">
                                    Brand
                                </label>

                                <div className="admin-products-select-wrapper">

                                    <select
                                        id="product-brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={
                                            handleInputChange
                                        }
                                    >

                                        <option value="">
                                            Select brand
                                        </option>

                                        {BRAND_OPTIONS.map(
                                            (brand) => (
                                                <option
                                                    key={brand}
                                                    value={brand}
                                                >
                                                    {brand}
                                                </option>
                                            )
                                        )}

                                    </select>

                                    <ChevronDown size={17} />

                                </div>

                            </div>

                            {/* Description */}

                            <div className="admin-products-form-group">

                                <label htmlFor="product-description">
                                    Description
                                </label>

                                <textarea
                                    id="product-description"
                                    name="description"
                                    rows="4"
                                    placeholder="Enter product description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleInputChange
                                    }
                                />

                            </div>

                            {/* Status */}

                            <div className="admin-products-form-group">

                                <label>
                                    Status
                                </label>

                                <div className="product-status-options">

                                    <label
                                        className={`product-status-option ${
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
                                        className={`product-status-option ${
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

                            {/* Image */}

                            <div className="admin-products-form-group">

                                <label>
                                    Product Image
                                </label>

                                <div className="product-upload-area">

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={
                                            handleImageChange
                                        }
                                        className="product-file-input"
                                    />

                                    {!imagePreview ? (
                                        <button
                                            type="button"
                                            className="product-upload-button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >

                                            <ImagePlus
                                                size={22}
                                            />

                                            <div>

                                                <strong>
                                                    Upload Product
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
                                        <div className="product-preview-box">

                                            <img
                                                src={
                                                    imagePreview
                                                }
                                                alt="Product preview"
                                            />

                                            <div className="product-preview-info">

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

                            <div className="admin-products-form-group">

                                <label>
                                    Image Display Size
                                </label>

                                <div className="product-size-options">

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
                                            className={`product-size-option ${
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

                                <p className="product-size-note">
                                    These options control the
                                    image display size in the
                                    frontend UI.
                                </p>

                            </div>

                            {/* Form Buttons */}

                            <div className="admin-products-form-actions">

                                <button
                                    type="button"
                                    className="product-cancel-button"
                                    onClick={closeModal}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="product-save-button"
                                >
                                    {editingId
                                        ? "Update Product"
                                        : "Save Product"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
};

/* Small local icon component for the empty table state */

const PackageIcon = () => (
    <div className="product-empty-icon">
        <ImagePlus size={30} />
    </div>
);

export default AdminProducts;