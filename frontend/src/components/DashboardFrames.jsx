import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";
export default function DashboardFrames() {

  /* MULTI SELECT STATES */
  const [manufacturers, setManufacturers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [frameTypes, setFrameTypes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [mountings, setMountings] = useState([]);

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
      frameType: frameTypes.join(","),
      sizeInch: sizes.join(","),
      material: materials.join(","),
      mounting: mountings.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/frames/search?${params.toString()}`
      );

      if (!res.ok) throw new Error("API failed");

      const data = await res.json();

      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Frame search failed", err);
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
        <span>Frame Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "Armattan",
  "AtomRC",
  "AxisFlying",
  "BetaFPV",
  "Custom",
  "Diatone",
  "Flywoo",
  "Foxeer",
  "GEPRC",
  "HappyModel",
  "HGLRC",
  "Holybro",
  "iFlight",
  "ImpulseRC",
  "Lumenier",
  "RCExplorer",
  "RekonFPV",
  "Reptile",
  "RMRC",
  "T-Motor",
  "Tarot",
  "TBS",
  "Zeta"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Sub Category"
          options={["FPV Frame", "Fixed Wing"]}
          selected={subCategories}
          setSelected={setSubCategories}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Frame Type"
          options={[
            "Whoop Frame",
            "Cinewhoop Frame",
            "Freestyle Frame",
            "Long Range Frame",
            "Airplane Frame"
          ]}
          selected={frameTypes}
          setSelected={setFrameTypes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Size (inch)"
          options={[
            "2",
            "2.5",
            "3",
            "3.5",
            "5",
            "6",
            "7",
            "8",
            "9",
            "10"
          ]}
          selected={sizes}
          setSelected={setSizes}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Material"
          options={[
            "Carbon",
            "Carbon + Fiber",
            "Plastic",
            "EPO Foam"
          ]}
          selected={materials}
          setSelected={setMaterials}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Mounting"
          options={[
            "Whoop",
            "20x20",
            "30x30",
            "Fixed Wing"
          ]}
          selected={mountings}
          setSelected={setMountings}
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
            <h3>No Frame Data Loaded</h3>
            <p>Apply filters to retrieve frame intelligence.</p>
          </div>
        )}

        {results.map((f) => (
          <div className="data-card" key={f.frame_code}>
            <h3>{f.frame_code}</h3>

            <p><strong>Manufacturer:</strong> {f.manufacturer}</p>
            <p><strong>Category:</strong> {f.sub_category}</p>
            <p><strong>Type:</strong> {f.frame_type}</p>

            <p><strong>Size:</strong> {f.size_inch} inch</p>
            <p><strong>Wheelbase:</strong> {f.wheelbase_mm} mm</p>

            <p><strong>Material:</strong> {f.material}</p>
            <p><strong>Arm Type:</strong> {f.arm_type}</p>
            <p><strong>Mounting:</strong> {f.mounting}</p>

            <p><strong>Supported:</strong> {f.supported_drone_type}</p>
            <p><strong>Use:</strong> {f.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}