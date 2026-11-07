
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://online-grocery-platform.onrender.com"
).replace(/\/+$/, "");

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: normalizedEmail }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to process your request. Please try again."
        );
      }

      setEmail(normalizedEmail);
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Unable to send reset link.");
    } finally {
      setLoading(false);
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
          {!submitted ? (
            <>
              <div className="auth-heading">
                <span className="auth-eyebrow">
                  ACCOUNT RECOVERY
                </span>

                <h1>Reset your password.</h1>

                <p>
                  Enter the email linked to your account and we'll
                  send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <label>
                  <span>Email Address</span>

                  <div className="auth-input">
                    <Mail size={17} />

                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      required
                    />
                  </div>
                </label>

                {error && (
                  <p
                    role="alert"
                    style={{
                      color: "#dc2626",
                      fontSize: "14px",
                      margin: "0",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <div className="auth-security">
                <ShieldCheck size={17} />

                <span>
                  We'll never ask for your password by email.
                </span>
              </div>

              <p className="auth-footer">
                Remember your password?{" "}
                <Link to="/login">Back to Login</Link>
              </p>
            </>
          ) : (
            <div className="auth-confirmation">
              <div className="confirmation-icon">
                <CheckCircle2 size={32} strokeWidth={1.8} />
              </div>

              <span className="auth-eyebrow">REQUEST RECEIVED</span>

              <h1>Check your email.</h1>

              <p>
                If an account exists for <strong>{email}</strong>,
                you'll receive a password reset link shortly.
              </p>

              <Link
                to="/login"
                className="auth-button auth-confirmation-button"
              >
                Back to Login
                <ArrowRight size={17} />
              </Link>

              <p className="auth-resend-text">
                Didn't receive it? Check your spam folder.
              </p>
            </div>
          )}
        </div>

        <Link to="/" className="auth-back-home">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default ForgotPassword;
