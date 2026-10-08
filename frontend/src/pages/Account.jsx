import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Heart,
  Bell,
  LogOut,
  ArrowRight,
  Pencil,
  Check,
  X,
} from "lucide-react";

function Account() {
  const navigate = useNavigate();

  const [name, setName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [mobile, setMobile] = useState("9876543210");
  const [editing, setEditing] = useState(false);

  const handleSave = (event) => {
    event.preventDefault();
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const accountLinks = [
    {
      title: "My Orders",
      description: "View your previous and current orders",
      icon: <Package size={21} strokeWidth={1.8} />,
      path: "/orders",
    },
    {
      title: "Saved Addresses",
      description: "Manage your delivery addresses",
      icon: <MapPin size={21} strokeWidth={1.8} />,
      path: "/addresses",
    },
    {
      title: "My Wishlist",
      description: "View products you saved",
      icon: <Heart size={21} strokeWidth={1.8} />,
      path: "/wishlist",
    },
    {
      title: "Notifications",
      description: "View your latest updates",
      icon: <Bell size={21} strokeWidth={1.8} />,
      path: "/notifications",
    },
  ];

  return (
    <main className="account-page">
      <div className="account-container">
        <header className="account-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="account-breadcrumb">Home / Account</p>

          <span className="account-eyebrow">ACCOUNT</span>

          <h1>Welcome back, {name.split(" ")[0]}.</h1>

          <p className="account-intro">
            Manage your profile, orders and account preferences.
          </p>
        </header>

        <div className="account-layout">
          <section className="account-profile-card">
            <div className="account-card-header">
              <div className="account-profile-heading">
                <div className="account-avatar">
                  <User size={25} strokeWidth={1.8} />
                </div>

                <div>
                  <span>PERSONAL INFORMATION</span>
                  <h2>Your Profile</h2>
                </div>
              </div>

              {!editing && (
                <button
                  type="button"
                  className="account-edit-button"
                  onClick={() => setEditing(true)}
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className="account-form">
                <label>
                  <span>Full Name</span>
                  <div className="account-input-wrapper">
                    <User size={17} />
                    <input
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Email Address</span>
                  <div className="account-input-wrapper">
                    <Mail size={17} />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>Mobile Number</span>
                  <div className="account-input-wrapper">
                    <Phone size={17} />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(event) => setMobile(event.target.value)}
                      required
                    />
                  </div>
                </label>

                <div className="account-form-actions">
                  <button
                    type="button"
                    className="account-cancel-button"
                    onClick={handleCancel}
                  >
                    <X size={16} />
                    Cancel
                  </button>

                  <button type="submit" className="account-save-button">
                    <Check size={16} />
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="account-details">
                <div className="account-detail-item">
                  <span>
                    <User size={16} />
                    Full Name
                  </span>
                  <strong>{name}</strong>
                </div>

                <div className="account-detail-item">
                  <span>
                    <Mail size={16} />
                    Email Address
                  </span>
                  <strong>{email}</strong>
                </div>

                <div className="account-detail-item">
                  <span>
                    <Phone size={16} />
                    Mobile Number
                  </span>
                  <strong>{mobile}</strong>
                </div>
              </div>
            )}
          </section>

          <section className="account-menu-section">
            <div className="account-section-heading">
              <div>
                <span>QUICK ACCESS</span>
                <h2>Manage your account</h2>
              </div>
            </div>

            <div className="account-menu">
              {accountLinks.map((item) => (
                <Link
                  to={item.path}
                  className="account-menu-item"
                  key={item.title}
                >
                  <div className="account-menu-icon">{item.icon}</div>

                  <div className="account-menu-content">
                    <strong>{item.title}</strong>
                    <span>{item.description}</span>
                  </div>

                  <ArrowRight
                    className="account-menu-arrow"
                    size={19}
                  />
                </Link>
              ))}
            </div>

            <button
              type="button"
              className="account-logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />
              Logout
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Account;