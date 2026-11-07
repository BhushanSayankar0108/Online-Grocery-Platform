import { useCallback, useEffect, useState } from "react";

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



const API_BASE_URL = "https://online-grocery-platform.onrender.com";

const CATEGORIES_API = `${API_BASE_URL}/api/categories`;



const INITIAL_CATEGORIES = [];



const EMPTY_FORM = {

  name: "",

  description: "",

  imageSize: "medium",

  status: "active",

};





const getCategoryImages = (category) => {

  if (Array.isArray(category.images)) {

    return category.images.filter(Boolean);

  }



  return category.image ? [category.image] : [];

};



const getAdminToken = () => localStorage.getItem("adminToken");



const getCategoryId = (category) => category?._id || category?.id;



const getImageUrl = (image) => {

  if (!image) return "";

  if (/^(data:|blob:|https?:\/\/)/i.test(image)) return image;

  return `${API_BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;

};



const getApiErrorMessage = async (response) => {

  try {

    const data = await response.json();

    return data.message || data.error || "The request could not be completed.";

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

  const [loading, setLoading] = useState(true);

  const [loadError, setLoadError] = useState("");



  const loadCategories = useCallback(async () => {

    setLoading(true);

    setLoadError("");



    try {

      const response = await fetch(CATEGORIES_API);



      if (!response.ok) {

        throw new Error(await getApiErrorMessage(response));

      }



      const data = await response.json();

      const serverCategories = Array.isArray(data.categories)

        ? data.categories

        : Array.isArray(data)

          ? data

          : [];



      setCategories(

        serverCategories.map((category) => {

          const images =

            Array.isArray(category.images) && category.images.length > 0

              ? category.images.filter(Boolean)

              : category.image

                ? [category.image]

                : [];



          return {

            ...category,

            id: getCategoryId(category),

            images,

            image: category.image || images[0] || "",

            createdAt: category.createdAt || category.created_at || "",

          };

        })

      );

    } catch (error) {

      console.error("Load categories error:", error);

      setLoadError(error.message || "Unable to load categories.");

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {
    // Defer the initial load so state updates happen after the effect body,
    // avoiding React's set-state-in-effect lint warning.
    let isActive = true;

    Promise.resolve().then(() => {
      if (isActive) {
        void loadCategories();
      }
    });

    return () => {
      isActive = false;
    };
  }, [loadCategories]);

  const filteredCategories = categories.filter((category) => {

    const search = searchTerm.toLowerCase().trim();



    return (

      (category.name || "").toLowerCase().includes(search) ||

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



    setEditingCategoryId(getCategoryId(category));

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

    const validFiles = files.filter((file) => {
      if (file.type.startsWith("image/")) return true;
      setFormError(`${file.name}: not a valid image file.`);
      return false;
    });

    if (validFiles.length === 0) return;

    try {
      const previews = await Promise.all(
        validFiles.map(async (file) => ({
          name: file.name,
          file,
          preview: await readFileAsDataUrl(file),
        }))
      );
      setSelectedImages((previous) => [...previous, ...previews]);
      setFormError("");
    } catch (error) {
      console.error("Image preview error:", error);
      setFormError("Unable to preview one or more images. Please try again.");
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



  const handleSubmit = async (event) => {

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



    const duplicate = categories.find(

      (category) =>

        String(getCategoryId(category)) !== String(editingCategoryId) &&

        (category.name || "").trim().toLowerCase() === trimmedName.toLowerCase()

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



    const token = getAdminToken();



    if (!token) {

      setFormError("Your admin session was not found. Please log in again.");

      return;

    }



    setFormLoading(true);



    try {

      const payload = new FormData();

      payload.append("name", trimmedName);

      payload.append("description", trimmedDescription);

      payload.append("status", formData.status);

      payload.append("imageSize", formData.imageSize);



      if (isEditing) {

        payload.append("existingImages", JSON.stringify(existingImages));

      }



      selectedImages.forEach((item) => {

        if (item.file instanceof File) {

          payload.append("images", item.file);

        }

      });



      const response = await fetch(

        isEditing

          ? `${CATEGORIES_API}/${encodeURIComponent(editingCategoryId)}`

          : CATEGORIES_API,

        {

          method: isEditing ? "PUT" : "POST",

          headers: {

            Authorization: `Bearer ${token}`,

          },

          body: payload,

        }

      );



      if (!response.ok) {

        throw new Error(await getApiErrorMessage(response));

      }



      await loadCategories();

      clearForm();

      window.alert(

        isEditing

          ? "Category updated successfully."

          : "Category created successfully."

      );

    } catch (error) {

      console.error("Save category error:", error);

      setFormError(error.message || "Unable to save the category. Please try again.");

    } finally {

      setFormLoading(false);

    }

  };



  const handleDelete = async (categoryId) => {

    const category = categories.find(

      (item) => String(getCategoryId(item)) === String(categoryId)

    );



    if (!category) return;



    const confirmed = window.confirm(

      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`

    );



    if (!confirmed) return;



    const token = getAdminToken();



    if (!token) {

      window.alert("Your admin session was not found. Please log in again.");

      return;

    }



    try {

      const response = await fetch(

        `${CATEGORIES_API}/${encodeURIComponent(categoryId)}`,

        {

          method: "DELETE",

          headers: {

            Authorization: `Bearer ${token}`,

          },

        }

      );



      if (!response.ok) {

        throw new Error(await getApiErrorMessage(response));

      }



      if (String(editingCategoryId) === String(categoryId)) {

        clearForm();

      }



      await loadCategories();

      window.alert("Category deleted successfully.");

    } catch (error) {

      console.error("Delete category error:", error);

      window.alert(error.message || "Unable to delete the category. Please try again.");

    }

  };



  const handleRefresh = async () => {

    if (showForm && isFormDirty()) {

      const discard = window.confirm(

        "You have unsaved changes. Discard them and refresh the category list?"

      );



      if (!discard) return;

      clearForm();

    }



    const confirmed = window.confirm("Refresh the category list?");



    if (!confirmed) return;



    await loadCategories();

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

                      Click to browse and select one or multiple image files

                    </span>

                  </label>

                </div>



                <p>

                  {existingImages.length + selectedImages.length} image(s) selected

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

                            src={getImageUrl(image)}

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



      {loadError && (

        <div className="admin-category-form-error" role="alert">

          <span>{loadError}</span>{" "}

          <button type="button" onClick={loadCategories} disabled={loading}>

            Retry

          </button>

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

                    <tr key={getCategoryId(category)}>

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

                                src={getImageUrl(images[0])}

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

                            onClick={() => handleDelete(getCategoryId(category))}

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
