import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ChargerDetail() {

  const { id } = useParams();

  const [charger, setCharger] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH ================= */

useEffect(() => {

  async function fetchCharger() {

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/chargers/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed");
      }

      const data = await res.json();

      setCharger(data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);

    }
  }

  fetchCharger();

}, [id]);

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading charger...</h2>
      </div>
    );
  }

  /* ================= NOT FOUND ================= */

  if (!charger) {

    return (
      <div className="dashboard-root">
        <h2>Charger Not Found</h2>
      </div>
    );
  }

  return (

    <div className="dashboard-root">

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">

        <h1>
          Drone Forensics
        </h1>

        <span>
          Charger Intelligence Report
        </span>

      </header>

      {/* ================= HERO ================= */}

      <section
        className="result-card"
        style={{
          marginBottom: "30px"
        }}
      >

        <h2>
          {charger.charger_code}
        </h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            flexWrap: "wrap"
          }}
        >

          <div className="filter-chip">
            {charger.charger_type}
          </div>

          <div className="filter-chip">
            {charger.max_charge_power_w} W
          </div>

          <div className="filter-chip">
            {charger.port_type}
          </div>

        </div>

      </section>

      {/* ================= DETAILS GRID ================= */}

      <section
        className="results-grid"
        style={{
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))"
        }}
      >

        {/* ================= MANUFACTURER ================= */}

        <div className="result-card">

          <h3>Manufacturer</h3>

          <p>
            {charger.manufacturer || "-"}
          </p>

        </div>

        {/* ================= CATEGORY ================= */}

        <div className="result-card">

          <h3>Sub Category</h3>

          <p>
            {charger.sub_category || "-"}
          </p>

        </div>

        {/* ================= TYPE ================= */}

        <div className="result-card">

          <h3>Charger Type</h3>

          <p>
            {charger.charger_type || "-"}
          </p>

        </div>

        {/* ================= CHEMISTRY ================= */}

        <div className="result-card">

          <h3>Supported Chemistry</h3>

          <p>
            {charger.supported_chemistry || "-"}
          </p>

        </div>

        {/* ================= POWER ================= */}

        <div className="result-card">

          <h3>Charge Power</h3>

          <p>
            {charger.max_charge_power_w} W
          </p>

        </div>

        {/* ================= INPUT ================= */}

        <div className="result-card">

          <h3>Input Voltage</h3>

          <p>
            {charger.input_voltage || "-"}
          </p>

        </div>

        {/* ================= OUTPUT ================= */}

        <div className="result-card">

          <h3>Output Current</h3>

          <p>
            {charger.output_current || "-"}
          </p>

        </div>

        {/* ================= BALANCER ================= */}

        <div className="result-card">

          <h3>Balancer Type</h3>

          <p>
            {charger.balancer_type || "-"}
          </p>

        </div>

        {/* ================= PORT ================= */}

        <div className="result-card">

          <h3>Port Type</h3>

          <p>
            {charger.port_type || "-"}
          </p>

        </div>

        {/* ================= PLATFORM ================= */}

        <div className="result-card">

          <h3>Supported Platform</h3>

          <p>
            {charger.supported_platform || "-"}
          </p>

        </div>

        {/* ================= USE ================= */}

        <div className="result-card">

          <h3>Intended Use</h3>

          <p>
            {charger.intended_use || "-"}
          </p>

        </div>

      </section>

    </div>
  );
}