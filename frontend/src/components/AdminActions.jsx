import { useNavigate } from "react-router-dom";
import "../styles/adminActions.css";

export default function AdminActions() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");

    navigate("/");
  };

  return (

    <div className="admin-actions">

      <button
        className="admin-btn"
        onClick={() => navigate("/dashboard/upload")}
      >
        Upload CSV
      </button>

      <button
        className="admin-btn"
        onClick={() => navigate("/dashboard/manual-entry")}
      >
        Manual Entry
      </button>

      <button
        className="admin-btn logout-btn"
        onClick={handleLogout}
      >
        Logout
      </button>

    </div>
  );
}