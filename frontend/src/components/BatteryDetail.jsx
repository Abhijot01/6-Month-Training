import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function BatteryDetail() {

  const { id } = useParams();

  const [battery, setBattery] = useState(null);

  const [loading, setLoading] = useState(true);

  /* ================= LOAD BATTERY ================= */

  useEffect(() => {

    const loadBattery = async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/api/parts/batteries/${id}`
        );

        const data = await res.json();

        setBattery(data);

      } catch (err) {

        console.error(
          "Battery detail load failed:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

    loadBattery();

  }, [id]);

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading Battery Intelligence...</h2>
      </div>
    );
  }

  /* ================= NOT FOUND ================= */

  if (!battery) {

    return (
      <div className="dashboard-root">
        <h2>Battery Not Found</h2>
      </div>
    );
  }

  /* ================= UI ================= */

  return (

    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* ================= HEADER ================= */}

      <header className="dashboard-header">

        <h1>Drone Forensics</h1>

        <span>
          Battery Intelligence Report
        </span>

      </header>

      {/* ================= HERO ================= */}

      <section
        className="data-card"
        style={{
          marginBottom: 30
        }}
      >

        <h1
          style={{
            fontSize: "2.5rem",
            marginBottom: 10
          }}
        >
          {battery.battery_code}
        </h1>

        <h3
          style={{
            color: "#00ffe1",
            marginBottom: 20
          }}
        >
          {battery.battery_chemistry} Battery
        </h3>

        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap"
          }}
        >

          <div className="mini-stat">
            {battery.cell_count}S
          </div>

          <div className="mini-stat">
            {battery.voltage_v}V
          </div>

          <div className="mini-stat">
            {battery.capacity_mah}mAh
          </div>

        </div>

      </section>

      {/* ================= SPEC GRID ================= */}

      <section className="dashboard-content grid">

        <div className="data-card">
          <h3>Manufacturer</h3>
          <p>{battery.manufacturer}</p>
        </div>

        <div className="data-card">
          <h3>Voltage</h3>
          <p>{battery.voltage_v} V</p>
        </div>

        <div className="data-card">
          <h3>Capacity</h3>
          <p>{battery.capacity_mah} mAh</p>
        </div>

        <div className="data-card">
          <h3>Discharge Rate</h3>
          <p>{battery.discharge_rate_c} C</p>
        </div>

        <div className="data-card">
          <h3>Energy</h3>
          <p>{battery.energy_wh} Wh</p>
        </div>

        <div className="data-card">
          <h3>Connector</h3>
          <p>{battery.connector_type}</p>
        </div>

        <div className="data-card">
          <h3>Compatible Drone</h3>
          <p>{battery.compatible_drone_type}</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{battery.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}