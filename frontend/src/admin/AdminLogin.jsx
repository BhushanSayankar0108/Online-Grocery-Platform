import { useState } from "react";
import {
    ShieldCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AdminLogin.css";

const API_BASE_URL = "http://localhost:5000";

const AdminLogin = () => {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");


    // =========================================================
    // HANDLE INPUT CHANGE
    // =========================================================

    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        // Remove error when user starts typing again
        if (error) {
            setError("");
        }
    };


    // =========================================================
    // HANDLE LOGIN
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");

        if (!formData.email || !formData.password) {

            setError(
                "Please enter your email address and password."
            );

            return;
        }


        try {

            setLoading(true);

            const response = await fetch(
                `${API_BASE_URL}/api/admin/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(formData)
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Invalid email or password."
                );
            }


            // =================================================
            // SAVE ADMIN AUTHENTICATION
            // =================================================

            localStorage.setItem(
                "adminToken",
                data.token
            );

            localStorage.setItem(
                "adminUser",
                JSON.stringify(data.admin)
            );

            localStorage.setItem(
                "adminLoggedIn",
                "true"
            );


            // =================================================
            // GO TO DASHBOARD
            // =================================================

            navigate("/admin/dashboard");

        } catch (error) {

            setError(
                error.message ||
                "Unable to login. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    return (

        <div className="admin-login-page">

            {/* Decorative background */}

            <div className="admin-login-background-glow admin-login-glow-one"></div>

            <div className="admin-login-background-glow admin-login-glow-two"></div>


            {/* =================================================
                LOGIN CONTAINER
            ================================================= */}

            <div className="admin-login-container">

                <div className="admin-login-card">


                    {/* =================================================
                        TOP ACCENT
                    ================================================= */}

                    <div className="admin-login-accent"></div>


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="admin-login-header">

                        <div className="admin-login-logo">

                            <ShieldCheck size={32} />

                        </div>


                        <h1 className="admin-login-title">
                            Admin Portal
                        </h1>


                        <p className="admin-login-subtitle">
                            Online Grocery Platform
                        </p>


                        <div className="admin-login-divider"></div>

                    </div>


                    {/* =================================================
                        FORM AREA
                    ================================================= */}

                    <div className="admin-login-form-container">


                        {/* =================================================
                            ERROR MESSAGE
                        ================================================= */}

                        {error && (

                            <div className="admin-login-error">

                                <AlertCircle size={18} />

                                <span>
                                    {error}
                                </span>

                            </div>

                        )}


                        <form
                            onSubmit={handleSubmit}
                        >


                            {/* =================================================
                                EMAIL
                            ================================================= */}

                            <div className="admin-login-group">

                                <label
                                    htmlFor="admin-email"
                                    className="admin-login-label"
                                >
                                    Email Address
                                </label>


                                <div className="admin-login-input-wrapper">

                                    <span className="admin-login-input-icon">

                                        <Mail size={18} />

                                    </span>


                                    <input
                                        id="admin-email"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter your admin email"
                                        autoComplete="email"
                                        className="admin-login-input"
                                    />

                                </div>

                            </div>


                            {/* =================================================
                                PASSWORD
                            ================================================= */}

                            <div className="admin-login-group">

                                <label
                                    htmlFor="admin-password"
                                    className="admin-login-label"
                                >
                                    Password
                                </label>


                                <div className="admin-login-input-wrapper">

                                    <span className="admin-login-input-icon">

                                        <Lock size={18} />

                                    </span>


                                    <input
                                        id="admin-password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="admin-login-input"
                                    />


                                    <button
                                        type="button"
                                        className="admin-login-password-toggle"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) =>
                                                    !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                    >

                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}

                                    </button>

                                </div>

                            </div>


                            {/* =================================================
                                LOGIN BUTTON
                            ================================================= */}

                            <button
                                type="submit"
                                className="admin-login-button"
                                disabled={loading}
                            >

                                {loading ? (

                                    <span className="admin-login-loading">

                                        <span className="admin-login-spinner"></span>

                                        Signing in...

                                    </span>

                                ) : (

                                    "Sign In to Admin Portal"

                                )}

                            </button>

                        </form>

                    </div>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="admin-login-footer">

                        <p className="admin-login-footer-text">
                            Authorized administrators only
                        </p>


                        <div className="admin-login-footer-status">

                            <span className="admin-login-status-dot"></span>

                            Secure administrator access

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
};

export default AdminLogin;