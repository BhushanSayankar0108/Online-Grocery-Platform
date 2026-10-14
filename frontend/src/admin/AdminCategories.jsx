
import { useState } from "react";
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
} from "lucide-react";
import "./AdminCategories.css";

const INITIAL_CATEGORIES = [
  {
    id: 1,
    name: "Fruits & Vegetables",
    description: "Fresh fruits and vegetables for everyday grocery needs.",
    status: "active",
    images: [],
    imageSize: "medium",
    createdAt: "2026-10-01",
  },
  {
    id: 2,
    name: "Dairy & Bakery",
    description: "Milk, dairy products, bread, cakes and bakery items.",
    status: "active",
    images: [],
    imageSize: "medium",
    createdAt: "2026-10-02",
  },
  {
    id: 3,
    name: "Staples",
    description: "Rice, flour, pulses, cooking essentials and other staples.",
    status: "active",
    images: [],
    imageSize: "medium",
    createdAt: "2026-10-03",
  },
  {
    id: 4,
    name: "Snacks & Beverages",
    description: "Snacks, soft drinks, juices and other beverages.",
    status: "active",
    images: [],
    imageSize: "medium",
    createdAt: "2026-10-04",
  },
  {
    id: 5,
    name: "Personal Care",
    description: "Personal hygiene and daily care products.",
    status: "inactive",
    images: [],
    imageSize: "medium",
    createdAt: "2026-10-05",
  },
];

const EMPTY_FORM = {
  name: "",
  description: "",
  imageSize: "medium",
  status: "active",
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

const getCategoryImages = (category) => {
  if (Array.isArray(category.images)) {
    return category.images.filter(Boolean);
  }

  return category.image ? [category.image] : [];
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () =>
      reject(new Error(`Unable to read ${file.name}`));

    reader.readAsDataURL(file);
  });

const AdminCategories = () => {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [originalSnapshot, setOriginalSnapshot] = useState("");
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const filteredCategories = categories.filter((category) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      category.name.toLowerCase().includes(search) ||
      (category.description || "").toLowerCase().includes(search)
    );
  });

  const createSnapshot = (data, images) =>
    JSON.stringify({
      ...data,
      images,
    });

  const isFormDirty = () => {
    if (!originalSnapshot) return false;

    return (
      createSnapshot(formData, existingImages) !== originalSnapshot ||
      selectedImages.length > 0
    );
  };

  const clearForm = () => {
    setShowForm(false);
    setEditingCategoryId(null);
    setFormData({ ...EMPTY_FORM });
    setExistingImages([]);
    setSelectedImages([]);
    setFormError("");
    setOriginalSnapshot("");
    setFormLoading(false);
  };

  const handleOpenAddForm = () => {
    if (showForm && isFormDirty()) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and open a new category form?"
      );

      if (!discard) return;
    }

    const confirmed = window.confirm(
      "Do you want to open the form to create a new category?"
    );

    if (!confirmed) return;

    setEditingCategoryId(null);
    setFormData({ ...EMPTY_FORM });
    setExistingImages([]);
    setSelectedImages([]);
    setFormError("");
    setOriginalSnapshot(createSnapshot(EMPTY_FORM, []));
    setShowForm(true);
  };

  const handleOpenEditForm = (category) => {
    if (showForm && isFormDirty()) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and edit another category?"
      );

      if (!discard) return;
    }

    const confirmed = window.confirm(
      `Do you want to edit "${category.name}"?`
    );

    if (!confirmed) return;

    const initialForm = {
      name: category.name || "",
      description: category.description || "",
      imageSize: category.imageSize || "medium",
      status: category.status || "active",
    };

    const images = getCategoryImages(category);

    setEditingCategoryId(category.id);
    setFormData(initialForm);
    setExistingImages(images);
    setSelectedImages([]);
    setFormError("");
    setOriginalSnapshot(createSnapshot(initialForm, images));
    setShowForm(true);
  };

  const handleCloseForm = () => {
    if (formLoading) return;

    if (isFormDirty()) {
      const discard = window.confirm(
        "You have unsaved changes. Are you sure you want to discard them?"
      );

      if (!discard) return;
    }

    clearForm();
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
  };

  const handleImageChange = async (event) => {
    const files = Array.from(event.target.files || []);

    // Allow the same file to be selected again later.
    event.target.value = "";

    if (files.length === 0) return;

    const remainingSlots =
      MAX_IMAGES - existingImages.length - selectedImages.length;

    if (remainingSlots <= 0) {
      setFormError(
        `You can add a maximum of ${MAX_IMAGES} images per category.`
      );
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    const validFiles = [];
    const errors = [];

    if (files.length > remainingSlots) {
      errors.push(
        `Only ${remainingSlots} additional image(s) can be selected. Maximum: ${MAX_IMAGES}.`
      );
    }

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name}: not a valid image file.`);
      } else if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name}: exceeds the 5 MB limit.`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setFormError(errors.join(" "));
    } else {
      setFormError("");
    }

    if (validFiles.length === 0) return;

    const confirmed = window.confirm(
      `Add ${validFiles.length} image(s) to this category?`
    );

    if (!confirmed) return;

    try {
      const previews = await Promise.all(
        validFiles.map(async (file) => ({
          name: file.name,
          preview: await readFileAsDataUrl(file),
        }))
      );

      setSelectedImages((previous) =>
        [
          ...previous,
          ...previews,
        ].slice(0, MAX_IMAGES - existingImages.length)
      );

      setFormError("");
    } catch (error) {
      console.error("Image preview error:", error);
      setFormError(
        "Unable to preview one or more images. Please try again."
      );
    }
  };

  const handleRemoveExistingImage = (index) => {
    const confirmed = window.confirm(
      "Remove this image from the category? The change will apply when you save."
    );

    if (!confirmed) return;

    setExistingImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );

    setFormError("");
  };

  const handleRemoveSelectedImage = (index) => {
    const confirmed = window.confirm(
      "Remove this selected image before saving?"
    );

    if (!confirmed) return;

    setSelectedImages((previous) =>
      previous.filter((_, imageIndex) => imageIndex !== index)
    );

    setFormError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setFormError("");

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedName) {
      setFormError("Category name is required.");
      return;
    }

    if (trimmedName.length < 2) {
      setFormError("Category name must contain at least 2 characters.");
      return;
    }

    const totalImages = existingImages.length + selectedImages.length;

    if (totalImages > MAX_IMAGES) {
      setFormError(
        `A category can contain a maximum of ${MAX_IMAGES} images.`
      );
      return;
    }

    const duplicate = categories.find(
      (category) =>
        category.id !== editingCategoryId &&
        category.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (duplicate) {
      setFormError("A category with this name already exists.");
      return;
    }

    const isEditing = editingCategoryId !== null;

    const confirmed = window.confirm(
      isEditing
        ? `Save the changes to "${trimmedName}"?`
        : `Create the category "${trimmedName}"?`
    );

    if (!confirmed) return;

    setFormLoading(true);

    try {
      const savedImages = [
        ...existingImages,
        ...selectedImages.map((item) => item.preview),
      ];

      if (isEditing) {
        setCategories((previous) =>
          previous.map((category) =>
            category.id === editingCategoryId
              ? {
                  ...category,
                  name: trimmedName,
                  description: trimmedDescription,
                  status: formData.status,
                  imageSize: formData.imageSize,
                  images: savedImages,
                  // Retain compatibility with older single-image components.
                  image: savedImages[0] || "",
                }
              : category
          )
        );

        window.alert("Category updated successfully.");
      } else {
        const newCategory = {
          id: Date.now(),
          name: trimmedName,
          description: trimmedDescription,
          status: formData.status,
          images: savedImages,
          image: savedImages[0] || "",
          imageSize: formData.imageSize,
          createdAt: new Date().toISOString().split("T")[0],
        };

        setCategories((previous) => [...previous, newCategory]);

        window.alert("Category created successfully.");
      }

      clearForm();
    } catch (error) {
      console.error("Save category error:", error);
      setFormError("Unable to save the category. Please try again.");
      setFormLoading(false);
    }
  };

  const handleDelete = (categoryId) => {
    const category = categories.find((item) => item.id === categoryId);

    if (!category) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setCategories((previous) =>
      previous.filter((item) => item.id !== categoryId)
    );

    if (editingCategoryId === categoryId) {
      clearForm();
    }

    window.alert("Category deleted successfully.");
  };

  const handleRefresh = () => {
    if (showForm && isFormDirty()) {
      const discard = window.confirm(
        "You have unsaved changes. Discard them and refresh the category list?"
      );

      if (!discard) return;
    }

    const confirmed = window.confirm("Refresh the category list?");

    if (!confirmed) return;

    setLoading(true);

    // Refreshes the current frontend list; no backend request is made.
    setCategories((previous) => [...previous]);
    setLoading(false);

    if (showForm && isFormDirty()) {
      clearForm();
    }
  };

  const getImageSizeClass = (imageSize) => {
    if (imageSize === "small") return "category-image-small";
    if (imageSize === "large") return "category-image-large";
    return "category-image-medium";
  };

  return (
    <div className="admin-categories-page">
      <div className="admin-categories-header">
        <div>
          <p className="admin-categories-eyebrow">
            Catalogue Management
          </p>

          <h1>Categories</h1>

          <p className="admin-categories-description">
            Manage product categories for your grocery platform.
          </p>
        </div>

        <button
          type="button"
          className="admin-categories-add-button"
          onClick={handleOpenAddForm}
        >
          <Plus size={19} />
          <span>Add Category</span>
        </button>
      </div>

      {showForm && (
        <div className="admin-category-form-card">
          <div className="admin-category-form-header">
            <div>
              <h2>
                {editingCategoryId !== null
                  ? "Edit Category"
                  : "Add New Category"}
              </h2>

              <p>
                {editingCategoryId !== null
                  ? "Update the category information below."
                  : "Enter the category information below."}
              </p>
            </div>

            <button
              type="button"
              className="admin-category-form-close"
              onClick={handleCloseForm}
              disabled={formLoading}
              title="Close"
            >
              <X size={20} />
            </button>
          </div>

          {formError && (
            <div
              className="admin-category-form-error"
              role="alert"
            >
              {formError}
            </div>
          )}

          <form
            className="admin-category-form"
            onSubmit={handleSubmit}
          >
            <div className="admin-category-form-grid">
              <div className="admin-category-form-field">
                <label htmlFor="category-name">
                  Category Name <span>*</span>
                </label>

                <input
                  id="category-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Dairy & Bakery"
                  disabled={formLoading}
                  required
                />
              </div>

              <div className="admin-category-form-field">
                <label htmlFor="category-status">Status</label>

                <select
                  id="category-status"
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  disabled={formLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="admin-category-form-field admin-category-image-upload-field">
                <label htmlFor="category-image">
                  Category Images
                </label>

                <div className="admin-category-upload-box">
                  <input
                    id="category-image"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={formLoading}
                    className="admin-category-file-input"
                  />

                  <label
                    htmlFor="category-image"
                    className="admin-category-upload-label"
                  >
                    <Upload size={24} />

                    <strong>
                      Choose one or multiple images
                    </strong>

                    <span>
                      Click to browse files · Maximum {MAX_IMAGES} images ·
                      5 MB per image
                    </span>
                  </label>
                </div>

                <p>
                  {existingImages.length + selectedImages.length} of{" "}
                  {MAX_IMAGES} images selected
                </p>

                {existingImages.length > 0 && (
                  <div className="admin-category-current-image">
                    <label>Current Images</label>

                    <div className="admin-category-multiple-image-grid">
                      {existingImages.map((image, index) => (
                        <div
                          className="admin-category-image-item"
                          key={`existing-${index}`}
                        >
                          <img
                            src={image}
                            alt={`Category image ${index + 1}`}
                          />

                          <button
                            type="button"
                            className="admin-category-remove-image"
                            onClick={() =>
                              handleRemoveExistingImage(index)
                            }
                            disabled={formLoading}
                            title="Remove existing image"
                            aria-label={`Remove existing image ${index + 1}`}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedImages.length > 0 && (
                  <div className="admin-category-image-preview-field">
                    <label>Selected Image Previews</label>

                    <div className="admin-category-multiple-image-grid">
                      {selectedImages.map((item, index) => (
                        <div
                          className="admin-category-image-item"
                          key={`${item.name}-${index}`}
                        >
                          <img
                            src={item.preview}
                            alt={item.name}
                          />

                          <span className="admin-category-image-filename">
                            {item.name}
                          </span>

                          <button
                            type="button"
                            className="admin-category-remove-image"
                            onClick={() =>
                              handleRemoveSelectedImage(index)
                            }
                            disabled={formLoading}
                            title="Remove selected image"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X size={17} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="admin-category-form-field">
                <label htmlFor="category-image-size">
                  Image Display Size
                </label>

                <select
                  id="category-image-size"
                  name="imageSize"
                  value={formData.imageSize}
                  onChange={handleFormChange}
                  disabled={formLoading}
                >
                  <option value="small">Small — 300 × 300 px</option>
                  <option value="medium">Medium — 600 × 600 px</option>
                  <option value="large">Large — 1200 × 1200 px</option>
                </select>
              </div>

              <div className="admin-category-form-field admin-category-form-field-full">
                <label htmlFor="category-description">
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Enter category description..."
                  rows={4}
                  disabled={formLoading}
                />
              </div>
            </div>

            <div className="admin-category-form-actions">
              <button
                type="button"
                className="admin-category-cancel-button"
                onClick={handleCloseForm}
                disabled={formLoading}
              >
                <X size={17} />
                Cancel
              </button>

              <button
                type="submit"
                className="admin-category-save-button"
                disabled={formLoading}
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
                    <Save size={17} />
                    {editingCategoryId !== null
                      ? "Update Category"
                      : "Save Category"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-categories-toolbar">
        <div className="admin-categories-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <button
          type="button"
          className="admin-categories-refresh-button"
          onClick={handleRefresh}
          title="Refresh categories"
          disabled={loading}
        >
          <RefreshCw
            size={18}
            className={loading ? "admin-categories-refreshing" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      <div className="admin-categories-summary">
        <div className="admin-categories-summary-icon">
          <FolderTree size={21} />
        </div>

        <div>
          <strong>{categories.length}</strong>
          <span>Total Categories</span>
        </div>
      </div>

      <div className="admin-categories-table-card">
        <div className="admin-categories-table-header">
          <div>
            <h2>Category List</h2>
            <p>View and manage your product categories.</p>
          </div>
        </div>

        {loading ? (
          <div className="admin-categories-state">
            <RefreshCw
              size={24}
              className="admin-categories-loading-icon"
            />
            <p>Loading categories...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="admin-categories-state">
            <FolderTree size={40} />
            <h3>No categories found</h3>
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
                  <th>Category</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Images</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category, index) => {
                  const images = getCategoryImages(category);

                  return (
                    <tr key={category.id}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="admin-category-name">
                          <div
                            className={`admin-category-image ${getImageSizeClass(
                              category.imageSize
                            )}`}
                          >
                            {images[0] ? (
                              <img
                                src={images[0]}
                                alt={category.name}
                              />
                            ) : (
                              <FolderTree size={20} />
                            )}
                          </div>

                          <strong>{category.name}</strong>
                        </div>
                      </td>

                      <td>
                        <span className="admin-category-description">
                          {category.description || "No description"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-category-status ${
                            category.status === "active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {category.status}
                        </span>
                      </td>

                      <td>{images.length}</td>

                      <td>
                        {category.createdAt
                          ? new Date(
                              category.createdAt
                            ).toLocaleDateString("en-IN")
                          : "-"}
                      </td>

                      <td>
                        <div className="admin-category-actions">
                          <button
                            type="button"
                            className="admin-category-edit-button"
                            title="Edit category"
                            onClick={() =>
                              handleOpenEditForm(category)
                            }
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            className="admin-category-delete-button"
                            title="Delete category"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCategories;
