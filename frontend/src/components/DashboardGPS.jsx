import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardGPS() {

  /* MULTI SELECT STATES */
  const [brands, setBrands] = useState([]);
  const [gnssList, setGnssList] = useState([]);
  const [compassList, setCompassList] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [firmwares, setFirmwares] = useState([]);
  const [updateRates, setUpdateRates] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      brand: brands.join(","),
      gnss: gnssList.join(","),
      compass: compassList.join(","),
      interfaceType: interfaces.join(","),
      firmware: firmwares.join(","),
      minUpdateRate: updateRates.join(",")
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/gps/search?${params.toString()}`
      );

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("GPS search failed", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (

    <motion.div className="dashboard-root">

      {/* HEADER */}
      <header className="dashboard-header">
        <AdminActions />
        <h1>Drone Forensics</h1>
        <span>GPS Module Intelligence</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "Beitian",
  "BN-880",
  "CUAV",
  "Flywoo",
  "Foxeer",
  "GEPRC",
  "Here3",
  "HGLRC",
  "Holybro",
  "iFlight",
  "Matek",
  "Radiolink",
  "Skydroid",
  "T-Motor"
]}
          selected={brands}
          setSelected={setBrands}
        />

        <MultiSelectDropdown
          label="GNSS"
          options={["GPS", "GPS+GLONASS", "GPS+Galileo", "GPS+GLONASS+Galileo"]}
          selected={gnssList}
          setSelected={setGnssList}
        />

        <MultiSelectDropdown
          label="Compass"
          options={["Yes", "No"]}
          selected={compassList}
          setSelected={setCompassList}
        />

        <MultiSelectDropdown
          label="Interface"
          options={["UART", "I2C"]}
          selected={interfaces}
          setSelected={setInterfaces}
        />

        <MultiSelectDropdown
          label="Firmware"
          options={["ArduPilot", "PX4"]}
          selected={firmwares}
          setSelected={setFirmwares}
        />

        <MultiSelectDropdown
          label="Update Rate"
          options={["5", "10"]}
          selected={updateRates}
          setSelected={setUpdateRates}
        />

        <button onClick={handleSearch}>
          {loading ? "Searching…" : "Search"}
        </button>

      </section>

      {/* RESULTS */}
      <section className="dashboard-content grid">

        {results.length === 0 && !loading && (
          <div className="placeholder-card">
            <h3>No GPS Data Loaded</h3>
            <p>Apply filters to retrieve GPS modules.</p>
          </div>
        )}

        {results.map((g) => (
          <div className="data-card" key={g.gps_code}>
            <h3>{g.gps_code}</h3>

            <p><strong>Brand:</strong> {g.brand}</p>
            <p><strong>GNSS:</strong> {g.gnss_support}</p>
            <p><strong>Compass:</strong> {g.compass_included}</p>

            <p><strong>Update Rate:</strong> {g.update_rate_hz} Hz</p>
            <p><strong>Interface:</strong> {g.interface_type}</p>

            <p><strong>Voltage:</strong> {g.voltage_input}</p>
            <p><strong>Antenna:</strong> {g.antenna_type}</p>

            <p><strong>Mount:</strong> {g.mounting_type}</p>
            <p><strong>Firmware:</strong> {g.supported_firmware}</p>

            <p><strong>Drone Type:</strong> {g.supported_drone_type}</p>
            <p><strong>Use:</strong> {g.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}