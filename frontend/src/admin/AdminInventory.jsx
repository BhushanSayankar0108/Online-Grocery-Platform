
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  ChevronDown,
  Edit,
  Plus,
  Search,
  X,
  History,
  RefreshCw,
} from "lucide-react";
import "./AdminInventory.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const EMPTY_FORM = {
  productId: "",
  stock: "",
  minStock: "",
  reason: "",
};

const getStockStatus = (stock, minStock) => {
  const current = Number(stock) || 0;
  const minimum = Number(minStock) || 0;

  if (current <= 0) return "out-of-stock";
  if (current <= minimum) return "low-stock";
  return "in-stock";
};

const getAdminToken = () => localStorage.getItem("adminToken");

const getErrorMessage = (payload, fallback) =>
  payload?.message || payload?.error || fallback;

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [selectedProductFilter, setSelectedProductFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [originalFormData, setOriginalFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [historyProduct, setHistoryProduct] = useState(null);
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const apiRequest = useCallback(async (url, options = {}) => {
    const token = getAdminToken();

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || payload?.success === false) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(
          "Admin session is invalid or expired. Please log in again."
        );
      }

      throw new Error(
        getErrorMessage(payload, `Request failed (${response.status}).`)
      );
    }

    return payload;
  }, []);

  const loadData = useCallback(async () => {
    try {
      if (!getAdminToken()) {
        throw new Error(
          "Admin token not found. Please log in to the admin panel again."
        );
      }

      const [inventoryPayload, productsPayload] = await Promise.all([
        apiRequest("/api/inventory?page=1&limit=100"),
        apiRequest("/api/products/admin/all?page=1&limit=100"),
      ]);

      const inventoryRows = Array.isArray(inventoryPayload.inventory)
        ? inventoryPayload.inventory
        : Array.isArray(inventoryPayload.data)
          ? inventoryPayload.data
          : [];

      const productRows = Array.isArray(productsPayload.products)
        ? productsPayload.products
        : Array.isArray(productsPayload.data)
          ? productsPayload.data
          : Array.isArray(productsPayload)
            ? productsPayload
            : [];

      setInventory(
        inventoryRows.map((row) => {
          const product =
            row.product && typeof row.product === "object"
              ? row.product
              : {};

          const stock = Number(row.stockQuantity ?? 0);
          const minStock = Number(
            row.lowStockThreshold ?? product.lowStockThreshold ?? 0
          );

          return {
            id: row._id,
            productId: product._id || row.product?._id || row.product,
            productName: product.name || "Unknown product",
            sku: product.sku || "—",
            stock,
            minStock,
            reservedStock: Number(row.reservedQuantity ?? 0),
            status: getStockStatus(
              stock - Number(row.reservedQuantity ?? 0),
              minStock
            ),
            updatedAt: row.updatedAt,
            raw: row,
          };
        })
      );

      setProducts(
        productRows.filter(
          (product) => product?._id && product.status !== "inactive"
        )
      );

      setError("");
    } catch (requestError) {
      setError(requestError.message || "Could not load inventory data.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const handleRefresh = async () => {
    setLoading(true);
    setError("");
    await loadData();
  };

  const filteredInventory = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return inventory.filter((item) => {
      const matchesSearch =
        !search ||
        item.productName.toLowerCase().includes(search) ||
        item.sku.toLowerCase().includes(search);

      const matchesStatus =
        selectedStatusFilter === "all" ||
        item.status === selectedStatusFilter;

      const matchesProduct =
        selectedProductFilter === "all" ||
        item.productId === selectedProductFilter;

      return matchesSearch && matchesStatus && matchesProduct;
    });
  }, [
    inventory,
    searchTerm,
    selectedStatusFilter,
    selectedProductFilter,
  ]);

  const totalItems = inventory.length;
  const inStockCount = inventory.filter(
    (item) => item.status === "in-stock"
  ).length;
  const lowStockCount = inventory.filter(
    (item) => item.status === "low-stock"
  ).length;
  const outOfStockCount = inventory.filter(
    (item) => item.status === "out-of-stock"
  ).length;

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData({ ...EMPTY_FORM });
    setError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    const editable = {
      productId: item.productId,
      stock: String(item.stock),
      minStock: String(item.minStock),
      reason: "Stock adjustment from admin inventory page",
    };

    setEditingId(item.productId);
    setFormData(editable);
    setOriginalFormData({ ...editable });
    setError("");
    setIsModalOpen(true);
  };

  const hasUnsavedChanges = () =>
    JSON.stringify(formData) !== JSON.stringify(originalFormData);

  const closeModal = () => {
    if (
      hasUnsavedChanges() &&
      !window.confirm("You have unsaved changes. Discard them?")
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setOriginalFormData({ ...EMPTY_FORM });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.productId) {
      setError("Please select a product.");
      return;
    }

    const stock = Number(formData.stock);
    const minStock = Number(formData.minStock);

    if (!Number.isInteger(stock) || stock < 0) {
      setError("Current stock must be a non-negative whole number.");
      return;
    }

    if (!Number.isInteger(minStock) || minStock < 0) {
      setError("Minimum stock must be a non-negative whole number.");
      return;
    }

    if (!formData.reason.trim()) {
      setError("Please enter a reason for this inventory change.");
      return;
    }

    const product = products.find(
      (item) => item._id === formData.productId
    );

    const existing = inventory.find(
      (item) => item.productId === formData.productId
    );

    const actionLabel = existing
      ? "update stock for"
      : "create inventory for";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} "${
          product?.name || existing?.productName || "this product"
        }"?`
      )
    ) {
      return;
    }

    setSaving(true);

    try {
      if (!existing) {
        await apiRequest("/api/inventory", {
          method: "POST",
          body: JSON.stringify({
            productId: formData.productId,
            stockQuantity: stock,
            lowStockThreshold: minStock,
            reason: formData.reason.trim(),
          }),
        });
      } else {
        const quantityChange = stock - existing.stock;

        if (quantityChange === 0) {
          setError(
            "The stock quantity is unchanged. Change the stock value to save an adjustment."
          );
          setSaving(false);
          return;
        }

        await apiRequest(
          `/api/inventory/${formData.productId}/adjust`,
          {
            method: "PATCH",
            body: JSON.stringify({
              quantityChange,
              reason: formData.reason.trim(),
              changeType: quantityChange > 0 ? "stock_in" : "stock_out",
            }),
          }
        );
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ ...EMPTY_FORM });
      setOriginalFormData({ ...EMPTY_FORM });

      await loadData();

      window.alert(
        existing
          ? "Inventory stock updated successfully."
          : "Inventory created successfully."
      );
    } catch (requestError) {
      setError(requestError.message || "Could not save inventory.");
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (item) => {
    setHistoryProduct(item);
    setHistoryRows([]);
    setHistoryLoading(true);

    try {
      const payload = await apiRequest(
        `/api/inventory/${item.productId}/history`
      );

      const rows = Array.isArray(payload.history)
        ? payload.history
        : Array.isArray(payload.data)
          ? payload.data
          : [];

      setHistoryRows(rows);
    } catch (requestError) {
      window.alert(
        requestError.message || "Could not load inventory history."
      );
      setHistoryProduct(null);
    } finally {
      setHistoryLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedStatusFilter("all");
    setSelectedProductFilter("all");
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  return (
    <div className="admin-inventory-page">
      <div className="admin-inventory-container">
        <div className="admin-inventory-header">
          <div>
            <p className="admin-inventory-eyebrow">Stock Management</p>
            <h1>Inventory Management</h1>
            <p className="admin-inventory-header-text">
              Manage product stock levels and low-stock thresholds.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="admin-inventory-refresh-button"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw size={17} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              className="admin-inventory-add-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              <span>Add Inventory</span>
            </button>
          </div>
        </div>

        {error && !isModalOpen && (
          <div
            role="alert"
            style={{ marginBottom: 16, color: "#b42318" }}
          >
            {error}
          </div>
        )}

        <div className="admin-inventory-stats">
          {[
            { label: "Total Items", value: totalItems },
            { label: "In Stock", value: inStockCount },
            { label: "Low Stock", value: lowStockCount },
            { label: "Out of Stock", value: outOfStockCount },
          ].map((stat) => (
            <div className="admin-inventory-stat-card" key={stat.label}>
              <div className="admin-inventory-stat-icon">
                <Boxes size={20} />
              </div>
              <div>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="admin-inventory-toolbar">
          <div className="admin-inventory-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

            {searchTerm && (
              <button
                type="button"
                className="admin-inventory-clear-search"
                title="Clear search"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="admin-inventory-filter">
            <select
              aria-label="Filter by product"
              value={selectedProductFilter}
              onChange={(event) =>
                setSelectedProductFilter(event.target.value)
              }
            >
              <option value="all">All Products</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
            <ChevronDown size={17} />
          </div>

          <div className="admin-inventory-filter">
            <select
              aria-label="Filter by stock status"
              value={selectedStatusFilter}
              onChange={(event) =>
                setSelectedStatusFilter(event.target.value)
              }
            >
              <option value="all">All Stock Status</option>
              <option value="in-stock">In Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <ChevronDown size={17} />
          </div>
        </div>

        <div className="admin-inventory-table-card">
          <div className="admin-inventory-table-header">
            <div>
              <h2>Inventory List</h2>
              <p>
                {filteredInventory.length} item
                {filteredInventory.length !== 1 ? "s" : ""} found
              </p>
            </div>
          </div>

          <div className="admin-inventory-table-wrapper">
            <table className="admin-inventory-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Reserved</th>
                  <th>Min Stock</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="inventory-empty-state">
                      <div>
                        <p>Loading inventory from server...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredInventory.length ? (
                  filteredInventory.map((item, index) => (
                    <tr key={item.id}>
                      <td className="inventory-number">{index + 1}</td>

                      <td>
                        <div className="inventory-product-cell">
                          <strong>{item.productName}</strong>
                          <span>Product-level stock</span>
                        </div>
                      </td>

                      <td>
                        <span className="inventory-sku">{item.sku}</span>
                      </td>

                      <td>
                        <strong className="inventory-stock-value">
                          {item.stock}
                        </strong>
                      </td>

                      <td>{item.reservedStock}</td>

                      <td>
                        <span className="inventory-threshold">
                          {item.minStock}
                        </span>
                      </td>

                      <td>
                        <span className={`inventory-status ${item.status}`}>
                          {item.status === "in-stock"
                            ? "In Stock"
                            : item.status === "low-stock"
                              ? "Low Stock"
                              : "Out of Stock"}
                        </span>
                      </td>

                      <td className="inventory-expiry">
                        {formatDate(item.updatedAt)}
                      </td>

                      <td>
                        <div className="inventory-actions">
                          <button
                            type="button"
                            className="inventory-edit-button"
                            title="Adjust inventory"
                            aria-label={`Adjust ${item.productName}`}
                            onClick={() => openEditModal(item)}
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            type="button"
                            className="inventory-delete-button"
                            title="View stock history"
                            aria-label={`View history for ${item.productName}`}
                            onClick={() => openHistory(item)}
                          >
                            <History size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="inventory-empty-state">
                      <div>
                        <Boxes size={34} />
                        <h3>No inventory found</h3>
                        <p>
                          {error ||
                            "Try changing your search or filters, or add inventory for a product."}
                        </p>

                        {(searchTerm ||
                          selectedStatusFilter !== "all" ||
                          selectedProductFilter !== "all") && (
                          <button
                            type="button"
                            className="inventory-cancel-button"
                            onClick={clearFilters}
                          >
                            Clear Filters
                          </button>
                        )}
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
          className="admin-inventory-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            className="admin-inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-modal-title"
          >
            <div className="admin-inventory-modal-header">
              <div>
                <p>Stock Management</p>
                <h2 id="inventory-modal-title">
                  {editingId ? "Adjust Inventory" : "Add Inventory"}
                </h2>
              </div>

              <button
                type="button"
                className="admin-inventory-modal-close"
                aria-label="Close inventory form"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="admin-inventory-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <p role="alert" style={{ color: "#b42318", margin: 0 }}>
                  {error}
                </p>
              )}

              <div className="admin-inventory-form-group">
                <label htmlFor="inventory-product">
                  Product <span>*</span>
                </label>

                <div className="admin-inventory-select-wrapper">
                  <select
                    id="inventory-product"
                    name="productId"
                    value={formData.productId}
                    onChange={handleInputChange}
                    required
                    disabled={Boolean(editingId)}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name}
                        {product.sku ? ` (${product.sku})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={17} />
                </div>
              </div>

              <div className="inventory-form-two-column">
                <div className="admin-inventory-form-group">
                  <label htmlFor="inventory-stock">
                    Target Stock <span>*</span>
                  </label>
                  <input
                    id="inventory-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Example: 50"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="admin-inventory-form-group">
                  <label htmlFor="inventory-min-stock">
                    Minimum Stock <span>*</span>
                  </label>
                  <input
                    id="inventory-min-stock"
                    name="minStock"
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Example: 10"
                    value={formData.minStock}
                    onChange={handleInputChange}
                    required
                    disabled={Boolean(editingId)}
                  />
                  <small>
                    {editingId
                      ? "Update this threshold from Product Management; this endpoint adjusts stock only."
                      : "Used to identify low-stock products."}
                  </small>
                </div>
              </div>

              <div className="admin-inventory-form-group">
                <label htmlFor="inventory-reason">
                  Reason for change <span>*</span>
                </label>
                <textarea
                  id="inventory-reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="e.g. New supplier stock received"
                  maxLength={500}
                  required
                  rows={3}
                />
              </div>

              <div className="inventory-info-box">
                <strong>Stock Status</strong>
                <p>
                  Stock status is calculated from current stock and the minimum
                  stock threshold. Stock changes are recorded in inventory
                  history.
                </p>

                <div className="inventory-info-statuses">
                  <span className="inventory-info-status in-stock">
                    In Stock
                  </span>
                  <span className="inventory-info-status low-stock">
                    Low Stock
                  </span>
                  <span className="inventory-info-status out-of-stock">
                    Out of Stock
                  </span>
                </div>
              </div>

              <div className="admin-inventory-form-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Stock Adjustment"
                      : "Save Inventory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {historyProduct && (
        <div
          className="admin-inventory-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setHistoryProduct(null);
            }
          }}
        >
          <div
            className="admin-inventory-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-history-title"
          >
            <div className="admin-inventory-modal-header">
              <div>
                <p>Audit Trail</p>
                <h2 id="inventory-history-title">Stock History</h2>
                <span>{historyProduct.productName}</span>
              </div>

              <button
                type="button"
                className="admin-inventory-modal-close"
                aria-label="Close stock history"
                onClick={() => setHistoryProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-inventory-table-wrapper">
              <table className="admin-inventory-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Change</th>
                    <th>Previous</th>
                    <th>New</th>
                    <th>Reason</th>
                  </tr>
                </thead>

                <tbody>
                  {historyLoading ? (
                    <tr>
                      <td colSpan="5">Loading history...</td>
                    </tr>
                  ) : historyRows.length ? (
                    historyRows.map((row) => (
                      <tr key={row._id}>
                        <td>{formatDate(row.createdAt)}</td>
                        <td>
                          {row.quantityChange > 0
                            ? `+${row.quantityChange}`
                            : row.quantityChange}
                        </td>
                        <td>{row.previousStock}</td>
                        <td>{row.newStock}</td>
                        <td>{row.reason || "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No history records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="admin-inventory-form-actions">
              <button
                type="button"
                className="inventory-cancel-button"
                onClick={() => setHistoryProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
