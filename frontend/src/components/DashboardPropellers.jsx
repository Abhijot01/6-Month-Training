import { useState } from "react";
import { motion } from "framer-motion";
import AdminActions from "./AdminActions";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function DashboardPropellers() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [propTypes, setPropTypes] = useState([]);
  const [diameters, setDiameters] = useState([]);
  const [bladeCounts, setBladeCounts] = useState([]);
  const [mountTypes, setMountTypes] = useState([]);

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
      propType: propTypes.join(","),
      diameter: diameters.join(","),
      bladeCount: bladeCounts.join(","),
      mountType: mountTypes.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/propellers/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Propeller search failed", err);
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
        <span>Propeller Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "APC",
  "Azure Power",
  "BROTHERHOBBY",
  "Carbonix",
  "Custom",
  "DALProp",
  "Ethix",
  "Foxeer",
  "Gemfan",
  "Gemfan Hurricane",
  "HQProp",
  "iFlight",
  "Lumenier",
  "Master Airscrew",
  "T-Motor"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Sub Category"
          options={["FPV Props", "Cinewhoop", "Micro FPV", "Fixed Wing"]}
          selected={subCategories}
          setSelected={setSubCategories}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Prop Type"
          options={["Standard", "Signature", "Ducted"]}
          selected={propTypes}
          setSelected={setPropTypes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Diameter"
          options={["2", "2.5", "3", "3.5", "5", "6", "7"]}
          selected={diameters}
          setSelected={setDiameters}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Blade Count"
          options={["2", "3", "4"]}
          selected={bladeCounts}
          setSelected={setBladeCounts}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Mount Type"
          options={["5mm Shaft", "1.5mm Shaft", "Press Fit"]}
          selected={mountTypes}
          setSelected={setMountTypes}
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
            <h3>No Propeller Data Loaded</h3>
            <p>Apply filters to retrieve propeller intelligence.</p>
          </div>
        )}

        {results.map((p) => (
          <div className="data-card" key={p.prop_code}>
            <h3>{p.prop_code}</h3>

            <p><strong>Manufacturer:</strong> {p.manufacturer}</p>
            <p><strong>Category:</strong> {p.sub_category}</p>
            <p><strong>Type:</strong> {p.prop_type}</p>

            <p><strong>Diameter:</strong> {p.diameter_in} inch</p>
            <p><strong>Pitch:</strong> {p.pitch_in}</p>
            <p><strong>Blades:</strong> {p.blade_count}</p>

            <p><strong>Material:</strong> {p.material}</p>
            <p><strong>Mount:</strong> {p.mount_type}</p>
            <p><strong>Rotation:</strong> {p.rotation}</p>

            <p><strong>Compatible:</strong> {p.compatible_drone_type}</p>
            <p><strong>Use:</strong> {p.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}