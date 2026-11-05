
import { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

const ALLOWED_ADMIN_ROLES = [
  "admin",
  "super_admin",
  "manager",
  "content_manager",
  "order_manager",
];

const AdminLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!email || !password) {
      setError("Please enter your email address and password.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        throw new Error(
          data.message ||
            (response.status === 401
              ? "Invalid admin email or password."
              : response.status === 403
                ? "Your account is not authorized to access the admin portal."
                : `Login failed. Server returned ${response.status}.`)
        );
      }

      const responseData = data.data || data;

      const token =
        responseData.token ||
        responseData.accessToken ||
        data.token ||
        "";

      const admin =
        responseData.admin ||
        responseData.user ||
        data.admin ||
        data.user ||
        null;

      if (!token || !admin) {
        throw new Error(
          "The server did not return the expected admin login details."
        );
      }

      const role = normalizeRole(
        admin.role || admin.userType || admin.accountType
      );

      if (!ALLOWED_ADMIN_ROLES.includes(role)) {
        console.error("Admin role rejected by frontend:", {
          receivedRole: admin.role,
          normalizedRole: role,
        });

        throw new Error(
          "This account does not have administrator access."
        );
      }

      if (
        admin.status &&
        String(admin.status).trim().toLowerCase() !== "active"
      ) {
        throw new Error("Your administrator account is inactive.");
      }

      const adminUser = {
        ...admin,
        id: admin.id || admin._id || "",
        email: admin.email || email,
        role,
      };

      // Save the authenticated session.
      // Storage errors are handled by the outer catch.
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));
      localStorage.setItem("adminLoggedIn", "true");

      navigate("/admin/dashboard", { replace: true });
    } catch (loginError) {
      console.error("Admin login failed:", loginError);

      if (
        loginError instanceof DOMException &&
        (loginError.name === "QuotaExceededError" ||
          loginError.name === "SecurityError")
      ) {
        setError(
          "Unable to save the login session. Please check browser storage settings."
        );
      } else {
        setError(
          loginError.message ||
            "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div
        className="admin-login-background-glow admin-login-glow-one"
        aria-hidden="true"
      />

      <div
        className="admin-login-background-glow admin-login-glow-two"
        aria-hidden="true"
      />

      <div className="admin-login-container">
        <section
          className="admin-login-card"
          aria-labelledby="admin-login-title"
        >
          <div className="admin-login-accent" />

          <header className="admin-login-header">
            <div className="admin-login-logo">
              <ShieldCheck size={32} />
            </div>

            <h1 id="admin-login-title" className="admin-login-title">
              Admin Portal
            </h1>

            <p className="admin-login-subtitle">
              Online Grocery Platform
            </p>

            <div className="admin-login-divider" />
          </header>

          <div className="admin-login-form-container">
            {error && (
              <div className="admin-login-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="admin-login-group">
                <label
                  htmlFor="admin-email"
                  className="admin-login-label"
                >
                  Email Address
                </label>

                <div className="admin-login-input-wrapper">
                  <span
                    className="admin-login-input-icon"
                    aria-hidden="true"
                  >
                    <Mail size={18} />
                  </span>

                  <input
                    id="admin-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your admin email"
                    autoComplete="username"
                    className="admin-login-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="admin-login-group">
                <label
                  htmlFor="admin-password"
                  className="admin-login-label"
                >
                  Password
                </label>

                <div className="admin-login-input-wrapper">
                  <span
                    className="admin-login-input-icon"
                    aria-hidden="true"
                  >
                    <Lock size={18} />
                  </span>

                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="admin-login-input"
                    required
                    disabled={loading}
                  />

                  <button
                    type="button"
                    className="admin-login-password-toggle"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="admin-login-button"
                disabled={loading}
              >
                {loading ? (
                  <span className="admin-login-loading">
                    <span className="admin-login-spinner" />
                    Signing in...
                  </span>
                ) : (
                  "Sign In to Admin Portal"
                )}
              </button>
            </form>
          </div>

          <footer className="admin-login-footer">
            <p className="admin-login-footer-text">
              Authorized administrators only
            </p>

            <div className="admin-login-footer-status">
              <span className="admin-login-status-dot" />
              Secure administrator access
            </div>

            <Link to="/" className="admin-login-back-link">
              <ArrowLeft size={16} />
              Back to Grocery Store
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default AdminLogin;
