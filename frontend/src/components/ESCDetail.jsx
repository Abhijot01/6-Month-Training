import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function ESCDetail() {

  const { id } = useParams();

  const [esc, setEsc] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchESC = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/esc/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch ESC");
      }

      const data = await res.json();

      setEsc(data);

    } catch (err) {

      console.error("ESC detail error:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchESC();

  }, [fetchESC]);

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading ESC intelligence...</h2>
      </div>
    );
  }

  if (!esc) {

    return (
      <div className="dashboard-root">
        <h2>ESC not found</h2>
      </div>
    );
  }

  return (

    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      <header className="dashboard-header">

        <h1>Drone Forensics</h1>

        <span>ESC Intelligence Report</span>

      </header>

      <section className="dashboard-content grid">

        <div className="data-card large">

          <h2>{esc.esc_code}</h2>

        </div>

        <div className="data-card">
          <h3>Manufacturer</h3>
          <p>{esc.manufacturer}</p>
        </div>

        <div className="data-card">
          <h3>ESC Type</h3>
          <p>{esc.esc_type}</p>
        </div>

        <div className="data-card">
          <h3>Continuous Current</h3>
          <p>{esc.continuous_current_a}A</p>
        </div>

        <div className="data-card">
          <h3>Burst Current</h3>
          <p>{esc.burst_current_a}A</p>
        </div>

        <div className="data-card">
          <h3>Voltage</h3>
          <p>{esc.supported_voltage}</p>
        </div>

        <div className="data-card">
          <h3>Firmware</h3>
          <p>{esc.firmware}</p>
        </div>

        <div className="data-card">
          <h3>Protocol</h3>
          <p>{esc.input_protocol}</p>
        </div>

        <div className="data-card">
          <h3>Mount Pattern</h3>
          <p>{esc.mount_pattern}</p>
        </div>

        <div className="data-card">
          <h3>BEC Output</h3>
          <p>{esc.bec_output}</p>
        </div>

        <div className="data-card">
          <h3>Cooling</h3>
          <p>{esc.cooling_method}</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{esc.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}