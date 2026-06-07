import { useNavigate } from "react-router-dom";

import "../../styles/dashboard.css";

export default function DashboardCompatibility() {
  const navigate = useNavigate();

  return (


      <div className="dashboard-root">
        <header className="dashboard-header">
          <h1>Compatibility Engine</h1>
          <span>Select compatibility module</span>
        </header>

        <section className="dashboard-content grid">

  <div
    className="data-card clickable"
    onClick={() => navigate("/dashboard/compatibility/esc-motor")}
  >
    <h3>ESC ↔ Motor</h3>
    <p>Validate ESC and Motor compatibility</p>
  </div>

  <div
    className="data-card clickable"
    onClick={() => navigate("/dashboard/compatibility/motor-prop")}
  >
    <h3>Motor ↔ Propeller</h3>
    <p>Validate motor and propeller pairing</p>
  </div>

  <div
    className="data-card clickable"
    onClick={() => navigate("/dashboard/compatibility/frame-prop")}
  >
    <h3>Frame ↔ Propeller</h3>
    <p>Validate frame and propeller compatibility</p>
  </div>

  <div
  className="data-card clickable"
  onClick={() => navigate("/dashboard/compatibility/recommend")}
>
  <h3>AI Recommendation</h3>
  <p>Predict optimal UAV configuration</p>
</div>

</section>
      </div>
  );
}