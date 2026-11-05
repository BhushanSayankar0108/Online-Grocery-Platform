
import { useEffect, useState } from "react";
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
  RotateCcw,
} from "lucide-react";

/* =========================================================
   API CONFIGURATION
========================================================= */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

/* =========================================================
   ACCOUNT COMPONENT
========================================================= */

function Account({ customer, onLogout, onCustomerUpdate }) {
  const navigate = useNavigate();

  const [name, setName] = useState(customer?.name || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [mobile, setMobile] = useState(customer?.mobile || "");

  const [editing, setEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =======================================================
     FETCH CUSTOMER PROFILE
  ======================================================= */

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!customer?.token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await fetch(
          `${API_BASE_URL}/api/customers/profile`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${customer.token}`,
            },
            cache: "no-store",
          }
        );

        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          onLogout?.();
          navigate("/login", { replace: true });
          return;
        }

        if (!response.ok || !data.success || !data.customer) {
          throw new Error(
            data.message || "Unable to load your profile."
          );
        }

        if (isMounted) {
          const profile = data.customer;

          setName(profile.name || "");
          setEmail(profile.email || "");
          setMobile(profile.mobile || "");

          onCustomerUpdate?.(profile);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Customer profile error:", error);

          setErrorMessage(
            error instanceof TypeError
              ? "Unable to connect to the server. Please try again."
              : error.message || "Unable to load your profile."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [customer?.token, onLogout, onCustomerUpdate, navigate]);

  /* =======================================================
     SAVE PROFILE
  ======================================================= */

  const handleSave = async (event) => {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    if (!customer?.token) {
      setErrorMessage(
        "Please log in again to update your profile."
      );
      return;
    }

    const normalizedName = name.trim();
    const normalizedMobile = mobile.trim();

    if (
      normalizedName.length < 2 ||
      normalizedName.length > 100
    ) {
      setErrorMessage(
        "Name must be between 2 and 100 characters."
      );
      return;
    }

    if (!/^\+?[0-9]{10,15}$/.test(normalizedMobile)) {
      setErrorMessage(
        "Enter a valid mobile number containing 10 to 15 digits."
      );
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${customer.token}`,
          },
          body: JSON.stringify({
            name: normalizedName,
            mobile: normalizedMobile,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        onLogout?.();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok || !data.success || !data.customer) {
        throw new Error(
          data.message || "Unable to update your profile."
        );
      }

      const updatedProfile = data.customer;

      setName(updatedProfile.name || "");
      setEmail(updatedProfile.email || "");
      setMobile(updatedProfile.mobile || "");

      onCustomerUpdate?.(updatedProfile);

      setEditing(false);
      setSuccessMessage(
        "Your profile has been updated successfully."
      );
    } catch (error) {
      console.error("Customer profile update error:", error);

      setErrorMessage(
        error instanceof TypeError
          ? "Unable to connect to the server. Please try again."
          : error.message || "Unable to save your details."
      );
    } finally {
      setIsSaving(false);
    }
  };

  /* =======================================================
     CANCEL EDITING
  ======================================================= */

  const handleCancel = () => {
    setName(customer?.name || "");
    setEmail(customer?.email || "");
    setMobile(customer?.mobile || "");

    setEditing(false);
    setErrorMessage("");
    setSuccessMessage("");
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = () => {
    onLogout?.();
    navigate("/login", { replace: true });
  };

  /* =======================================================
     ACCOUNT QUICK ACCESS LINKS
  ======================================================= */

  const accountLinks = [
    {
      title: "My Orders",
      description: "View your previous and current orders",
      icon: <Package size={21} strokeWidth={1.8} />,
      path: "/orders",
    },
    {
      title: "My Returns",
      description: "Track your return and refund requests",
      icon: <RotateCcw size={21} strokeWidth={1.8} />,
      path: "/my-returns",
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

  /* =======================================================
     NOT LOGGED IN
  ======================================================= */

  if (!customer) {
    return (
      <main className="account-page">
        <div className="account-container">
          <header className="account-header">
            <span className="account-eyebrow">
              YOUR ACCOUNT
            </span>

            <h1>Please log in first.</h1>

            <p className="account-intro">
              Log in to view and manage your account information.
            </p>

            <Link to="/login" className="account-save-button">
              Login / Sign Up
            </Link>
          </header>
        </div>
      </main>
    );
  }

  /* =======================================================
     MAIN ACCOUNT PAGE
  ======================================================= */

  return (
    <main className="account-page">
      <div className="account-container">

        {/* PAGE HEADER */}

        <header className="account-header">
          <Link to="/" className="shop-home-link">
            ← Back to Home
          </Link>

          <p className="account-breadcrumb">
            Home / Account
          </p>

          <span className="account-eyebrow">
            ACCOUNT
          </span>

          <h1>
            Welcome back, {(name || "Customer").split(" ")[0]}.
          </h1>

          <p className="account-intro">
            Manage your profile, orders and account preferences.
          </p>
        </header>

        <div className="account-layout">

          {/* PROFILE CARD */}

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

              {!editing && !isLoading && (
                <button
                  type="button"
                  className="account-edit-button"
                  onClick={() => {
                    setErrorMessage("");
                    setSuccessMessage("");
                    setEditing(true);
                  }}
                >
                  <Pencil size={15} />
                  Edit
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="account-details">
                <p>Loading your profile...</p>
              </div>
            ) : (
              <>
                {errorMessage && (
                  <p
                    role="alert"
                    aria-live="polite"
                    style={{
                      color: "#dc2626",
                      fontSize: "14px",
                      margin: "12px 0",
                    }}
                  >
                    {errorMessage}
                  </p>
                )}

                {successMessage && (
                  <p
                    role="status"
                    aria-live="polite"
                    style={{
                      color: "#15803d",
                      fontSize: "14px",
                      margin: "12px 0",
                    }}
                  >
                    {successMessage}
                  </p>
                )}

                {editing ? (
                  <form
                    onSubmit={handleSave}
                    className="account-form"
                  >
                    <label>
                      <span>Full Name</span>

                      <div className="account-input-wrapper">
                        <User size={17} />

                        <input
                          type="text"
                          value={name}
                          onChange={(event) =>
                            setName(event.target.value)
                          }
                          minLength={2}
                          maxLength={100}
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
                          readOnly
                          disabled
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
                          onChange={(event) =>
                            setMobile(event.target.value)
                          }
                          maxLength={16}
                          required
                        />
                      </div>
                    </label>

                    <div className="account-form-actions">
                      <button
                        type="button"
                        className="account-cancel-button"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X size={16} />
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="account-save-button"
                        disabled={isSaving}
                      >
                        <Check size={16} />

                        {isSaving
                          ? "Saving..."
                          : "Save Changes"}
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

                      <strong>
                        {name || "Not provided"}
                      </strong>
                    </div>

                    <div className="account-detail-item">
                      <span>
                        <Mail size={16} />
                        Email Address
                      </span>

                      <strong>
                        {email || "Not provided"}
                      </strong>
                    </div>

                    <div className="account-detail-item">
                      <span>
                        <Phone size={16} />
                        Mobile Number
                      </span>

                      <strong>
                        {mobile || "Not provided"}
                      </strong>
                    </div>

                  </div>
                )}
              </>
            )}
          </section>

          {/* QUICK ACCESS SECTION */}

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
                  <div className="account-menu-icon">
                    {item.icon}
                  </div>

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

            {/* LOGOUT */}

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
