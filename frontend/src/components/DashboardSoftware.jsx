import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardSoftware() {

  /* =========================
     HARD CODED FILTER OPTIONS
  ========================= */
  const FILTER_OPTIONS = {
    types: [
      "Flight Controller Configurator",
      "ESC Configuration Tool",
      "Drone Utility Software",
      "Ground Control Station"
    ],
    platforms: [
      "Windows",
      "Android / iOS",
      "Windows / Mac",
      "Web / Mobile"
    ],
    licenses: [
      "Open Source",
      "Commercial",
      "Freeware",
      "Proprietary"
    ],
    connections: [
      "USB",
      "Telemetry",
      "Bluetooth",
      "Telemetry / USB"
    ],
    statuses: [
      "Active",
      "Very Active"
    ]
  };

  /* =========================
     STATES
  ========================= */
  const [types, setTypes] = useState([]);
  const [platforms, setPlatforms] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* =========================
     SEARCH
  ========================= */
  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      type: types.join(","),
      platform: platforms.join(","),
      license: licenses.join(","),
      connection: connections.join(","),
      status: statuses.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/software/search?${params.toString()}`
      );

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (

      <motion.div className="dashboard-root">
        <header className="dashboard-header">
          <AdminActions />
          <h1>Drone Forensics</h1>
          <span>Software Intelligence Catalog</span>
          <GlobalSearch />
        </header>

        <section className="dashboard-filters">

          <MultiSelectDropdown
            label="Software Type"
            options={FILTER_OPTIONS.types}
            selected={types}
            setSelected={setTypes}
          />

          <MultiSelectDropdown
            label="Platform"
            options={FILTER_OPTIONS.platforms}
            selected={platforms}
            setSelected={setPlatforms}
          />

          <MultiSelectDropdown
            label="License"
            options={FILTER_OPTIONS.licenses}
            selected={licenses}
            setSelected={setLicenses}
          />

          <MultiSelectDropdown
            label="Connection"
            options={FILTER_OPTIONS.connections}
            selected={connections}
            setSelected={setConnections}
          />

          <MultiSelectDropdown
            label="Status"
            options={FILTER_OPTIONS.statuses}
            selected={statuses}
            setSelected={setStatuses}
          />

          <button onClick={handleSearch}>
            {loading ? "Searching…" : "Search"}
          </button>
        </section>

        <section className="dashboard-content grid">
          {results.length === 0 && !loading && (
            <div className="placeholder-card">
              <h3>No Software Data Found</h3>
              <p>Apply filters to explore software intelligence.</p>
            </div>
          )}

          {results.map((s) => (
            <div className="data-card" key={s.software_code}>
              <h3>{s.name}</h3>

              <p><strong>Code:</strong> {s.software_code}</p>
              <p><strong>Type:</strong> {s.software_type}</p>
              <p><strong>Platform:</strong> {s.supported_platform}</p>
              <p><strong>License:</strong> {s.license_type}</p>
              <p><strong>Connection:</strong> {s.connection_type}</p>
              <p><strong>Status:</strong> {s.development_status}</p>
              <p><strong>Purpose:</strong> {s.primary_purpose}</p>
            </div>
          ))}
        </section>
      </motion.div>
  );
}