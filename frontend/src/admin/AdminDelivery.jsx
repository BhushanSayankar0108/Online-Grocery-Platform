import { useMemo, useState } from "react";
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

const INITIAL_ZONES = [
  {
    id: 1,
    name: "Pune Central",
    areas: "Shivajinagar, Deccan, Camp",
    deliveryCharge: 40,
    minimumOrder: 299,
    status: "active",
  },
  {
    id: 2,
    name: "Pimpri-Chinchwad",
    areas: "Pimpri, Chinchwad, Akurdi",
    deliveryCharge: 50,
    minimumOrder: 399,
    status: "active",
  },
  {
    id: 3,
    name: "Hinjewadi",
    areas: "Hinjewadi Phase 1, 2, 3",
    deliveryCharge: 60,
    minimumOrder: 499,
    status: "active",
  },
  {
    id: 4,
    name: "Baner-Balewadi",
    areas: "Baner, Balewadi, Sus",
    deliveryCharge: 45,
    minimumOrder: 399,
    status: "inactive",
  },
];

const INITIAL_SLOTS = [
  {
    id: 1,
    name: "Morning Slot",
    startTime: "08:00",
    endTime: "11:00",
    maxOrders: 25,
    status: "active",
  },
  {
    id: 2,
    name: "Afternoon Slot",
    startTime: "12:00",
    endTime: "15:00",
    maxOrders: 30,
    status: "active",
  },
  {
    id: 3,
    name: "Evening Slot",
    startTime: "16:00",
    endTime: "19:00",
    maxOrders: 35,
    status: "active",
  },
  {
    id: 4,
    name: "Night Slot",
    startTime: "19:00",
    endTime: "22:00",
    maxOrders: 20,
    status: "inactive",
  },
];

const EMPTY_ZONE_FORM = {
  name: "",
  areas: "",
  deliveryCharge: "",
  minimumOrder: "",
  status: "active",
};

const EMPTY_SLOT_FORM = {
  name: "",
  startTime: "",
  endTime: "",
  maxOrders: "",
  status: "active",
};

const formatCurrency = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN")}`;

function AdminDelivery() {
  const [activeTab, setActiveTab] = useState("zones");

  const [zones, setZones] = useState(INITIAL_ZONES);
  const [slots, setSlots] = useState(INITIAL_SLOTS);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formDirty, setFormDirty] = useState(false);

  const [zoneForm, setZoneForm] = useState(EMPTY_ZONE_FORM);
  const [slotForm, setSlotForm] = useState(EMPTY_SLOT_FORM);

  const currentData = activeTab === "zones" ? zones : slots;

  const filteredData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return currentData.filter((item) => {
      const matchesSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        (activeTab === "zones" &&
          item.areas.toLowerCase().includes(search));

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
        name: item.name,
        areas: item.areas,
        deliveryCharge: String(item.deliveryCharge),
        minimumOrder: String(item.minimumOrder),
        status: item.status,
      });
    } else {
      setSlotForm({
        name: item.name,
        startTime: item.startTime,
        endTime: item.endTime,
        maxOrders: String(item.maxOrders),
        status: item.status,
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

    setZoneForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormDirty(true);
  };

  const handleSlotChange = (event) => {
    const { name, value } = event.target;

    setSlotForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormDirty(true);
  };

  const handleZoneSubmit = (event) => {
    event.preventDefault();

    const name = zoneForm.name.trim();
    const areas = zoneForm.areas.trim();
    const deliveryCharge = Number(zoneForm.deliveryCharge);
    const minimumOrder = Number(zoneForm.minimumOrder);

    if (
      !name ||
      !areas ||
      zoneForm.deliveryCharge === "" ||
      zoneForm.minimumOrder === ""
    ) {
      window.alert("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isFinite(deliveryCharge) ||
      deliveryCharge < 0 ||
      !Number.isFinite(minimumOrder) ||
      minimumOrder < 0
    ) {
      window.alert(
        "Delivery charge and minimum order must be valid non-negative numbers."
      );
      return;
    }

    const duplicate = zones.some(
      (zone) =>
        zone.id !== editingId &&
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

    const updatedZone = {
      id: editingId ?? Date.now(),
      name,
      areas,
      deliveryCharge,
      minimumOrder,
      status: zoneForm.status,
    };

    if (editingId !== null) {
      setZones((previous) =>
        previous.map((zone) =>
          zone.id === editingId ? updatedZone : zone
        )
      );
    } else {
      setZones((previous) => [updatedZone, ...previous]);
    }

    setShowModal(false);
    resetForms();
  };

  const handleSlotSubmit = (event) => {
    event.preventDefault();

    const name = slotForm.name.trim();
    const maxOrders = Number(slotForm.maxOrders);

    if (
      !name ||
      !slotForm.startTime ||
      !slotForm.endTime ||
      slotForm.maxOrders === ""
    ) {
      window.alert("Please fill in all required fields.");
      return;
    }

    if (slotForm.endTime <= slotForm.startTime) {
      window.alert("End time must be later than start time.");
      return;
    }

    if (!Number.isInteger(maxOrders) || maxOrders < 1) {
      window.alert("Maximum orders must be a positive whole number.");
      return;
    }

    const duplicate = slots.some(
      (slot) =>
        slot.id !== editingId &&
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

    const updatedSlot = {
      id: editingId ?? Date.now(),
      name,
      startTime: slotForm.startTime,
      endTime: slotForm.endTime,
      maxOrders,
      status: slotForm.status,
    };

    if (editingId !== null) {
      setSlots((previous) =>
        previous.map((slot) =>
          slot.id === editingId ? updatedSlot : slot
        )
      );
    } else {
      setSlots((previous) => [updatedSlot, ...previous]);
    }

    setShowModal(false);
    resetForms();
  };

  const toggleStatus = (item) => {
    const nextStatus = item.status === "active" ? "inactive" : "active";

    const confirmed = window.confirm(
      `Are you sure you want to change "${item.name}" to ${nextStatus}?`
    );

    if (!confirmed) return;

    if (activeTab === "zones") {
      setZones((previous) =>
        previous.map((zone) =>
          zone.id === item.id
            ? { ...zone, status: nextStatus }
            : zone
        )
      );
    } else {
      setSlots((previous) =>
        previous.map((slot) =>
          slot.id === item.id
            ? { ...slot, status: nextStatus }
            : slot
        )
      );
    }
  };

  const deleteItem = (item) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    if (activeTab === "zones") {
      setZones((previous) =>
        previous.filter((zone) => zone.id !== item.id)
      );
    } else {
      setSlots((previous) =>
        previous.filter((slot) => slot.id !== item.id)
      );
    }
  };

  const clearSearch = () => setSearchTerm("");

  const changeTab = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="admin-delivery-page">
      <div className="admin-delivery-container">
        {/* Header */}
        <div className="admin-delivery-header">
          <div>
            <p className="admin-delivery-eyebrow">
              Logistics Management
            </p>

            <h1>Delivery Management</h1>

            <p className="admin-delivery-header-text">
              Manage delivery zones, charges and delivery time slots.
            </p>
          </div>

          <button
            type="button"
            className="admin-delivery-add-button"
            onClick={openAddModal}
          >
            <Plus size={18} />
            Add {activeTab === "zones" ? "Delivery Zone" : "Delivery Slot"}
          </button>
        </div>

        {/* Statistics */}
        <div className="admin-delivery-stats">
          <div className="admin-delivery-stat-card">
            <div className="admin-delivery-stat-icon">
              <MapPin size={21} />
            </div>
            <div>
              <span>Total Zones</span>
              <strong>{stats.totalZones}</strong>
            </div>
          </div>

          <div className="admin-delivery-stat-card">
            <div className="admin-delivery-stat-icon">
              <MapPin size={21} />
            </div>
            <div>
              <span>Active Zones</span>
              <strong>{stats.activeZones}</strong>
            </div>
          </div>

          <div className="admin-delivery-stat-card">
            <div className="admin-delivery-stat-icon">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Total Slots</span>
              <strong>{stats.totalSlots}</strong>
            </div>
          </div>

          <div className="admin-delivery-stat-card">
            <div className="admin-delivery-stat-icon">
              <Truck size={21} />
            </div>
            <div>
              <span>Active Slots</span>
              <strong>{stats.activeSlots}</strong>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-delivery-tabs">
          <button
            type="button"
            className={activeTab === "zones" ? "active" : ""}
            onClick={() => changeTab("zones")}
          >
            <MapPin size={16} />
            Delivery Zones
          </button>

          <button
            type="button"
            className={activeTab === "slots" ? "active" : ""}
            onClick={() => changeTab("slots")}
          >
            <Clock3 size={16} />
            Delivery Slots
          </button>
        </div>

        {/* Search and filter */}
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
                onClick={clearSearch}
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

        {/* Records table */}
        <div className="admin-delivery-table-card">
          <div className="admin-delivery-table-header">
            <div>
              <h2>
                {activeTab === "zones" ? "Delivery Zones" : "Delivery Slots"}
              </h2>
              <p>
                {filteredData.length} record
                {filteredData.length !== 1 ? "s" : ""} found
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((zone, index) => (
                      <tr key={zone.id}>
                        <td className="delivery-number">{index + 1}</td>

                        <td>
                          <div className="delivery-zone-info">
                            <div className="delivery-zone-icon">
                              <MapPin size={16} />
                            </div>
                            <strong>{zone.name}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="delivery-area-text">
                            {zone.areas}
                          </span>
                        </td>

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
                          <button
                            type="button"
                            className={`delivery-status-button ${zone.status}`}
                            onClick={() => toggleStatus(zone)}
                            aria-label={`Change ${zone.name} status`}
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
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              type="button"
                              className="delivery-delete-button"
                              title="Delete zone"
                              aria-label={`Delete ${zone.name}`}
                              onClick={() => deleteItem(zone)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="delivery-empty-state">
                        <MapPin size={35} />
                        <h3>No delivery zones found</h3>
                        <p>Try changing your search or filter.</p>
                      </td>
                    </tr>
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
                    <th>Maximum Orders</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((slot, index) => (
                      <tr key={slot.id}>
                        <td className="delivery-number">{index + 1}</td>

                        <td>
                          <div className="delivery-zone-info">
                            <div className="delivery-zone-icon">
                              <Clock3 size={16} />
                            </div>
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
                          <span className="delivery-orders-limit">
                            {slot.maxOrders}
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className={`delivery-status-button ${slot.status}`}
                            onClick={() => toggleStatus(slot)}
                            aria-label={`Change ${slot.name} status`}
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
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              type="button"
                              className="delivery-delete-button"
                              title="Delete slot"
                              aria-label={`Delete ${slot.name}`}
                              onClick={() => deleteItem(slot)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="delivery-empty-state">
                        <Clock3 size={35} />
                        <h3>No delivery slots found</h3>
                        <p>Try changing your search or filter.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="admin-delivery-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
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
              >
                <X size={18} />
              </button>
            </div>

            {activeTab === "zones" ? (
              <form
                className="admin-delivery-form"
                onSubmit={handleZoneSubmit}
              >
                <div className="delivery-form-group">
                  <label htmlFor="delivery-zone-name">
                    Zone Name <span>*</span>
                  </label>
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
                  <label htmlFor="delivery-zone-areas">
                    Areas / Pincodes <span>*</span>
                  </label>
                  <textarea
                    id="delivery-zone-areas"
                    name="areas"
                    placeholder="Enter areas, pincodes or localities"
                    value={zoneForm.areas}
                    onChange={handleZoneChange}
                    maxLength={1000}
                    required
                  />
                </div>

                <div className="delivery-form-two-column">
                  <div className="delivery-form-group">
                    <label htmlFor="delivery-charge">
                      Delivery Charge <span>*</span>
                    </label>
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
                    <label htmlFor="delivery-minimum-order">
                      Minimum Order <span>*</span>
                    </label>
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
                    Define the areas served by this zone and configure the
                    delivery charge and minimum order value.
                  </p>
                </div>

                <div className="admin-delivery-form-actions">
                  <button
                    type="button"
                    className="delivery-cancel-button"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="delivery-save-button">
                    {editingId !== null ? "Update Zone" : "Save Zone"}
                  </button>
                </div>
              </form>
            ) : (
              <form
                className="admin-delivery-form"
                onSubmit={handleSlotSubmit}
              >
                <div className="delivery-form-group">
                  <label htmlFor="delivery-slot-name">
                    Slot Name <span>*</span>
                  </label>
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
                    <label htmlFor="delivery-slot-start">
                      Start Time <span>*</span>
                    </label>
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
                    <label htmlFor="delivery-slot-end">
                      End Time <span>*</span>
                    </label>
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
                  <label htmlFor="delivery-slot-max-orders">
                    Maximum Orders <span>*</span>
                  </label>
                  <input
                    id="delivery-slot-max-orders"
                    type="number"
                    name="maxOrders"
                    min="1"
                    step="1"
                    placeholder="25"
                    value={slotForm.maxOrders}
                    onChange={handleSlotChange}
                    required
                  />
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
                  >
                    Cancel
                  </button>
                  <button type="submit" className="delivery-save-button">
                    {editingId !== null ? "Update Slot" : "Save Slot"}
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