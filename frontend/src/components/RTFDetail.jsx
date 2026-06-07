import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function RTFDetail() {

  const { id } = useParams();

  const [rtf, setRtf] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchRTF = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/rtf/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch RTF");
      }

      const data = await res.json();

      setRtf(data);

    } catch (err) {

      console.error("RTF detail error:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchRTF();

  }, [fetchRTF]);

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading UAV intelligence...</h2>
      </div>
    );
  }

  if (!rtf) {

    return (
      <div className="dashboard-root">
        <h2>RTF UAV not found</h2>
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

        <span>Ready-to-Fly UAV Report</span>

      </header>

      <section className="dashboard-content grid">

        <div className="data-card large">

          <h2>{rtf.manufacturer}</h2>

        </div>

        <div className="data-card">
          <h3>Drone Type</h3>
          <p>{rtf.drone_type}</p>
        </div>

        <div className="data-card">
          <h3>Build Level</h3>
          <p>{rtf.build_level}</p>
        </div>

        <div className="data-card">
          <h3>Frame Size</h3>
          <p>{rtf.frame_size} inch</p>
        </div>

        <div className="data-card">
          <h3>Wheelbase</h3>
          <p>{rtf.wheelbase} mm</p>
        </div>

        <div className="data-card">
          <h3>Motor</h3>
          <p>{rtf.motor_spec}</p>
        </div>

        <div className="data-card">
          <h3>Propellers</h3>
          <p>{rtf.propeller_spec}</p>
        </div>

        <div className="data-card">
          <h3>Battery</h3>
          <p>{rtf.battery_spec}</p>
        </div>

        <div className="data-card">
          <h3>Flight Controller</h3>
          <p>{rtf.flight_controller}</p>
        </div>

        <div className="data-card">
          <h3>Firmware</h3>
          <p>{rtf.firmware}</p>
        </div>

        <div className="data-card">
          <h3>Payload</h3>
          <p>{rtf.payload_support}</p>
        </div>

        <div className="data-card">
          <h3>MTOW</h3>
          <p>{rtf.max_takeoff_kg} kg</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{rtf.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}