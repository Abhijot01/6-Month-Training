import { useEffect, useState } from "react";

import "../styles/dashboard.css";        // overrides 
import AdminActions from "./AdminActions";
export default function DashboardHome() {
  const [droneStats, setDroneStats] = useState({});
  const [components, setComponents] = useState({});

  /* =========================
     FETCH DRONE SUMMARY (NEW API)
  ========================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/drone-summary")
      .then(res => res.json())
      .then(data => setDroneStats(data || {}))
      .catch(err => console.error("Drone summary error:", err));
  }, []);

  /* =========================
     FETCH COMPONENT COUNTS
  ========================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard/summary")
      .then(res => res.json())
      .then(data => setComponents(data || {}))
      .catch(err => console.error("Components fetch error:", err));
  }, []);

  return (
    <>
    <AdminActions />
      <h1>📊 Dashboard Overview</h1>
      <p>Welcome to Drone Forensics Intelligence System</p>

      {/* =========================
          DRONE STATS (UPDATED)
      ========================= */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <div className="stat-content">
            <h3>{droneStats.total || 0}</h3>
            <p>Total Drones</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{droneStats.armed || 0}</h3>
            <p>Armed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{droneStats.unarmed || 0}</h3>
            <p>Unarmed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{droneStats.classes || 0}</h3>
            <p>Classes</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{droneStats.countries || 0}</h3>
            <p>Countries</p>
          </div>
        </div>

      </div>

      {/* =========================
          COMPONENT INVENTORY
      ========================= */}
      <div className="components-section">
        <h2>📦 Drone Components Inventory</h2>

        <div className="components-grid">

          <div className="component-card">
            <div className="component-icon">🔋</div>
            <h3>Batteries</h3>
            <p className="component-quantity">{components.batteries || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">⚙️</div>
            <h3>Motors</h3>
            <p className="component-quantity">{components.motors || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🖼️</div>
            <h3>Frames</h3>
            <p className="component-quantity">{components.frames || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🔀</div>
            <h3>Propellers</h3>
            <p className="component-quantity">{components.propellers || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">📷</div>
            <h3>Cameras</h3>
            <p className="component-quantity">{components.cameras || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🔌</div>
            <h3>Chargers</h3>
            <p className="component-quantity">{components.chargers || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">⚡</div>
            <h3>ESC</h3>
            <p className="component-quantity">{components.esc || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🎮</div>
            <h3>Flight Controllers</h3>
            <p className="component-quantity">
              {components.flightControllers || 0}
            </p>
          </div>

          <div className="component-card">
            <div className="component-icon">📡</div>
            <h3>GPS</h3>
            <p className="component-quantity">{components.gps || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">📶</div>
            <h3>Radios</h3>
            <p className="component-quantity">{components.radios || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">📺</div>
            <h3>Video TX</h3>
            <p className="component-quantity">
              {components.videoTransmitters || 0}
            </p>
          </div>

          <div className="component-card">
            <div className="component-icon">💾</div>
            <h3>Firmware</h3>
            <p className="component-quantity">{components.firmware || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🖥️</div>
            <h3>Software</h3>
            <p className="component-quantity">{components.software || 0}</p>
          </div>

          <div className="component-card">
            <div className="component-icon">🛸</div>
            <h3>RTF Drones</h3>
            <p className="component-quantity">
              {components.readyToFly || 0}
            </p>
          </div>

          {/* TOTAL */}
          <div className="component-card total-card">
            <h3>Total</h3>
            <p className="component-quantity">
              {Object.values(components).reduce(
                (sum, val) => sum + (Number(val) || 0),
                0
              )}
            </p>
          </div>

        </div>
      </div>
    </>
  );
}