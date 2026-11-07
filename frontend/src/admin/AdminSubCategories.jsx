
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  Edit,
  ImagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import "./AdminSubCategories.css";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = "https://online-grocery-platform.onrender.com";
const CATEGORIES_API = `${API_BASE_URL}/api/categories`;
const SUBCATEGORIES_API = `${API_BASE_URL}/api/subcategories`;

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  description: "",
  image: "",
  images: [],
  imageSize: "medium",
  status: "active",
};

/* =========================================================
   HELPERS
========================================================= */

const getId = (item) => item?._id || item?.id;

const getToken = () => localStorage.getItem("adminToken");

const getImageUrl = (image) => {
  if (!image) return "";

  if (/^(https?:\/\/|data:|blob:)/i.test(image)) {
    return image;
  }

  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
};

const normalizeImages = (item) => {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images.filter(Boolean);
  }

  return item?.image ? [item.image] : [];
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();

    return (
      data.message ||
      data.error ||
      "The request could not be completed."
    );
  } catch {
    return "The server returned an unexpected response.";
  }
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error(`Unable to read ${file.name}`));

    reader.readAsDataURL(file);
  });

/* =========================================================
   ADMIN SUBCATEGORIES
========================================================= */

const AdminSubCategories = () => {
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const [subCategories, setSubCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    images: [],
  });

  const [imagePreview, setImagePreview] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  /* =========================================================
     LOAD DATA
  ========================================================= */

  const loadData = useCallback(async () => {
    try {
      const [categoriesResponse, subcategoriesResponse] =
        await Promise.all([
          fetch(CATEGORIES_API),
          fetch(SUBCATEGORIES_API),
        ]);

      if (!categoriesResponse.ok) {
        throw new Error(
          await getErrorMessage(categoriesResponse)
        );
      }

      if (!subcategoriesResponse.ok) {
        throw new Error(
          await getErrorMessage(subcategoriesResponse)
        );
      }

      const categoriesData = await categoriesResponse.json();
      const subcategoriesData = await subcategoriesResponse.json();

      const rawCategories = Array.isArray(categoriesData)
        ? categoriesData
        : categoriesData.categories || [];

      const rawSubcategories = Array.isArray(subcategoriesData)
        ? subcategoriesData
        : subcategoriesData.subcategories ||
          subcategoriesData.subCategories ||
          subcategoriesData.data ||
          [];

      const mappedCategories = rawCategories.map((category) => ({
        id: String(getId(category)),
        name: category.name || "Unnamed category",
      }));

      const mappedSubcategories = rawSubcategories.map((item) => {
        const parent =
          item.category && typeof item.category === "object"
            ? item.category
            : null;

        const categoryId = String(
          parent?._id ||
            item.category ||
            item.categoryId ||
            ""
        );

        const images = normalizeImages(item);

        const parentCategory = mappedCategories.find(
          (category) => category.id === categoryId
        );

        return {
          ...item,
          id: String(getId(item)),
          categoryId,
          categoryName:
            parent?.name ||
            parentCategory?.name ||
            item.categoryName ||
            "Unknown category",
          description: item.description || "",
          image: item.image || images[0] || "",
          images,
          imageSize: item.imageSize || "medium",
          status: item.status || "active",
          createdAt: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "-",
        };
      });

      setCategoryOptions(mappedCategories);
      setSubCategories(mappedSubcategories);
      setLoadError("");
    } catch (error) {
      console.error("Failed to load subcategories:", error);

      setLoadError(
        error.message || "Unable to load subcategories."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /* =========================================================
     INITIAL LOAD AND MANUAL REFRESH
  ========================================================= */

  useEffect(() => {
  let cancelled = false;

  const initializeData = async () => {
    await Promise.resolve();

    if (!cancelled) {
      await loadData();
    }
  };

  initializeData();

  return () => {
    cancelled = true;
  };
}, [loadData]);

  const refreshData = async () => {
    setLoading(true);
    await loadData();
  };

  /* =========================================================
     FILTERS AND COUNTS
  ========================================================= */

  const filteredSubCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return subCategories.filter((item) => {
      const matchesSearch =
        !search ||
        (item.name || "").toLowerCase().includes(search) ||
        (item.categoryName || "").toLowerCase().includes(search) ||
        (item.description || "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        String(item.categoryId) ===
          String(selectedCategoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [subCategories, searchTerm, selectedCategoryFilter]);

  const activeCount = subCategories.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveCount = subCategories.filter(
    (item) => item.status === "inactive"
  ).length;

  /* =========================================================
     IMAGE PREVIEW CLEANUP
  ========================================================= */

  const releaseImageUrl = (url) => {
    if (url && objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      objectUrlsRef.current.delete(url);
    }
  };

  const releaseNewImages = (images) => {
    images.forEach((image) => {
      if (image?.isNew) {
        releaseImageUrl(image.url);
      }
    });
  };

  /* =========================================================
     OPEN ADD FORM
  ========================================================= */

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, images: [] });
    setImagePreview([]);
    setValidationError("");
    setIsDirty(false);
    setIsModalOpen(true);
  };

  /* =========================================================
     OPEN EDIT FORM
  ========================================================= */

  const openEditModal = (item) => {
    const existingImages = normalizeImages(item);

    const formImages = existingImages.map((url) => ({
      url,
      name: "Existing image",
      isNew: false,
    }));

    setEditingId(String(getId(item)));

    setFormData({
      name: item.name || "",
      categoryId: String(item.categoryId || ""),
      description: item.description || "",
      image: item.image || existingImages[0] || "",
      images: formImages,
      imageSize: item.imageSize || "medium",
      status: item.status || "active",
    });

    setImagePreview(
      formImages.map((image) => ({
        ...image,
        url: getImageUrl(image.url),
      }))
    );

    setValidationError("");
    setIsDirty(false);
    setIsModalOpen(true);
  };

  /* =========================================================
     CLOSE FORM
  ========================================================= */

  const closeModal = (force = false) => {
    if (!force && isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );

      if (!confirmed) return;
    }

    releaseNewImages(formData.images || []);

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, images: [] });
    setImagePreview([]);
    setValidationError("");
    setIsDirty(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =========================================================
     INPUT HANDLER
  ========================================================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setIsDirty(true);
    setValidationError("");
  };

  /* =========================================================
     IMAGE HANDLER
  ========================================================= */

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const currentImages = formData.images || [];
    const remainingSlots = MAX_IMAGES - currentImages.length;

    if (remainingSlots <= 0) {
      setValidationError(
        `You can upload a maximum of ${MAX_IMAGES} images.`
      );

      event.target.value = "";
      return;
    }

    const acceptedImages = [];
    const errors = [];

    files.slice(0, remainingSlots).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not a valid image.`);
        return;
      }

      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name} exceeds the 5 MB limit.`);
        return;
      }

      const url = URL.createObjectURL(file);
      objectUrlsRef.current.add(url);

      acceptedImages.push({
        url,
        name: file.name,
        file,
        isNew: true,
      });
    });

    const updatedImages = [
      ...currentImages,
      ...acceptedImages,
    ];

    setFormData((previous) => ({
      ...previous,
      images: updatedImages,
      image: updatedImages[0]?.url || "",
    }));

    setImagePreview(updatedImages);
    setIsDirty(true);

    setValidationError(
      errors.length
        ? errors.join(" ")
        : files.length > remainingSlots
          ? `Only ${MAX_IMAGES} images are allowed. Extra images were skipped.`
          : ""
    );

    event.target.value = "";
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (index) => {
    const imageToRemove = formData.images[index];

    if (!imageToRemove) return;

    const confirmed = window.confirm(
      `Remove "${imageToRemove.name || "this image"}" from the form?`
    );

    if (!confirmed) return;

    if (imageToRemove.isNew) {
      releaseImageUrl(imageToRemove.url);
    }

    const updatedImages = formData.images.filter(
      (_, imageIndex) => imageIndex !== index
    );

    setFormData((previous) => ({
      ...previous,
      images: updatedImages,
      image: updatedImages[0]?.url || "",
    }));

    setImagePreview(updatedImages);
    setIsDirty(true);
    setValidationError("");
  };

  /* =========================================================
     CREATE OR UPDATE SUBCATEGORY
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setValidationError("");

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setValidationError("Please enter a subcategory name.");
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError(
        "Subcategory name cannot exceed 100 characters."
      );
      return;
    }

    if (!formData.categoryId) {
      setValidationError("Please select a parent category.");
      return;
    }

    const selectedCategory = categoryOptions.find(
      (category) =>
        String(category.id) === String(formData.categoryId)
    );

    if (!selectedCategory) {
      setValidationError("Please select a valid parent category.");
      return;
    }

    const duplicate = subCategories.some(
      (item) =>
        String(getId(item)) !== String(editingId) &&
        String(item.categoryId) === String(formData.categoryId) &&
        (item.name || "").trim().toLowerCase() ===
          trimmedName.toLowerCase()
    );

    if (duplicate) {
      setValidationError(
        "A subcategory with this name already exists under the selected parent category."
      );
      return;
    }

    const confirmed = window.confirm(
      editingId
        ? `Are you sure you want to update "${trimmedName}"?`
        : `Are you sure you want to add "${trimmedName}"?`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setValidationError(
        "Your admin session was not found. Please log in again."
      );
      return;
    }

    setSaving(true);

    try {
      let primaryImage = "";
      const primary = formData.images[0];

      if (primary) {
        if (primary.file) {
          primaryImage = await readFileAsDataUrl(primary.file);
        } else {
          primaryImage = primary.url || "";
        }
      }

      const payload = {
        name: trimmedName,
        description: formData.description.trim(),
        category: formData.categoryId,
        image: primaryImage,
        status: formData.status,
      };

      const url = editingId
        ? `${SUBCATEGORIES_API}/${encodeURIComponent(editingId)}`
        : SUBCATEGORIES_API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const successMessage = editingId
        ? "Subcategory updated successfully."
        : "Subcategory created successfully.";

      await refreshData();

      closeModal(true);
      window.alert(successMessage);
    } catch (error) {
      console.error("Save subcategory error:", error);

      setValidationError(
        error.message || "Unable to save the subcategory."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =========================================================
     DELETE SUBCATEGORY
  ========================================================= */

  const handleDelete = async (id) => {
    const item = subCategories.find(
      (subcategory) => String(getId(subcategory)) === String(id)
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      window.alert("Please log in again to delete subcategories.");
      return;
    }

    try {
      const response = await fetch(
        `${SUBCATEGORIES_API}/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await refreshData();
      window.alert("Subcategory deleted successfully.");
    } catch (error) {
      console.error("Delete subcategory error:", error);

      window.alert(
        error.message || "Unable to delete the subcategory."
      );
    }
  };

  /* =========================================================
     IMAGE SIZE
  ========================================================= */

  const getImageSizeClass = (size) => {
    if (size === "small") return "sub-category-image-small";
    if (size === "large") return "sub-category-image-large";

    return "sub-category-image-medium";
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-subcategories-page">
      <div className="admin-subcategories-container">
        <div className="admin-subcategories-header">
          <div>
            <p className="admin-subcategories-eyebrow">
              Catalogue Management
            </p>

            <h1>Subcategories</h1>

            <p className="admin-subcategories-header-text">
              Manage product subcategories under their parent categories.
            </p>
          </div>

          <button
            type="button"
            className="admin-subcategories-add-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            <span>Add Subcategory</span>
          </button>
        </div>

        <div className="admin-subcategories-stats">
          <div className="admin-subcategories-stat-card">
            <span>Total Subcategories</span>
            <strong>{subCategories.length}</strong>
          </div>

          <div className="admin-subcategories-stat-card">
            <span>Active</span>
            <strong>{activeCount}</strong>
          </div>

          <div className="admin-subcategories-stat-card">
            <span>Inactive</span>
            <strong>{inactiveCount}</strong>
          </div>
        </div>

        {/* SEARCH, FILTER AND REFRESH */}

        <div className="admin-subcategories-toolbar">
          <div className="admin-subcategories-search">
            <Search size={18} />

            <input
              type="search"
              aria-label="Search subcategories"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-subcategories-clear-search"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="admin-subcategories-filter">
            <select
              aria-label="Filter by parent category"
              value={selectedCategoryFilter}
              onChange={(event) =>
                setSelectedCategoryFilter(event.target.value)
              }
            >
              <option value="all">All Categories</option>

              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>

          <button
            type="button"
            className="admin-subcategories-refresh-button"
            onClick={refreshData}
            disabled={loading}
          >
            <RefreshCw
              size={17}
              className={
                loading ? "admin-subcategories-refreshing" : ""
              }
            />

            <span>{loading ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {loadError && (
          <div
            className="admin-subcategories-validation-error"
            role="alert"
          >
            {loadError}{" "}
            <button
              type="button"
              onClick={refreshData}
              disabled={loading}
            >
              Retry
            </button>
          </div>
        )}

        <div className="admin-subcategories-table-card">
          <div className="admin-subcategories-table-header">
            <div>
              <h2>Subcategory List</h2>

              <p>
                {filteredSubCategories.length} subcategor
                {filteredSubCategories.length === 1 ? "y" : "ies"} found
              </p>
            </div>
          </div>

          <div className="admin-subcategories-table-wrapper">
            <table className="admin-subcategories-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Subcategory</th>
                  <th>Parent Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="sub-category-empty-state">
                      Loading subcategories...
                    </td>
                  </tr>
                ) : filteredSubCategories.length > 0 ? (
                  filteredSubCategories.map((item, index) => {
                    const images = normalizeImages(item);

                    return (
                      <tr key={item.id}>
                        <td className="sub-category-number">
                          {index + 1}
                        </td>

                        <td>
                          <div
                            className={`sub-category-table-image ${getImageSizeClass(
                              item.imageSize
                            )}`}
                          >
                            {images[0] ? (
                              <img
                                src={getImageUrl(images[0])}
                                alt={item.name}
                              />
                            ) : (
                              <ImagePlus size={20} />
                            )}
                          </div>

                          {images.length > 1 && (
                            <small className="sub-category-image-count">
                              +{images.length - 1} more
                            </small>
                          )}
                        </td>

                        <td>
                          <div className="sub-category-name-cell">
                            <strong>{item.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="sub-category-parent-badge">
                            {item.categoryName}
                          </span>
                        </td>

                        <td>
                          <p className="sub-category-description">
                            {item.description || "No description"}
                          </p>
                        </td>

                        <td>
                          <span
                            className={`sub-category-status ${
                              item.status === "active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {item.status === "active"
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        <td className="sub-category-date">
                          {item.createdAt}
                        </td>

                        <td>
                          <div className="sub-category-actions">
                            <button
                              type="button"
                              className="sub-category-edit-button"
                              title="Edit subcategory"
                              aria-label={`Edit ${item.name}`}
                              onClick={() => openEditModal(item)}
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              type="button"
                              className="sub-category-delete-button"
                              title="Delete subcategory"
                              aria-label={`Delete ${item.name}`}
                              onClick={() => handleDelete(item.id)}
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
                    <td colSpan={8} className="sub-category-empty-state">
                      <div>
                        <ImagePlus size={32} />
                        <h3>No subcategories found</h3>
                        <p>
                          Try changing your search or category filter.
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
          className="admin-subcategories-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="admin-subcategories-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subcategory-modal-title"
          >
            <div className="admin-subcategories-modal-header">
              <div>
                <p>Catalogue Management</p>

                <h2 id="subcategory-modal-title">
                  {editingId ? "Edit Subcategory" : "Add Subcategory"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-subcategories-modal-close"
                aria-label="Close modal"
                onClick={() => closeModal()}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-subcategories-form"
              onSubmit={handleSubmit}
            >
              {validationError && (
                <div
                  className="admin-subcategories-validation-error"
                  role="alert"
                >
                  {validationError}
                </div>
              )}

              <div className="admin-subcategories-form-group">
                <label htmlFor="categoryId">
                  Parent Category <span>*</span>
                </label>

                <div className="admin-subcategories-select-wrapper">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select parent category</option>

                    {categoryOptions.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="admin-subcategories-form-group">
                <label htmlFor="name">
                  Subcategory Name <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  maxLength={100}
                  placeholder="Enter subcategory name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-subcategories-form-group">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={500}
                  placeholder="Enter subcategory description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              <div className="admin-subcategories-form-group">
                <label htmlFor="status-active">Status</label>

                <div className="admin-subcategories-status-options">
                  <label
                    className={`sub-category-status-option ${
                      formData.status === "active" ? "selected" : ""
                    }`}
                  >
                    <input
                      id="status-active"
                      type="radio"
                      name="status"
                      value="active"
                      checked={formData.status === "active"}
                      onChange={handleInputChange}
                    />

                    <span>Active</span>
                  </label>

                  <label
                    className={`sub-category-status-option ${
                      formData.status === "inactive" ? "selected" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={formData.status === "inactive"}
                      onChange={handleInputChange}
                    />

                    <span>Inactive</span>
                  </label>
                </div>
              </div>

              <div className="admin-subcategories-form-group">
                <label>Subcategory Images</label>

                <div className="sub-category-upload-area">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="sub-category-file-input"
                    aria-label="Choose subcategory images"
                  />

                  <button
                    type="button"
                    className="sub-category-upload-button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={formData.images.length >= MAX_IMAGES}
                  >
                    <ImagePlus size={22} />

                    <div>
                      <strong>Upload Images</strong>

                      <span>
                        Choose multiple images from your device
                      </span>

                      <span>
                        Maximum {MAX_IMAGES} images, 5 MB per image
                      </span>
                    </div>
                  </button>

                  {imagePreview.length > 0 && (
                    <div className="sub-category-multiple-preview-grid">
                      {imagePreview.map((image, index) => (
                        <div
                          className="sub-category-multiple-preview-item"
                          key={`${image.url}-${index}`}
                        >
                          <img
                            src={getImageUrl(image.url)}
                            alt={`Subcategory preview ${index + 1}`}
                          />

                          {index === 0 && (
                            <span className="sub-category-primary-image-label">
                              Primary
                            </span>
                          )}

                          <button
                            type="button"
                            className="sub-category-remove-image-button"
                            aria-label={`Remove image ${index + 1}`}
                            onClick={() => removeImage(index)}
                          >
                            <X size={15} />
                          </button>

                          <span className="sub-category-preview-image-name">
                            {image.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="sub-category-size-note">
                    The first image is used as the primary image in the
                    table.
                  </p>
                </div>
              </div>

              <div className="admin-subcategories-form-group">
                <label>Image Display Size</label>

                <div className="sub-category-size-options">
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
                      className={`sub-category-size-option ${
                        formData.imageSize === option.value
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="imageSize"
                        value={option.value}
                        checked={formData.imageSize === option.value}
                        onChange={handleInputChange}
                      />

                      <div>
                        <strong>{option.title}</strong>
                        <span>{option.subtitle}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="admin-subcategories-form-actions">
                <button
                  type="button"
                  className="sub-category-cancel-button"
                  onClick={() => closeModal()}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sub-category-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Subcategory"
                      : "Save Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubCategories;
