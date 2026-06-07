import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardReadyToFly() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [droneTypes, setDroneTypes] = useState([]);
  const [buildLevels, setBuildLevels] = useState([]);
  const [frameSizes, setFrameSizes] = useState([]);
  const [batterySpecs, setBatterySpecs] = useState([]);
  const [firmwares, setFirmwares] = useState([]);
  const [useCases, setUseCases] = useState([]);

  /* CONTROL */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closeAll, setCloseAll] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    // 🔥 CLOSE ALL DROPDOWNS AFTER CLICK
    setCloseAll(true);
    setTimeout(() => setCloseAll(false), 100);

    const params = new URLSearchParams({
      manufacturer: manufacturers.join(","),
      droneType: droneTypes.join(","),
      buildLevel: buildLevels.join(","),
      frameSize: frameSizes.join(","),
      batterySpec: batterySpecs.join(","),
      firmware: firmwares.join(","),
      intendedUse: useCases.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/rtf/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      // Safety
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("RTF search failed", err);
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
        <span>Ready-to-Fly UAV Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "Armattan",
  "AtomRC",
  "Autel",
  "AxisFlying",
  "BetaFPV",
  "CUAV",
  "Custom",
  "Diatone",
  "DJI",
  "Flywoo",
  "Foxeer",
  "GEPRC",
  "HappyModel",
  "HGLRC",
  "Holybro",
  "iFlight",
  "ImpulseRC",
  "Parrot",
  "Reptile",
  "RMRC",
  "Skydio",
  "Skydroid",
  "Walksnail",
  "Yuneec",
  "Zeta"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Drone Type"
          options={[
            "Freestyle FPV",
            "Cinematic FPV",
            "Long Range FPV",
            "Inspection UAV",
            "Survey UAV",
          ]}
          selected={droneTypes}
          setSelected={setDroneTypes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Build Level"
          options={["RTF", "Kit"]}
          selected={buildLevels}
          setSelected={setBuildLevels}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Frame Size"
          options={["2", "3.5", "5", "7", "10", "Custom"]}
          selected={frameSizes}
          setSelected={setFrameSizes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Battery"
          options={["4S LiPo", "6S LiPo", "Li-ion", "Smart Battery"]}
          selected={batterySpecs}
          setSelected={setBatterySpecs}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Firmware"
          options={["BetaFlight", "ArduPilot", "Custom"]}
          selected={firmwares}
          setSelected={setFirmwares}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Use Case"
          options={[
            "Freestyle FPV",
            "Cinematic FPV",
            "Survey UAV",
            "Inspection UAV",
            "Delivery UAV",
          ]}
          selected={useCases}
          setSelected={setUseCases}
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
            <h3>No RTF Data Loaded</h3>
            <p>Apply filters to retrieve ready-to-fly UAV intelligence.</p>
          </div>
        )}

        {results.map((r) => (
          <div className="data-card" key={r.rtf_id}>
            <h3>{r.manufacturer}</h3>

            <p><strong>Type:</strong> {r.drone_type}</p>
            <p><strong>Build:</strong> {r.build_level}</p>
            <p><strong>Frame:</strong> {r.frame_size} inch</p>
            <p><strong>Wheelbase:</strong> {r.wheelbase} mm</p>

            <p><strong>Motor:</strong> {r.motor_spec}</p>
            <p><strong>Propellers:</strong> {r.propeller_spec}</p>
            <p><strong>Battery:</strong> {r.battery_spec}</p>

            <p><strong>FC:</strong> {r.flight_controller}</p>
            <p><strong>Firmware:</strong> {r.firmware}</p>

            <p><strong>Payload:</strong> {r.payload_support}</p>
            <p><strong>MTOW:</strong> {r.max_takeoff_kg} kg</p>
            <p><strong>Use:</strong> {r.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}