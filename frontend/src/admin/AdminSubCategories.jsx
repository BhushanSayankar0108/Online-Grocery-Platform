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
  imageSize: "medium",
  status: "active",
};

const AdminSubCategories = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [subCategories, setSubCategories] = useState(
    INITIAL_SUBCATEGORIES
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [imagePreview, setImagePreview] = useState("");

  const filteredSubCategories = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return subCategories.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.categoryName.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);

      const matchesCategory =
        selectedCategoryFilter === "all" ||
        item.categoryId === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [subCategories, searchTerm, selectedCategoryFilter]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);

    setFormData({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description,
      image: item.image,
      imageSize: item.imageSize,
      status: item.status,
    });

    setImagePreview(item.image || "");
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
      [name]: value,
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
      image: previewUrl,
    }));

    setImagePreview(previewUrl);
  };

  const removeImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));

    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert("Please enter subcategory name.");
      return;
    }

    if (!formData.categoryId) {
      alert("Please select parent category.");
      return;
    }

    const selectedCategory = CATEGORY_OPTIONS.find(
      (category) => category.id === formData.categoryId
    );

    if (!selectedCategory) {
      return;
    }

    if (editingId) {
      setSubCategories((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? {
                ...item,
                name: formData.name.trim(),
                categoryId: formData.categoryId,
                categoryName: selectedCategory.name,
                description: formData.description.trim(),
                image: formData.image,
                imageSize: formData.imageSize,
                status: formData.status,
              }
            : item
        )
      );
    } else {
      const newSubCategory = {
        id: Date.now(),
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        categoryName: selectedCategory.name,
        description: formData.description.trim(),
        image: formData.image,
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

    closeModal();
  };

  const handleDelete = (id) => {
    const item = subCategories.find(
      (subcategory) => subcategory.id === id
    );

    if (!item) {
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setSubCategories((previous) =>
      previous.filter((subcategory) => subcategory.id !== id)
    );
  };

  const getImageSizeClass = (size) => {
    if (size === "small") {
      return "sub-category-image-small";
    }

    if (size === "large") {
      return "sub-category-image-large";
    }

    return "sub-category-image-medium";
  };

  return (
    <div className="admin-subcategories-page">
      <div className="admin-subcategories-container">

        {/* Back Button */}
        <div className="admin-subcategories-back-wrapper">
          <button
            type="button"
            className="admin-subcategories-back-button"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={17} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Header */}
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

        {/* Stats */}
        <div className="admin-subcategories-stats">
          <div className="admin-subcategories-stat-card">
            <span>Total Subcategories</span>
            <strong>{subCategories.length}</strong>
          </div>

          <div className="admin-subcategories-stat-card">
            <span>Active</span>
            <strong>
              {
                subCategories.filter(
                  (item) => item.status === "active"
                ).length
              }
            </strong>
          </div>

          <div className="admin-subcategories-stat-card">
            <span>Inactive</span>
            <strong>
              {
                subCategories.filter(
                  (item) => item.status === "inactive"
                ).length
              }
            </strong>
          </div>
        </div>

        {/* Toolbar */}
        <div className="admin-subcategories-toolbar">

          <div className="admin-subcategories-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-subcategories-clear-search"
                onClick={() => setSearchTerm("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="admin-subcategories-filter">
            <select
              value={selectedCategoryFilter}
              onChange={(event) =>
                setSelectedCategoryFilter(event.target.value)
              }
            >
              <option value="all">All Categories</option>

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

        {/* Table */}
        <div className="admin-subcategories-table-card">
          <div className="admin-subcategories-table-header">
            <div>
              <h2>Subcategory List</h2>
              <p>
                {filteredSubCategories.length} subcategory
                {filteredSubCategories.length !== 1 ? "ies" : "y"} found
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
                  filteredSubCategories.map((item, index) => (
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
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                            />
                          ) : (
                            <ImagePlus size={20} />
                          )}
                        </div>
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
                            title="Edit"
                            onClick={() =>
                              openEditModal(item)
                            }
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="sub-category-delete-button"
                            title="Delete"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="sub-category-empty-state"
                    >
                      <div>
                        <ImagePlus size={32} />
                        <h3>No subcategories found</h3>
                        <p>
                          Try changing your search or category
                          filter.
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
          className="admin-subcategories-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div className="admin-subcategories-modal">

            <div className="admin-subcategories-modal-header">
              <div>
                <p>Catalogue Management</p>

                <h2>
                  {editingId
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-subcategories-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-subcategories-form"
              onSubmit={handleSubmit}
            >

              {/* Parent Category */}
              <div className="admin-subcategories-form-group">
                <label htmlFor="categoryId">
                  Parent Category
                  <span>*</span>
                </label>

                <div className="admin-subcategories-select-wrapper">
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">
                      Select parent category
                    </option>

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

              {/* Name */}
              <div className="admin-subcategories-form-group">
                <label htmlFor="name">
                  Subcategory Name
                  <span>*</span>
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter subcategory name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="admin-subcategories-form-group">
                <label htmlFor="description">
                  Description
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  placeholder="Enter subcategory description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>

              {/* Status */}
              <div className="admin-subcategories-form-group">
                <label htmlFor="status">
                  Status
                </label>

                <div className="admin-subcategories-status-options">

                  <label
                    className={`sub-category-status-option ${
                      formData.status === "active"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="active"
                      checked={
                        formData.status === "active"
                      }
                      onChange={handleInputChange}
                    />
                    <span>Active</span>
                  </label>

                  <label
                    className={`sub-category-status-option ${
                      formData.status === "inactive"
                        ? "selected"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="inactive"
                      checked={
                        formData.status === "inactive"
                      }
                      onChange={handleInputChange}
                    />
                    <span>Inactive</span>
                  </label>

                </div>
              </div>

              {/* Image */}
              <div className="admin-subcategories-form-group">
                <label>
                  Subcategory Image
                </label>

                <div className="sub-category-upload-area">

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="sub-category-file-input"
                  />

                  {!imagePreview ? (
                    <button
                      type="button"
                      className="sub-category-upload-button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <ImagePlus size={22} />

                      <div>
                        <strong>
                          Upload Image
                        </strong>

                        <span>
                          Choose an image from your device
                        </span>
                      </div>
                    </button>
                  ) : (
                    <div className="sub-category-preview-box">

                      <img
                        src={imagePreview}
                        alt="Subcategory preview"
                      />

                      <div className="sub-category-preview-info">
                        <strong>
                          Image Preview
                        </strong>

                        <span>
                          Image selected successfully
                        </span>

                        <button
                          type="button"
                          onClick={removeImage}
                        >
                          Remove Image
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Image Size */}
              <div className="admin-subcategories-form-group">
                <label>
                  Image Display Size
                </label>

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
                        <strong>
                          {option.title}
                        </strong>

                        <span>
                          {option.subtitle}
                        </span>
                      </div>
                    </label>
                  ))}

                </div>

                <p className="sub-category-size-note">
                  These options control the image display
                  size in the frontend UI.
                </p>
              </div>

              {/* Buttons */}
              <div className="admin-subcategories-form-actions">

                <button
                  type="button"
                  className="sub-category-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="sub-category-save-button"
                >
                  {editingId
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