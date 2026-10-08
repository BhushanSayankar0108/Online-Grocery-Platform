import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import "./AdminBackButton.css";

const AdminBackButton = () => {
    const navigate = useNavigate();

    const handleBackToDashboard = () => {
        navigate("/admin/dashboard");
    };

    return (
        <button
            type="button"
            className="admin-back-button"
            onClick={handleBackToDashboard}
        >
            <ArrowLeft size={17} />

            <span>
                Back to Dashboard
            </span>
        </button>
    );
};

export default AdminBackButton;