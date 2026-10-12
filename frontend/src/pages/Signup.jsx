import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSignup = (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const mobile = formData.mobile.trim();
    const { password, confirmPassword } = formData;

    if (!name || !email || !mobile || !password || !confirmPassword) {
      alert("Please fill in all fields.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const customers = JSON.parse(
        localStorage.getItem("demoCustomers") || "[]"
      );

      if (!Array.isArray(customers)) {
        alert("Unable to create your account. Please try again.");
        return;
      }

      const existingCustomer = customers.some(
        (customer) => customer.email?.toLowerCase() === email
      );

      if (existingCustomer) {
        alert("An account with this email already exists. Please log in.");
        navigate("/login");
        return;
      }

      customers.push({
        name,
        email,
        mobile,
        password,
      });

      localStorage.setItem("demoCustomers", JSON.stringify(customers));

      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch {
      alert("Unable to save your account. Please try again.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <Link to="/" className="auth-logo">
          <span className="auth-logo-mark">OG</span>
          <span>
            Online Grocery
            <small>Freshness Delivered</small>
          </span>
        </Link>

        <div className="auth-card">
          <div className="auth-heading">
            <span className="auth-eyebrow">GET STARTED</span>
            <h1>Create your account.</h1>
            <p>
              Sign up to shop fresh groceries and everyday essentials.
            </p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            <label>
              <span>Full Name</span>
              <div className="auth-input">
                <User size={17} />
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>
            </label>

            <label>
              <span>Email Address</span>
              <div className="auth-input">
                <Mail size={17} />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label>
              <span>Mobile Number</span>
              <div className="auth-input">
                <Phone size={17} />
                <input
                  type="tel"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  required
                />
              </div>
            </label>

            <label>
              <span>Password</span>
              <div className="auth-input">
                <Lock size={17} />
                <input
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </label>

            <label>
              <span>Confirm Password</span>
              <div className="auth-input">
                <Lock size={17} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
            </label>

            <button type="submit" className="auth-button">
              Create Account
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-security">
            <ShieldCheck size={17} />
            <span>Your account details are saved for this demo.</span>
          </div>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>

        <Link to="/" className="auth-back-home">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default Signup;