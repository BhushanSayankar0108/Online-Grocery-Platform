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

import "./AdminSubCategories.css";

const CATEGORY_OPTIONS = [
  { id: "cat-1", name: "Fruits & Vegetables" },
  { id: "cat-2", name: "Dairy & Bakery" },
  { id: "cat-3", name: "Staples & Grains" },
  { id: "cat-4", name: "Snacks & Beverages" },
  { id: "cat-5", name: "Personal Care" },
];

const INITIAL_SUBCATEGORIES = [
  {
    id: 1,
    name: "Fresh Fruits",
    categoryId: "cat-1",
    categoryName: "Fruits & Vegetables",
    description: "Fresh seasonal fruits and everyday favorites.",
    image: "",
    images: [],
    imageSize: "medium",
    status: "active",
    createdAt: "02 Oct 2026",
  },
  {
    id: 2,
    name: "Fresh Vegetables",
    categoryId: "cat-1",
    categoryName: "Fruits & Vegetables",
    description: "Fresh vegetables for everyday cooking.",
    image: "",
    images: [],
    imageSize: "medium",
    status: "active",
    createdAt: "02 Oct 2026",
  },
  {
    id: 3,
    name: "Milk & Dairy",
    categoryId: "cat-2",
    categoryName: "Dairy & Bakery",
    description: "Milk, curd, butter, paneer and other dairy products.",
    image: "",
    images: [],
    imageSize: "medium",
    status: "active",
    createdAt: "02 Oct 2026",
  },
  {
    id: 4,
    name: "Rice & Grains",
    categoryId: "cat-3",
    categoryName: "Staples & Grains",
    description: "Rice, wheat, grains and staple food products.",
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
  description: "",
  image: "",
  images: [],
  imageSize: "medium",
  status: "active",
};

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const normalizeImages = (item) => {
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images;
  }

  return item.image ? [item.image] : [];
};

const AdminSubCategories = () => {
  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef(new Set());

  const [subCategories, setSubCategories] = useState(
    INITIAL_SUBCATEGORIES
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    ...EMPTY_FORM,
    images: [],
  });
  const [validationError, setValidationError] = useState("");
  const [imagePreview, setImagePreview] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // Capture the Set once inside the effect. This avoids reading the
  // mutable ref's current value from the cleanup function.
  useEffect(() => {
    const urls = objectUrlsRef.current;

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
    };
  }, []);

  const filteredSubCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return subCategories.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.categoryName.toLowerCase().includes(search) ||
        (item.description || "").toLowerCase().includes(search);

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        item.categoryId === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [subCategories, searchTerm, selectedCategoryFilter]);

  const activeCount = subCategories.filter(
    (item) => item.status === "active"
  ).length;

  const inactiveCount = subCategories.filter(
    (item) => item.status === "inactive"
  ).length;

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

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM, images: [] });
    setImagePreview([]);
    setValidationError("");
    setIsDirty(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    const existingImages = normalizeImages(item);

    setEditingId(item.id);
    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description || "",
      image: item.image || existingImages[0] || "",
      images: existingImages.map((url) => ({
        url,
        name: "Existing image",
        isNew: false,
      })),
      imageSize: item.imageSize || "medium",
      status: item.status,
    });

    setImagePreview(
      existingImages.map((url) => ({
        url,
        name: "Existing image",
        isNew: false,
      }))
    );

    setValidationError("");
    setIsDirty(false);
    setIsModalOpen(true);
  };

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

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setIsDirty(true);
    setValidationError("");
  };

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
        errors.push(`${file.name} is not a supported image.`);
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
        isNew: true,
      });
    });

    const updatedImages = [...currentImages, ...acceptedImages];

    setFormData((previous) => ({
      ...previous,
      images: updatedImages,
      image: updatedImages[0]?.url || "",
    }));

    setImagePreview(updatedImages);
    setIsDirty(true);

    setValidationError(
      errors.length > 0
        ? errors.join(" ")
        : files.length > remainingSlots
          ? `Only ${MAX_IMAGES} images are allowed. Extra images were skipped.`
          : ""
    );

    // Allows the same file to be selected again if needed.
    event.target.value = "";
  };

  const removeImage = (index) => {
    const imageToRemove = formData.images[index];

    if (!imageToRemove) return;

    const confirmed = window.confirm(
      `Remove "${imageToRemove.name || "this image"}" from the subcategory?`
    );

    if (!confirmed) return;

    // Do not revoke an image URL here. If the user cancels editing,
    // the original table entry must continue displaying its image.
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError("");

    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      setValidationError("Please enter a subcategory name.");
      return;
    }

    if (!formData.categoryId) {
      setValidationError("Please select a parent category.");
      return;
    }

    if (trimmedName.length > 100) {
      setValidationError(
        "Subcategory name cannot exceed 100 characters."
      );
      return;
    }

    const selectedCategory = CATEGORY_OPTIONS.find(
      (category) => category.id === formData.categoryId
    );

    if (!selectedCategory) {
      setValidationError("Please select a valid parent category.");
      return;
    }

    const duplicate = subCategories.some(
      (item) =>
        item.id !== editingId &&
        item.categoryId === formData.categoryId &&
        item.name.trim().toLowerCase() === trimmedName.toLowerCase()
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

    const imageObjects = formData.images || [];
    const imageUrls = imageObjects.map((image) => image.url);

    if (editingId) {
      const existingItem = subCategories.find(
        (item) => item.id === editingId
      );

      // Revoke old object URLs only when the update is confirmed.
      if (existingItem) {
        const oldUrls = normalizeImages(existingItem);

        oldUrls.forEach((url) => {
          if (!imageUrls.includes(url)) {
            releaseImageUrl(url);
          }
        });
      }

      setSubCategories((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: trimmedName,
                categoryId: formData.categoryId,
                categoryName: selectedCategory.name,
                description: formData.description.trim(),
                image: imageUrls[0] || "",
                images: imageUrls,
                imageSize: formData.imageSize,
                status: formData.status,
              }
            : item
        )
      );
    } else {
      // Generate the ID outside the state updater to keep the updater pure.
      const newSubCategoryId = Date.now();

      const newSubCategory = {
        id: newSubCategoryId,
        name: trimmedName,
        categoryId: formData.categoryId,
        categoryName: selectedCategory.name,
        description: formData.description.trim(),
        image: imageUrls[0] || "",
        images: imageUrls,
        imageSize: formData.imageSize,
        status: formData.status,
        createdAt: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };

      setSubCategories((previous) => [
        newSubCategory,
        ...previous,
      ]);
    }

    setIsDirty(false);
    closeModal(true);
  };

  const handleDelete = (id) => {
    const item = subCategories.find(
      (subcategory) => subcategory.id === id
    );

    if (!item) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setSubCategories((previous) =>
      previous.filter((subcategory) => subcategory.id !== id)
    );

    normalizeImages(item).forEach((url) => {
      releaseImageUrl(url);
    });
  };

  const getImageSizeClass = (size) => {
    if (size === "small") return "sub-category-image-small";
    if (size === "large") return "sub-category-image-large";
    return "sub-category-image-medium";
  };

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

              {CATEGORY_OPTIONS.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <ChevronDown size={17} />
          </div>
        </div>

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
                {filteredSubCategories.length > 0 ? (
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
                              <img src={images[0]} alt={item.name} />
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
                            {item.status === "active" ? "Active" : "Inactive"}
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

                    {CATEGORY_OPTIONS.map((category) => (
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
                      <span>Choose multiple images from your device</span>
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
                            src={image.url}
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
                    The first image is used as the primary image in the table.
                    Choose image display size below.
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

                <p className="sub-category-size-note">
                  These options control the image display size in the frontend UI.
                </p>
              </div>

              <div className="admin-subcategories-form-actions">
                <button
                  type="button"
                  className="sub-category-cancel-button"
                  onClick={() => closeModal()}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sub-category-save-button"
                >
                  {editingId ? "Update Subcategory" : "Save Subcategory"}
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