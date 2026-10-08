import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
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


function AdminDelivery() {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("zones");

    const [zones, setZones] = useState(INITIAL_ZONES);
    const [slots, setSlots] = useState(INITIAL_SLOTS);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [zoneForm, setZoneForm] = useState(EMPTY_ZONE_FORM);
    const [slotForm, setSlotForm] = useState(EMPTY_SLOT_FORM);


    const currentData =
        activeTab === "zones" ? zones : slots;


    const filteredData = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        return currentData.filter((item) => {
            const matchesSearch =
                !search ||
                item.name.toLowerCase().includes(search) ||
                (activeTab === "zones"
                    ? item.areas.toLowerCase().includes(search)
                    : true);

            const matchesStatus =
                statusFilter === "all" ||
                item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [
        currentData,
        searchTerm,
        statusFilter,
        activeTab,
    ]);


    const stats = useMemo(() => {
        const zoneActive = zones.filter(
            (zone) => zone.status === "active"
        ).length;

        const slotActive = slots.filter(
            (slot) => slot.status === "active"
        ).length;

        return {
            totalZones: zones.length,
            activeZones: zoneActive,
            totalSlots: slots.length,
            activeSlots: slotActive,
        };
    }, [zones, slots]);


    const resetForms = () => {
        setZoneForm(EMPTY_ZONE_FORM);
        setSlotForm(EMPTY_SLOT_FORM);
        setEditingId(null);
    };


    const openAddModal = () => {
        resetForms();
        setShowModal(true);
    };


    const openEditModal = (item) => {
        setEditingId(item.id);

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
        setShowModal(false);
        resetForms();
    };


    const handleZoneChange = (event) => {
        const { name, value } = event.target;

        setZoneForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleSlotChange = (event) => {
        const { name, value } = event.target;

        setSlotForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    const handleZoneSubmit = (event) => {
        event.preventDefault();

        if (
            !zoneForm.name.trim() ||
            !zoneForm.areas.trim() ||
            !zoneForm.deliveryCharge ||
            !zoneForm.minimumOrder
        ) {
            alert("Please fill all required fields.");
            return;
        }

        const newZone = {
            id: editingId || Date.now(),
            name: zoneForm.name.trim(),
            areas: zoneForm.areas.trim(),
            deliveryCharge: Number(zoneForm.deliveryCharge),
            minimumOrder: Number(zoneForm.minimumOrder),
            status: zoneForm.status,
        };

        if (editingId) {
            setZones((previous) =>
                previous.map((zone) =>
                    zone.id === editingId
                        ? newZone
                        : zone
                )
            );
        } else {
            setZones((previous) => [
                newZone,
                ...previous,
            ]);
        }

        closeModal();
    };


    const handleSlotSubmit = (event) => {
        event.preventDefault();

        if (
            !slotForm.name.trim() ||
            !slotForm.startTime ||
            !slotForm.endTime ||
            !slotForm.maxOrders
        ) {
            alert("Please fill all required fields.");
            return;
        }

        if (slotForm.endTime <= slotForm.startTime) {
            alert("End time must be after start time.");
            return;
        }

        const newSlot = {
            id: editingId || Date.now(),
            name: slotForm.name.trim(),
            startTime: slotForm.startTime,
            endTime: slotForm.endTime,
            maxOrders: Number(slotForm.maxOrders),
            status: slotForm.status,
        };

        if (editingId) {
            setSlots((previous) =>
                previous.map((slot) =>
                    slot.id === editingId
                        ? newSlot
                        : slot
                )
            );
        } else {
            setSlots((previous) => [
                newSlot,
                ...previous,
            ]);
        }

        closeModal();
    };


    const toggleStatus = (id) => {
        if (activeTab === "zones") {
            setZones((previous) =>
                previous.map((zone) =>
                    zone.id === id
                        ? {
                            ...zone,
                            status:
                                zone.status === "active"
                                    ? "inactive"
                                    : "active",
                        }
                        : zone
                )
            );
        } else {
            setSlots((previous) =>
                previous.map((slot) =>
                    slot.id === id
                        ? {
                            ...slot,
                            status:
                                slot.status === "active"
                                    ? "inactive"
                                    : "active",
                        }
                        : slot
                )
            );
        }
    };


    const deleteItem = (id) => {
        const itemName = currentData.find(
            (item) => item.id === id
        )?.name;

        const confirmed = window.confirm(
            `Are you sure you want to delete "${itemName}"?`
        );

        if (!confirmed) {
            return;
        }

        if (activeTab === "zones") {
            setZones((previous) =>
                previous.filter(
                    (zone) => zone.id !== id
                )
            );
        } else {
            setSlots((previous) =>
                previous.filter(
                    (slot) => slot.id !== id
                )
            );
        }
    };


    const clearSearch = () => {
        setSearchTerm("");
    };


    return (
        <div className="admin-delivery-page">
            <div className="admin-delivery-container">

                {/* Back Button */}
                <div className="admin-delivery-back-wrapper">
                    <button
                        type="button"
                        className="admin-delivery-back-button"
                        onClick={() =>
                            navigate("/admin/dashboard")
                        }
                    >
                        <ArrowLeft size={17} />
                        Back to Dashboard
                    </button>
                </div>


                {/* Header */}
                <div className="admin-delivery-header">
                    <div>
                        <p className="admin-delivery-eyebrow">
                            Logistics Management
                        </p>

                        <h1>Delivery Management</h1>

                        <p className="admin-delivery-header-text">
                            Manage delivery zones, charges and
                            delivery time slots.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-delivery-add-button"
                        onClick={openAddModal}
                    >
                        <Plus size={18} />
                        Add{" "}
                        {activeTab === "zones"
                            ? "Delivery Zone"
                            : "Delivery Slot"}
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
                            <strong>
                                {stats.totalZones}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-delivery-stat-card">
                        <div className="admin-delivery-stat-icon">
                            <MapPin size={21} />
                        </div>

                        <div>
                            <span>Active Zones</span>
                            <strong>
                                {stats.activeZones}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-delivery-stat-card">
                        <div className="admin-delivery-stat-icon">
                            <Clock3 size={21} />
                        </div>

                        <div>
                            <span>Total Slots</span>
                            <strong>
                                {stats.totalSlots}
                            </strong>
                        </div>
                    </div>


                    <div className="admin-delivery-stat-card">
                        <div className="admin-delivery-stat-icon">
                            <Truck size={21} />
                        </div>

                        <div>
                            <span>Active Slots</span>
                            <strong>
                                {stats.activeSlots}
                            </strong>
                        </div>
                    </div>

                </div>


                {/* Tabs */}
                <div className="admin-delivery-tabs">

                    <button
                        type="button"
                        className={
                            activeTab === "zones"
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setActiveTab("zones");
                            setSearchTerm("");
                            setStatusFilter("all");
                        }}
                    >
                        <MapPin size={16} />
                        Delivery Zones
                    </button>


                    <button
                        type="button"
                        className={
                            activeTab === "slots"
                                ? "active"
                                : ""
                        }
                        onClick={() => {
                            setActiveTab("slots");
                            setSearchTerm("");
                            setStatusFilter("all");
                        }}
                    >
                        <Clock3 size={16} />
                        Delivery Slots
                    </button>

                </div>


                {/* Toolbar */}
                <div className="admin-delivery-toolbar">

                    <div className="admin-delivery-search">
                        <Search size={17} />

                        <input
                            type="text"
                            placeholder={
                                activeTab === "zones"
                                    ? "Search zone or area..."
                                    : "Search delivery slot..."
                            }
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(
                                    event.target.value
                                )
                            }
                        />

                        {searchTerm && (
                            <button
                                type="button"
                                className="admin-delivery-clear-search"
                                onClick={clearSearch}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>


                    <div className="admin-delivery-filter">
                        <select
                            value={statusFilter}
                            onChange={(event) =>
                                setStatusFilter(
                                    event.target.value
                                )
                            }
                        >
                            <option value="all">
                                All Status
                            </option>

                            <option value="active">
                                Active
                            </option>

                            <option value="inactive">
                                Inactive
                            </option>
                        </select>

                        <ChevronDown size={16} />
                    </div>

                </div>


                {/* Table */}
                <div className="admin-delivery-table-card">

                    <div className="admin-delivery-table-header">
                        <div>
                            <h2>
                                {activeTab === "zones"
                                    ? "Delivery Zones"
                                    : "Delivery Slots"}
                            </h2>

                            <p>
                                {filteredData.length} record
                                {filteredData.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
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
                                        filteredData.map(
                                            (zone, index) => (
                                                <tr
                                                    key={zone.id}
                                                >
                                                    <td className="delivery-number">
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        <div className="delivery-zone-info">
                                                            <div className="delivery-zone-icon">
                                                                <MapPin
                                                                    size={16}
                                                                />
                                                            </div>

                                                            <strong>
                                                                {
                                                                    zone.name
                                                                }
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="delivery-area-text">
                                                            {
                                                                zone.areas
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong className="delivery-amount">
                                                            ₹
                                                            {zone.deliveryCharge.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span className="delivery-minimum">
                                                            ₹
                                                            {zone.minimumOrder.toLocaleString(
                                                                "en-IN"
                                                            )}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`delivery-status-button ${zone.status}`}
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    zone.id
                                                                )
                                                            }
                                                        >
                                                            {zone.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </button>
                                                    </td>

                                                    <td>
                                                        <div className="delivery-actions">

                                                            <button
                                                                type="button"
                                                                className="delivery-edit-button"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        zone
                                                                    )
                                                                }
                                                            >
                                                                <Edit
                                                                    size={15}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delivery-delete-button"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    deleteItem(
                                                                        zone.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={15}
                                                                />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="7"
                                                className="delivery-empty-state"
                                            >
                                                <MapPin
                                                    size={35}
                                                />

                                                <h3>
                                                    No delivery
                                                    zones found
                                                </h3>

                                                <p>
                                                    Try changing your
                                                    search or filter.
                                                </p>
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
                                        filteredData.map(
                                            (slot, index) => (
                                                <tr
                                                    key={slot.id}
                                                >
                                                    <td className="delivery-number">
                                                        {index + 1}
                                                    </td>

                                                    <td>
                                                        <div className="delivery-zone-info">
                                                            <div className="delivery-zone-icon">
                                                                <Clock3
                                                                    size={16}
                                                                />
                                                            </div>

                                                            <strong>
                                                                {
                                                                    slot.name
                                                                }
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="delivery-time-cell">
                                                            <strong>
                                                                {
                                                                    slot.startTime
                                                                }
                                                            </strong>

                                                            <span>
                                                                to
                                                            </span>

                                                            <strong>
                                                                {
                                                                    slot.endTime
                                                                }
                                                            </strong>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="delivery-orders-limit">
                                                            {
                                                                slot.maxOrders
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <button
                                                            type="button"
                                                            className={`delivery-status-button ${slot.status}`}
                                                            onClick={() =>
                                                                toggleStatus(
                                                                    slot.id
                                                                )
                                                            }
                                                        >
                                                            {slot.status ===
                                                            "active"
                                                                ? "Active"
                                                                : "Inactive"}
                                                        </button>
                                                    </td>

                                                    <td>
                                                        <div className="delivery-actions">

                                                            <button
                                                                type="button"
                                                                className="delivery-edit-button"
                                                                title="Edit"
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        slot
                                                                    )
                                                                }
                                                            >
                                                                <Edit
                                                                    size={15}
                                                                />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="delivery-delete-button"
                                                                title="Delete"
                                                                onClick={() =>
                                                                    deleteItem(
                                                                        slot.id
                                                                    )
                                                                }
                                                            >
                                                                <Trash2
                                                                    size={15}
                                                                />
                                                            </button>

                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="delivery-empty-state"
                                            >
                                                <Clock3
                                                    size={35}
                                                />

                                                <h3>
                                                    No delivery
                                                    slots found
                                                </h3>

                                                <p>
                                                    Try changing your
                                                    search or filter.
                                                </p>
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
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeModal();
                        }
                    }}
                >
                    <div className="admin-delivery-modal">

                        <div className="admin-delivery-modal-header">

                            <div>
                                <p>
                                    {editingId
                                        ? "Update"
                                        : "Create"}
                                </p>

                                <h2>
                                    {editingId
                                        ? "Edit "
                                        : "Add "}
                                    {activeTab === "zones"
                                        ? "Delivery Zone"
                                        : "Delivery Slot"}
                                </h2>
                            </div>

                            <button
                                type="button"
                                className="admin-delivery-modal-close"
                                onClick={closeModal}
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
                                    <label>
                                        Zone Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Pune Central"
                                        value={zoneForm.name}
                                        onChange={
                                            handleZoneChange
                                        }
                                    />
                                </div>


                                <div className="delivery-form-group">
                                    <label>
                                        Areas / Pincodes
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="areas"
                                        placeholder="Enter areas, pincodes or localities"
                                        value={zoneForm.areas}
                                        onChange={
                                            handleZoneChange
                                        }
                                    />
                                </div>


                                <div className="delivery-form-two-column">

                                    <div className="delivery-form-group">
                                        <label>
                                            Delivery Charge
                                            <span>*</span>
                                        </label>

                                        <div className="delivery-input-prefix">
                                            <span>₹</span>

                                            <input
                                                type="number"
                                                name="deliveryCharge"
                                                min="0"
                                                placeholder="40"
                                                value={
                                                    zoneForm.deliveryCharge
                                                }
                                                onChange={
                                                    handleZoneChange
                                                }
                                            />
                                        </div>
                                    </div>


                                    <div className="delivery-form-group">
                                        <label>
                                            Minimum Order
                                            <span>*</span>
                                        </label>

                                        <div className="delivery-input-prefix">
                                            <span>₹</span>

                                            <input
                                                type="number"
                                                name="minimumOrder"
                                                min="0"
                                                placeholder="299"
                                                value={
                                                    zoneForm.minimumOrder
                                                }
                                                onChange={
                                                    handleZoneChange
                                                }
                                            />
                                        </div>
                                    </div>

                                </div>


                                <div className="delivery-form-group">
                                    <label>
                                        Status
                                    </label>

                                    <div className="delivery-select-wrapper">
                                        <select
                                            name="status"
                                            value={
                                                zoneForm.status
                                            }
                                            onChange={
                                                handleZoneChange
                                            }
                                        >
                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                        />
                                    </div>
                                </div>


                                <div className="delivery-info-box">
                                    <strong>
                                        Delivery zone information
                                    </strong>

                                    <p>
                                        Define the areas served by
                                        this zone and configure
                                        the delivery charge and
                                        minimum order value.
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

                                    <button
                                        type="submit"
                                        className="delivery-save-button"
                                    >
                                        {editingId
                                            ? "Update Zone"
                                            : "Save Zone"}
                                    </button>

                                </div>

                            </form>
                        ) : (
                            <form
                                className="admin-delivery-form"
                                onSubmit={handleSlotSubmit}
                            >

                                <div className="delivery-form-group">
                                    <label>
                                        Slot Name
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Morning Slot"
                                        value={slotForm.name}
                                        onChange={
                                            handleSlotChange
                                        }
                                    />
                                </div>


                                <div className="delivery-form-two-column">

                                    <div className="delivery-form-group">
                                        <label>
                                            Start Time
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="time"
                                            name="startTime"
                                            value={
                                                slotForm.startTime
                                            }
                                            onChange={
                                                handleSlotChange
                                            }
                                        />
                                    </div>


                                    <div className="delivery-form-group">
                                        <label>
                                            End Time
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="time"
                                            name="endTime"
                                            value={
                                                slotForm.endTime
                                            }
                                            onChange={
                                                handleSlotChange
                                            }
                                        />
                                    </div>

                                </div>


                                <div className="delivery-form-group">
                                    <label>
                                        Maximum Orders
                                        <span>*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="maxOrders"
                                        min="1"
                                        placeholder="25"
                                        value={
                                            slotForm.maxOrders
                                        }
                                        onChange={
                                            handleSlotChange
                                        }
                                    />
                                </div>


                                <div className="delivery-form-group">
                                    <label>
                                        Status
                                    </label>

                                    <div className="delivery-select-wrapper">
                                        <select
                                            name="status"
                                            value={
                                                slotForm.status
                                            }
                                            onChange={
                                                handleSlotChange
                                            }
                                        >
                                            <option value="active">
                                                Active
                                            </option>

                                            <option value="inactive">
                                                Inactive
                                            </option>
                                        </select>

                                        <ChevronDown
                                            size={16}
                                        />
                                    </div>
                                </div>


                                <div className="delivery-info-box">
                                    <strong>
                                        Delivery slot information
                                    </strong>

                                    <p>
                                        Configure the delivery
                                        time window and the
                                        maximum number of orders
                                        that can be accepted.
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

                                    <button
                                        type="submit"
                                        className="delivery-save-button"
                                    >
                                        {editingId
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