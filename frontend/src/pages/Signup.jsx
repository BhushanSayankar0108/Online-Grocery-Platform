import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Leaf,
  Truck,
  ShoppingBasket,
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
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
      const customers = JSON.parse(localStorage.getItem("demoCustomers") || "[]");
      if (!Array.isArray(customers)) {
        alert("Unable to create your account. Please try again.");
        return;
      }
      const existingCustomer = customers.some((customer) => customer.email?.toLowerCase() === email);
      if (existingCustomer) {
        alert("An account with this email already exists. Please log in.");
        navigate("/login");
        return;
      }
      customers.push({ name, email, mobile, password });
      localStorage.setItem("demoCustomers", JSON.stringify(customers));
      alert("Account created successfully! Please log in.");
      navigate("/login");
    } catch {
      alert("Unable to save your account. Please try again.");
    }
  };

  return (
    <main className="auth-page auth-page-signup">
      <div className="auth-shell">
        <Link to="/" className="auth-logo" aria-label="Online Grocery home">
          <span className="auth-logo-mark">OG</span>
          <span className="auth-logo-copy"><strong>Online Grocery</strong><small>Freshness Delivered</small></span>
        </Link>

        <div className="auth-layout auth-layout-signup">
          <aside className="auth-visual auth-visual-signup">
            <div className="auth-visual-glow" />
            <span className="auth-visual-pill"><Leaf size={15} /> A FRESH START</span>
            <h2>Make room<br />for good things.</h2>
            <p>Join us for fresh favourites, everyday essentials and a little more ease in your day.</p>
            <div className="auth-produce-art" aria-hidden="true">
              <span className="produce produce-apple">🍎</span>
              <span className="produce produce-avocado">🥑</span>
              <span className="produce produce-carrot">🥕</span>
              <span className="produce produce-leaf">🥬</span>
              <span className="produce produce-orange">🍊</span>
              <span className="produce produce-pepper">🫑</span>
              <div className="produce-basket"><ShoppingBasket size={76} strokeWidth={1.25} /></div>
            </div>
            <div className="auth-visual-benefits"><span><Truck size={17} /> Everyday convenience</span><span><ShieldCheck size={17} /> Simple, secure access</span></div>
            <div className="auth-visual-note"><span className="auth-note-dot" /> Your everyday grocery run, made easier</div>
          </aside>

          <section className="auth-card auth-card-signup">
            <div className="auth-heading">
              <span className="auth-eyebrow">GET STARTED</span>
              <h1>Create your account<span>.</span></h1>
              <p>Sign up to shop fresh groceries and everyday essentials.</p>
            </div>

            <form onSubmit={handleSignup} className="auth-form auth-form-signup">
              <label className="auth-field"><span>Full name</span><div className="auth-input"><User size={18} aria-hidden="true" /><input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} autoComplete="name" required /></div></label>
              <label className="auth-field"><span>Email address</span><div className="auth-input"><Mail size={18} aria-hidden="true" /><input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} autoComplete="email" required /></div></label>
              <label className="auth-field"><span>Mobile number</span><div className="auth-input"><Phone size={18} aria-hidden="true" /><input type="tel" name="mobile" placeholder="10-digit mobile number" value={formData.mobile} onChange={handleChange} autoComplete="tel" inputMode="numeric" maxLength={10} required /></div></label>
              <label className="auth-field"><span>Password</span><div className="auth-input"><Lock size={18} aria-hidden="true" /><input type={showPassword ? "text" : "password"} name="password" placeholder="Create a password (6+ characters)" value={formData.password} onChange={handleChange} autoComplete="new-password" minLength={6} required /><button className="auth-password-toggle" type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              <label className="auth-field"><span>Confirm password</span><div className="auth-input"><Lock size={18} aria-hidden="true" /><input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Re-enter your password" value={formData.confirmPassword} onChange={handleChange} autoComplete="new-password" minLength={6} required /><button className="auth-password-toggle" type="button" onClick={() => setShowConfirmPassword((show) => !show)} aria-label={showConfirmPassword ? "Hide password" : "Show password"}>{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
              <button type="submit" className="auth-button"><span>Create account</span><ArrowRight size={18} /></button>
            </form>

            <div className="auth-security"><ShieldCheck size={17} /><span>Your account details are saved for this demo.</span></div>
            <p className="auth-footer">Already have an account? <Link to="/login">Login</Link></p>
          </section>
        </div>

        <Link to="/" className="auth-back-home"><ArrowRight size={15} className="auth-back-arrow" /> Back to home</Link>
      </div>
    </main>
  );
}

export default Signup;
