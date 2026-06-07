import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";
export default function DashboardFirmware() {
  const [categories, setCategories] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [adoptions, setAdoptions] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      category: categories.join(","),
      license: licenses.join(","),
      status: statuses.join(","),
      adoption: adoptions.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/firmware/search?${params}`
      );

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Firmware search failed", err);
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
          <span>Firmware Intelligence Catalog</span>
          <GlobalSearch />
        </header>

        <section className="dashboard-filters">

          <MultiSelectDropdown
            label="Category"
            options={["Flight Controller Firmware", "ESC Firmware", "Autopilot Firmware"]}
            selected={categories}
            setSelected={setCategories}
          />

          <MultiSelectDropdown
            label="License"
            options={["Open Source", "Proprietary"]}
            selected={licenses}
            setSelected={setLicenses}
          />

          <MultiSelectDropdown
            label="Development Status"
            options={["Active", "Deprecated", "Experimental"]}
            selected={statuses}
            setSelected={setStatuses}
          />

          <MultiSelectDropdown
            label="Industry Adoption"
            options={["Very High", "High", "Medium", "Low"]}
            selected={adoptions}
            setSelected={setAdoptions}
          />

        <button onClick={handleSearch}>
            {loading ? "Searching…" : "Search"}
          </button>

        </section>

        <section className="dashboard-content grid">
          {results.map((f) => (
            <div className="data-card" key={f.firmware_code}>
              <h3>{f.name}</h3>

              <p><strong>Code:</strong> {f.firmware_code}</p>
              <p><strong>Category:</strong> {f.category}</p>
              <p><strong>Purpose:</strong> {f.purpose}</p>

              <p><strong>License:</strong> {f.license_type}</p>
              <p><strong>Status:</strong> {f.development_status}</p>

              <p><strong>Adoption:</strong> {f.industry_adoption}</p>

              <p><strong>Use:</strong> {f.typical_use}</p>
            </div>
          ))}
        </section>
      </motion.div>
  );
}