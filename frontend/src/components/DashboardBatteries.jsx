import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import AdminActions from "./AdminActions";
import "../styles/dashboard.css";
import GlobalSearch from "./GlobalSearch";
import MultiSelectDropdown from "./MultiSelectDropdown";

export default function DashboardBatteries() {

  /* FILTER STATES */
  const [chemistries, setChemistries] = useState([]);
  const [cellCounts, setCellCounts] = useState([]);
  const [connectors, setConnectors] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [capacities, setCapacities] = useState([]);
  const [voltages, setVoltages] = useState([]);

  /* DATA */
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [closeAll, setCloseAll] = useState(false);

  /* URL PARAMS */
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const partId = queryParams.get("id");

  /* =========================================
     AUTO LOAD ALL BATTERIES
  ========================================= */

  useEffect(() => {

  if (partId) {

    loadBatteryDetail(partId);
  }

}, [partId]);

  /* =========================================
     LOAD SINGLE BATTERY
  ========================================= */

  const loadBatteryDetail = async (id) => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/batteries/${id}`
      );

      const data = await res.json();

      console.log("BATTERY DETAIL:", data);

      if (data && !data.error) {

        setResults([data]);

      } else {

        setResults([]);
      }

    } catch (err) {

      console.error("Battery detail failed:", err);
      setResults([]);

    } finally {

      setLoading(false);
    }
  };

  /* =========================================
     LOAD ALL BATTERIES
  ========================================= */

/*  const loadAllBatteries = async () => {

    try {

      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/parts/batteries/search"
      );

      const data = await res.json();

      console.log("ALL BATTERIES:", data);

      if (Array.isArray(data)) {

        setResults(data);

      } else {

        setResults([]);
      }

    } catch (err) {

      console.error("Load batteries failed:", err);
      setResults([]);

    } finally {

      setLoading(false);
    }
  };
*/
  /* =========================================
     FILTER SEARCH
  ========================================= */

  const handleSearch = async () => {

  setLoading(true);

  setCloseAll(true);
  setTimeout(() => setCloseAll(false), 100);

  const params = new URLSearchParams();

  if (chemistries.length)
    params.append("chemistry", chemistries.join(","));

  if (cellCounts.length)
    params.append("cellCount", cellCounts.join(","));

  if (connectors.length)
    params.append("connector", connectors.join(","));

  if (manufacturers.length)
    params.append("manufacturer", manufacturers.join(","));

  if (capacities.length)
    params.append("capacityMin", capacities.join(","));

  if (voltages.length)
    params.append("voltageMin", voltages.join(","));

  const finalUrl =
    `http://localhost:5000/api/parts/batteries/search?${params.toString()}`;

  console.log("=================================");
  console.log("BATTERY SEARCH URL:");
  console.log(finalUrl);

  console.log("FILTER STATES:");
  console.log({
    chemistries,
    cellCounts,
    connectors,
    manufacturers,
    capacities,
    voltages
  });

  try {

    const res = await fetch(finalUrl);

    console.log("FETCH STATUS:");
    console.log(res.status);

    const data = await res.json();

    console.log("BATTERY SEARCH RESPONSE:");
    console.log(data);

    console.log("IS ARRAY?");
    console.log(Array.isArray(data));

    if (Array.isArray(data)) {

      console.log("SETTING RESULTS");
      setResults(data);

    } else {

      console.log("NOT ARRAY -> EMPTY");
      setResults([]);
    }

  } catch (err) {

    console.error("BATTERY SEARCH FAILED:");
    console.error(err);

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

        <span>Battery Intelligence Catalog</span>

        <GlobalSearch />

      </header>

      {/* FILTERS */}

      <section className="dashboard-filters">

        <MultiSelectDropdown
          label="Chemistry"
          options={["LiPo", "Li-ion"]}
          selected={chemistries}
          setSelected={setChemistries}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Cell Count"
          options={["3", "4", "6", "12", "18"]}
          selected={cellCounts}
          setSelected={setCellCounts}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Connector"
          options={["XT60", "XT90", "AS150"]}
          selected={connectors}
          setSelected={setConnectors}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Manufacturer"
          options={[
  "BetaFPV",
  "Bonka",
  "CNHL",
  "Custom",
  "Dinogy",
  "DOGCOM",
  "Flywoo",
  "Gaoneng GNB",
  "Gens Ace",
  "Grepow",
  "Herewin",
  "HRB",
  "Ovonic",
  "Panasonic",
  "Samsung",
  "Tattu",
  "Turnigy",
  "Youme",
  "Zeee"
]}
          selected={manufacturers}
          setSelected={setManufacturers}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Capacity (mAh)"
          options={["1000", "1500", "2000", "3000"]}
          selected={capacities}
          setSelected={setCapacities}
          closeAll={closeAll}
        />

        <MultiSelectDropdown
          label="Voltage (V)"
          options={["11.1", "14.8", "22.2"]}
          selected={voltages}
          setSelected={setVoltages}
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

            <h3>No Battery Data Loaded</h3>

            <p>
              Apply filters to retrieve battery intelligence.
            </p>

          </div>
        )}

        {results.map((b) => (

          <div
            className="data-card"
            key={b.battery_id}
          >

            <h3>{b.battery_code || "Unknown Battery"}</h3>

            <p>
              <strong>Manufacturer:</strong>{" "}
              {b.manufacturer || "-"}
            </p>

            <p>
              <strong>Chemistry:</strong>{" "}
              {b.battery_chemistry || "-"}
            </p>

            <p>
              <strong>Cells:</strong>{" "}
              {b.cell_count || "-"}S
            </p>

            <p>
              <strong>Voltage:</strong>{" "}
              {b.voltage_v || "-"} V
            </p>

            <p>
              <strong>Capacity:</strong>{" "}
              {b.capacity_mah || "-"} mAh
            </p>

            <p>
              <strong>Discharge:</strong>{" "}
              {b.discharge_rate_c || "-"} C
            </p>

            <p>
              <strong>Energy:</strong>{" "}
              {b.energy_wh || "-"} Wh
            </p>

            <p>
              <strong>Connector:</strong>{" "}
              {b.connector_type || "-"}
            </p>

            <p>
              <strong>Use:</strong>{" "}
              {b.intended_use || "-"}
            </p>

          </div>
        ))}

      </section>

    </motion.div>
  );
}