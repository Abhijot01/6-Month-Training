import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AdminActions from "./AdminActions";
import "../styles/partsCatalog.css";
import GlobalSearch from "./GlobalSearch";

export default function DashboardDrones() {

  const navigate = useNavigate();

  const [countries, setCountries] = useState([]);
  const [droneClasses, setDroneClasses] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [armament, setArmament] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  /* LOAD DROPDOWNS */
  useEffect(() => {
    fetch("http://localhost:5000/api/dropdowns/countries")
      .then(res => res.json())
      .then(setCountries);

    fetch("http://localhost:5000/api/dropdowns/drone-classes")
      .then(res => res.json())
      .then(setDroneClasses);

    fetch("http://localhost:5000/api/dropdowns/roles")
      .then(res => res.json())
      .then(setRoles);
  }, []);

  /* SEARCH */
  const handleSearch = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/search/military", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: selectedCountry,
          droneClass: selectedClass,
          role: selectedRole,
          armament,
        }),
      });

      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Drone search failed", err);
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
        <span>Military UAV Intelligence</span>
        <GlobalSearch />
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters">

        <select
          value={selectedCountry}
          onChange={e => setSelectedCountry(e.target.value)}
        >
          <option value="">All Countries</option>
          {countries.map(c => <option key={c}>{c}</option>)}
        </select>

        <select
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {droneClasses.map(c => <option key={c}>{c}</option>)}
        </select>

        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
        >
          <option value="">All Roles</option>
          {roles.map(r => <option key={r}>{r}</option>)}
        </select>

        <select
          value={armament}
          onChange={e => setArmament(e.target.value)}
        >
          <option value="">Armament</option>
          <option value="1">Armed</option>
          <option value="0">Unarmed</option>
        </select>

        <button onClick={handleSearch}>
          {loading ? "Scanning…" : "Search"}
        </button>

      </section>

      {/* RESULTS */}
      <section className="dashboard-content grid">

        {loading && (
          <div className="placeholder-card">
            <h3>Scanning intelligence…</h3>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="placeholder-card">
            <h3>No Intelligence Found</h3>
          </div>
        )}

        {results.map((r, i) => (
          <div
            key={i}
            className="data-card military-card"
            onClick={() => navigate(`/dashboard/drones/${r.variant_id}`)}
          >
            <h3>{r.platform_name}</h3>
            <p>{r.variant_name}</p>
          </div>
        ))}

      </section>

    </motion.div>
  );
}