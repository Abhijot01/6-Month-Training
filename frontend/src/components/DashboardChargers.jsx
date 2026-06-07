import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import AdminActions from "./AdminActions";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function DashboardChargers() {

  /* FILTER STATES */

  const [manufacturers, setManufacturers] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [chemistries, setChemistries] = useState([]);
  const [powers, setPowers] = useState([]);
  const [portTypes, setPortTypes] = useState([]);

  /* DATA */

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closeAll, setCloseAll] = useState(false);

  /* URL */

  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  const chargerId = queryParams.get("id");

  /* =========================================
     DETAIL LOAD
  ========================================= */

  useEffect(() => {

    if (chargerId) {

      loadChargerDetail(chargerId);
    }

  }, [chargerId]);

  /* =========================================
     CHARGER DETAIL
  ========================================= */

  const loadChargerDetail = async (id) => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/chargers/${id}`
      );

      const data = await res.json();

      if (data && !data.error) {

        setResults([data]);

      } else {

        setResults([]);
      }

    } catch (err) {

      console.error("Charger detail failed:", err);

      setResults([]);

    } finally {

      setLoading(false);
    }
  };

  /* =========================================
     SEARCH
  ========================================= */

  const handleSearch = async () => {

    setLoading(true);

    setCloseAll(true);
    setTimeout(() => setCloseAll(false), 100);

    const params = new URLSearchParams();

    if (manufacturers.length)
      params.append("manufacturer", manufacturers.join(","));

    if (subCategories.length)
      params.append("subCategory", subCategories.join(","));

    if (chemistries.length)
      params.append("chemistry", chemistries.join(","));

    if (powers.length)
      params.append("powerMin", powers.join(","));

    if (portTypes.length)
      params.append("portType", portTypes.join(","));

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/chargers/search?${params.toString()}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {

        setResults(data);

      } else {

        setResults([]);
      }

    } catch (err) {

      console.error("Charger search failed:", err);

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


        <span>Charger Intelligence Catalog</span>

        <GlobalSearch />

      </header>

      {/* FILTERS */}

      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Manufacturer"
          options={["Custom","EV-Peak","GensAce","Grepow","HOTA","ISDT","SkyRC","Tattu","Tenergy","Turnigy"]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Sub Category"
          options={["Smart Charger", "Industrial Charger"]}
          selected={subCategories}
          setSelected={setSubCategories}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Chemistry"
          options={["LiPo", "Li-ion"]}
          selected={chemistries}
          setSelected={setChemistries}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Power (W)"
          options={["100", "250", "500"]}
          selected={powers}
          setSelected={setPowers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Port Type"
          options={["XT60", "USB-C"]}
          selected={portTypes}
          setSelected={setPortTypes}
          closeAll={closeAll}
        />

        <button onClick={handleSearch}>
          {loading ? "Searching..." : "Search"}
        </button>

      </section>

      {/* RESULTS */}

      <section className="dashboard-content grid">

        {!loading && results.length === 0 && (

          <div className="placeholder-card">

            <h3>No Charger Data Loaded</h3>

            <p>
              Apply filters to retrieve charger intelligence.
            </p>

          </div>
        )}

        {results.map((c) => (

          <div
            className="data-card"
            key={c.charger_id}
          >

            <h3>{c.charger_code}</h3>

            <p>
              <strong>Manufacturer:</strong>{" "}
              {c.manufacturer || "-"}
            </p>

            <p>
              <strong>Category:</strong>{" "}
              {c.sub_category || "-"}
            </p>

            <p>
              <strong>Type:</strong>{" "}
              {c.charger_type || "-"}
            </p>

            <p>
              <strong>Chemistry:</strong>{" "}
              {c.supported_chemistry || "-"}
            </p>

            <p>
              <strong>Power:</strong>{" "}
              {c.max_charge_power_w || "-"} W
            </p>

            <p>
              <strong>Input:</strong>{" "}
              {c.input_voltage || "-"}
            </p>

            <p>
              <strong>Output:</strong>{" "}
              {c.output_current || "-"}
            </p>

            <p>
              <strong>Balancer:</strong>{" "}
              {c.balancer_type || "-"}
            </p>

            <p>
              <strong>Port:</strong>{" "}
              {c.port_type || "-"}
            </p>

            <p>
              <strong>Use:</strong>{" "}
              {c.intended_use || "-"}
            </p>

          </div>
        ))}

      </section>

    </motion.div>
  );
}