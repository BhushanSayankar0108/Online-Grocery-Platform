
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Home,
  Briefcase,
  MapPinned,
  Plus,
  Trash2,
  Check,
  X,
  ArrowRight,
  Pencil,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/$/, "");

const ADDRESSES_API = `${API_BASE_URL}/api/customers/addresses`;

const emptyForm = {
  type: "Home",
  name: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
};

// Get customer session from localStorage or sessionStorage.
function getCustomerSession(customerProp = null) {
  if (customerProp?.token) {
    return customerProp;
  }

  for (const storage of [localStorage, sessionStorage]) {
    try {
      const session = JSON.parse(
        storage.getItem("customerSession") || "null"
      );

      if (session?.token) {
        return session;
      }
    } catch {
      // Continue checking the other storage.
    }
  }

  return null;
}

// Convert backend address type to frontend type.
function formatAddressType(type) {
  const types = {
    home: "Home",
    office: "Work",
    other: "Other",
  };

  return types[type?.toLowerCase()] || "Home";
}

// Convert frontend form data to backend payload.
function prepareAddressPayload(form) {
  const typeMapping = {
    Home: "home",
    Work: "office",
    Other: "other",
  };

  return {
    fullName: form.name.trim(),
    mobile: form.mobile.trim(),
    addressLine1: form.address.trim(),
    addressLine2: "",
    city: form.city.trim(),
    state: form.state.trim(),
    postalCode: form.pinCode.trim(),
    landmark: "",
    addressType: typeMapping[form.type] || "home",
  };
}

// Convert backend address to frontend format.
function formatAddress(address) {
  return {
    id: address._id || address.id,
    type: formatAddressType(address.addressType),
    name: address.fullName || "",
    mobile: address.mobile || "",
    address: [
      address.addressLine1,
      address.addressLine2,
      address.landmark,
    ]
      .filter(Boolean)
      .join(", "),
    city: address.city || "",
    state: address.state || "",
    pinCode: address.postalCode || "",
    isDefault: Boolean(address.isDefault),
  };
}

// Read backend error message.
async function getErrorMessage(response) {
  try {
    const data = await response.json();
    return data.message || "Something went wrong. Please try again.";
  } catch {
    return "Something went wrong. Please try again.";
  }
}

function Addresses({ customer = null }) {
  const session = getCustomerSession(customer);
  const token = session?.token || "";

  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("error");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);

  // Display success or error message.
  const showMessage = (text, type = "error") => {
    setMessage(text);
    setMessageType(type);
  };

  // Authorization headers.
  const getAuthHeaders = (includeJson = false) => {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    return headers;
  };

  // Fetch addresses from MongoDB.
  // State updates happen after the asynchronous API response.
  useEffect(() => {
    if (!token) {
      return;
    }

    let ignore = false;

    const loadAddresses = async () => {
      try {
        const response = await fetch(ADDRESSES_API, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const data = await response.json();

        if (!ignore) {
          setAddresses(
            Array.isArray(data.addresses)
              ? data.addresses.map(formatAddress)
              : []
          );
        }
      } catch (error) {
        if (!ignore) {
          showMessage(
            error.message || "Unable to load addresses."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadAddresses();

    return () => {
      ignore = true;
    };
  }, [token]);

  // Refresh addresses after add, edit, delete or default change.
  const refreshAddresses = async () => {
    const response = await fetch(ADDRESSES_API, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response));
    }

    const data = await response.json();

    setAddresses(
      Array.isArray(data.addresses)
        ? data.addresses.map(formatAddress)
        : []
    );
  };

  // Handle form changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // Open add or edit form.
  const handleOpenForm = (address = null) => {
    if (address) {
      setForm({
        type: address.type,
        name: address.name,
        mobile: address.mobile,
        address: address.address,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
      });

      setEditingId(address.id);
    } else {
      setForm({ ...emptyForm });
      setEditingId(null);
    }

    setShowForm(true);
    setMessage("");
  };

  // Close form.
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setMessage("");
  };

  // Add or update address.
  const handleSaveAddress = async (event) => {
    event.preventDefault();

    if (!token) {
      showMessage("Please log in before saving an address.");
      return;
    }

    const pinCode = form.pinCode.trim();
    const mobile = form.mobile.trim();

    if (!/^\d{6}$/.test(pinCode)) {
      showMessage("Enter a valid 6-digit PIN code.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      showMessage(
        "Enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    const payload = prepareAddressPayload(form);

    if (
      !payload.fullName ||
      !payload.addressLine1 ||
      !payload.city ||
      !payload.state
    ) {
      showMessage("Please fill in all required fields.");
      return;
    }

    const isEditing = Boolean(editingId);

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        isEditing
          ? `${ADDRESSES_API}/${editingId}`
          : ADDRESSES_API,
        {
          method: isEditing ? "PUT" : "POST",
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            ...payload,
            ...(!isEditing && addresses.length === 0
              ? { isDefault: true }
              : {}),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await response.json();

      await refreshAddresses();

      handleCancelForm();

      showMessage(
        isEditing
          ? "Address updated successfully."
          : "Address added successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.message || "Unable to save address."
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete saved address.
  const handleDelete = async (id) => {
    if (!token) {
      showMessage("Please log in to manage addresses.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this saved address?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      setMessage("");

      const response = await fetch(
        `${ADDRESSES_API}/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await response.json();
      await refreshAddresses();

      showMessage(
        "Address deleted successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.message || "Unable to delete address."
      );
    } finally {
      setActionId(null);
    }
  };

  // Set default address.
  const handleSetDefault = async (id) => {
    if (!token) {
      showMessage("Please log in to manage addresses.");
      return;
    }

    try {
      setActionId(id);
      setMessage("");

      const response = await fetch(
        `${ADDRESSES_API}/${id}/default`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      await response.json();
      await refreshAddresses();

      showMessage(
        "Default address updated successfully.",
        "success"
      );
    } catch (error) {
      showMessage(
        error.message || "Unable to update default address."
      );
    } finally {
      setActionId(null);
    }
  };

  // Address type icon.
  const getAddressIcon = (type) => {
    if (type === "Work") {
      return <Briefcase size={18} strokeWidth={1.8} />;
    }

    if (type === "Other") {
      return <MapPinned size={18} strokeWidth={1.8} />;
    }

    return <Home size={18} strokeWidth={1.8} />;
  };

  // Login required screen.
  if (!token) {
    return (
      <main className="addresses-page">
        <div className="addresses-container">
          <header className="addresses-header">
            <Link to="/account" className="shop-home-link">
              ← Back to Account
            </Link>

            <span className="addresses-eyebrow">
              DELIVERY DETAILS
            </span>

            <h1>Log in to manage addresses.</h1>

            <p className="addresses-intro">
              Your saved delivery addresses belong to your customer account.
            </p>

            <Link to="/login" className="add-address-button">
              Login / Sign Up
            </Link>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="addresses-page">
      <div className="addresses-container">
        <header className="addresses-header">
          <Link to="/account" className="shop-home-link">
            ← Back to Account
          </Link>

          <p className="addresses-breadcrumb">
            Home / Account / Addresses
          </p>

          <span className="addresses-eyebrow">
            DELIVERY DETAILS
          </span>

          <h1>Your saved addresses.</h1>

          <p className="addresses-intro">
            Add your address once and select it during checkout.
          </p>
        </header>

        <div className="addresses-content">
          <div className="addresses-top">
            <div>
              <span>SAVED LOCATIONS</span>
              <h2>Your Addresses</h2>
            </div>

            <button
              type="button"
              className="add-address-button"
              onClick={() =>
                showForm
                  ? handleCancelForm()
                  : handleOpenForm()
              }
              disabled={saving}
            >
              {showForm ? (
                <X size={17} />
              ) : (
                <Plus size={17} />
              )}

              {showForm ? "Cancel" : "Add New Address"}
            </button>
          </div>

          {message && (
            <p
              role="status"
              className="address-message"
              style={{
                color:
                  messageType === "success"
                    ? "#16834a"
                    : "#c0392b",
              }}
            >
              {message}
            </p>
          )}

          {showForm && (
            <form
              className="address-form"
              onSubmit={handleSaveAddress}
            >
              <div className="address-form-header">
                <div>
                  <span>
                    {editingId ? "EDIT ADDRESS" : "NEW ADDRESS"}
                  </span>

                  <h2>
                    {editingId
                      ? "Update address"
                      : "Add delivery address"}
                  </h2>
                </div>

                <MapPin size={22} />
              </div>

              <div className="address-type">
                <span className="address-field-title">
                  Address type
                </span>

                <div className="address-type-options">
                  {["Home", "Work", "Other"].map((type) => (
                    <label
                      className={`address-type-option ${
                        form.type === type ? "active" : ""
                      }`}
                      key={type}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={form.type === type}
                        onChange={handleChange}
                      />

                      {getAddressIcon(type)}
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="address-form-grid">
                <label>
                  <span>Full Name</span>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  <span>Mobile Number</span>

                  <input
                    name="mobile"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    required
                  />
                </label>

                <label className="address-full-width">
                  <span>Full Address</span>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="House / flat, building, street and area"
                    rows={3}
                    maxLength={200}
                    required
                  />
                </label>

                <label>
                  <span>City</span>

                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  <span>State</span>

                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    maxLength={100}
                    required
                  />
                </label>

                <label>
                  <span>PIN Code</span>

                  <input
                    name="pinCode"
                    value={form.pinCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN"
                    inputMode="numeric"
                    maxLength={6}
                    required
                  />
                </label>
              </div>

              <div className="address-form-footer">
                <p>
                  <MapPin size={15} />
                  Your PIN code can be used to check delivery availability.
                </p>

                <button
                  type="submit"
                  className="save-address-button"
                  disabled={saving}
                >
                  <Check size={17} />

                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Save Address"}

                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="addresses-empty">
              <p>Loading your saved addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="addresses-empty">
              <div className="addresses-empty-icon">
                <MapPin size={30} />
              </div>

              <span>NO SAVED ADDRESSES</span>

              <h2>Add your first delivery address</h2>

              <p>
                You don't have any saved addresses yet. Add one to make
                checkout faster.
              </p>

              <button
                type="button"
                onClick={() => handleOpenForm()}
                className="add-address-button"
              >
                <Plus size={17} />
                Add Address
              </button>
            </div>
          ) : (
            <div className="addresses-list">
              {addresses.map((address) => (
                <article
                  className={`address-card ${
                    address.isDefault ? "default" : ""
                  }`}
                  key={address.id}
                >
                  <div className="address-card-top">
                    <div className="address-card-type">
                      <div className="address-type-icon">
                        {getAddressIcon(address.type)}
                      </div>

                      <div>
                        <strong>{address.type}</strong>

                        {address.isDefault && (
                          <span className="default-badge">
                            <Check size={13} />
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="address-card-details">
                    <h3>{address.name}</h3>

                    <p className="address-mobile">
                      {address.mobile}
                    </p>

                    <p>{address.address}</p>

                    <p>
                      {address.city}, {address.state} - {address.pinCode}
                    </p>
                  </div>

                  <div className="address-actions">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(address.id)}
                        disabled={actionId === address.id}
                      >
                        <Check size={15} />
                        Set as Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenForm(address)}
                      disabled={
                        saving || actionId === address.id
                      }
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-address"
                      onClick={() => handleDelete(address.id)}
                      disabled={actionId === address.id}
                    >
                      <Trash2 size={15} />

                      {actionId === address.id
                        ? "Please wait..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Addresses;
