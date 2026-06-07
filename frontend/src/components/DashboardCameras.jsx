import { useState } from "react";
import { motion } from "framer-motion";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";
import AdminActions from "./AdminActions";
export default function DashboardCameras() {

  /* MULTI SELECT STATES */
  const [brands, setBrands] = useState([]);
  const [cameraTypes, setCameraTypes] = useState([]);
  const [sensorTypes, setSensorTypes] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [interfaces, setInterfaces] = useState([]);
  const [minWeights, setMinWeights] = useState([]);
  const [maxWeights, setMaxWeights] = useState([]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    const params = new URLSearchParams({
      brand: brands.join(","),
      type: cameraTypes.join(","),
      sensor: sensorTypes.join(","),
      resolution: resolutions.join(","),
      interfaceType: interfaces.join(","),
      minWeight: minWeights.join(","),
      maxWeight: maxWeights.join(","),
    });

    try {
      const res = await fetch(
        `http://localhost:5000/api/parts/cameras/search?${params.toString()}`
      );

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error("Camera search failed", err);
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
        <span>Camera Intelligence Catalog</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Brand"
          options={[
  "Caddx",
  "DJI",
  "Foxeer",
  "GREMSY",
  "HAWKEYE",
  "HDZERO",
  "MICASENSE",
  "NEXTVISION",
  "RUNCAM",
  "SENTERA",
  "SiYi",
  "VIEWPRO",
  "Walksnail",
  "WORKSWELL"
]}
          selected={brands}
          setSelected={setBrands}
        />

        <MultiSelectDropdown
          label="Camera Type"
          options={["FPV Camera", "HD Camera", "Thermal Camera"]}
          selected={cameraTypes}
          setSelected={setCameraTypes}
        />

        <MultiSelectDropdown
          label="Sensor"
          options={["CMOS", "CCD"]}
          selected={sensorTypes}
          setSelected={setSensorTypes}
        />

        <MultiSelectDropdown
          label="Resolution"
          options={["720p", "1080p", "4K"]}
          selected={resolutions}
          setSelected={setResolutions}
        />

        <MultiSelectDropdown
          label="Interface"
          options={["Analog", "Digital"]}
          selected={interfaces}
          setSelected={setInterfaces}
        />

        <MultiSelectDropdown
          label="Min Weight"
          options={["5", "10", "20"]}
          selected={minWeights}
          setSelected={setMinWeights}
        />

        <MultiSelectDropdown
          label="Max Weight"
          options={["10", "20", "50"]}
          selected={maxWeights}
          setSelected={setMaxWeights}
        />

        <button onClick={handleSearch}>
          {loading ? "Searching…" : "Search"}
        </button>

      </section>

      {/* RESULTS */}
      <section className="dashboard-content grid">

        {results.length === 0 && !loading && (
          <div className="placeholder-card">
            <h3>No Camera Data Loaded</h3>
            <p>Apply filters to retrieve camera intelligence.</p>
          </div>
        )}

        {results.map((c) => (
          <div className="data-card" key={c.camera_code}>
            <h3>{c.camera_code}</h3>

            <p><strong>Brand:</strong> {c.brand}</p>
            <p><strong>Type:</strong> {c.camera_type}</p>
            <p><strong>Sensor:</strong> {c.sensor_type}</p>

            <p><strong>Resolution:</strong> {c.resolution}</p>
            <p><strong>Video:</strong> {c.video_system}</p>

            <p><strong>Lens:</strong> {c.lens_size_mm} mm</p>
            <p><strong>FOV:</strong> {c.field_of_view_deg}°</p>

            <p><strong>Interface:</strong> {c.interface_type}</p>
            <p><strong>Mount:</strong> {c.mount_type}</p>

            <p><strong>Weight:</strong> {c.weight_g} g</p>
            <p><strong>Drone Type:</strong> {c.supported_drone_type}</p>
            <p><strong>Use:</strong> {c.intended_use}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}