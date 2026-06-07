import { useState } from "react";
import { motion } from "framer-motion";
import AdminActions from "./AdminActions";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function DashboardESC() {
  const [manufacturers, setManufacturers] = useState([]);
  const [currents, setCurrents] = useState([]);
  const [voltages, setVoltages] = useState([]);
  const [firmwares, setFirmwares] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [mountPatterns, setMountPatterns] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      manufacturer: manufacturers.join(","),
      current: currents.join(","),
      voltage: voltages.join(","),
      firmware: firmwares.join(","),
      protocol: protocols.join(","),
      mountPattern: mountPatterns.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/esc/search?${params}`
      );
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("ESC search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (

      <motion.div className="dashboard-root">
        <header className="dashboard-header">
          <AdminActions />
          <h1>Drone Forensics</h1>
          <span>ESC Intelligence Catalog</span>
          <GlobalSearch />
        </header>

        <section className="dashboard-filters">

          <MultiSelectDropdown
            label="Manufacturer"
            options={["Hobbywing", "BLHeli", "T-Motor", "Holybro"]}
            selected={manufacturers}
            setSelected={setManufacturers}
          />

          <MultiSelectDropdown
            label="Current (A)"
            options={["20", "30", "40", "60", "80"]}
            selected={currents}
            setSelected={setCurrents}
          />

          <MultiSelectDropdown
            label="Voltage"
            options={["2-4S", "3-6S", "6-12S"]}
            selected={voltages}
            setSelected={setVoltages}
          />

          <MultiSelectDropdown
            label="Firmware"
            options={["BLHeli_S", "BLHeli_32"]}
            selected={firmwares}
            setSelected={setFirmwares}
          />

          <MultiSelectDropdown
            label="Protocol"
            options={["DShot300", "DShot600", "PWM"]}
            selected={protocols}
            setSelected={setProtocols}
          />

          <MultiSelectDropdown
            label="Mount Pattern"
            options={["20x20", "30x30", "Stack"]}
            selected={mountPatterns}
            setSelected={setMountPatterns}
          />

          <button onClick={handleSearch}>
            {loading ? "Searching…" : "Search"}
          </button>

        </section>

        <section className="dashboard-content grid">
          {results.map((e) => (
            <div className="data-card" key={e.esc_code}>
              <h3>{e.esc_code}</h3>

              <p><strong>Manufacturer:</strong> {e.manufacturer}</p>
              <p><strong>Type:</strong> {e.esc_type}</p>

              <p><strong>Current:</strong> {e.continuous_current_a}A</p>
              <p><strong>Burst:</strong> {e.burst_current_a}A</p>

              <p><strong>Voltage:</strong> {e.supported_voltage}</p>
              <p><strong>Firmware:</strong> {e.firmware}</p>

              <p><strong>Protocol:</strong> {e.input_protocol}</p>
              <p><strong>Mount:</strong> {e.mount_pattern}</p>

              <p><strong>BEC:</strong> {e.bec_output}</p>
              <p><strong>Cooling:</strong> {e.cooling_method}</p>

              <p><strong>Use:</strong> {e.intended_use}</p>
            </div>
          ))}
        </section>
      </motion.div>
    
  );
}