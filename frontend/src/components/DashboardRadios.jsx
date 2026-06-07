import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardRadios() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [connectors, setConnectors] = useState([]);
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
      deviceType: deviceTypes.join(","),
      protocol: protocols.join(","),
      frequency: frequencies.join(","),
      connector: connectors.join(","),
      droneType: droneTypes.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/radios/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Radio search failed", err);
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
        <span>Radios & Receivers Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "3DR",
  "BetaFPV",
  "Custom",
  "FlySky",
  "Foxeer",
  "FreeWave",
  "FrSky",
  "Futaba",
  "HappyModel",
  "Herelink",
  "Holybro",
  "ImmersionRC",
  "Jumper",
  "Microhard",
  "Radiomaster",
  "RFD",
  "SiYi",
  "Skydroid",
  "Spektrum",
  "TBS",
  "Walksnail"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Device Type"
          options={[
            "Handheld",
            "Gamepad",
            "Module TX",
            "Micro RX",
            "Standard RX",
          ]}
          selected={deviceTypes}
          setSelected={setDeviceTypes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Protocol"
          options={["ELRS", "Crossfire", "ACCST", "AFHDS 2A", "Tracer"]}
          selected={protocols}
          setSelected={setProtocols}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Frequency"
          options={["2.4GHz", "900MHz"]}
          selected={frequencies}
          setSelected={setFrequencies}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Connector"
          options={["USB-C", "USB", "JR Bay", "U.FL", "Solder Pad"]}
          selected={connectors}
          setSelected={setConnectors}
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
            <h3>No Radio Data Loaded</h3>
            <p>Apply filters to retrieve radio & receiver intelligence.</p>
          </div>
        )}

        {results.map((r) => (
          <div className="data-card" key={r.radio_code}>
            <h3>{r.radio_code}</h3>

            <p><strong>Manufacturer:</strong> {r.manufacturer}</p>
            <p><strong>Device:</strong> {r.device_type}</p>
            <p><strong>Protocol:</strong> {r.protocol}</p>
            <p><strong>Frequency:</strong> {r.frequency}</p>

            <p><strong>Channels:</strong> {r.channel_count}</p>
            <p><strong>Telemetry:</strong> {r.telemetry}</p>
            <p><strong>Antenna:</strong> {r.antenna_type}</p>
            <p><strong>Connector:</strong> {r.connector}</p>

            <p><strong>Power:</strong> {r.power_output}</p>
            <p><strong>Supported:</strong> {r.supported_drone_type}</p>
            <p><strong>Use:</strong> {r.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}