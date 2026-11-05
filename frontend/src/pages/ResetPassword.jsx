
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  LockKeyhole,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
).replace(/\/+$/, "");

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (password.length < 8 || password.length > 72) {
      setError("Password must contain between 8 and 72 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/customers/reset-password/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to reset your password."
        );
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Unable to reset your password.");
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
          {success ? (
            <div className="auth-confirmation">
              <div className="confirmation-icon">
                <CheckCircle2 size={32} strokeWidth={1.8} />
              </div>

              <span className="auth-eyebrow">PASSWORD UPDATED</span>

              <h1>Password reset successful.</h1>

              <p>
                Your password has been changed successfully.
                You can now log in using your new password.
              </p>

              <button
                type="button"
                className="auth-button auth-confirmation-button"
                onClick={() => navigate("/login")}
              >
                Continue to Login
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <>
              <div className="auth-heading">
                <span className="auth-eyebrow">ACCOUNT RECOVERY</span>

                <h1>Create new password.</h1>

                <p>
                  Choose a strong password for your Online Grocery account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
                <label>
                  <span>New Password</span>

                  <div className="auth-input">
                    <LockKeyhole size={17} />

                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        color: "inherit",
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>

                <label>
                  <span>Confirm New Password</span>

                  <div className="auth-input">
                    <LockKeyhole size={17} />

                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(event.target.value)
                      }
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={72}
                      required
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword((value) => !value)
                      }
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        display: "flex",
                        color: "inherit",
                      }}
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
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
                  {loading ? "Updating Password..." : "Reset Password"}
                  {!loading && <ArrowRight size={17} />}
                </button>
              </form>

              <p className="auth-footer">
                Remember your password?{" "}
                <Link to="/login">Back to Login</Link>
              </p>
            </>
          )}
        </div>

        <Link to="/" className="auth-back-home">
          ← Back to Home
        </Link>
      </div>
    </main>
  );
}

export default ResetPassword;
