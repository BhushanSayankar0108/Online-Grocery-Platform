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

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Temporary frontend-only demo login.
    const savedCustomers = (() => {
      try {
        return JSON.parse(localStorage.getItem("demoCustomers") || "[]");
      } catch {
        return [];
      }
    })();

    const matchingCustomer = savedCustomers.find(
      (customer) =>
        customer.email.toLowerCase() === normalizedEmail.toLowerCase() &&
        customer.password === password
    );

    if (!matchingCustomer) {
      alert("Account not found or password is incorrect. Please sign up first.");
      return;
    }

    onLogin?.({ name: matchingCustomer.name, email: matchingCustomer.email });
    navigate("/");
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
            <span className="auth-visual-pill"><Leaf size={15} /> FRESH EVERY DAY</span>
            <h2>Good food.<br />Good mood.</h2>
            <p>Your everyday groceries, carefully picked and delivered to your door.</p>
            <div className="auth-produce-art" aria-hidden="true">
              <span className="produce produce-apple">🍎</span>
              <span className="produce produce-avocado">🥑</span>
              <span className="produce produce-carrot">🥕</span>
              <span className="produce produce-leaf">🥬</span>
              <span className="produce produce-orange">🍊</span>
              <span className="produce produce-pepper">🫑</span>
              <div className="produce-basket"><ShoppingBasket size={76} strokeWidth={1.25} /></div>
            </div>
            <div className="auth-visual-benefits">
              <span><Truck size={17} /> Reliable delivery</span>
              <span><ShieldCheck size={17} /> Secure checkout</span>
            </div>
            <div className="auth-visual-note"><span className="auth-note-dot" /> Fresh picks for your everyday table</div>
          </aside>

          <section className="auth-card">
            <div className="auth-heading">
              <span className="auth-eyebrow">WELCOME BACK</span>
              <h1>Login to your account<span>.</span></h1>
              <p>Access your orders, saved addresses and grocery preferences.</p>
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
                  <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              <div className="auth-options">
                <label className="remember-option">
                  <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
                  <span>Remember me</span>
                </label>
                <Link to="/forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="auth-button">
                <span>Login</span><ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-security"><ShieldCheck size={17} /><span>Welcome back to your grocery account.</span></div>
            <p className="auth-footer">Don’t have an account? <Link to="/signup">Create one</Link></p>
          </section>
        </div>

        <Link to="/" className="auth-back-home"><ArrowRight size={15} className="auth-back-arrow" /> Back to home</Link>
      </div>
    </main>
  );
}

export default Login;
