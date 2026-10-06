import { useState } from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setSubmitted(true);
  };

  return (
    <main className="auth-page">
      <div className="auth-card">
        {!submitted ? (
          <>
            <h1>Forgot Password?</h1>

            <p>
              Enter your email address and we'll send you a password reset
              link.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button type="submit" className="auth-button">
                Send Reset Link
              </button>
            </form>

            <p className="auth-footer">
              Remember your password?{" "}
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        ) : (
          <>
            <div className="confirmation-icon">✓</div>

            <h1>Check Your Email</h1>

            <p>
              If an account exists for <strong>{email}</strong>, you will
              receive a password reset link shortly.
            </p>

            <p className="auth-footer">
              <Link to="/login">Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}

export default ForgotPassword;