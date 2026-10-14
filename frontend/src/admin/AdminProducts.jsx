import { useMemo, useRef, useState, useEffect } from "react";
import {
    ChevronDown,
    Edit,
    ImagePlus,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import "./AdminProducts.css";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const CATEGORY_OPTIONS = [
    {
        id: "cat-1",
        name: "Fruits & Vegetables",
        subcategories: [
            { id: "sub-1", name: "Fresh Fruits" },
            { id: "sub-2", name: "Fresh Vegetables" },
        ],
    },
    {
        id: "cat-2",
        name: "Dairy & Bakery",
        subcategories: [
            { id: "sub-3", name: "Milk & Dairy" },
            { id: "sub-4", name: "Bakery Products" },
        ],
    },
    {
        id: "cat-3",
        name: "Staples & Grains",
        subcategories: [
            { id: "sub-5", name: "Rice & Grains" },
            { id: "sub-6", name: "Flour & Pulses" },
        ],
    },
    {
        id: "cat-4",
        name: "Snacks & Beverages",
        subcategories: [
            { id: "sub-7", name: "Biscuits & Snacks" },
            { id: "sub-8", name: "Beverages" },
        ],
    },
    {
        id: "cat-5",
        name: "Personal Care",
        subcategories: [
            { id: "sub-9", name: "Bath & Body" },
            { id: "sub-10", name: "Hair Care" },
        ],
    },
];

const BRAND_OPTIONS = [
    "Fresh Farm",
    "Amul",
    "India Gate",
    "Tata",
    "Aashirvaad",
    "Britannia",
    "Other",
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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "inactive",
        createdAt: "02 Oct 2026",
    },
];

const EMPTY_FORM = {
    name: "",
    categoryId: "",
    subcategoryId: "",
    brand: "",
    description: "",
    images: [],
    imageSize: "medium",
    status: "active",
};

const getProductImages = (product) => {
    if (Array.isArray(product.images) && product.images.length > 0) {
        return product.images;
    }

    return product.image ? [product.image] : [];
};

const formatDate = (date = new Date()) =>
    date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const AdminProducts = () => {
    const fileInputRef = useRef(null);
    const objectUrlsRef = useRef(new Set());

    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategoryFilter, setSelectedCategoryFilter] =
        useState("all");
    const [selectedStatusFilter, setSelectedStatusFilter] =
        useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [originalFormData, setOriginalFormData] = useState(null);
    const [formError, setFormError] = useState("");

    useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
        objectUrls.forEach((url) => {
            URL.revokeObjectURL(url);
        });

        objectUrls.clear();
    };
}, []);

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
                (product.brand || "").toLowerCase().includes(search) ||
                product.categoryName.toLowerCase().includes(search) ||
                product.subcategoryName.toLowerCase().includes(search);

            const matchesCategory =
                selectedCategoryFilter === "all" ||
                product.categoryId === selectedCategoryFilter;

            const matchesStatus =
                selectedStatusFilter === "all" ||
                product.status === selectedStatusFilter;

            return matchesSearch && matchesCategory && matchesStatus;
        });
    }, [
        products,
        searchTerm,
        selectedCategoryFilter,
        selectedStatusFilter,
    ]);

    const revokePreviewUrl = (url) => {
        if (objectUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            objectUrlsRef.current.delete(url);
        }
    };

    const releaseFormPreviewUrls = (images) => {
        images.forEach((image) => {
            if (image.isLocal && image.url) {
                revokePreviewUrl(image.url);
            }
        });
    };

    const resetForm = () => {
        releaseFormPreviewUrls(formData.images);
        setFormData(EMPTY_FORM);
        setOriginalFormData(null);
        setEditingId(null);
        setFormError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openAddModal = () => {
        resetForm();
        setEditingId(null);
        setOriginalFormData({ ...EMPTY_FORM, images: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (product) => {
        const images = getProductImages(product).map((url, index) => ({
            id: `existing-${product.id}-${index}`,
            url,
            name: `Product image ${index + 1}`,
            isLocal: false,
        }));

        resetForm();

        const nextForm = {
            name: product.name,
            categoryId: product.categoryId,
            subcategoryId: product.subcategoryId,
            brand: product.brand || "",
            description: product.description || "",
            images,
            imageSize: product.imageSize || "medium",
            status: product.status,
        };

        setEditingId(product.id);
        setFormData(nextForm);
        setOriginalFormData({
            ...nextForm,
            images: images.map((image) => ({ ...image })),
        });
        setIsModalOpen(true);
    };

    const hasFormChanged = () => {
        if (!originalFormData) return false;

        const scalarFields = [
            "name",
            "categoryId",
            "subcategoryId",
            "brand",
            "description",
            "imageSize",
            "status",
        ];

        const scalarChanged = scalarFields.some(
            (key) => formData[key] !== originalFormData[key]
        );

        const currentImages = formData.images.map((image) => image.url);
        const originalImages = originalFormData.images.map(
            (image) => image.url
        );

        return (
            scalarChanged ||
            currentImages.length !== originalImages.length ||
            currentImages.some((url, index) => url !== originalImages[index])
        );
    };

    const closeModal = () => {
        if (
            hasFormChanged() &&
            !window.confirm(
                "You have unsaved changes. Are you sure you want to discard them?"
            )
        ) {
            return;
        }

        setIsModalOpen(false);
        resetForm();
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
            ...(name === "categoryId" ? { subcategoryId: "" } : {}),
        }));

        setFormError("");
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = MAX_IMAGES - formData.images.length;

        if (remainingSlots <= 0) {
            setFormError(`You can upload a maximum of ${MAX_IMAGES} images.`);
            event.target.value = "";
            return;
        }

        const acceptedImages = [];
        let validationMessage = "";

        files.slice(0, remainingSlots).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                validationMessage = "Please select valid image files only.";
                return;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                validationMessage = `${file.name} exceeds the 5 MB image limit.`;
                return;
            }

            const url = URL.createObjectURL(file);
            objectUrlsRef.current.add(url);

            acceptedImages.push({
                id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
                url,
                name: file.name,
                isLocal: true,
                file,
            });
        });

        if (files.length > remainingSlots) {
            validationMessage = `Only ${remainingSlots} additional image(s) can be added.`;
        }

        if (acceptedImages.length > 0) {
            setFormData((previous) => ({
                ...previous,
                images: [...previous.images, ...acceptedImages],
            }));
        }

        setFormError(validationMessage);
        event.target.value = "";
    };

    const removeImage = (imageId) => {
        const image = formData.images.find((item) => item.id === imageId);
        if (!image) return;

        if (
            !window.confirm(
                `Remove "${image.name}" from this product?`
            )
        ) {
            return;
        }

        if (image.isLocal) {
            revokePreviewUrl(image.url);
        }

        setFormData((previous) => ({
            ...previous,
            images: previous.images.filter((item) => item.id !== imageId),
        }));

        setFormError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormError("");

        const name = formData.name.trim();

        if (!name) {
            setFormError("Please enter the product name.");
            return;
        }

        if (!formData.categoryId) {
            setFormError("Please select a parent category.");
            return;
        }

        if (!formData.subcategoryId) {
            setFormError("Please select a subcategory.");
            return;
        }

        if (formData.images.length > MAX_IMAGES) {
            setFormError(`A maximum of ${MAX_IMAGES} images is allowed.`);
            return;
        }

        const category = CATEGORY_OPTIONS.find(
            (item) => item.id === formData.categoryId
        );

        const subcategory = category?.subcategories.find(
            (item) => item.id === formData.subcategoryId
        );

        if (!category || !subcategory) {
            setFormError("Please select a valid category and subcategory.");
            return;
        }

        const duplicate = products.some(
            (product) =>
                product.id !== editingId &&
                product.name.trim().toLowerCase() === name.toLowerCase() &&
                product.categoryId === formData.categoryId
        );

        if (duplicate) {
            setFormError(
                "A product with this name already exists in the selected category."
            );
            return;
        }

        const action = editingId ? "update" : "add";

        if (
            !window.confirm(
                `Are you sure you want to ${action} "${name}"?`
            )
        ) {
            return;
        }

        const imageUrls = formData.images.map((image) => image.url);

        const productData = {
            name,
            categoryId: formData.categoryId,
            categoryName: category.name,
            subcategoryId: formData.subcategoryId,
            subcategoryName: subcategory.name,
            brand: formData.brand,
            description: formData.description.trim(),
            images: imageUrls,
            image: imageUrls[0] || "",
            imageSize: formData.imageSize,
            status: formData.status,
        };

        if (editingId !== null) {
            setProducts((previous) =>
                previous.map((product) =>
                    product.id === editingId
                        ? { ...product, ...productData }
                        : product
                )
            );
        } else {
            setProducts((previous) => [
                {
                    id: Date.now(),
                    ...productData,
                    createdAt: formatDate(),
                },
                ...previous,
            ]);
        }

        setIsModalOpen(false);
        resetForm();

        window.alert(
            editingId
                ? "Product updated successfully."
                : "Product added successfully."
        );
    };

    const handleDelete = (productId) => {
        const product = products.find((item) => item.id === productId);
        if (!product) return;

        if (
            !window.confirm(
                `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        setProducts((previous) =>
            previous.filter((item) => item.id !== productId)
        );

        window.alert("Product deleted successfully.");
    };

    const handleStatusChange = (product) => {
        const nextStatus =
            product.status === "active" ? "inactive" : "active";

        if (
            !window.confirm(
                `Are you sure you want to mark "${product.name}" as ${nextStatus}?`
            )
        ) {
            return;
        }

        setProducts((previous) =>
            previous.map((item) =>
                item.id === product.id
                    ? { ...item, status: nextStatus }
                    : item
            )
        );
    };

    const getImageSizeClass = (size) => {
        if (size === "small") return "product-image-small";
        if (size === "large") return "product-image-large";
        return "product-image-medium";
    };

    return (
        <div className="admin-products-page">
            <div className="admin-products-container">
                <div className="admin-products-header">
                    <div>
                        <p className="admin-products-eyebrow">
                            Catalogue Management
                        </p>

                        <h1>Products</h1>

                        <p className="admin-products-header-text">
                            Manage your grocery products, categories and
                            product information.
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
                                    (item) => item.status === "active"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-products-stat-card">
                        <span>Inactive</span>
                        <strong>
                            {
                                products.filter(
                                    (item) => item.status === "inactive"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-products-stat-card">
                        <span>Categories Used</span>
                        <strong>
                            {
                                new Set(
                                    products.map((item) => item.categoryId)
                                ).size
                            }
                        </strong>
                    </div>
                </div>

                <div className="admin-products-toolbar">
                    <div className="admin-products-search">
                        <Search size={18} />

                        <input
                            type="text"
                            aria-label="Search products"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-products-clear-search"
                                aria-label="Clear search"
                                onClick={() => setSearchTerm("")}
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="admin-products-filter">
                        <select
                            aria-label="Filter by category"
                            value={selectedCategoryFilter}
                            onChange={(event) =>
                                setSelectedCategoryFilter(event.target.value)
                            }
                        >
                            <option value="all">All Categories</option>

                            {CATEGORY_OPTIONS.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <ChevronDown size={17} />
                    </div>

                    <div className="admin-products-filter">
                        <select
                            aria-label="Filter by status"
                            value={selectedStatusFilter}
                            onChange={(event) =>
                                setSelectedStatusFilter(event.target.value)
                            }
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>

                        <ChevronDown size={17} />
                    </div>
                </div>

                <div className="admin-products-table-card">
                    <div className="admin-products-table-header">
                        <div>
                            <h2>Product List</h2>
                            <p>
                                {filteredProducts.length} product
                                {filteredProducts.length !== 1 ? "s" : ""}{" "}
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
                                    filteredProducts.map((product, index) => {
                                        const images = getProductImages(product);

                                        return (
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
                                                        {images.length > 0 ? (
                                                            <img
                                                                src={images[0]}
                                                                alt={product.name}
                                                            />
                                                        ) : (
                                                            <ImagePlus size={20} />
                                                        )}

                                                        {images.length > 1 && (
                                                            <span
                                                                className="product-image-count"
                                                                title={`${images.length} product images`}
                                                            >
                                                                +{images.length - 1}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="product-name-cell">
                                                        <strong>{product.name}</strong>
                                                        <p>
                                                            {product.description ||
                                                                "No description"}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="product-category-badge">
                                                        {product.categoryName}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="product-subcategory-text">
                                                        {product.subcategoryName}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="product-brand-text">
                                                        {product.brand || "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`product-status ${
                                                            product.status === "active"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                        onClick={() =>
                                                            handleStatusChange(product)
                                                        }
                                                        title="Change product status"
                                                        aria-label={`Change ${product.name} status`}
                                                    >
                                                        {product.status === "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </button>
                                                </td>

                                                <td className="product-date">
                                                    {product.createdAt}
                                                </td>

                                                <td>
                                                    <div className="product-actions">
                                                        <button
                                                            type="button"
                                                            className="product-edit-button"
                                                            title="Edit product"
                                                            aria-label={`Edit ${product.name}`}
                                                            onClick={() =>
                                                                openEditModal(product)
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="product-delete-button"
                                                            title="Delete product"
                                                            aria-label={`Delete ${product.name}`}
                                                            onClick={() =>
                                                                handleDelete(product.id)
                                                            }
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="9"
                                            className="product-empty-state"
                                        >
                                            <div>
                                                <div className="product-empty-icon">
                                                    <ImagePlus size={30} />
                                                </div>
                                                <h3>No products found</h3>
                                                <p>
                                                    Try changing your search or
                                                    filters.
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
                    className="admin-products-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="admin-products-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="product-modal-title"
                    >
                        <div className="admin-products-modal-header">
                            <div>
                                <p>Catalogue Management</p>
                                <h2 id="product-modal-title">
                                    {editingId !== null
                                        ? "Edit Product"
                                        : "Add Product"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-products-modal-close"
                                aria-label="Close product form"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="admin-products-form"
                            onSubmit={handleSubmit}
                        >
                            {formError && (
                                <div
                                    className="admin-products-form-error"
                                    role="alert"
                                >
                                    {formError}
                                </div>
                            )}

                            <div className="admin-products-form-group">
                                <label htmlFor="product-name">
                                    Product Name <span>*</span>
                                </label>
                                <input
                                    id="product-name"
                                    name="name"
                                    type="text"
                                    maxLength={150}
                                    placeholder="Enter product name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="admin-products-form-group">
                                <label htmlFor="product-category">
                                    Parent Category <span>*</span>
                                </label>

                                <div className="admin-products-select-wrapper">
                                    <select
                                        id="product-category"
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select category</option>
                                        {CATEGORY_OPTIONS.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={17} />
                                </div>
                            </div>

                            <div className="admin-products-form-group">
                                <label htmlFor="product-subcategory">
                                    Subcategory <span>*</span>
                                </label>

                                <div className="admin-products-select-wrapper">
                                    <select
                                        id="product-subcategory"
                                        name="subcategoryId"
                                        value={formData.subcategoryId}
                                        onChange={handleInputChange}
                                        disabled={!formData.categoryId}
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
                                                    key={subcategory.id}
                                                    value={subcategory.id}
                                                >
                                                    {subcategory.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                    <ChevronDown size={17} />
                                </div>
                            </div>

                            <div className="admin-products-form-group">
                                <label htmlFor="product-brand">Brand</label>

                                <div className="admin-products-select-wrapper">
                                    <select
                                        id="product-brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select brand</option>
                                        {BRAND_OPTIONS.map((brand) => (
                                            <option key={brand} value={brand}>
                                                {brand}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={17} />
                                </div>
                            </div>

                            <div className="admin-products-form-group">
                                <label htmlFor="product-description">
                                    Description
                                </label>
                                <textarea
                                    id="product-description"
                                    name="description"
                                    rows={4}
                                    maxLength={2000}
                                    placeholder="Enter product description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="admin-products-form-group">
                                <label>Status</label>

                                <div className="product-status-options">
                                    {["active", "inactive"].map((status) => (
                                        <label
                                            key={status}
                                            className={`product-status-option ${
                                                formData.status === status
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={
                                                    formData.status === status
                                                }
                                                onChange={handleInputChange}
                                            />
                                            <span>
                                                {status === "active"
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="admin-products-form-group">
                                <label>Product Images</label>

                                <p className="product-size-note">
                                    Upload up to {MAX_IMAGES} images. Each image
                                    must be 5 MB or smaller. The first image is
                                    used as the primary image.
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="product-file-input"
                                    aria-label="Choose product images"
                                />

                                <div className="product-upload-area">
                                    {formData.images.length < MAX_IMAGES && (
                                        <button
                                            type="button"
                                            className="product-upload-button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <ImagePlus size={22} />
                                            <div>
                                                <strong>
                                                    Upload Product Images
                                                </strong>
                                                <span>
                                                    Select multiple images from
                                                    your device
                                                </span>
                                            </div>
                                        </button>
                                    )}

                                    {formData.images.length > 0 && (
                                        <div className="product-multiple-preview-grid">
                                            {formData.images.map(
                                                (image, index) => (
                                                    <div
                                                        className="product-multiple-preview-item"
                                                        key={image.id}
                                                    >
                                                        <img
                                                            src={image.url}
                                                            alt={image.name}
                                                        />

                                                        {index === 0 && (
                                                            <span className="product-primary-image-label">
                                                                Primary
                                                            </span>
                                                        )}

                                                        <button
                                                            type="button"
                                                            className="product-remove-image-button"
                                                            aria-label={`Remove ${image.name}`}
                                                            title="Remove image"
                                                            onClick={() =>
                                                                removeImage(image.id)
                                                            }
                                                        >
                                                            <X size={15} />
                                                        </button>

                                                        <span
                                                            className="product-preview-image-name"
                                                            title={image.name}
                                                        >
                                                            {image.name}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    <p className="product-size-note">
                                        {formData.images.length} of {MAX_IMAGES}{" "}
                                        images selected
                                    </p>
                                </div>
                            </div>

                            <div className="admin-products-form-group">
                                <label>Image Display Size</label>

                                <div className="product-size-options">
                                    {[
                                        {
                                            value: "small",
                                            title: "Small",
                                            subtitle: "Small display",
                                        },
                                        {
                                            value: "medium",
                                            title: "Medium",
                                            subtitle: "Medium display",
                                        },
                                        {
                                            value: "large",
                                            title: "Large",
                                            subtitle: "Large display",
                                        },
                                    ].map((option) => (
                                        <label
                                            key={option.value}
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
                                                value={option.value}
                                                checked={
                                                    formData.imageSize ===
                                                    option.value
                                                }
                                                onChange={handleInputChange}
                                            />

                                            <div>
                                                <strong>{option.title}</strong>
                                                <span>{option.subtitle}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <p className="product-size-note">
                                    These options control the image display size
                                    in the frontend UI.
                                </p>
                            </div>

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
                                    {editingId !== null
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

export default AdminProducts;