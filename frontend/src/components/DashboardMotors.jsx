import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";

export default function DashboardMotors() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [motorTypes, setMotorTypes] = useState([]);
  const [kvRanges, setKvRanges] = useState([]);
  const [powerRanges, setPowerRanges] = useState([]);
  const [shaftDiameters, setShaftDiameters] = useState([]);
  const [propSizes, setPropSizes] = useState([]);

  /* CONTROL */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closeAll, setCloseAll] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    // close dropdowns
    setCloseAll(true);
    setTimeout(() => setCloseAll(false), 100);

    const params = new URLSearchParams({
      manufacturer: manufacturers.join(","),
      subCategory: subCategories.join(","),
      motorType: motorTypes.join(","),
      kvMin: kvRanges.join(","),          // backend supports min filters
      powerMin: powerRanges.join(","),
      shaftDiameter: shaftDiameters.join(","),
      propSize: propSizes.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/motors/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Motor search failed", err);
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
        <span>Motor Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "AxisFlying",
  "BROTHERHOBBY",
  "Cobra",
  "Eachine",
  "EMAX",
  "Flywoo",
  "Foxeer",
  "Freewing",
  "GEPRC",
  "HappyModel",
  "HGLRC",
  "iFlight",
  "KDE Direct",
  "Lumenier",
  "Makerfire",
  "NewBeeDrone",
  "RCINPOWER",
  "SunnySky",
  "T-Motor",
  "Turnigy",
  "XNova"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Sub Category"
          options={[
            "FPV Motor",
            "Micro FPV Motor",
            "Multirotor Motor",
            "Industrial UAV Motor",
            "Fixed Wing Motor",
          ]}
          selected={subCategories}
          setSelected={setSubCategories}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Motor Type"
          options={[
            "Brushless Outrunner",
            "Brushless Inrunner",
          ]}
          selected={motorTypes}
          setSelected={setMotorTypes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="KV Range"
          options={["500", "1000", "1500", "2000", "3000"]}
          selected={kvRanges}
          setSelected={setKvRanges}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Power (W)"
          options={["300", "600", "1000", "2000"]}
          selected={powerRanges}
          setSelected={setPowerRanges}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Shaft Diameter"
          options={["1", "1.5", "3", "5", "6", "8"]}
          selected={shaftDiameters}
          setSelected={setShaftDiameters}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Prop Size"
          options={[
            "3 inch",
            "5 inch",
            "7 inch",
            "10 inch",
            "15 inch",
            "30+ inch",
          ]}
          selected={propSizes}
          setSelected={setPropSizes}
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
            <h3>No Motor Data Loaded</h3>
            <p>Apply filters to retrieve motor intelligence.</p>
          </div>
        )}

        {results.map((m) => (
          <div className="data-card" key={m.motor_code}>
            <h3>{m.motor_code}</h3>

            <p><strong>Manufacturer:</strong> {m.manufacturer}</p>
            <p><strong>Category:</strong> {m.sub_category}</p>
            <p><strong>Type:</strong> {m.motor_type}</p>

            <p><strong>KV Rating:</strong> {m.kv_rating}</p>
            <p><strong>Max Current:</strong> {m.max_current_a} A</p>
            <p><strong>Max Power:</strong> {m.max_power_w} W</p>

            <p><strong>Shaft:</strong> {m.shaft_diameter}</p>
            <p><strong>Mount:</strong> {m.mount_pattern}</p>
            <p><strong>Recommended Prop:</strong> {m.recommended_prop_size}</p>

            <p><strong>Compatible:</strong> {m.compatible_drone_type}</p>
            <p><strong>Use:</strong> {m.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}