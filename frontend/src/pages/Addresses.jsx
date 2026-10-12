import { useState } from "react";
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

const emptyForm = {
  type: "Home",
  name: "",
  mobile: "",
  address: "",
  city: "",
  state: "",
  pinCode: "",
};

function getCustomerEmail() {
  try {
    const customer = JSON.parse(
      localStorage.getItem("customerSession") || "null"
    );
    return customer?.email?.trim().toLowerCase() || "";
  } catch {
    return "";
  }
}

function getStorageKey() {
  const email = getCustomerEmail();
  return email ? `savedAddresses_${email}` : null;
}

function loadAddresses() {
  const key = getStorageKey();
  if (!key) return [];

  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function Addresses() {
  const [addresses, setAddresses] = useState(loadAddresses);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const saveAddresses = (nextAddresses) => {
    const key = getStorageKey();

    if (!key) {
      setMessage("Please log in before saving an address.");
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(nextAddresses));
      setAddresses(nextAddresses);
      setMessage("");
      return true;
    } catch {
      setMessage("Unable to save the address. Please try again.");
      return false;
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleOpenForm = (address = null) => {
    setForm(address ? { ...emptyForm, ...address } : emptyForm);
    setEditingId(address?.id ?? null);
    setShowForm(true);
    setMessage("");
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSaveAddress = (event) => {
    event.preventDefault();

    const pinCode = form.pinCode.trim();
    const mobile = form.mobile.trim();

    if (!/^\d{6}$/.test(pinCode)) {
      setMessage("Enter a valid 6-digit PIN code.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const nextAddress = {
      ...form,
      id: editingId ?? Date.now(),
      name: form.name.trim(),
      mobile,
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode,
      isDefault: editingId
        ? addresses.find((item) => item.id === editingId)?.isDefault ?? false
        : addresses.length === 0,
    };

    let nextAddresses;

    if (editingId) {
      nextAddresses = addresses.map((item) =>
        item.id === editingId ? nextAddress : item
      );
    } else {
      nextAddresses = [...addresses, nextAddress];
    }

    if (saveAddresses(nextAddresses)) {
      handleCancelForm();
    }
  };

  const handleDelete = (id) => {
    const remaining = addresses.filter((item) => item.id !== id);

    if (remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
      remaining[0] = { ...remaining[0], isDefault: true };
    }

    saveAddresses(remaining);
  };

  const handleSetDefault = (id) => {
    const nextAddresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));

    saveAddresses(nextAddresses);
  };

  const getAddressIcon = (type) => {
    if (type === "Work") {
      return <Briefcase size={18} strokeWidth={1.8} />;
    }

    if (type === "Other") {
      return <MapPinned size={18} strokeWidth={1.8} />;
    }

    return <Home size={18} strokeWidth={1.8} />;
  };

  if (!getCustomerEmail()) {
    return (
      <main className="addresses-page">
        <div className="addresses-container">
          <header className="addresses-header">
            <Link to="/account" className="shop-home-link">
              ← Back to Account
            </Link>
            <span className="addresses-eyebrow">DELIVERY DETAILS</span>
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
          <p className="addresses-breadcrumb">Home / Account / Addresses</p>
          <span className="addresses-eyebrow">DELIVERY DETAILS</span>
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
                showForm ? handleCancelForm() : handleOpenForm()
              }
            >
              {showForm ? <X size={17} /> : <Plus size={17} />}
              {showForm ? "Cancel" : "Add New Address"}
            </button>
          </div>

          {message && (
            <p role="status" className="address-message">
              {message}
            </p>
          )}

          {showForm && (
            <form className="address-form" onSubmit={handleSaveAddress}>
              <div className="address-form-header">
                <div>
                  <span>{editingId ? "EDIT ADDRESS" : "NEW ADDRESS"}</span>
                  <h2>{editingId ? "Update address" : "Add delivery address"}</h2>
                </div>
                <MapPin size={22} />
              </div>

              <div className="address-type">
                <span className="address-field-title">Address type</span>
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
                <button type="submit" className="save-address-button">
                  <Check size={17} />
                  {editingId ? "Save Changes" : "Save Address"}
                  <ArrowRight size={17} />
                </button>
              </div>
            </form>
          )}

          {addresses.length === 0 ? (
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
                    <p className="address-mobile">{address.mobile}</p>
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
                      >
                        <Check size={15} />
                        Set as Default
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenForm(address)}
                    >
                      <Pencil size={15} />
                      Edit
                    </button>

                    <button
                      type="button"
                      className="delete-address"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 size={15} />
                      Delete
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