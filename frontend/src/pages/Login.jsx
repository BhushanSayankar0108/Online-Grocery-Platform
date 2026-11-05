import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Leaf,
  Truck,
  ShoppingBasket,
} from "lucide-react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed. Please check your credentials."
        );
      }

      if (!data.token || !data.customer) {
        throw new Error(
          "The server response is missing customer authentication details."
        );
      }

      const loggedInCustomer = {
        ...data.customer,
        id: data.customer.id || data.customer._id || "",
        name: data.customer.name || "Customer",
        email: data.customer.email || normalizedEmail,
        mobile: data.customer.mobile || "",
        token: data.token,
      };

      // App.jsx handles session storage and shared customer state.
onLogin?.({
  ...loggedInCustomer,
  rememberMe,
});
      navigate("/");
    } catch (error) {
      console.error("Customer login error:", error);

      setErrorMessage(
        error instanceof TypeError
          ? "Unable to connect to the server. Please check that the backend is running."
          : error.message || "Something went wrong. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link to="/" className="auth-logo" aria-label="Online Grocery home">
          <span className="auth-logo-mark">OG</span>
          <span className="auth-logo-copy">
            <strong>Online Grocery</strong>
            <small>Freshness Delivered</small>
          </span>
        </Link>

        <div className="auth-layout">
          <aside className="auth-visual auth-visual-login">
            <div className="auth-visual-glow" />

            <span className="auth-visual-pill">
              <Leaf size={15} /> FRESH EVERY DAY
            </span>

            <h2>
              Good food.
              <br />
              Good mood.
            </h2>

            <p>
              Your everyday groceries, carefully picked and delivered to your
              door.
            </p>

            <div className="auth-produce-art" aria-hidden="true">
              <span className="produce produce-apple">🍎</span>
              <span className="produce produce-avocado">🥑</span>
              <span className="produce produce-carrot">🥕</span>
              <span className="produce produce-leaf">🥬</span>
              <span className="produce produce-orange">🍊</span>
              <span className="produce produce-pepper">🫑</span>

              <div className="produce-basket">
                <ShoppingBasket size={76} strokeWidth={1.25} />
              </div>
            </div>

            <div className="auth-visual-benefits">
              <span>
                <Truck size={17} /> Reliable delivery
              </span>
              <span>
                <ShieldCheck size={17} /> Secure checkout
              </span>
            </div>

            <div className="auth-visual-note">
              <span className="auth-note-dot" />
              Fresh picks for your everyday table
            </div>
          </aside>

          <section className="auth-card">
            <div className="auth-heading">
              <span className="auth-eyebrow">WELCOME BACK</span>
              <h1>
                Login to your account<span>.</span>
              </h1>
              <p>
                Access your orders, saved addresses and grocery preferences.
              </p>
            </div>

            <form onSubmit={handleLogin} className="auth-form">
              <label className="auth-field">
                <span>Email address</span>

                <div className="auth-input">
                  <Mail size={18} aria-hidden="true" />

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>Password</span>

                <div className="auth-input">
                  <Lock size={18} aria-hidden="true" />

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                  />

                  <button
                    className="auth-password-toggle"
                    type="button"
                    onClick={() => setShowPassword((show) => !show)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>

              {errorMessage && (
                <p
                  role="alert"
                  aria-live="polite"
                  style={{
                    color: "#dc2626",
                    fontSize: "14px",
                    margin: "0",
                  }}
                >
                  {errorMessage}
                </p>
              )}

              <div className="auth-options">
                <label className="remember-option">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) =>
                      setRememberMe(event.target.checked)
                    }
                  />
                  <span>Remember me</span>
                </label>

                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <span>{isLoading ? "Logging in..." : "Login"}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-security">
              <ShieldCheck size={17} />
              <span>Welcome back to your grocery account.</span>
            </div>

            <p className="auth-footer">
              Don’t have an account? <Link to="/signup">Create one</Link>
            </p>
          </section>
        </div>

        <Link to="/" className="auth-back-home">
          <ArrowRight size={15} className="auth-back-arrow" />
          Back to home
        </Link>
      </div>
    </main>
  );
}

export default Login;