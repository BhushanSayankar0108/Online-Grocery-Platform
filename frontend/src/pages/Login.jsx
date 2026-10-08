import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    // Temporary frontend login
    navigate("/");
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
            <span className="auth-eyebrow">WELCOME BACK</span>

            <h1>Login to your account.</h1>

            <p>
              Access your orders, saved addresses and grocery
              preferences.
            </p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <label>
              <span>Email Address</span>

              <div className="auth-input">
                <Mail size={17} />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  required
                />
              </div>
            </label>

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

              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="auth-button">
              Login
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="auth-security">
            <ShieldCheck size={17} />

            <span>
              Secure access to your grocery account.
            </span>
          </div>

          <p className="auth-footer">
            Don't have an account?{" "}
            <Link to="/signup">Create one</Link>
          </p>
        </div>

        <Link to="/" className="auth-back-home">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default Login;