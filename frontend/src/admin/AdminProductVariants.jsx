
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Edit,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import "./AdminProductVariants.css";

const API_BASE_URL = "http://localhost:5000";
const PRODUCTS_API = `${API_BASE_URL}/api/products`;

const EMPTY_FORM = {
  productId: "",
  variantName: "",
  sku: "",
  quantity: "",
  unit: "g",
  mrp: "",
  sellingPrice: "",
  stockQuantity: "0",
  status: "active",
};

const getToken = () => localStorage.getItem("adminToken");
const getId = (item) => String(item?._id ?? item?.id ?? "");

const getRecords = (data) => {
  let current = data;
  for (let depth = 0; depth < 4 && current; depth += 1) {
    if (Array.isArray(current)) return current;
    for (const key of ["products", "items", "results", "records"]) {
      if (Array.isArray(current[key])) return current[key];
    }
    current = current.data ?? current.result ?? current.payload ?? null;
  }
  return [];
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    return data.message || data.error || "The request could not be completed.";
  } catch {
    return "The server returned an unexpected response.";
  }
};

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const toVariantForm = (product, variant = {}) => ({
  productId: getId(product),
  variantName: variant.label ?? "",
  sku: variant.sku ?? "",
  quantity: String(variant.quantityValue ?? ""),
  unit: variant.quantityUnit ?? "g",
  mrp: String(variant.mrp ?? ""),
  sellingPrice: String(variant.sellingPrice ?? ""),
  stockQuantity: String(variant.stockQuantity ?? 0),
  status: variant.status ?? "active",
});

const AdminProductVariants = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    let cancelled = false;

    const fetchProducts = async () => {
      try {
        const token = getToken();
        if (!token) {
          throw new Error("Your admin session has expired. Please log in again.");
        }

        const response = await fetch(
          `${PRODUCTS_API}/admin/all?page=1&limit=100`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error(await getErrorMessage(response));
        const data = await response.json();

        if (!cancelled) {
          setProducts(getRecords(data));
          setPageError("");
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Unable to load product variants:", error);
          setPageError(error.message || "Unable to load product variants.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error("Your admin session has expired. Please log in again.");
      }

      const response = await fetch(
        `${PRODUCTS_API}/admin/all?page=1&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error(await getErrorMessage(response));
      const data = await response.json();
      setProducts(getRecords(data));
      setPageError("");
    } catch (error) {
      console.error("Unable to load product variants:", error);
      setPageError(error.message || "Unable to load product variants.");
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProducts = async () => {
    setLoading(true);
    setPageError("");
    await loadProducts();
  };

  const variants = useMemo(
    () =>
      products.flatMap((product) =>
        (Array.isArray(product.variants) ? product.variants : []).map((variant) => ({
          ...variant,
          id: String(variant._id ?? variant.id ?? ""),
          productId: getId(product),
          productName: product.name || "Unnamed product",
          createdAt: variant.createdAt || product.createdAt,
        }))
      ),
    [products]
  );

  const filteredVariants = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return variants.filter((variant) => {
      const matchesSearch =
        !search ||
        String(variant.label || "").toLowerCase().includes(search) ||
        String(variant.productName || "").toLowerCase().includes(search) ||
        String(variant.sku || "").toLowerCase().includes(search);
      const matchesProduct =
        selectedProductFilter === "all" ||
        variant.productId === selectedProductFilter;
      const matchesStatus =
        selectedStatusFilter === "all" ||
        variant.status === selectedStatusFilter;
      return matchesSearch && matchesProduct && matchesStatus;
    });
  }, [variants, searchTerm, selectedProductFilter, selectedStatusFilter]);

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
    setEditing(null);
    setFormError("");
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (variant) => {
    const product = products.find((item) => getId(item) === variant.productId);
    if (!product) {
      setFormError("The parent product could not be found. Refresh and try again.");
      return;
    }

    setEditing({ productId: variant.productId, variantId: variant.id });
    setFormData(toVariantForm(product, variant));
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setFormError("");
  };

  const buildVariant = () => {
    const label = formData.variantName.trim();
    const sku = formData.sku.trim().toUpperCase();
    const quantityValue = Number(formData.quantity);
    const mrp = Number(formData.mrp);
    const sellingPrice = Number(formData.sellingPrice);
    const stockQuantity = Number(formData.stockQuantity || 0);

    if (!formData.productId) throw new Error("Please select a product.");
    if (!label) throw new Error("Please enter a variant name, such as 500 g or 1 kg.");
    if (!sku) throw new Error("Please enter a SKU for this variant.");
    if (!formData.unit) throw new Error("Please select a quantity unit.");
    if (!formData.quantity || !Number.isFinite(quantityValue) || quantityValue <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }
    if (formData.mrp === "" || !Number.isFinite(mrp) || mrp < 0) {
      throw new Error("Please enter a valid non-negative MRP.");
    }
    if (
      formData.sellingPrice === "" ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0
    ) {
      throw new Error("Please enter a valid non-negative selling price.");
    }
    if (sellingPrice > mrp) throw new Error("Selling price cannot exceed MRP.");
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0) {
      throw new Error("Stock quantity cannot be negative.");
    }

    return {
      ...(editing?.variantId ? { _id: editing.variantId } : {}),
      label,
      quantityValue,
      quantityUnit: formData.unit,
      mrp,
      sellingPrice,
      stockQuantity,
      sku,
      status: formData.status,
    };
  };

  const saveVariant = async (event) => {
    event.preventDefault();
    setFormError("");

    let variantToSave;
    try {
      variantToSave = buildVariant();
    } catch (error) {
      setFormError(error.message);
      return;
    }

    const product = products.find((item) => getId(item) === formData.productId);
    if (!product) {
      setFormError("Please select a valid product.");
      return;
    }

    const currentVariants = Array.isArray(product.variants) ? product.variants : [];
    const editingId = String(editing?.variantId ?? "");
    const duplicateLabel = currentVariants.some(
      (item) =>
        String(item._id ?? item.id ?? "") !== editingId &&
        String(item.label || "").trim().toLowerCase() ===
          variantToSave.label.toLowerCase()
    );

    if (duplicateLabel) {
      setFormError("This product already has a variant with that size label.");
      return;
    }

    const duplicateSku = products.some((item) =>
      (Array.isArray(item.variants) ? item.variants : []).some(
        (variant) =>
          String(variant._id ?? variant.id ?? "") !== editingId &&
          String(variant.sku || "").trim().toUpperCase() === variantToSave.sku
      )
    );

    if (duplicateSku) {
      setFormError("This SKU is already assigned to another variant.");
      return;
    }

    const nextVariants = editing
      ? currentVariants.map((item) =>
          String(item._id ?? item.id ?? "") === editingId
            ? { ...item, ...variantToSave }
            : item
        )
      : [...currentVariants, variantToSave];

    const token = getToken();
    if (!token) {
      setFormError("Your admin session has expired. Please log in again.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `${PRODUCTS_API}/${encodeURIComponent(getId(product))}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ variants: nextVariants }),
        }
      );

      if (!response.ok) throw new Error(await getErrorMessage(response));
      await loadProducts();
      setIsModalOpen(false);
      resetForm();
      window.alert(
        editing
          ? "Product variant updated successfully."
          : "Product variant added successfully."
      );
    } catch (error) {
      console.error("Unable to save variant:", error);
      setFormError(error.message || "Unable to save this variant.");
    } finally {
      setSaving(false);
    }
  };

  const updateVariant = async (variant, patch, confirmation) => {
    if (confirmation && !window.confirm(confirmation)) return;

    const product = products.find((item) => getId(item) === variant.productId);
    if (!product) {
      window.alert("The parent product could not be found. Refresh and try again.");
      return;
    }

    const currentVariants = Array.isArray(product.variants) ? product.variants : [];
    const nextVariants = currentVariants.map((item) =>
      String(item._id ?? item.id ?? "") === variant.id
        ? { ...item, ...patch }
        : item
    );

    const token = getToken();
    if (!token) {
      window.alert("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${PRODUCTS_API}/${encodeURIComponent(variant.productId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ variants: nextVariants }),
        }
      );

      if (!response.ok) throw new Error(await getErrorMessage(response));
      await loadProducts();
    } catch (error) {
      console.error("Unable to update variant:", error);
      window.alert(error.message || "Unable to update variant.");
    }
  };

  const handleDelete = async (variant) => {
    const product = products.find((item) => getId(item) === variant.productId);
    if (!product) {
      window.alert("The parent product could not be found.");
      return;
    }

    if (
      !window.confirm(
        `Delete "${variant.productName} - ${variant.label}" permanently?`
      )
    ) {
      return;
    }

    const currentVariants = Array.isArray(product.variants) ? product.variants : [];
    const nextVariants = currentVariants.filter(
      (item) => String(item._id ?? item.id ?? "") !== variant.id
    );
    const token = getToken();

    if (!token) {
      window.alert("Your admin session has expired. Please log in again.");
      return;
    }

    try {
      const response = await fetch(
        `${PRODUCTS_API}/${encodeURIComponent(variant.productId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ variants: nextVariants }),
        }
      );

      if (!response.ok) throw new Error(await getErrorMessage(response));
      await loadProducts();
      window.alert("Product variant deleted successfully.");
    } catch (error) {
      console.error("Unable to delete variant:", error);
      window.alert(error.message || "Unable to delete variant.");
    }
  };

  const activeCount = variants.filter((item) => item.status === "active").length;
  const inactiveCount = variants.filter((item) => item.status === "inactive").length;
  const productsWithVariants = new Set(variants.map((item) => item.productId)).size;

  return (
    <div className="admin-product-variants-page">
      <div className="admin-product-variants-container">
        <div className="admin-product-variants-header">
          <div>
            <p className="admin-product-variants-eyebrow">Catalogue Management</p>
            <h1>Product Variants</h1>
            <p className="admin-product-variants-header-text">
              Manage product sizes, quantities, pricing and SKUs.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="admin-product-variants-refresh-button"
              onClick={refreshProducts}
              disabled={loading}
            >
              <RefreshCw size={17} />
              <span>{loading ? "Loading..." : "Refresh"}</span>
            </button>
            <button
              type="button"
              className="admin-product-variants-add-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              <span>Add Variant</span>
            </button>
          </div>
        </div>

        <div className="admin-product-variants-stats">
          <div className="admin-product-variants-stat-card">
            <span>Total Variants</span><strong>{variants.length}</strong>
          </div>
          <div className="admin-product-variants-stat-card">
            <span>Active</span><strong>{activeCount}</strong>
          </div>
          <div className="admin-product-variants-stat-card">
            <span>Inactive</span><strong>{inactiveCount}</strong>
          </div>
          <div className="admin-product-variants-stat-card">
            <span>Products With Variants</span><strong>{productsWithVariants}</strong>
          </div>
        </div>

        {pageError && (
          <div className="admin-product-variants-form-error" role="alert">
            {pageError}{" "}
            <button type="button" onClick={refreshProducts}>Retry</button>
          </div>
        )}

        <div className="admin-product-variants-toolbar">
          <div className="admin-product-variants-search">
            <Search size={18} />
            <input
              type="search"
              aria-label="Search variants, products or SKU"
              placeholder="Search variants, products or SKU..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
              onChange={(event) => setSelectedProductFilter(event.target.value)}
            >
              <option value="all">All Products</option>
              {products.map((product) => (
                <option key={getId(product)} value={getId(product)}>
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
              onChange={(event) => setSelectedStatusFilter(event.target.value)}
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
                  <th>#</th><th>Product</th><th>Variant</th><th>SKU</th>
                  <th>Quantity</th><th>MRP</th><th>Selling Price</th><th>Stock</th>
                  <th>Status</th><th>Created</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11}>Loading variants from database...</td></tr>
                ) : filteredVariants.length ? (
                  filteredVariants.map((variant, index) => (
                    <tr key={`${variant.productId}-${variant.id || index}`}>
                      <td className="variant-number">{index + 1}</td>
                      <td>
                        <div className="variant-product-cell">
                          <strong>{variant.productName}</strong>
                        </div>
                      </td>
                      <td><span className="variant-name-badge">{variant.label}</span></td>
                      <td><span className="variant-sku">{variant.sku || "—"}</span></td>
                      <td>
                        <span className="variant-quantity">
                          {variant.quantityValue} {variant.quantityUnit}
                        </span>
                      </td>
                      <td>{formatMoney(variant.mrp)}</td>
                      <td>
                        <div className="variant-price-cell">
                          <strong>{formatMoney(variant.sellingPrice)}</strong>
                          {Number(variant.mrp) > Number(variant.sellingPrice) && (
                            <span>{formatMoney(variant.mrp)}</span>
                          )}
                        </div>
                      </td>
                      <td>{variant.stockQuantity ?? 0}</td>
                      <td>
                        <button
                          type="button"
                          className={`variant-status ${
                            variant.status === "active" ? "active" : "inactive"
                          }`}
                          onClick={() =>
                            updateVariant(
                              variant,
                              {
                                status:
                                  variant.status === "active" ? "inactive" : "active",
                              },
                              `Change "${variant.label}" status?`
                            )
                          }
                        >
                          {variant.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="variant-date">{formatDate(variant.createdAt)}</td>
                      <td>
                        <div className="variant-actions">
                          <button
                            type="button"
                            className="variant-edit-button"
                            title="Edit variant"
                            aria-label={`Edit ${variant.productName} ${variant.label}`}
                            onClick={() => openEditModal(variant)}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            type="button"
                            className="variant-delete-button"
                            title="Delete variant"
                            aria-label={`Delete ${variant.productName} ${variant.label}`}
                            onClick={() => handleDelete(variant)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="variant-empty-state">
                      <div>
                        <h3>No variants found</h3>
                        <p>Add a variant or change your search and filters.</p>
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
            if (event.target === event.currentTarget) closeModal();
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
                  {editing ? "Edit Product Variant" : "Add Product Variant"}
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

            <form className="admin-product-variants-form" onSubmit={saveVariant}>
              {formError && (
                <div className="admin-product-variants-form-error" role="alert">
                  {formError}
                </div>
              )}

              <div className="admin-product-variants-form-group">
                <label htmlFor="variant-product">Product <span>*</span></label>
                <div className="admin-product-variants-select-wrapper">
                  <select
                    id="variant-product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    disabled={Boolean(editing)}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={getId(product)} value={getId(product)}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="admin-product-variants-form-group">
                <label htmlFor="variant-name">Variant Name / Size <span>*</span></label>
                <input
                  id="variant-name"
                  name="variantName"
                  type="text"
                  maxLength={50}
                  placeholder="Example: 250 g, 500 g, 1 kg"
                  value={formData.variantName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="admin-product-variants-form-group">
                <label htmlFor="variant-sku">Variant SKU <span>*</span></label>
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
                  <label htmlFor="variant-quantity">Quantity <span>*</span></label>
                  <input
                    id="variant-quantity"
                    name="quantity"
                    type="number"
                    min="0.001"
                    step="any"
                    placeholder="Example: 500"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="admin-product-variants-form-group">
                  <label htmlFor="variant-unit">Quantity Unit <span>*</span></label>
                  <div className="admin-product-variants-select-wrapper">
                    <select
                      id="variant-unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      required
                    >
                      {["g", "kg", "ml", "L", "piece", "pack", "box"].map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </div>
              </div>

              <div className="variant-form-two-column">
                <div className="admin-product-variants-form-group">
                  <label htmlFor="variant-mrp">MRP (₹) <span>*</span></label>
                  <div className="variant-price-input">
                    <span>₹</span>
                    <input
                      id="variant-mrp"
                      name="mrp"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.mrp}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div className="admin-product-variants-form-group">
                  <label htmlFor="variant-selling-price">
                    Selling Price (₹) <span>*</span>
                  </label>
                  <div className="variant-price-input">
                    <span>₹</span>
                    <input
                      id="variant-selling-price"
                      name="sellingPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.sellingPrice}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="variant-form-two-column">
                <div className="admin-product-variants-form-group">
                  <label htmlFor="variant-stock">Stock Quantity</label>
                  <input
                    id="variant-stock"
                    name="stockQuantity"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.stockQuantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="admin-product-variants-form-group">
                  <label htmlFor="variant-status">Status</label>
                  <div className="admin-product-variants-select-wrapper">
                    <select
                      id="variant-status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown size={17} />
                  </div>
                </div>
              </div>

              <p className="variant-size-note">
                Variants are saved inside the selected product's MongoDB document.
                Variant-specific images are not saved in this version because the
                current backend variant schema does not define an image field.
              </p>

              <div className="admin-product-variants-form-actions">
                <button
                  type="button"
                  className="variant-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="variant-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
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
