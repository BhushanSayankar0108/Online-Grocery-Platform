import { useEffect, useState } from "react";

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    FolderTree,
    RefreshCw,
    X,
    Save,
    Upload,
    Image as ImageIcon,
    ArrowLeft
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import "./AdminCategories.css";

const API_BASE_URL = "http://localhost:5000";

const AdminCategories = () => {
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showForm, setShowForm] =
        useState(false);

    const [editingCategoryId, setEditingCategoryId] =
        useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        image: null,
        imageSize: "medium",
        status: "active"
    });

    const [existingImage, setExistingImage] =
        useState("");

    const [imagePreview, setImagePreview] =
        useState("");

    const [formLoading, setFormLoading] =
        useState(false);

    const [formError, setFormError] =
        useState("");

    /* =====================================================
       INITIAL CATEGORY LOADING
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const fetchInitialCategories = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/api/categories`
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message ||
                            "Failed to load categories."
                    );
                }

                if (isMounted) {
                    setCategories(
                        data.categories || []
                    );

                    setError("");
                }
            } catch (error) {
                console.error(
                    "Initial categories error:",
                    error
                );

                if (isMounted) {
                    setError(
                        error.message ||
                            "Unable to load categories."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchInitialCategories();

        return () => {
            isMounted = false;
        };
    }, []);

    /* =====================================================
       LOAD CATEGORIES
    ===================================================== */

    const loadCategories = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${API_BASE_URL}/api/categories`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to load categories."
                );
            }

            setCategories(
                data.categories || []
            );
        } catch (error) {
            console.error(
                "Load categories error:",
                error
            );

            setError(
                error.message ||
                    "Unable to load categories."
            );
        } finally {
            setLoading(false);
        }
    };

    /* =====================================================
       SEARCH
    ===================================================== */

    const filteredCategories =
        categories.filter((category) =>
            category.name
                ?.toLowerCase()
                .includes(
                    searchTerm.toLowerCase()
                )
        );

    /* =====================================================
       OPEN ADD FORM
    ===================================================== */

    const handleOpenAddForm = () => {
        setEditingCategoryId(null);

        setFormData({
            name: "",
            description: "",
            image: null,
            imageSize: "medium",
            status: "active"
        });

        setExistingImage("");

        setImagePreview("");

        setFormError("");

        setShowForm(true);
    };

    /* =====================================================
       OPEN EDIT FORM
    ===================================================== */

    const handleOpenEditForm = (category) => {
        setEditingCategoryId(
            category._id
        );

        setFormData({
            name: category.name || "",
            description:
                category.description || "",
            image: null,
            imageSize:
                category.imageSize ||
                "medium",
            status:
                category.status ||
                "active"
        });

        setExistingImage(
            category.image || ""
        );

        setImagePreview("");

        setFormError("");

        setShowForm(true);
    };

    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const handleCloseForm = () => {
        if (formLoading) {
            return;
        }

        setShowForm(false);

        setEditingCategoryId(null);

        setFormError("");

        setImagePreview("");

        setExistingImage("");

        setFormData({
            name: "",
            description: "",
            image: null,
            imageSize: "medium",
            status: "active"
        });
    };

    /* =====================================================
       FORM CHANGE
    ===================================================== */

    const handleFormChange = (event) => {
        const {
            name,
            value
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    /* =====================================================
       IMAGE CHANGE
    ===================================================== */

    const handleImageChange = (event) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setFormData((previous) => ({
            ...previous,
            image: file
        }));

        const previewUrl =
            URL.createObjectURL(file);

        setImagePreview(previewUrl);

        setFormError("");
    };

    /* =====================================================
       REMOVE NEW IMAGE
    ===================================================== */

    const handleRemoveImage = () => {
        setFormData((previous) => ({
            ...previous,
            image: null
        }));

        setImagePreview("");

        const fileInput =
            document.getElementById(
                "category-image"
            );

        if (fileInput) {
            fileInput.value = "";
        }
    };

    /* =====================================================
       CREATE / UPDATE CATEGORY
    ===================================================== */

    const handleSubmit = async (event) => {
        event.preventDefault();

        setFormError("");

        if (!formData.name.trim()) {
            setFormError(
                "Category name is required."
            );

            return;
        }

        try {
            setFormLoading(true);

            const uploadData =
                new FormData();

            uploadData.append(
                "name",
                formData.name.trim()
            );

            uploadData.append(
                "description",
                formData.description.trim()
            );

            uploadData.append(
                "status",
                formData.status
            );

            uploadData.append(
                "imageSize",
                formData.imageSize
            );

            if (formData.image) {
                uploadData.append(
                    "image",
                    formData.image
                );
            }

            const url = editingCategoryId
                ? `${API_BASE_URL}/api/categories/${editingCategoryId}`
                : `${API_BASE_URL}/api/categories`;

            const method = editingCategoryId
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method,
                    body: uploadData
                }
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        `Failed to ${
                            editingCategoryId
                                ? "update"
                                : "create"
                        } category.`
                );
            }

            setShowForm(false);

            setEditingCategoryId(null);

            setFormData({
                name: "",
                description: "",
                image: null,
                imageSize: "medium",
                status: "active"
            });

            setExistingImage("");

            setImagePreview("");

            setFormError("");

            await loadCategories();

        } catch (error) {
            console.error(
                "Save category error:",
                error
            );

            setFormError(
                error.message ||
                    "Unable to save category."
            );
        } finally {
            setFormLoading(false);
        }
    };

    /* =====================================================
       DELETE CATEGORY
    ===================================================== */

    const handleDelete = async (
        categoryId
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this category?"
            );

        if (!confirmed) {
            return;
        }

        try {
            const response =
                await fetch(
                    `${API_BASE_URL}/api/categories/${categoryId}`,
                    {
                        method: "DELETE"
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        "Failed to delete category."
                );
            }

            await loadCategories();

        } catch (error) {
            console.error(
                "Delete category error:",
                error
            );

            window.alert(
                error.message ||
                    "Unable to delete category."
            );
        }
    };

    /* =====================================================
       REFRESH
    ===================================================== */

    const handleRefresh = () => {
        loadCategories();
    };

    /* =====================================================
       IMAGE SIZE CLASS
    ===================================================== */

    const getImageSizeClass = (
        imageSize
    ) => {
        if (imageSize === "small") {
            return "category-image-small";
        }

        if (imageSize === "large") {
            return "category-image-large";
        }

        return "category-image-medium";
    };

    /* =====================================================
       DASHBOARD
    ===================================================== */

    const handleBackToDashboard = () => {
        navigate("/admin/dashboard");
    };

    /* =====================================================
       IMAGE URL
    ===================================================== */

    const getImageUrl = (image) => {
        if (!image) {
            return "";
        }

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }

        return `${API_BASE_URL}${image}`;
    };

    /* =====================================================
       JSX
    ===================================================== */

    return (
        <div className="admin-categories-page">

            {/* BACK TO DASHBOARD */}

            <div className="admin-categories-back-wrapper">

                <button
                    type="button"
                    className="admin-categories-back-button"
                    onClick={
                        handleBackToDashboard
                    }
                >
                    <ArrowLeft size={17} />

                    <span>
                        Back to Dashboard
                    </span>
                </button>

            </div>

            {/* PAGE HEADER */}

            <div className="admin-categories-header">

                <div>

                    <p className="admin-categories-eyebrow">
                        Catalogue Management
                    </p>

                    <h1>
                        Categories
                    </h1>

                    <p className="admin-categories-description">
                        Manage product categories
                        for your grocery platform.
                    </p>

                </div>

                <button
                    type="button"
                    className="admin-categories-add-button"
                    onClick={
                        handleOpenAddForm
                    }
                >
                    <Plus size={19} />

                    <span>
                        Add Category
                    </span>
                </button>

            </div>

            {/* ADD / EDIT FORM */}

            {showForm && (
                <div className="admin-category-form-card">

                    <div className="admin-category-form-header">

                        <div>

                            <h2>
                                {editingCategoryId
                                    ? "Edit Category"
                                    : "Add New Category"}
                            </h2>

                            <p>
                                {editingCategoryId
                                    ? "Update the category information below."
                                    : "Enter the category information below."}
                            </p>

                        </div>

                        <button
                            type="button"
                            className="admin-category-form-close"
                            onClick={
                                handleCloseForm
                            }
                            disabled={
                                formLoading
                            }
                            title="Close"
                        >
                            <X size={20} />
                        </button>

                    </div>

                    {formError && (
                        <div className="admin-category-form-error">
                            {formError}
                        </div>
                    )}

                    <form
                        className="admin-category-form"
                        onSubmit={
                            handleSubmit
                        }
                    >

                        <div className="admin-category-form-grid">

                            {/* CATEGORY NAME */}

                            <div className="admin-category-form-field">

                                <label htmlFor="category-name">
                                    Category Name
                                    <span>*</span>
                                </label>

                                <input
                                    id="category-name"
                                    type="text"
                                    name="name"
                                    value={
                                        formData.name
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="e.g. Dairy & Bakery"
                                    disabled={
                                        formLoading
                                    }
                                />

                            </div>

                            {/* STATUS */}

                            <div className="admin-category-form-field">

                                <label htmlFor="category-status">
                                    Status
                                </label>

                                <select
                                    id="category-status"
                                    name="status"
                                    value={
                                        formData.status
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    disabled={
                                        formLoading
                                    }
                                >
                                    <option value="active">
                                        Active
                                    </option>

                                    <option value="inactive">
                                        Inactive
                                    </option>
                                </select>

                            </div>

                            {/* IMAGE UPLOAD */}

                            <div className="admin-category-form-field admin-category-image-upload-field">

                                <label htmlFor="category-image">
                                    Category Image
                                </label>

                                <div className="admin-category-upload-box">

                                    <input
                                        id="category-image"
                                        type="file"
                                        onChange={
                                            handleImageChange
                                        }
                                        disabled={
                                            formLoading
                                        }
                                        className="admin-category-file-input"
                                    />

                                    <label
                                        htmlFor="category-image"
                                        className="admin-category-upload-label"
                                    >
                                        <Upload
                                            size={24}
                                        />

                                        <strong>
                                            {editingCategoryId
                                                ? "Choose replacement image"
                                                : "Choose image from device"}
                                        </strong>

                                        <span>
                                            Click to browse files
                                        </span>

                                    </label>

                                </div>

                                {/* NEW IMAGE */}

                                {formData.image && (
                                    <div className="admin-category-selected-file">

                                        <div className="admin-category-selected-file-icon">
                                            <ImageIcon
                                                size={18}
                                            />
                                        </div>

                                        <div className="admin-category-selected-file-info">

                                            <strong>
                                                {
                                                    formData
                                                        .image
                                                        .name
                                                }
                                            </strong>

                                            <span>
                                                New image selected
                                            </span>

                                        </div>

                                        <button
                                            type="button"
                                            className="admin-category-remove-image"
                                            onClick={
                                                handleRemoveImage
                                            }
                                            disabled={
                                                formLoading
                                            }
                                            title="Remove image"
                                        >
                                            <X
                                                size={17}
                                            />
                                        </button>

                                    </div>
                                )}

                            </div>

                            {/* IMAGE SIZE */}

                            <div className="admin-category-form-field">

                                <label htmlFor="category-image-size">
                                    Image Pixel Size
                                </label>

                                <select
                                    id="category-image-size"
                                    name="imageSize"
                                    value={
                                        formData.imageSize
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    disabled={
                                        formLoading
                                    }
                                >
                                    <option value="small">
                                        Small — 300 × 300 px
                                    </option>

                                    <option value="medium">
                                        Medium — 600 × 600 px
                                    </option>

                                    <option value="large">
                                        Large — 1200 × 1200 px
                                    </option>
                                </select>

                            </div>

                            {/* CURRENT IMAGE */}

                            {editingCategoryId &&
                                existingImage &&
                                !imagePreview && (
                                    <div className="admin-category-current-image">

                                        <label>
                                            Current Image
                                        </label>

                                        <div className="admin-category-current-image-box">

                                            <img
                                                src={getImageUrl(
                                                    existingImage
                                                )}
                                                alt="Current category"
                                            />

                                        </div>

                                    </div>
                                )}

                            {/* NEW PREVIEW */}

                            {imagePreview && (
                                <div className="admin-category-image-preview-field">

                                    <label>
                                        New Image Preview
                                    </label>

                                    <div
                                        className={`admin-category-image-preview ${getImageSizeClass(
                                            formData.imageSize
                                        )}`}
                                    >
                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt="Category preview"
                                        />
                                    </div>

                                </div>
                            )}

                            {/* DESCRIPTION */}

                            <div className="admin-category-form-field admin-category-form-field-full">

                                <label htmlFor="category-description">
                                    Description
                                </label>

                                <textarea
                                    id="category-description"
                                    name="description"
                                    value={
                                        formData.description
                                    }
                                    onChange={
                                        handleFormChange
                                    }
                                    placeholder="Enter category description..."
                                    rows="4"
                                    disabled={
                                        formLoading
                                    }
                                />

                            </div>

                        </div>

                        {/* FORM ACTIONS */}

                        <div className="admin-category-form-actions">

                            <button
                                type="button"
                                className="admin-category-cancel-button"
                                onClick={
                                    handleCloseForm
                                }
                                disabled={
                                    formLoading
                                }
                            >
                                <X size={17} />

                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-category-save-button"
                                disabled={
                                    formLoading
                                }
                            >

                                {formLoading ? (
                                    <>
                                        <RefreshCw
                                            size={17}
                                            className="admin-category-saving-icon"
                                        />

                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save
                                            size={17}
                                        />

                                        {editingCategoryId
                                            ? "Update Category"
                                            : "Save Category"}
                                    </>
                                )}

                            </button>

                        </div>

                    </form>

                </div>
            )}

            {/* TOOLBAR */}

            <div className="admin-categories-toolbar">

                <div className="admin-categories-search">

                    <Search size={19} />

                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={
                            searchTerm
                        }
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                </div>

                <button
                    type="button"
                    className="admin-categories-refresh-button"
                    onClick={
                        handleRefresh
                    }
                    title="Refresh categories"
                >
                    <RefreshCw
                        size={18}
                        className={
                            loading
                                ? "admin-categories-refreshing"
                                : ""
                        }
                    />

                    <span>
                        Refresh
                    </span>
                </button>

            </div>

            {/* ERROR */}

            {error && (
                <div className="admin-categories-error">
                    {error}
                </div>
            )}

            {/* SUMMARY */}

            <div className="admin-categories-summary">

                <div className="admin-categories-summary-icon">
                    <FolderTree size={21} />
                </div>

                <div>

                    <strong>
                        {categories.length}
                    </strong>

                    <span>
                        Total Categories
                    </span>

                </div>

            </div>

            {/* CATEGORY TABLE */}

            <div className="admin-categories-table-card">

                <div className="admin-categories-table-header">

                    <div>

                        <h2>
                            Category List
                        </h2>

                        <p>
                            View and manage your
                            product categories.
                        </p>

                    </div>

                </div>

                {loading ? (

                    <div className="admin-categories-state">

                        <RefreshCw
                            size={24}
                            className="admin-categories-loading-icon"
                        />

                        <p>
                            Loading categories...
                        </p>

                    </div>

                ) : filteredCategories.length === 0 ? (

                    <div className="admin-categories-state">

                        <FolderTree
                            size={40}
                        />

                        <h3>
                            No categories found
                        </h3>

                        <p>
                            {searchTerm
                                ? "Try a different search term."
                                : "Create your first product category."}
                        </p>

                    </div>

                ) : (

                    <div className="admin-categories-table-wrapper">

                        <table className="admin-categories-table">

                            <thead>

                                <tr>

                                    <th>#</th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Description
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                    <th>
                                        Created
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredCategories.map(
                                    (
                                        category,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                category._id
                                            }
                                        >

                                            <td>
                                                {
                                                    index +
                                                    1
                                                }
                                            </td>

                                            <td>

                                                <div className="admin-category-name">

                                                    <div
                                                        className={`admin-category-image ${getImageSizeClass(
                                                            category.imageSize
                                                        )}`}
                                                    >

                                                        {category.image ? (
                                                            <img
                                                                src={getImageUrl(
                                                                    category.image
                                                                )}
                                                                alt={
                                                                    category.name
                                                                }
                                                            />
                                                        ) : (
                                                            <FolderTree
                                                                size={
                                                                    20
                                                                }
                                                            />
                                                        )}

                                                    </div>

                                                    <strong>
                                                        {
                                                            category.name
                                                        }
                                                    </strong>

                                                </div>

                                            </td>

                                            <td>

                                                <span className="admin-category-description">

                                                    {category.description ||
                                                        "No description"}

                                                </span>

                                            </td>

                                            <td>

                                                <span
                                                    className={`admin-category-status ${
                                                        category.status ===
                                                        "active"
                                                            ? "active"
                                                            : "inactive"
                                                    }`}
                                                >
                                                    {
                                                        category.status
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                {category.createdAt
                                                    ? new Date(
                                                          category.createdAt
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "-"}

                                            </td>

                                            <td>

                                                <div className="admin-category-actions">

                                                    {/* EDIT */}

                                                    <button
                                                        type="button"
                                                        className="admin-category-edit-button"
                                                        title="Edit category"
                                                        onClick={() =>
                                                            handleOpenEditForm(
                                                                category
                                                            )
                                                        }
                                                    >
                                                        <Pencil
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                    {/* DELETE */}

                                                    <button
                                                        type="button"
                                                        className="admin-category-delete-button"
                                                        title="Delete category"
                                                        onClick={() =>
                                                            handleDelete(
                                                                category._id
                                                            )
                                                        }
                                                    >
                                                        <Trash2
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )
                                )}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>

        </div>
    );
};

export default AdminCategories;