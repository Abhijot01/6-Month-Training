import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardVideoTransmitters() {
  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [powers, setPowers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [mountPatterns, setMountPatterns] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      manufacturer: manufacturers.join(","),
      frequency: frequencies.join(","),
      power: powers.join(","),
      channels: channels.join(","),
      mountPattern: mountPatterns.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/video_transmitters/search?${params.toString()}`
      );

      if (!res.ok) {
        throw new Error("API failed");
      }

      const data = await res.json();

      // Prevent crash
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("VTX search failed:", err);
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
          <span>Video Transmitter Intelligence Catalog</span>
          <GlobalSearch />
        </header>

        {/* FILTERS */}
        <section className="dashboard-filters">

          <MultiSelectDropdown
            label="Manufacturer"
            options={[
  "AKK",
  "AxisFlying",
  "BetaFPV",
  "Caddx",
  "Custom",
  "DJI",
  "Eachine",
  "EMAX",
  "Flywoo",
  "Foxeer",
  "GEPRC",
  "HappyModel",
  "HGLRC",
  "Holybro",
  "iFlight",
  "ImmersionRC",
  "JHEMCU",
  "Matek",
  "NamelessRC",
  "Orqa",
  "PandaRC",
  "RushFPV",
  "SpeedyBee",
  "TBS",
  "Walksnail"
]}
            selected={manufacturers}
            setSelected={setManufacturers}
          />

          <MultiSelectDropdown
            label="Frequency"
            options={["5.8GHz", "2.4GHz"]}
            selected={frequencies}
            setSelected={setFrequencies}
          />

          <MultiSelectDropdown
            label="Min Power (mW)"
            options={["25", "200", "600", "1000"]}
            selected={powers}
            setSelected={setPowers}
          />

          <MultiSelectDropdown
            label="Channels"
            options={["40", "72"]}
            selected={channels}
            setSelected={setChannels}
          />

          <MultiSelectDropdown
            label="Mount Pattern"
            options={["20x20", "30x30", "Whoop"]}
            selected={mountPatterns}
            setSelected={setMountPatterns}
          />

          <button onClick={handleSearch}>
            {loading ? "Searching…" : "Search"}
          </button>
        </section>

        {/* RESULTS */}
        <section className="dashboard-content grid">
          {results.length === 0 && !loading && (
            <div className="placeholder-card">
              <h3>No Video Transmitter Data Loaded</h3>
              <p>Apply filters to retrieve VTX intelligence.</p>
            </div>
          )}

          {results.map((v) => (
            <div className="data-card" key={v.vtx_code}>
              <h3>{v.vtx_code}</h3>

              <p><strong>Manufacturer:</strong> {v.manufacturer}</p>
              <p><strong>Category:</strong> {v.sub_category}</p>
              <p><strong>Video System:</strong> {v.video_system}</p>

              <p><strong>Frequency:</strong> {v.frequency_band}</p>
              <p><strong>Power:</strong> {v.output_power_mw} mW</p>
              <p><strong>Channels:</strong> {v.channel_count}</p>

              <p><strong>Voltage:</strong> {v.input_voltage}</p>
              <p><strong>Mount:</strong> {v.mount_pattern}</p>
              <p><strong>Antenna:</strong> {v.antenna_connector}</p>

              <p><strong>Protocol:</strong> {v.control_protocol}</p>
              <p><strong>Type:</strong> {v.antenna_type}</p>

              <p><strong>Compatible:</strong> {v.supported_drone_type}</p>
              <p><strong>Use:</strong> {v.intended_use}</p>
            </div>
          ))}
        </section>
      </motion.div>
  );
}