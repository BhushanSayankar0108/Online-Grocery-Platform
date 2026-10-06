import { useState } from "react";
import { Link } from "react-router-dom";

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

  const [form, setForm] = useState({
    type: "Home",
    name: "",
    mobile: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAddress = (e) => {
    e.preventDefault();

    const newAddress = {
      id: Date.now(),
      ...form,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, newAddress]);

    setForm({
      type: "Home",
      name: "",
      mobile: "",
      address: "",
      city: "",
      state: "",
      pinCode: "",
    });

    setShowForm(false);
  };

  const handleDelete = (id) => {
    setAddresses(addresses.filter((address) => address.id !== id));
  };

  const handleSetDefault = (id) => {
    setAddresses(
      addresses.map((address) => ({
        ...address,
        isDefault: address.id === id,
      }))
    );
  };

  return (
    <main className="addresses-page">
      <div className="addresses-header">
        <Link to="/account" className="shop-home-link">
          ← Back to Account
        </Link>

        <p>Home / Account / Addresses</p>

        <h1>Saved Addresses</h1>

        <p>Manage your delivery addresses.</p>
      </div>

      <div className="addresses-content">
        <div className="addresses-top">
          <h2>Your Addresses</h2>

          <button
            className="add-address-button"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add New Address"}
          </button>
        </div>

        {showForm && (
          <form className="address-form" onSubmit={handleAddAddress}>
            <h2>Add New Address</h2>

            <div className="address-type">
              <label>
                <input
                  type="radio"
                  name="type"
                  value="Home"
                  checked={form.type === "Home"}
                  onChange={handleChange}
                />
                Home
              </label>

              <label>
                <input
                  type="radio"
                  name="type"
                  value="Work"
                  checked={form.type === "Work"}
                  onChange={handleChange}
                />
                Work
              </label>

              <label>
                <input
                  type="radio"
                  name="type"
                  value="Other"
                  checked={form.type === "Other"}
                  onChange={handleChange}
                />
                Other
              </label>
            </div>

            <div className="address-form-grid">
              <label>
                Full Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="address-full-width">
                Address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                City
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                State
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                PIN Code
                <input
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>

            <button type="submit" className="save-address-button">
              Save Address
            </button>
          </form>
        )}

        <div className="addresses-list">
          {addresses.length === 0 ? (
            <div className="addresses-empty">
              <div>📍</div>
              <h2>No Saved Addresses</h2>
              <p>Add an address to make checkout faster.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <div className="address-card" key={address.id}>
                <div className="address-card-top">
                  <div>
                    <span className="address-type-badge">
                      {address.type}
                    </span>

                    {address.isDefault && (
                      <span className="default-badge">Default</span>
                    )}
                  </div>
                </div>

                <h3>{address.name}</h3>

                <p>{address.mobile}</p>

                <p>{address.address}</p>

                <p>
                  {address.city}, {address.state} - {address.pinCode}
                </p>

                <div className="address-actions">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set as Default
                    </button>
                  )}

                  <button onClick={() => handleDelete(address.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Addresses;