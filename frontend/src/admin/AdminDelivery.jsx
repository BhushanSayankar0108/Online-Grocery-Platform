import { useCallback, useEffect, useMemo, useState } from "react";

import {

  ChevronDown,

  Clock3,

  Edit,

  MapPin,

  Plus,

  Search,

  Trash2,

  Truck,

  X,

} from "lucide-react";

import "./AdminDelivery.css";

const API_BASE_URL = (

  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"

).replace(/\/$/, "");

const EMPTY_ZONE_FORM = {

  name: "",

  areas: "",

  deliveryCharge: "",

  minimumOrder: "",

  freeDeliveryAbove: "799",

  status: "active",

};

const EMPTY_SLOT_FORM = {
  name: "",
  startTime: "",
  endTime: "",
  status: "active",
};

const formatCurrency = (amount) =>

  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function getAdminToken() {

  return (

    localStorage.getItem("adminToken") ||

    localStorage.getItem("token") ||

    localStorage.getItem("admin_token")

  );

}

async function deliveryRequest(path, options = {}) {

  const token = getAdminToken();

  if (!token) {

    throw new Error("Admin login token was not found. Please log in again.");

  }

  const response = await fetch(`${API_BASE_URL}/api/delivery${path}`, {

    ...options,

    headers: {

      ...(options.body ? { "Content-Type": "application/json" } : {}),

      Authorization: `Bearer ${token}`,

      ...options.headers,

    },

  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {

    if (response.status === 401 || response.status === 403) {

      throw new Error(

        "Your admin session is invalid or expired, or you do not have Delivery permission."

      );

    }

    throw new Error(

      result.message || result.error || `Request failed with status ${response.status}.`

    );

  }

  return result;

}

function normalizeRecords(result, type) {

  let records = [];

  if (Array.isArray(result)) records = result;

  else if (Array.isArray(result?.[type])) records = result[type];

  else if (Array.isArray(result?.data)) records = result.data;

  else if (Array.isArray(result?.records)) records = result.records;

  return records.map((item) => ({

    ...item,

    id: String(item._id ?? item.id),

    status: String(item.status || "active").toLowerCase(),

  }));

}

function AdminDelivery() {

  const [activeTab, setActiveTab] = useState("zones");

  const [zones, setZones] = useState([]);

  const [slots, setSlots] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [apiError, setApiError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [formDirty, setFormDirty] = useState(false);

  const [zoneForm, setZoneForm] = useState({ ...EMPTY_ZONE_FORM });

  const [slotForm, setSlotForm] = useState({ ...EMPTY_SLOT_FORM });

  const loadDeliveryData = useCallback(async (showLoader = true) => {

    if (showLoader) setLoading(true);

    try {

      const [zonesResult, slotsResult] = await Promise.all([

        deliveryRequest("/zones"),

        deliveryRequest("/slots"),

      ]);

      setZones(normalizeRecords(zonesResult, "zones"));

      setSlots(normalizeRecords(slotsResult, "slots"));

      setApiError("");

    } catch (error) {

      setApiError(error.message || "Unable to load delivery data.");

    } finally {

      if (showLoader) setLoading(false);

    }

  }, []);

  useEffect(() => {

    let isMounted = true;

    const fetchInitialDeliveryData = async () => {

      try {

        const [zonesResult, slotsResult] = await Promise.all([

          deliveryRequest("/zones"),

          deliveryRequest("/slots"),

        ]);

        if (!isMounted) return;

        setZones(normalizeRecords(zonesResult, "zones"));

        setSlots(normalizeRecords(slotsResult, "slots"));

        setApiError("");

      } catch (error) {

        if (!isMounted) return;

        setApiError(error.message || "Unable to load delivery data.");

      } finally {

        if (isMounted) setLoading(false);

      }

    };

    fetchInitialDeliveryData();

    return () => {

      isMounted = false;

    };

  }, []);

  const currentData = activeTab === "zones" ? zones : slots;

  const filteredData = useMemo(() => {

    const search = searchTerm.trim().toLowerCase();

    return currentData.filter((item) => {

      const matchesSearch =

        !search ||

        String(item.name || "").toLowerCase().includes(search) ||

        (activeTab === "zones" &&

          String(item.areas || "").toLowerCase().includes(search));

      const matchesStatus =

        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;

    });

  }, [currentData, searchTerm, statusFilter, activeTab]);

  const stats = useMemo(

    () => ({

      totalZones: zones.length,

      activeZones: zones.filter((zone) => zone.status === "active").length,

      totalSlots: slots.length,

      activeSlots: slots.filter((slot) => slot.status === "active").length,

    }),

    [zones, slots]

  );

  const resetForms = () => {

    setZoneForm({ ...EMPTY_ZONE_FORM });

    setSlotForm({ ...EMPTY_SLOT_FORM });

    setEditingId(null);

    setFormDirty(false);

  };

  const openAddModal = () => {

    resetForms();

    setShowModal(true);

  };

  const openEditModal = (item) => {

    setEditingId(item.id);

    setFormDirty(false);

    if (activeTab === "zones") {

      setZoneForm({

        name: item.name || "",

        areas: item.areas || "",

        deliveryCharge: String(item.deliveryCharge ?? ""),

        minimumOrder: String(item.minimumOrder ?? ""),

        freeDeliveryAbove: String(item.freeDeliveryAbove ?? 799),

        status: item.status || "active",

      });
    } else {
      setSlotForm({
        name: item.name || "",
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        status: item.status || "active",
      });
    }

    setShowModal(true);

  };

  const closeModal = () => {

    if (formDirty) {

      const confirmed = window.confirm(

        "You have unsaved changes. Are you sure you want to discard them?"

      );

      if (!confirmed) return;

    }

    setShowModal(false);

    resetForms();

  };

  const handleZoneChange = (event) => {

    const { name, value } = event.target;

    setZoneForm((previous) => ({ ...previous, [name]: value }));

    setFormDirty(true);

  };

  const handleSlotChange = (event) => {

    const { name, value } = event.target;

    setSlotForm((previous) => ({ ...previous, [name]: value }));

    setFormDirty(true);

  };

  const handleZoneSubmit = async (event) => {

    event.preventDefault();

    const name = zoneForm.name.trim();

    const areas = zoneForm.areas.trim();

    const deliveryCharge = Number(zoneForm.deliveryCharge);

    const minimumOrder = Number(zoneForm.minimumOrder);

    const freeDeliveryAbove = Number(zoneForm.freeDeliveryAbove);

    if (

      !name ||

      !areas ||

      zoneForm.deliveryCharge === "" ||

      zoneForm.minimumOrder === "" ||

      zoneForm.freeDeliveryAbove === ""

    ) {

      window.alert("Please fill in all required fields.");

      return;

    }

    if (

      !Number.isFinite(deliveryCharge) ||

      deliveryCharge < 0 ||

      !Number.isFinite(minimumOrder) ||

      minimumOrder < 0 ||

      !Number.isFinite(freeDeliveryAbove) ||

      freeDeliveryAbove < 0

    ) {

      window.alert(

        "Delivery charge, minimum order and free delivery threshold must be valid non-negative numbers."

      );

      return;

    }

    if (freeDeliveryAbove < minimumOrder) {

      window.alert(

        "Free delivery threshold should be equal to or greater than the minimum order."

      );

      return;

    }

    const duplicate = zones.some(

      (zone) =>

        String(zone.id) !== String(editingId) &&

        zone.name.trim().toLowerCase() === name.toLowerCase()

    );

    if (duplicate) {

      window.alert("A delivery zone with this name already exists.");

      return;

    }

    const confirmed = window.confirm(

      editingId

        ? `Are you sure you want to update the delivery zone "${name}"?`

        : `Are you sure you want to add the delivery zone "${name}"?`

    );

    if (!confirmed) return;

    const payload = {

      name,

      areas,

      deliveryCharge,

      minimumOrder,

      freeDeliveryAbove,

      status: zoneForm.status,

    };

    setSaving(true);

    setApiError("");

    try {

      const path =

        editingId !== null

          ? `/zones/${encodeURIComponent(editingId)}`

          : "/zones";

      await deliveryRequest(path, {

        method: editingId !== null ? "PUT" : "POST",

        body: JSON.stringify(payload),

      });

      await loadDeliveryData(false);

      setShowModal(false);

      resetForms();

      window.alert(

        editingId !== null

          ? "Delivery zone updated successfully."

          : "Delivery zone added successfully."

      );

    } catch (error) {

      setApiError(error.message || "Unable to save delivery zone.");

      window.alert(error.message || "Unable to save delivery zone.");

    } finally {

      setSaving(false);

    }

  };

  const handleSlotSubmit = async (event) => {
    event.preventDefault();

    const name = slotForm.name.trim();

    if (!name || !slotForm.startTime || !slotForm.endTime) {
      window.alert("Please fill in all required fields.");
      return;
    }

    if (slotForm.endTime <= slotForm.startTime) {
      window.alert("End time must be later than start time.");
      return;
    }

    const duplicate = slots.some(
      (slot) =>
        String(slot.id) !== String(editingId) &&
        slot.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicate) {
      window.alert("A delivery slot with this name already exists.");
      return;
    }

    const confirmed = window.confirm(
      editingId
        ? `Are you sure you want to update the delivery slot "${name}"?`
        : `Are you sure you want to add the delivery slot "${name}"?`
    );

    if (!confirmed) return;

    const payload = {
      name,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      status: slotForm.status,
    };

    setSaving(true);
    setApiError("");

    try {
      const path =
        editingId !== null
          ? `/slots/${encodeURIComponent(editingId)}`
          : "/slots";

      await deliveryRequest(path, {
        method: editingId !== null ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      await loadDeliveryData(false);
      setShowModal(false);
      resetForms();

      window.alert(
        editingId !== null
          ? "Delivery slot updated successfully."
          : "Delivery slot added successfully."
      );
    } catch (error) {
      setApiError(error.message || "Unable to save delivery slot.");
      window.alert(error.message || "Unable to save delivery slot.");
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {

    const nextStatus = item.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(

      `Are you sure you want to change "${item.name}" to ${nextStatus}?`

    );

    if (!confirmed) return;

    setApiError("");

    try {

      const collection = activeTab === "zones" ? "zones" : "slots";

      await deliveryRequest(

        `/${collection}/${encodeURIComponent(item.id)}/status`,

        {

          method: "PATCH",

          body: JSON.stringify({ status: nextStatus }),

        }

      );

      await loadDeliveryData(false);

    } catch (error) {

      setApiError(error.message || "Unable to change status.");

      window.alert(error.message || "Unable to change status.");

    }

  };

  const deleteItem = async (item) => {

    const confirmed = window.confirm(

      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`

    );

    if (!confirmed) return;

    setApiError("");

    try {

      const collection = activeTab === "zones" ? "zones" : "slots";

      await deliveryRequest(

        `/${collection}/${encodeURIComponent(item.id)}`,

        { method: "DELETE" }

      );

      await loadDeliveryData(false);

      window.alert(`${item.name} deleted successfully.`);

    } catch (error) {

      setApiError(error.message || "Unable to delete record.");

      window.alert(error.message || "Unable to delete record.");

    }

  };

  const changeTab = (tab) => {

    setActiveTab(tab);

    setSearchTerm("");

    setStatusFilter("all");

    setApiError("");

  };

  return (

    <div className="admin-delivery-page">

      <div className="admin-delivery-container">

        <div className="admin-delivery-header">

          <div>

            <p className="admin-delivery-eyebrow">Logistics Management</p>

            <h1>Delivery Management</h1>

            <p className="admin-delivery-header-text">

              Manage delivery zones, charges and delivery time slots.

            </p>

          </div>

          <button

            type="button"

            className="admin-delivery-add-button"

            onClick={openAddModal}

            disabled={loading || saving}

          >

            <Plus size={18} />

            Add {activeTab === "zones" ? "Delivery Zone" : "Delivery Slot"}

          </button>

        </div>

        {loading && (

          <div role="status" aria-live="polite">Loading delivery data...</div>

        )}

        {apiError && (

          <div

            role="alert"

            style={{

              margin: "12px 0",

              padding: "12px 16px",

              borderRadius: "8px",

              background: "#fff1f0",

              color: "#b42318",

            }}

          >

            <p>{apiError}</p>

            <button

              type="button"

              onClick={() => loadDeliveryData()}

              disabled={loading}

            >

              Retry loading

            </button>

          </div>

        )}

        <div className="admin-delivery-stats">

          <div className="admin-delivery-stat-card">

            <div className="admin-delivery-stat-icon"><MapPin size={21} /></div>

            <div><span>Total Zones</span><strong>{stats.totalZones}</strong></div>

          </div>

          <div className="admin-delivery-stat-card">

            <div className="admin-delivery-stat-icon"><MapPin size={21} /></div>

            <div><span>Active Zones</span><strong>{stats.activeZones}</strong></div>

          </div>

          <div className="admin-delivery-stat-card">

            <div className="admin-delivery-stat-icon"><Clock3 size={21} /></div>

            <div><span>Total Slots</span><strong>{stats.totalSlots}</strong></div>

          </div>

          <div className="admin-delivery-stat-card">

            <div className="admin-delivery-stat-icon"><Truck size={21} /></div>

            <div><span>Active Slots</span><strong>{stats.activeSlots}</strong></div>

          </div>

        </div>

        <div className="admin-delivery-tabs">

          <button

            type="button"

            className={activeTab === "zones" ? "active" : ""}

            onClick={() => changeTab("zones")}

          >

            <MapPin size={16} /> Delivery Zones

          </button>

          <button

            type="button"

            className={activeTab === "slots" ? "active" : ""}

            onClick={() => changeTab("slots")}

          >

            <Clock3 size={16} /> Delivery Slots

          </button>

        </div>

        <div className="admin-delivery-toolbar">

          <div className="admin-delivery-search">

            <Search size={17} />

            <input

              type="text"

              aria-label="Search delivery records"

              placeholder={

                activeTab === "zones"

                  ? "Search zone or area..."

                  : "Search delivery slot..."

              }

              value={searchTerm}

              onChange={(event) => setSearchTerm(event.target.value)}

            />

            {searchTerm && (

              <button

                type="button"

                className="admin-delivery-clear-search"

                aria-label="Clear search"

                onClick={() => setSearchTerm("")}

              >

                <X size={14} />

              </button>

            )}

          </div>

          <div className="admin-delivery-filter">

            <select

              aria-label="Filter by status"

              value={statusFilter}

              onChange={(event) => setStatusFilter(event.target.value)}

            >

              <option value="all">All Status</option>

              <option value="active">Active</option>

              <option value="inactive">Inactive</option>

            </select>

            <ChevronDown size={16} />

          </div>

        </div>

        <div className="admin-delivery-table-card">

          <div className="admin-delivery-table-header">

            <div>

              <h2>{activeTab === "zones" ? "Delivery Zones" : "Delivery Slots"}</h2>

              <p>

                {filteredData.length} record{filteredData.length !== 1 ? "s" : ""} found

              </p>

            </div>

          </div>

          <div className="admin-delivery-table-wrapper">

            {activeTab === "zones" ? (

              <table className="admin-delivery-table">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Zone</th>

                    <th>Areas / Pincodes</th>

                    <th>Delivery Charge</th>

                    <th>Minimum Order</th>

                    <th>Free Delivery Above</th>

                    <th>Status</th>

                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {!loading && filteredData.length > 0 ? (

                    filteredData.map((zone, index) => (

                      <tr key={zone.id}>

                        <td className="delivery-number">{index + 1}</td>

                        <td>

                          <div className="delivery-zone-info">

                            <div className="delivery-zone-icon"><MapPin size={16} /></div>

                            <strong>{zone.name}</strong>

                          </div>

                        </td>

                        <td><span className="delivery-area-text">{zone.areas}</span></td>

                        <td>

                          <strong className="delivery-amount">

                            {formatCurrency(zone.deliveryCharge)}

                          </strong>

                        </td>

                        <td>

                          <span className="delivery-minimum">

                            {formatCurrency(zone.minimumOrder)}

                          </span>

                        </td>

                        <td>

                          <span className="delivery-minimum">

                            {formatCurrency(zone.freeDeliveryAbove ?? 799)}

                          </span>

                        </td>

                        <td>

                          <button

                            type="button"

                            className={`delivery-status-button ${zone.status}`}

                            onClick={() => toggleStatus(zone)}

                            aria-label={`Change ${zone.name} status`}

                            disabled={saving}

                          >

                            {zone.status === "active" ? "Active" : "Inactive"}

                          </button>

                        </td>

                        <td>

                          <div className="delivery-actions">

                            <button

                              type="button"

                              className="delivery-edit-button"

                              title="Edit zone"

                              aria-label={`Edit ${zone.name}`}

                              onClick={() => openEditModal(zone)}

                              disabled={saving}

                            >

                              <Edit size={15} />

                            </button>

                            <button

                              type="button"

                              className="delivery-delete-button"

                              title="Delete zone"

                              aria-label={`Delete ${zone.name}`}

                              onClick={() => deleteItem(zone)}

                              disabled={saving}

                            >

                              <Trash2 size={15} />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    !loading && (

                      <tr>

                        <td colSpan="8" className="delivery-empty-state">

                          <MapPin size={35} />

                          <h3>No delivery zones found</h3>

                          <p>Try changing your search or filter.</p>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            ) : (

              <table className="admin-delivery-table">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>Slot</th>

                    <th>Time</th>

                    

                    <th>Status</th>

                    <th>Actions</th>

                  </tr>

                </thead>

                <tbody>

                  {!loading && filteredData.length > 0 ? (

                    filteredData.map((slot, index) => (

                      <tr key={slot.id}>

                        <td className="delivery-number">{index + 1}</td>

                        <td>

                          <div className="delivery-zone-info">

                            <div className="delivery-zone-icon"><Clock3 size={16} /></div>

                            <strong>{slot.name}</strong>

                          </div>

                        </td>

                        <td>

                          <div className="delivery-time-cell">

                            <strong>{slot.startTime}</strong>

                            <span>to</span>

                            <strong>{slot.endTime}</strong>

                          </div>

                        </td>

                        

                        <td>

                          <button

                            type="button"

                            className={`delivery-status-button ${slot.status}`}

                            onClick={() => toggleStatus(slot)}

                            aria-label={`Change ${slot.name} status`}

                            disabled={saving}

                          >

                            {slot.status === "active" ? "Active" : "Inactive"}

                          </button>

                        </td>

                        <td>

                          <div className="delivery-actions">

                            <button

                              type="button"

                              className="delivery-edit-button"

                              title="Edit slot"

                              aria-label={`Edit ${slot.name}`}

                              onClick={() => openEditModal(slot)}

                              disabled={saving}

                            >

                              <Edit size={15} />

                            </button>

                            <button

                              type="button"

                              className="delivery-delete-button"

                              title="Delete slot"

                              aria-label={`Delete ${slot.name}`}

                              onClick={() => deleteItem(slot)}

                              disabled={saving}

                            >

                              <Trash2 size={15} />

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  ) : (

                    !loading && (

                      <tr>

                        <td colSpan="5" className="delivery-empty-state">

                          <Clock3 size={35} />

                          <h3>No delivery slots found</h3>

                          <p>Try changing your search or filter.</p>

                        </td>

                      </tr>

                    )

                  )}

                </tbody>

              </table>

            )}

          </div>

        </div>

      </div>

      {showModal && (

        <div

          className="admin-delivery-modal-overlay"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) closeModal();

          }}

        >

          <div

            className="admin-delivery-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="admin-delivery-modal-title"

          >

            <div className="admin-delivery-modal-header">

              <div>

                <p>{editingId !== null ? "Update" : "Create"}</p>

                <h2 id="admin-delivery-modal-title">

                  {editingId !== null ? "Edit " : "Add "}

                  {activeTab === "zones" ? "Delivery Zone" : "Delivery Slot"}

                </h2>

              </div>

              <button

                type="button"

                className="admin-delivery-modal-close"

                onClick={closeModal}

                aria-label="Close dialog"

                disabled={saving}

              >

                <X size={18} />

              </button>

            </div>

            {activeTab === "zones" ? (

              <form className="admin-delivery-form" onSubmit={handleZoneSubmit}>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-zone-name">Zone Name <span>*</span></label>

                  <input

                    id="delivery-zone-name"

                    type="text"

                    name="name"

                    placeholder="e.g. Pune Central"

                    value={zoneForm.name}

                    onChange={handleZoneChange}

                    maxLength={100}

                    required

                  />

                </div>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-zone-areas">Areas / Pincodes <span>*</span></label>

                  <textarea

                    id="delivery-zone-areas"

                    name="areas"

                    placeholder="Enter comma-separated pincodes or localities"

                    value={zoneForm.areas}

                    onChange={handleZoneChange}

                    maxLength={1000}

                    required

                  />

                </div>

                <div className="delivery-form-two-column">

                  <div className="delivery-form-group">

                    <label htmlFor="delivery-charge">Delivery Charge <span>*</span></label>

                    <div className="delivery-input-prefix">

                      <span>₹</span>

                      <input

                        id="delivery-charge"

                        type="number"

                        name="deliveryCharge"

                        min="0"

                        step="0.01"

                        placeholder="40"

                        value={zoneForm.deliveryCharge}

                        onChange={handleZoneChange}

                        required

                      />

                    </div>

                  </div>

                  <div className="delivery-form-group">

                    <label htmlFor="delivery-minimum-order">Minimum Order <span>*</span></label>

                    <div className="delivery-input-prefix">

                      <span>₹</span>

                      <input

                        id="delivery-minimum-order"

                        type="number"

                        name="minimumOrder"

                        min="0"

                        step="0.01"

                        placeholder="299"

                        value={zoneForm.minimumOrder}

                        onChange={handleZoneChange}

                        required

                      />

                    </div>

                  </div>

                </div>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-free-delivery">Free Delivery Above <span>*</span></label>

                  <div className="delivery-input-prefix">

                    <span>₹</span>

                    <input

                      id="delivery-free-delivery"

                      type="number"

                      name="freeDeliveryAbove"

                      min="0"

                      step="0.01"

                      placeholder="799"

                      value={zoneForm.freeDeliveryAbove}

                      onChange={handleZoneChange}

                      required

                    />

                  </div>

                </div>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-zone-status">Status</label>

                  <div className="delivery-select-wrapper">

                    <select

                      id="delivery-zone-status"

                      name="status"

                      value={zoneForm.status}

                      onChange={handleZoneChange}

                    >

                      <option value="active">Active</option>

                      <option value="inactive">Inactive</option>

                    </select>

                    <ChevronDown size={16} />

                  </div>

                </div>

                <div className="delivery-info-box">

                  <strong>Delivery zone information</strong>

                  <p>

                    Configure the service areas, delivery charge, minimum order

                    and the order value at which delivery becomes free.

                  </p>

                </div>

                <div className="admin-delivery-form-actions">

                  <button

                    type="button"

                    className="delivery-cancel-button"

                    onClick={closeModal}

                    disabled={saving}

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="delivery-save-button"

                    disabled={saving}

                  >

                    {saving

                      ? "Saving..."

                      : editingId !== null

                        ? "Update Zone"

                        : "Save Zone"}

                  </button>

                </div>

              </form>

            ) : (

              <form className="admin-delivery-form" onSubmit={handleSlotSubmit}>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-slot-name">Slot Name <span>*</span></label>

                  <input

                    id="delivery-slot-name"

                    type="text"

                    name="name"

                    placeholder="e.g. Morning Slot"

                    value={slotForm.name}

                    onChange={handleSlotChange}

                    maxLength={100}

                    required

                  />

                </div>

                <div className="delivery-form-two-column">

                  <div className="delivery-form-group">

                    <label htmlFor="delivery-slot-start">Start Time <span>*</span></label>

                    <input

                      id="delivery-slot-start"

                      type="time"

                      name="startTime"

                      value={slotForm.startTime}

                      onChange={handleSlotChange}

                      required

                    />

                  </div>

                  <div className="delivery-form-group">

                    <label htmlFor="delivery-slot-end">End Time <span>*</span></label>

                    <input

                      id="delivery-slot-end"

                      type="time"

                      name="endTime"

                      value={slotForm.endTime}

                      onChange={handleSlotChange}

                      required

                    />

                  </div>

                </div>

                <div className="delivery-form-group">

                  <label htmlFor="delivery-slot-status">Status</label>

                  <div className="delivery-select-wrapper">

                    <select

                      id="delivery-slot-status"

                      name="status"

                      value={slotForm.status}

                      onChange={handleSlotChange}

                    >

                      <option value="active">Active</option>

                      <option value="inactive">Inactive</option>

                    </select>

                    <ChevronDown size={16} />

                  </div>

                </div>

                <div className="delivery-info-box">

                  <strong>Delivery slot information</strong>

                  <p>

                    Configure the delivery time window and the maximum number

                    of orders that can be accepted.

                  </p>

                </div>

                <div className="admin-delivery-form-actions">

                  <button

                    type="button"

                    className="delivery-cancel-button"

                    onClick={closeModal}

                    disabled={saving}

                  >

                    Cancel

                  </button>

                  <button

                    type="submit"

                    className="delivery-save-button"

                    disabled={saving}

                  >

                    {saving

                      ? "Saving..."

                      : editingId !== null

                        ? "Update Slot"

                        : "Save Slot"}

                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

    </div>

  );

}

export default AdminDelivery;
