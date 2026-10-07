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

function Addresses() {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "John Doe",
      mobile: "9876543210",
      address: "Flat 101, Green Residency, Main Road",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "411001",
      isDefault: true,
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleAddAddress = (event) => {
    event.preventDefault();

    const newAddress = {
      id: Date.now(),
      ...form,
      isDefault: addresses.length === 0,
    };

    setAddresses((currentAddresses) => [
      ...currentAddresses,
      newAddress,
    ]);

    setForm(emptyForm);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setAddresses((currentAddresses) =>
      currentAddresses.filter((address) => address.id !== id)
    );
  };

  const handleSetDefault = (id) => {
    setAddresses((currentAddresses) =>
      currentAddresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
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
            Manage your delivery locations and choose where you want
            your groceries delivered.
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
              onClick={() => setShowForm((current) => !current)}
            >
              {showForm ? (
                <>
                  <X size={17} />
                  Cancel
                </>
              ) : (
                <>
                  <Plus size={17} />
                  Add New Address
                </>
              )}
            </button>
          </div>

          {showForm && (
            <form
              className="address-form"
              onSubmit={handleAddAddress}
            >
              <div className="address-form-header">
                <div>
                  <span>NEW ADDRESS</span>
                  <h2>Add delivery address</h2>
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
                    required
                  />
                </label>

                <label>
                  <span>Mobile Number</span>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter mobile number"
                    type="tel"
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
                    rows="3"
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
                    maxLength="6"
                    required
                  />
                </label>
              </div>

              <div className="address-form-footer">
                <p>
                  <MapPin size={15} />
                  Your PIN code will be used to check delivery
                  availability.
                </p>

                <button
                  type="submit"
                  className="save-address-button"
                >
                  Save Address
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
                Save an address to make your next grocery order
                faster and easier.
              </p>

              <button
                type="button"
                onClick={() => setShowForm(true)}
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
                      {address.city}, {address.state} -{" "}
                      {address.pinCode}
                    </p>
                  </div>

                  <div className="address-actions">
                    {!address.isDefault && (
                      <button
                        type="button"
                        onClick={() =>
                          handleSetDefault(address.id)
                        }
                      >
                        <Check size={15} />
                        Set as Default
                      </button>
                    )}

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