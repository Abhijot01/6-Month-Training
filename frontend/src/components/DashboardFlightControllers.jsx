import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";
export default function DashboardFlightControllers() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [firmwares, setFirmwares] = useState([]);
  const [formFactors, setFormFactors] = useState([]);
  const [droneTypes, setDroneTypes] = useState([]);

  /* CONTROL */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closeAll, setCloseAll] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    // 🔥 close dropdowns
    setCloseAll(true);
    setTimeout(() => setCloseAll(false), 100);

    const params = new URLSearchParams({
      manufacturer: manufacturers.join(","),
      subCategory: subCategories.join(","),
      processor: processors.join(","),
      firmware: firmwares.join(","),
      formFactor: formFactors.join(","),
      droneType: droneTypes.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/flight-controllers/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Flight controller search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >

      {/* HEADER */}
      <header className="dashboard-header">
        <AdminActions />
        <h1>Drone Forensics</h1>
        <span>Flight Controller Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "Athlon Avia",
  "Custom",
  "ImpulseRC",
  "JHEMCU",
  "Kakute",
  "KDE Direct",
  "Makerfire",
  "Matek",
  "MICASENSE",
  "NEXTVISION",
  "Omnibus",
  "Parrot",
  "Pulse",
  "Radiomaster",
  "RCINPOWER",
  "RMRC",
  "SENTERA",
  "Skydio",
  "SpeedyBee",
  "Spektrum",
  "Tarot",
  "TBS"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Sub Category"
          options={["FPV FC", "AIO FC", "Autopilot", "Fixed Wing FC"]}
          selected={subCategories}
          setSelected={setSubCategories}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Processor"
          options={["F4", "F7", "H7", "F405", "Pixhawk 4", "Pixhawk 6"]}
          selected={processors}
          setSelected={setProcessors}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Firmware"
          options={["BetaFlight", "INAV", "ArduPilot"]}
          selected={firmwares}
          setSelected={setFirmwares}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Form Factor"
          options={["30x30", "20x20", "Whoop", "Standard"]}
          selected={formFactors}
          setSelected={setFormFactors}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Drone Type"
          options={["FPV", "Fixed Wing", "Industrial"]}
          selected={droneTypes}
          setSelected={setDroneTypes}
          closeAll={closeAll}
        />

        <button onClick={handleSearch}>
          {loading ? "Searching…" : "Search"}
        </button>

      </section>

      {/* RESULTS */}
      <section className="dashboard-content grid">

        {results.length === 0 && !loading && (
          <div className="placeholder-card">
            <h3>No Flight Controller Data Loaded</h3>
            <p>Apply filters to retrieve flight controller intelligence.</p>
          </div>
        )}

        {results.map((fc) => (
          <div className="data-card" key={fc.fc_code}>
            <h3>{fc.fc_code}</h3>

            <p><strong>Manufacturer:</strong> {fc.manufacturer}</p>
            <p><strong>Category:</strong> {fc.sub_category}</p>
            <p><strong>Processor:</strong> {fc.processor}</p>

            <p><strong>Form Factor:</strong> {fc.form_factor}</p>
            <p><strong>Firmware:</strong> {fc.firmware_supported}</p>

            <p><strong>IMU:</strong> {fc.imu}</p>
            <p><strong>Barometer:</strong> {fc.barometer}</p>
            <p><strong>OSD:</strong> {fc.osd}</p>
            <p><strong>Blackbox:</strong> {fc.blackbox}</p>

            <p><strong>ESC Interface:</strong> {fc.esc_interface}</p>
            <p><strong>Connector:</strong> {fc.connector_type}</p>

            <p><strong>Supported:</strong> {fc.supported_drone_type}</p>
            <p><strong>Use:</strong> {fc.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}