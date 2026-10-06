import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Account() {
  const navigate = useNavigate();

  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [mobile, setMobile] = useState("9876543210");
  const [editing, setEditing] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setEditing(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <main className="account-page">
      <div className="account-header">
        <Link to="/" className="shop-home-link">
          ← Back to Home
        </Link>

        <p>Home / Account</p>
        <h1>My Account</h1>
        <p>Manage your profile and account settings.</p>
      </div>

      <div className="account-content">
        <section className="account-profile-card">
          <div className="account-card-header">
            <div>
              <p className="account-label">PROFILE</p>
              <h2>Personal Information</h2>
            </div>

            <button
              className="account-edit-button"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="account-form">
              <label>
                Full Name
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="account-save-button">
                Save Changes
              </button>
            </form>
          ) : (
            <div className="account-details">
              <div>
                <span>Full Name</span>
                <strong>{name}</strong>
              </div>

              <div>
                <span>Email Address</span>
                <strong>{email}</strong>
              </div>

              <div>
                <span>Mobile Number</span>
                <strong>{mobile}</strong>
              </div>
            </div>
          )}
        </section>

        <section className="account-menu">
          <Link to="/orders" className="account-menu-item">
            <div>
              <strong>My Orders</strong>
              <span>View your previous and current orders</span>
            </div>
            <span>→</span>
          </Link>

          <Link to="/addresses" className="account-menu-item">
            <div>
              <strong>Saved Addresses</strong>
              <span>Manage your delivery addresses</span>
            </div>
            <span>→</span>
          </Link>

          <Link to="/wishlist" className="account-menu-item">
            <div>
              <strong>My Wishlist</strong>
              <span>View products you saved</span>
            </div>
            <span>→</span>
          </Link>

          <Link to="/notifications" className="account-menu-item">
            <div>
              <strong>Notifications</strong>
              <span>View your latest updates</span>
            </div>
            <span>→</span>
          </Link>

          <button className="account-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>
      </div>
    </main>
  );
}

export default Account;