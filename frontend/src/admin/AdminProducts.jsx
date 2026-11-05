import {

  useCallback,

  useEffect,

  useMemo,

  useState,

} from "react";

import {

  Search,

  Plus,

  RefreshCw,

  Pencil,

  Trash2,

  X,

  Package,

  ImagePlus,

} from "lucide-react";



import "./AdminProducts.css";



/* =========================================================

   API CONFIGURATION

========================================================= */



const API_BASE_URL = "http://localhost:5000";

const PRODUCTS_API = `${API_BASE_URL}/api/products`;

const CATEGORIES_API = `${API_BASE_URL}/api/categories`;

const SUBCATEGORIES_API = `${API_BASE_URL}/api/subcategories`;



const EMPTY_FORM = {

  name: "",

  description: "",

  sku: "",

  barcode: "",

  category: "",

  subCategory: "",

  brand: "",

  imageUrls: "",
  imageSize: "medium",

  unit: "piece",

  quantityValue: "1",

  quantityUnit: "kg",

  mrp: "",

  sellingPrice: "",

  gstPercentage: "0",

  stockQuantity: "0",

  lowStockThreshold: "10",

  isFeatured: false,

  status: "active",

};



const getToken = () => localStorage.getItem("adminToken");



const getId = (item) => item?._id || item?.id;



const normalizeImagePath = (image) => {
  if (!image) return "";
  if (typeof image === "string") return image.trim();
  if (typeof image === "object") {
    return String(
      image.url ||
      image.imageUrl ||
      image.path ||
      image.src ||
      image.location ||
      (image.filename ? `/uploads/products/${image.filename}` : "") ||
      ""
    ).trim();
  }
  return "";
};

const getImageUrl = (image) => {
  const normalized = normalizeImagePath(image);
  if (!normalized) return "";
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;
  const imagePath = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${API_BASE_URL}${imagePath}`;
};

const getProductImages = (product) => {
  const candidates = [
    ...(Array.isArray(product?.images) ? product.images : []),
    product?.image,
    product?.imageUrl,
    product?.imageURL,
    product?.thumbnail,
    product?.thumbnailUrl,
  ];
  return candidates.map(normalizeImagePath).filter(Boolean);
};

const getErrorMessage = async (response) => {

  try {

    const data = await response.json();

    return data.message || "The request could not be completed.";

  } catch {

    return "The server returned an unexpected response.";

  }

};



const getRecords = (data, key) => {
  const aliases = {
    products: ["products", "items", "results", "records"],
    categories: ["categories", "category", "items", "results", "records"],
    subcategories: [
      "subcategories", "subCategories", "sub_categories", "subCategory",
      "subCategoryList", "items", "results", "records",
    ],
  };

  // Supports APIs returning an array directly, {data: [...]},
  // {subcategories: [...]}, or {success:true, data:{subcategories:[...]}}.
  let current = data;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (Array.isArray(current)) return current;
    for (const candidate of [key, ...(aliases[key] || [])]) {
      if (Array.isArray(current?.[candidate])) return current[candidate];
    }
    if (Array.isArray(current?.data)) return current.data;
    current = current?.data ?? current?.result ?? current?.payload ?? null;
  }
  return [];
};

const getParentCategoryId = (subcategory) => {
  const parent =
    subcategory?.category ??
    subcategory?.categoryId ??
    subcategory?.parentCategory ??
    subcategory?.parentCategoryId;
  if (parent && typeof parent === "object") {
    return getId(parent) ?? parent.categoryId ?? parent._id ?? parent.id ?? "";
  }
  return parent ?? "";
};

const normalizeId = (value) => {
  if (value && typeof value === "object") {
    return String(getId(value) ?? value.categoryId ?? value.subCategoryId ?? "");
  }
  return String(value ?? "");
};


const formatPrice = (price) =>

  new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(Number(price) || 0);



/* =========================================================

   COMPONENT

========================================================= */



const AdminProducts = () => {

  const [products, setProducts] = useState([]);

  const [categories, setCategories] = useState([]);

  const [subcategories, setSubcategories] = useState([]);



  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [pageError, setPageError] = useState("");

  const [formError, setFormError] = useState("");



  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");



  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ ...EMPTY_FORM });



  /* =========================================================

     LOAD PRODUCTS, CATEGORIES, SUBCATEGORIES

  ========================================================= */



  const loadData = useCallback(async () => {

    setLoading(true);

    setPageError("");



    try {

      const token = getToken();

      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      const [productResponse, categoryResponse, subcategoryResponse] =
        await Promise.all([
          fetch(`${PRODUCTS_API}/admin/all?page=1&limit=100`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(CATEGORIES_API),
          fetch(SUBCATEGORIES_API),
        ]);



      if (!productResponse.ok) {

        throw new Error(await getErrorMessage(productResponse));

      }



      if (!categoryResponse.ok) {

        throw new Error(await getErrorMessage(categoryResponse));

      }



      if (!subcategoryResponse.ok) {

        throw new Error(await getErrorMessage(subcategoryResponse));

      }



      const productData = await productResponse.json();

      const categoryData = await categoryResponse.json();

      const subcategoryData = await subcategoryResponse.json();



      setProducts(getRecords(productData, "products"));

      setCategories(

        getRecords(categoryData, "categories").filter(

          (category) => category.status !== "inactive"

       )

     );

      setSubcategories(

        getRecords(subcategoryData, "subcategories").filter(

          (subcategory) => subcategory.status !== "inactive"

       )

     );

    } catch (error) {

      console.error("Unable to load product management data:", error);

      setPageError(

        error.message || "Unable to load product management data."

     );

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

  const timerId = window.setTimeout(() => {

    void loadData();

  }, 0);



  return () => {

    window.clearTimeout(timerId);

  };

}, [loadData]);



  /* =========================================================

     FILTERS

  ========================================================= */



  const filteredProducts = useMemo(() => {

    const query = searchTerm.trim().toLowerCase();



    return products.filter((product) => {

      const categoryId =

        typeof product.category === "object"

          ? getId(product.category)

          : product.category;



      const matchesSearch =

        !query ||

        [

          product.name,

          product.sku,

          product.barcode,

          product.brand,

          product.description,

          product.category?.name,

          product.subCategory?.name,

        ].some((value) =>

          String(value || "").toLowerCase().includes(query)

       );



      const matchesCategory =

        categoryFilter === "all" ||

        String(categoryId) === String(categoryFilter);



      const matchesStatus =

        statusFilter === "all" || product.status === statusFilter;



      return matchesSearch && matchesCategory && matchesStatus;

    });

  }, [products, searchTerm, categoryFilter, statusFilter]);



  const activeCount = products.filter(

    (product) => product.status === "active"

 ).length;



  const inactiveCount = products.filter(

    (product) => product.status === "inactive"

 ).length;



  const lowStockCount = products.filter(

    (product) =>

      Number(product.stockQuantity) <=

      Number(product.lowStockThreshold ?? 10)

 ).length;



  /* =========================================================

     FORM HANDLERS

  ========================================================= */



  const openAddForm = () => {

    setEditingId(null);

    setFormData({ ...EMPTY_FORM });

    setFormError("");

    setShowForm(true);

  };



  const openEditForm = (product) => {

    const images = Array.isArray(product.images)

      ? product.images

      : [];



    setEditingId(String(getId(product)));



    setFormData({

      name: product.name || "",

      description: product.description || "",

      sku: product.sku || "",

      barcode: product.barcode || "",

      category:

        typeof product.category === "object"

          ? String(getId(product.category))

          : String(product.category || ""),

      subCategory:

        typeof product.subCategory === "object"

          ? String(getId(product.subCategory))

          : String(product.subCategory || ""),

      brand: product.brand || "",

      imageUrls: images.join("\n"),

      imageSize: product.imageSize || "medium",

      unit: product.unit || "piece",

      quantityValue: String(product.quantityValue ?? 1),

      quantityUnit: product.quantityUnit || "kg",

      mrp: String(product.mrp ?? ""),

      sellingPrice: String(product.sellingPrice ?? ""),

      gstPercentage: String(product.gstPercentage ?? 0),

      stockQuantity: String(product.stockQuantity ?? 0),

      lowStockThreshold: String(product.lowStockThreshold ?? 10),

      isFeatured: Boolean(product.isFeatured),

      status: product.status || "active",

    });



    setFormError("");

    setShowForm(true);

  };



  const closeForm = () => {

    if (saving) return;



    setShowForm(false);

    setEditingId(null);

    setFormData({ ...EMPTY_FORM });

    setFormError("");

  };



  const handleChange = (event) => {

    const { name, value, type, checked } = event.target;



    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "category" ? { subCategory: "" } : {}),
    }));



    setFormError("");

  };


  // Read images directly from the device, resize them in the browser, and
  // store the resulting data URLs in the existing Product.images string array.
  // This does not require a separate productImageUploadController endpoint.
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    const outputWidths = { small: 320, medium: 800, large: 1600 };
    const maxWidth = outputWidths[formData.imageSize || "medium"] || 800;
    const supported = files.filter((file) => file.type.startsWith("image/"));
    if (!supported.length) {
      setFormError("Choose one or more image files.");
      return;
    }

    setUploadingImages(true);
    setFormError("");

    const fileToDataUrl = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });

    const resizeImage = async (file) => {
      const source = await fileToDataUrl(file);
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error(`Could not open ${file.name}. Try another image format.`));
        image.src = source;
      });

      const ratio = Math.min(1, maxWidth / image.naturalWidth);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Your browser could not process this image.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      // WebP significantly reduces the amount of data sent with the product.
      let result = canvas.toDataURL("image/webp", 0.78);
      if (!result.startsWith("data:image/webp")) result = canvas.toDataURL("image/jpeg", 0.78);
      return result;
    };

    try {
      const converted = await Promise.all(supported.map(resizeImage));
      setFormData((previous) => {
        const existing = previous.imageUrls.split(/\r?\n/).map((image) => image.trim()).filter(Boolean);
        return { ...previous, imageUrls: [...existing, ...converted].join("\n") };
      });
    } catch (error) {
      console.error("Product image processing failed:", error);
      setFormError(error.message || "Unable to process the selected images.");
    } finally {
      setUploadingImages(false);
    }
  };


  /* =========================================================

     SAVE PRODUCT

  ========================================================= */



  const handleSubmit = async (event) => {

    event.preventDefault();

    setFormError("");



    const requiredFields = [

      ["name", "Product name"],

      ["sku", "SKU"],

      ["category", "Category"],

      ["subCategory", "Subcategory"],

      ["unit", "Unit"],

      ["quantityValue", "Quantity value"],

      ["quantityUnit", "Quantity unit"],

      ["mrp", "MRP"],

      ["sellingPrice", "Selling price"],

    ];



    for (const [field, label] of requiredFields) {

      if (

        formData[field] === "" ||

        formData[field] === null ||

        formData[field] === undefined

     ) {

        setFormError(`${label} is required.`);

        return;

      }

    }



    const numericFields = [

      ["quantityValue", "Quantity value", 0.001],

      ["mrp", "MRP", 0],

      ["sellingPrice", "Selling price", 0],

      ["gstPercentage", "GST percentage", 0],

      ["stockQuantity", "Stock quantity", 0],

      ["lowStockThreshold", "Low-stock threshold", 0],

    ];



    for (const [field, label, minimum] of numericFields) {

      const value = Number(formData[field]);



      if (!Number.isFinite(value) || value < minimum) {

        setFormError(

          `${label} must be a valid number of at least ${minimum}.`

       );

        return;

      }

    }



    if (

      Number(formData.gstPercentage) > 100

   ) {

      setFormError("GST percentage cannot exceed 100.");

      return;

    }



    if (Number(formData.sellingPrice) > Number(formData.mrp)) {

      setFormError("Selling price cannot exceed MRP.");

      return;

    }



    const validSubcategory = subcategories.find(

      (subcategory) =>

        normalizeId(getId(subcategory)) === normalizeId(formData.subCategory)

   );



    const parentCategoryId = getParentCategoryId(validSubcategory);



    if (

      !validSubcategory ||

      normalizeId(parentCategoryId) !== normalizeId(formData.category)

   ) {

      setFormError(

        "Choose a subcategory belonging to the selected category."

     );

      return;

    }



    const token = getToken();



    if (!token) {

      setFormError("Your admin session has expired. Please log in again.");

      return;

    }



    const images = formData.imageUrls

      .split(/\r?\n/)

      .map((image) => image.trim())

      .filter(Boolean);



    const payload = {

      name: formData.name.trim(),

      description: formData.description.trim(),

      sku: formData.sku.trim().toUpperCase(),

      barcode: formData.barcode.trim(),

      category: formData.category,

      subCategory: formData.subCategory,

      brand: formData.brand.trim(),

      images,
      // imageSize is a client-side upload/resizing preference.
      // It is not a field in the backend Product schema.

      unit: formData.unit.trim(),

      quantityValue: Number(formData.quantityValue),

      quantityUnit: formData.quantityUnit.trim(),

      mrp: Number(formData.mrp),

      sellingPrice: Number(formData.sellingPrice),

      gstPercentage: Number(formData.gstPercentage || 0),

      stockQuantity: Number(formData.stockQuantity || 0),

      lowStockThreshold: Number(formData.lowStockThreshold || 0),

      isFeatured: Boolean(formData.isFeatured),

      status: formData.status,

    };



    setSaving(true);



    try {

      const url = editingId

        ? `${PRODUCTS_API}/${encodeURIComponent(editingId)}`

        : PRODUCTS_API;



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



      await loadData();

      closeForm();



      window.alert(

        editingId

          ? "Product updated successfully."

          : "Product created successfully."

     );

    } catch (error) {

      console.error("Product save failed:", error);

      setFormError(error.message || "Unable to save product.");

    } finally {

      setSaving(false);

    }

  };



  /* =========================================================

     DELETE PRODUCT

  ========================================================= */



  const handleDelete = async (product) => {

    const id = getId(product);



    if (!window.confirm(`Delete "${product.name}" permanently?`)) {

      return;

    }



    const token = getToken();



    if (!token) {

      window.alert("Your admin session has expired. Please log in again.");

      return;

    }



    try {

      const response = await fetch(

        `${PRODUCTS_API}/${encodeURIComponent(id)}`,

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



      await loadData();

      window.alert("Product deleted successfully.");

    } catch (error) {

      console.error("Product deletion failed:", error);

      window.alert(error.message || "Unable to delete product.");

    }

  };



  /* =========================================================

     TOGGLE PRODUCT STATUS

  ========================================================= */



  const toggleStatus = async (product) => {

    const token = getToken();



    if (!token) {

      window.alert("Your admin session has expired. Please log in again.");

      return;

    }



    const id = getId(product);

    const nextStatus =

      product.status === "active" ? "inactive" : "active";



    if (

      nextStatus === "active" &&

      !categories.some(

        (category) =>

          String(getId(category)) ===

          String(

            typeof product.category === "object"

              ? getId(product.category)

              : product.category

         )

     )

   ) {

      window.alert(

        "This product's category may be inactive. Select an active category before activating it."

     );

      return;

    }



    try {

      const response = await fetch(

        `${PRODUCTS_API}/${encodeURIComponent(id)}`,

        {

          method: "PUT",

          headers: {

            "Content-Type": "application/json",

            Authorization: `Bearer ${token}`,

          },

          body: JSON.stringify({ status: nextStatus }),

        }

     );



      if (!response.ok) {

        throw new Error(await getErrorMessage(response));

      }



      await loadData();

    } catch (error) {

      console.error("Product status update failed:", error);

      window.alert(error.message || "Unable to update product status.");

    }

  };



  /* =========================================================

     UI

  ========================================================= */



  return (

    <div className="admin-products-page">

      <div className="admin-products-container">

        <div className="admin-products-header">

          <div>

            <p className="admin-products-eyebrow">

              Catalogue Management

            </p>

            <h1>Products</h1>

            <p>Manage your grocery products and pricing.</p>

          </div>



          <button

            type="button"

            className="admin-products-primary-button"

            onClick={openAddForm}

          >

            <Plus size={18} />

            Add Product

          </button>

        </div>



        <div className="admin-products-stats">

          <div className="admin-products-stat-card">

            <Package size={22} />

            <div>

              <strong>{products.length}</strong>

              <span>Total Products</span>

            </div>

          </div>



          <div className="admin-products-stat-card">

            <div>

              <strong>{activeCount}</strong>

              <span>Active Products</span>

            </div>

          </div>



          <div className="admin-products-stat-card">

            <div>

              <strong>{inactiveCount}</strong>

              <span>Inactive Products</span>

            </div>

          </div>



          <div className="admin-products-stat-card">

            <div>

              <strong>{lowStockCount}</strong>

              <span>Low Stock</span>

            </div>

          </div>

        </div>



        <div className="admin-products-toolbar">

          <div className="admin-products-search">

            <Search size={18} />

            <input

              type="search"

              placeholder="Search name, SKU, barcode or brand..."

              value={searchTerm}

              onChange={(event) => setSearchTerm(event.target.value)}

            />

          </div>



          <select

            aria-label="Filter by category"

            value={categoryFilter}

            onChange={(event) => setCategoryFilter(event.target.value)}

          >

            <option value="all">All Categories</option>

            {categories.map((category) => (

              <option key={getId(category)} value={getId(category)}>

                {category.name}

              </option>

           ))}

          </select>



          <select

            aria-label="Filter by status"

            value={statusFilter}

            onChange={(event) => setStatusFilter(event.target.value)}

          >

            <option value="all">All Statuses</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

          </select>



          <button

            type="button"

            className="admin-products-refresh-button"

            onClick={loadData}

            disabled={loading}

          >

            <RefreshCw size={16} />

            {loading ? "Loading..." : "Refresh"}

          </button>

        </div>



        {pageError && (

          <div className="admin-products-error" role="alert">

            {pageError}

            <button type="button" onClick={loadData}>

              Retry

            </button>

          </div>

       )}



        <div className="admin-products-table-card">

          <div className="admin-products-table-heading">

            <div>

              <h2>Product List</h2>

              <p>{filteredProducts.length} products displayed</p>

            </div>

          </div>



          <div className="admin-products-table-wrapper">

            <table className="admin-products-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Product</th>

                  <th>SKU</th>

                  <th>Category</th>

                  <th>MRP</th>

                  <th>Selling Price</th>

                  <th>Stock</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>

              </thead>



              <tbody>

                {loading ? (

                  <tr>

                    <td colSpan={9}>Loading products...</td>

                  </tr>

               ) : filteredProducts.length === 0 ? (

                  <tr>

                    <td colSpan={9}>

                      <div className="admin-products-empty">

                        <Package size={32} />

                        <h3>No products found</h3>

                        <p>Try changing your filters or add a product.</p>

                      </div>

                    </td>

                  </tr>

               ) : (

                  filteredProducts.map((product, index) => {

                    const firstImage = getProductImages(product)[0] || "";



                    return (

                      <tr key={getId(product)}>

                        <td>{index + 1}</td>



                        <td>

                          <div className="admin-products-product-cell">

                            <div className="admin-products-image">

                              {firstImage ? (

                                <img

                                  src={getImageUrl(firstImage)}

                                  alt={product.name}
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                    const wrapper = event.currentTarget.parentElement;
                                    if (wrapper) {
                                      wrapper.dataset.imageFailed = "true";
                                    }
                                  }}
                                />

                             ) : (

                                <ImagePlus size={20} />

                             )}

                            </div>



                            <div>

                              <strong>{product.name}</strong>

                              <small>{product.brand || "No brand"}</small>

                            </div>

                          </div>

                        </td>



                        <td>{product.sku}</td>



                        <td>

                          {product.category?.name || "—"}

                          <small className="admin-products-subcategory">

                            {product.subCategory?.name || ""}

                          </small>

                        </td>



                        <td>{formatPrice(product.mrp)}</td>

                        <td>{formatPrice(product.sellingPrice)}</td>



                        <td>

                          <span

                            className={

                              Number(product.stockQuantity) <=

                              Number(product.lowStockThreshold ?? 10)

                                ? "admin-products-stock-low"

                                : "admin-products-stock-normal"

                            }

                          >

                            {product.stockQuantity}

                          </span>

                        </td>



                        <td>

                          <button

                            type="button"

                            className={`admin-products-status ${

                              product.status === "active"

                                ? "active"

                                : "inactive"

                            }`}

                            onClick={() => toggleStatus(product)}

                            title="Click to change status"

                          >

                            {product.status === "active"

                              ? "Active"

                              : "Inactive"}

                          </button>

                        </td>



                        <td>

                          <div className="admin-products-actions">

                            <button

                              type="button"

                              title="Edit product"

                              aria-label={`Edit ${product.name}`}

                              onClick={() => openEditForm(product)}

                            >

                              <Pencil size={16} />

                            </button>



                            <button

                              type="button"

                              title="Delete product"

                              aria-label={`Delete ${product.name}`}

                              onClick={() => handleDelete(product)}

                            >

                              <Trash2 size={16} />

                            </button>

                          </div>

                        </td>

                      </tr>

                   );

                  })

               )}

              </tbody>

            </table>

          </div>

        </div>

      </div>



      {showForm && (

        <div className="admin-products-modal-overlay">

          <div

            className="admin-products-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="admin-products-form-title"

          >

            <div className="admin-products-modal-header">

              <div>

                <p>Catalogue Management</p>

                <h2 id="admin-products-form-title">

                  {editingId ? "Edit Product" : "Add Product"}

                </h2>

              </div>



              <button

                type="button"

                aria-label="Close form"

                onClick={closeForm}

                disabled={saving}

              >

                <X size={20} />

              </button>

            </div>



            <form

              className="admin-products-form"

              onSubmit={handleSubmit}

            >

              {formError && (

                <div className="admin-products-error" role="alert">

                  {formError}

                </div>

             )}



              <div className="admin-products-form-grid">

                <label>

                  Product Name *

                  <input

                    name="name"

                    value={formData.name}

                    onChange={handleChange}

                    maxLength={200}

                    required

                  />

                </label>



                <label>

                  SKU *

                  <input

                    name="sku"

                    value={formData.sku}

                    onChange={handleChange}

                    required

                  />

                </label>



                <label>

                  Barcode

                  <input

                    name="barcode"

                    value={formData.barcode}

                    onChange={handleChange}

                  />

                </label>



                <label>

                  Brand

                  <input

                    name="brand"

                    value={formData.brand}

                    onChange={handleChange}

                  />

                </label>



                <label>

                  Category *

                  <select

                    name="category"

                    value={formData.category}

                    onChange={(event) => {

                      const categoryId = event.target.value;



                      setFormData((previous) => ({

                        ...previous,

                        category: categoryId,

                        subCategory: "",

                      }));



                      setFormError("");

                    }}

                    required

                  >

                    <option value="">Select category</option>

                    {categories.map((category) => (

                      <option key={getId(category)} value={getId(category)}>

                        {category.name}

                      </option>

                   ))}

                  </select>

                </label>



                <label>

                  Subcategory *

                  <select

                    name="subCategory"

                    value={formData.subCategory}

                    onChange={handleChange}

                    required

                    disabled={!formData.category}

                  >

                    <option value="">Select subcategory</option>

                    {subcategories

                      .filter((subcategory) => {

                        const parent = getParentCategoryId(subcategory);
                        return normalizeId(parent) === normalizeId(formData.category);

                      })

                      .map((subcategory) => (

                        <option

                          key={getId(subcategory)}

                          value={getId(subcategory)}

                        >

                          {subcategory.name}

                        </option>

                     ))}

                  </select>

                </label>



                <label>

                  Unit *

                  <input

                    name="unit"

                    value={formData.unit}

                    onChange={handleChange}

                    placeholder="piece, pack, bottle"

                    required

                  />

                </label>



                <label>

                  Quantity Value *

                  <input

                    name="quantityValue"

                    type="number"

                    min="0.001"

                    step="any"

                    value={formData.quantityValue}

                    onChange={handleChange}

                    required

                  />

                </label>



                <label>

                  Quantity Unit *

                  <input

                    name="quantityUnit"

                    value={formData.quantityUnit}

                    onChange={handleChange}

                    placeholder="kg, g, litre, ml"

                    required

                  />

                </label>



                <label>

                  MRP (₹) *

                  <input

                    name="mrp"

                    type="number"

                    min="0"

                    step="0.01"

                    value={formData.mrp}

                    onChange={handleChange}

                    required

                  />

                </label>



                <label>

                  Selling Price (₹) *

                  <input

                    name="sellingPrice"

                    type="number"

                    min="0"

                    step="0.01"

                    value={formData.sellingPrice}

                    onChange={handleChange}

                    required

                  />

                </label>



                <label>

                  GST Percentage

                  <input

                    name="gstPercentage"

                    type="number"

                    min="0"

                    max="100"

                    step="0.01"

                    value={formData.gstPercentage}

                    onChange={handleChange}

                  />

                </label>



                <label>

                  Stock Quantity

                  <input

                    name="stockQuantity"

                    type="number"

                    min="0"

                    step="1"

                    value={formData.stockQuantity}

                    onChange={handleChange}

                  />

                </label>



                <label>

                  Low-Stock Threshold

                  <input

                    name="lowStockThreshold"

                    type="number"

                    min="0"

                    step="1"

                    value={formData.lowStockThreshold}

                    onChange={handleChange}

                  />

                </label>



                <label>

                  Status

                  <select

                    name="status"

                    value={formData.status}

                    onChange={handleChange}

                  >

                    <option value="active">Active</option>

                    <option value="inactive">Inactive</option>

                  </select>

                </label>

              </div>



              <label className="admin-products-description-field">

                Description

                <textarea

                  name="description"

                  value={formData.description}

                  onChange={handleChange}

                  rows={4}

                />

              </label>



              <div className="admin-products-description-field">
                <label htmlFor="product-image-size">Image output size</label>
                <select
                  id="product-image-size"
                  value={formData.imageSize || "medium"}
                  onChange={(event) => {
                    setFormData((previous) => ({ ...previous, imageSize: event.target.value }));
                    setFormError("");
                  }}
                  disabled={uploadingImages}
                >
                  <option value="small">Small — 320 px wide</option>
                  <option value="medium">Medium — 800 px wide</option>
                  <option value="large">Large — 1600 px wide</option>
                </select>
                <small>Choose the saved image size. Original aspect ratio is preserved; images are not enlarged.</small>

                <label htmlFor="product-image-files" style={{ display: "block", marginTop: "12px" }}>
                  Upload product images from this device
                </label>
                <input
                  id="product-image-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages || saving}
                />
                <small>
                  Select one or more images from your computer, phone, or tablet. JPG, PNG, WEBP and GIF are supported; each file can be up to 25 MB.
                </small>
                {uploadingImages && <p role="status">Uploading and processing images…</p>}
              </div>

              <input type="hidden" name="imageUrls" value={formData.imageUrls} readOnly />
              <small>Images are selected from this device and resized in your browser. Choose the image size before adding images.</small>

              {formData.imageUrls.trim() && (

                <div className="admin-products-image-preview-grid">

                  {formData.imageUrls

                    .split(/\r?\n/)

                    .map((url) => url.trim())

                    .filter(Boolean)

                    .map((url, index) => (
                      <div key={`${url.slice(0, 60)}-${index}`} className="admin-product-image-preview-item">
                        <img
                          src={getImageUrl(url)}
                          alt={`Product preview ${index + 1}`}
                          onError={(event) => { event.currentTarget.style.opacity = "0.35"; }}
                        />
                        <button
                          type="button"
                          aria-label={`Remove image ${index + 1}`}
                          onClick={() => setFormData((previous) => ({
                            ...previous,
                            imageUrls: previous.imageUrls.split(/\r?\n/).filter((_, imageIndex) => imageIndex !== index).join("\n"),
                          }))}
                        >
                          <X size={14} /> Remove
                        </button>
                      </div>
                   ))}

                </div>

             )}



              <label className="admin-products-featured-option">

                <input

                  type="checkbox"

                  name="isFeatured"

                  checked={formData.isFeatured}

                  onChange={handleChange}

                />

                <span>Mark as featured product</span>

              </label>



              <div className="admin-products-form-actions">

                <button

                  type="button"

                  onClick={closeForm}

                  disabled={saving}

                >

                  Cancel

                </button>



                <button type="submit" disabled={saving || uploadingImages}>

                  {uploadingImages
                    ? "Uploading images..."
                    : saving
                      ? "Saving..."
                      : editingId

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