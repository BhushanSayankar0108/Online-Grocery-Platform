import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    Edit,
    ImagePlus,
    Plus,
    Search,
    Trash2,
    X,
} from "lucide-react";

import "./AdminProductVariants.css";

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const PRODUCT_OPTIONS = [
    {
        id: "product-1",
        name: "Fresh Red Apples",
        category: "Fruits & Vegetables",
        subcategory: "Fresh Fruits",
    },
    {
        id: "product-2",
        name: "Fresh Full Cream Milk",
        category: "Dairy & Bakery",
        subcategory: "Milk & Dairy",
    },
    {
        id: "product-3",
        name: "Basmati Rice",
        category: "Staples & Grains",
        subcategory: "Rice & Grains",
    },
    {
        id: "product-4",
        name: "Butter Cookies",
        category: "Snacks & Beverages",
        subcategory: "Biscuits & Snacks",
    },
];

const UNIT_OPTIONS = ["g", "kg", "ml", "L", "piece", "pack", "box"];

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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "active",
        createdAt: "02 Oct 2026",
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
        images: [],
        imageSize: "medium",
        status: "inactive",
        createdAt: "02 Oct 2026",
    },
];

const EMPTY_FORM = {
    productId: "",
    variantName: "",
    sku: "",
    unit: "",
    quantity: "",
    price: "",
    discountPrice: "",
    images: [],
    imageSize: "medium",
    status: "active",
};

const getVariantImages = (variant) => {
    if (Array.isArray(variant.images) && variant.images.length > 0) {
        return variant.images;
    }

    return variant.image ? [variant.image] : [];
};

const formatDate = () =>
    new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

const AdminProductVariants = () => {
    const fileInputRef = useRef(null);
    const objectUrlsRef = useRef(new Set());

    const [variants, setVariants] = useState(INITIAL_VARIANTS);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductFilter, setSelectedProductFilter] =
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
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
            objectUrls.clear();
        };
    }, []);

    const filteredVariants = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return variants.filter((variant) => {
            const matchesSearch =
                !search ||
                variant.variantName.toLowerCase().includes(search) ||
                variant.productName.toLowerCase().includes(search) ||
                variant.sku.toLowerCase().includes(search);

            const matchesProduct =
                selectedProductFilter === "all" ||
                variant.productId === selectedProductFilter;

            const matchesStatus =
                selectedStatusFilter === "all" ||
                variant.status === selectedStatusFilter;

            return matchesSearch && matchesProduct && matchesStatus;
        });
    }, [
        variants,
        searchTerm,
        selectedProductFilter,
        selectedStatusFilter,
    ]);

    const revokePreviewUrl = (url) => {
        if (objectUrlsRef.current.has(url)) {
            URL.revokeObjectURL(url);
            objectUrlsRef.current.delete(url);
        }
    };

    const releaseFormImages = (images = []) => {
        images.forEach((image) => {
            if (image.isLocal && image.url) {
                revokePreviewUrl(image.url);
            }
        });
    };

    const resetForm = () => {
        releaseFormImages(formData.images);

        setFormData({
            ...EMPTY_FORM,
            images: [],
        });
        setOriginalFormData(null);
        setEditingId(null);
        setFormError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openAddModal = () => {
        resetForm();

        setOriginalFormData({
            ...EMPTY_FORM,
            images: [],
        });

        setIsModalOpen(true);
    };

    const openEditModal = (variant) => {
        resetForm();

        const images = getVariantImages(variant).map((url, index) => ({
            id: `existing-${variant.id}-${index}`,
            url,
            name: `Variant image ${index + 1}`,
            isLocal: false,
        }));

        const nextForm = {
            productId: variant.productId,
            variantName: variant.variantName,
            sku: variant.sku,
            unit: variant.unit,
            quantity: variant.quantity,
            price: variant.price,
            discountPrice: variant.discountPrice || "",
            images,
            imageSize: variant.imageSize || "medium",
            status: variant.status,
        };

        setEditingId(variant.id);
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
            "productId",
            "variantName",
            "sku",
            "unit",
            "quantity",
            "price",
            "discountPrice",
            "imageSize",
            "status",
        ];

        const scalarChanged = scalarFields.some(
            (field) => formData[field] !== originalFormData[field]
        );

        const currentImages = formData.images.map((image) => image.url);
        const originalImages = originalFormData.images.map(
            (image) => image.url
        );

        return (
            scalarChanged ||
            currentImages.length !== originalImages.length ||
            currentImages.some(
                (url, index) => url !== originalImages[index]
            )
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
        }));

        setFormError("");
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (files.length === 0) return;

        const remainingSlots = MAX_IMAGES - formData.images.length;

        if (remainingSlots <= 0) {
            setFormError(
                `You can upload a maximum of ${MAX_IMAGES} images.`
            );
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
                id: `${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}`,
                url,
                name: file.name,
                isLocal: true,
                file,
            });
        });

        if (files.length > remainingSlots) {
            validationMessage =
                `Only ${remainingSlots} additional image(s) can be added.`;
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
        const image = formData.images.find(
            (item) => item.id === imageId
        );

        if (!image) return;

        if (
            !window.confirm(
                `Remove "${image.name}" from this variant?`
            )
        ) {
            return;
        }

        if (image.isLocal) {
            revokePreviewUrl(image.url);
        }

        setFormData((previous) => ({
            ...previous,
            images: previous.images.filter(
                (item) => item.id !== imageId
            ),
        }));

        setFormError("");
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setFormError("");

        const variantName = formData.variantName.trim();
        const sku = formData.sku.trim().toUpperCase();
        const quantity = Number(formData.quantity);
        const price = Number(formData.price);
        const discountPrice =
            formData.discountPrice === ""
                ? null
                : Number(formData.discountPrice);

        if (!formData.productId) {
            setFormError("Please select a product.");
            return;
        }

        if (!variantName) {
            setFormError("Please enter the variant name.");
            return;
        }

        if (!sku) {
            setFormError("Please enter the SKU.");
            return;
        }

        if (!formData.unit) {
            setFormError("Please select a unit.");
            return;
        }

        if (
            formData.quantity === "" ||
            !Number.isFinite(quantity) ||
            quantity <= 0
        ) {
            setFormError("Quantity must be greater than zero.");
            return;
        }

        if (
            formData.price === "" ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            setFormError("Please enter a valid, non-negative price.");
            return;
        }

        if (
            discountPrice !== null &&
            (!Number.isFinite(discountPrice) ||
                discountPrice < 0 ||
                discountPrice > price)
        ) {
            setFormError(
                "Discount price must be non-negative and cannot exceed the original price."
            );
            return;
        }

        if (formData.images.length > MAX_IMAGES) {
            setFormError(
                `A maximum of ${MAX_IMAGES} images is allowed.`
            );
            return;
        }

        const product = PRODUCT_OPTIONS.find(
            (item) => item.id === formData.productId
        );

        if (!product) {
            setFormError("Please select a valid product.");
            return;
        }

        const duplicateSku = variants.some(
            (variant) =>
                variant.id !== editingId &&
                variant.sku.trim().toUpperCase() === sku
        );

        if (duplicateSku) {
            setFormError("This SKU is already assigned to another variant.");
            return;
        }

        if (
            !window.confirm(
                `Are you sure you want to ${
                    editingId !== null ? "update" : "add"
                } the variant "${product.name} - ${variantName}"?`
            )
        ) {
            return;
        }

        const imageUrls = formData.images.map((image) => image.url);

        const variantData = {
            productId: product.id,
            productName: product.name,
            variantName,
            sku,
            unit: formData.unit,
            quantity: String(quantity),
            price: String(price),
            discountPrice:
                discountPrice === null ? "" : String(discountPrice),
            images: imageUrls,
            image: imageUrls[0] || "",
            imageSize: formData.imageSize,
            status: formData.status,
        };

        if (editingId !== null) {
            setVariants((previous) =>
                previous.map((variant) =>
                    variant.id === editingId
                        ? { ...variant, ...variantData }
                        : variant
                )
            );
        } else {
            setVariants((previous) => [
                {
                    id: Date.now(),
                    ...variantData,
                    createdAt: formatDate(),
                },
                ...previous,
            ]);
        }

        setIsModalOpen(false);
        resetForm();

        window.alert(
            editingId !== null
                ? "Product variant updated successfully."
                : "Product variant added successfully."
        );
    };

    const handleDelete = (id) => {
        const variant = variants.find((item) => item.id === id);

        if (!variant) return;

        if (
            !window.confirm(
                `Are you sure you want to delete "${variant.productName} - ${variant.variantName}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        setVariants((previous) =>
            previous.filter((item) => item.id !== id)
        );

        window.alert("Product variant deleted successfully.");
    };

    const handleStatusChange = (variant) => {
        const nextStatus =
            variant.status === "active" ? "inactive" : "active";

        if (
            !window.confirm(
                `Are you sure you want to mark "${variant.productName} - ${variant.variantName}" as ${nextStatus}?`
            )
        ) {
            return;
        }

        setVariants((previous) =>
            previous.map((item) =>
                item.id === variant.id
                    ? { ...item, status: nextStatus }
                    : item
            )
        );
    };

    const getImageSizeClass = (size) => {
        if (size === "small") return "variant-image-small";
        if (size === "large") return "variant-image-large";
        return "variant-image-medium";
    };

    return (
        <div className="admin-product-variants-page">
            <div className="admin-product-variants-container">
                <div className="admin-product-variants-header">
                    <div>
                        <p className="admin-product-variants-eyebrow">
                            Catalogue Management
                        </p>

                        <h1>Product Variants</h1>

                        <p className="admin-product-variants-header-text">
                            Manage product sizes, quantities, pricing and SKUs.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-product-variants-add-button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        <span>Add Variant</span>
                    </button>
                </div>

                <div className="admin-product-variants-stats">
                    <div className="admin-product-variants-stat-card">
                        <span>Total Variants</span>
                        <strong>{variants.length}</strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>Active</span>
                        <strong>
                            {
                                variants.filter(
                                    (item) => item.status === "active"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>Inactive</span>
                        <strong>
                            {
                                variants.filter(
                                    (item) => item.status === "inactive"
                                ).length
                            }
                        </strong>
                    </div>

                    <div className="admin-product-variants-stat-card">
                        <span>Products With Variants</span>
                        <strong>
                            {
                                new Set(
                                    variants.map((item) => item.productId)
                                ).size
                            }
                        </strong>
                    </div>
                </div>

                <div className="admin-product-variants-toolbar">
                    <div className="admin-product-variants-search">
                        <Search size={18} />

                        <input
                            type="search"
                            aria-label="Search variants, products or SKU"
                            placeholder="Search variants, products or SKU..."
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-product-variants-clear-search"
                                aria-label="Clear search"
                                onClick={() => setSearchTerm("")}
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>

                    <div className="admin-product-variants-filter">
                        <select
                            aria-label="Filter by product"
                            value={selectedProductFilter}
                            onChange={(event) =>
                                setSelectedProductFilter(event.target.value)
                            }
                        >
                            <option value="all">All Products</option>
                            {PRODUCT_OPTIONS.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={17} />
                    </div>

                    <div className="admin-product-variants-filter">
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

                <div className="admin-product-variants-table-card">
                    <div className="admin-product-variants-table-header">
                        <div>
                            <h2>Variant List</h2>
                            <p>
                                {filteredVariants.length} variant
                                {filteredVariants.length !== 1 ? "s" : ""} found
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
                                    filteredVariants.map((variant, index) => {
                                        const images = getVariantImages(variant);

                                        return (
                                            <tr key={variant.id}>
                                                <td className="variant-number">
                                                    {index + 1}
                                                </td>

                                                <td>
                                                    <div
                                                        className={`variant-table-image ${getImageSizeClass(
                                                            variant.imageSize
                                                        )}`}
                                                    >
                                                        {images.length > 0 ? (
                                                            <>
                                                                <img
                                                                    src={images[0]}
                                                                    alt={variant.variantName}
                                                                />
                                                                {images.length > 1 && (
                                                                    <span
                                                                        className="variant-image-count"
                                                                        title={`${images.length} images`}
                                                                    >
                                                                        +{images.length - 1}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <ImagePlus size={20} />
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <div className="variant-product-cell">
                                                        <strong>
                                                            {variant.productName}
                                                        </strong>
                                                    </div>
                                                </td>

                                                <td>
                                                    <span className="variant-name-badge">
                                                        {variant.variantName}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="variant-sku">
                                                        {variant.sku}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="variant-quantity">
                                                        {variant.quantity} {variant.unit}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="variant-price-cell">
                                                        {variant.discountPrice !== "" &&
                                                        variant.discountPrice != null ? (
                                                            <>
                                                                <strong>
                                                                    ₹{variant.discountPrice}
                                                                </strong>
                                                                <span>
                                                                    ₹{variant.price}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <strong>₹{variant.price}</strong>
                                                        )}
                                                    </div>
                                                </td>

                                                <td>
                                                    <button
                                                        type="button"
                                                        className={`variant-status ${
                                                            variant.status === "active"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                        aria-label={`Change ${variant.variantName} status`}
                                                        onClick={() =>
                                                            handleStatusChange(variant)
                                                        }
                                                    >
                                                        {variant.status === "active"
                                                            ? "Active"
                                                            : "Inactive"}
                                                    </button>
                                                </td>

                                                <td className="variant-date">
                                                    {variant.createdAt}
                                                </td>

                                                <td>
                                                    <div className="variant-actions">
                                                        <button
                                                            type="button"
                                                            className="variant-edit-button"
                                                            title="Edit variant"
                                                            aria-label={`Edit ${variant.productName} ${variant.variantName}`}
                                                            onClick={() =>
                                                                openEditModal(variant)
                                                            }
                                                        >
                                                            <Edit size={16} />
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="variant-delete-button"
                                                            title="Delete variant"
                                                            aria-label={`Delete ${variant.productName} ${variant.variantName}`}
                                                            onClick={() =>
                                                                handleDelete(variant.id)
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
                                            colSpan={10}
                                            className="variant-empty-state"
                                        >
                                            <div>
                                                <ImagePlus size={32} />
                                                <h3>No variants found</h3>
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

            {isModalOpen && (
                <div
                    className="admin-product-variants-modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeModal();
                        }
                    }}
                >
                    <div
                        className="admin-product-variants-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="variant-modal-title"
                    >
                        <div className="admin-product-variants-modal-header">
                            <div>
                                <p>Catalogue Management</p>
                                <h2 id="variant-modal-title">
                                    {editingId !== null
                                        ? "Edit Product Variant"
                                        : "Add Product Variant"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-product-variants-modal-close"
                                aria-label="Close variant form"
                                onClick={closeModal}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            className="admin-product-variants-form"
                            onSubmit={handleSubmit}
                        >
                            {formError && (
                                <div
                                    className="admin-product-variants-form-error"
                                    role="alert"
                                >
                                    {formError}
                                </div>
                            )}

                            <div className="admin-product-variants-form-group">
                                <label htmlFor="variant-product">
                                    Product <span>*</span>
                                </label>

                                <div className="admin-product-variants-select-wrapper">
                                    <select
                                        id="variant-product"
                                        name="productId"
                                        value={formData.productId}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">Select product</option>
                                        {PRODUCT_OPTIONS.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown size={17} />
                                </div>
                            </div>

                            <div className="admin-product-variants-form-group">
                                <label htmlFor="variant-name">
                                    Variant Name <span>*</span>
                                </label>
                                <input
                                    id="variant-name"
                                    name="variantName"
                                    type="text"
                                    maxLength={100}
                                    placeholder="Example: 500 g, 1 kg, 1 L"
                                    value={formData.variantName}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="admin-product-variants-form-group">
                                <label htmlFor="variant-sku">
                                    SKU <span>*</span>
                                </label>
                                <input
                                    id="variant-sku"
                                    name="sku"
                                    type="text"
                                    maxLength={60}
                                    placeholder="Example: APP-500G"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="variant-form-two-column">
                                <div className="admin-product-variants-form-group">
                                    <label htmlFor="variant-quantity">
                                        Quantity <span>*</span>
                                    </label>
                                    <input
                                        id="variant-quantity"
                                        name="quantity"
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        placeholder="Example: 500"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="admin-product-variants-form-group">
                                    <label htmlFor="variant-unit">
                                        Unit <span>*</span>
                                    </label>
                                    <div className="admin-product-variants-select-wrapper">
                                        <select
                                            id="variant-unit"
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleInputChange}
                                            required
                                        >
                                            <option value="">Select unit</option>
                                            {UNIT_OPTIONS.map((unit) => (
                                                <option key={unit} value={unit}>
                                                    {unit}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown size={17} />
                                    </div>
                                </div>
                            </div>

                            <div className="variant-form-two-column">
                                <div className="admin-product-variants-form-group">
                                    <label htmlFor="variant-price">
                                        Price (₹) <span>*</span>
                                    </label>
                                    <div className="variant-price-input">
                                        <span>₹</span>
                                        <input
                                            id="variant-price"
                                            name="price"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="admin-product-variants-form-group">
                                    <label htmlFor="variant-discount-price">
                                        Discount Price (₹)
                                    </label>
                                    <div className="variant-price-input">
                                        <span>₹</span>
                                        <input
                                            id="variant-discount-price"
                                            name="discountPrice"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="Optional"
                                            value={formData.discountPrice}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="admin-product-variants-form-group">
                                <label>Status</label>
                                <div className="variant-status-options">
                                    {["active", "inactive"].map((status) => (
                                        <label
                                            key={status}
                                            className={`variant-status-option ${
                                                formData.status === status
                                                    ? "selected"
                                                    : ""
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="status"
                                                value={status}
                                                checked={formData.status === status}
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

                            <div className="admin-product-variants-form-group">
                                <label>Variant Images</label>
                                <p className="variant-size-note">
                                    Upload up to {MAX_IMAGES} images. Each image
                                    must be 5 MB or smaller. The first image is
                                    the primary image.
                                </p>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="variant-file-input"
                                    aria-label="Choose variant images"
                                />

                                <div className="variant-upload-area">
                                    {formData.images.length < MAX_IMAGES && (
                                        <button
                                            type="button"
                                            className="variant-upload-button"
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            <ImagePlus size={22} />
                                            <div>
                                                <strong>
                                                    Upload Variant Images
                                                </strong>
                                                <span>
                                                    Select multiple images from
                                                    your device
                                                </span>
                                            </div>
                                        </button>
                                    )}

                                    {formData.images.length > 0 && (
                                        <div className="variant-multiple-preview-grid">
                                            {formData.images.map((image, index) => (
                                                <div
                                                    className="variant-multiple-preview-item"
                                                    key={image.id}
                                                >
                                                    <img
                                                        src={image.url}
                                                        alt={image.name}
                                                    />

                                                    {index === 0 && (
                                                        <span className="variant-primary-image-label">
                                                            Primary
                                                        </span>
                                                    )}

                                                    <button
                                                        type="button"
                                                        className="variant-remove-image-button"
                                                        aria-label={`Remove ${image.name}`}
                                                        title="Remove image"
                                                        onClick={() =>
                                                            removeImage(image.id)
                                                        }
                                                    >
                                                        <X size={15} />
                                                    </button>

                                                    <span
                                                        className="variant-preview-image-name"
                                                        title={image.name}
                                                    >
                                                        {image.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <p className="variant-size-note">
                                        {formData.images.length} of {MAX_IMAGES}{" "}
                                        images selected
                                    </p>
                                </div>
                            </div>

                            <div className="admin-product-variants-form-group">
                                <label>Image Display Size</label>
                                <div className="variant-size-options">
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
                                            className={`variant-size-option ${
                                                formData.imageSize === option.value
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
                                <p className="variant-size-note">
                                    These options control the image display size
                                    in the frontend UI.
                                </p>
                            </div>

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
                                    {editingId !== null
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