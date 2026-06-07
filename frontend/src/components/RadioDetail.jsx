import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function RadioDetail() {

  const { id } = useParams();

  const [radio, setRadio] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchRadio = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/radios/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch radio");
      }

      const data = await res.json();

      setRadio(data);

    } catch (err) {

      console.error("Radio detail error:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchRadio();

  }, [fetchRadio]);

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading radio intelligence...</h2>
      </div>
    );
  }

  if (!radio) {

    return (
      <div className="dashboard-root">
        <h2>Radio not found</h2>
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

        <span>Radio Intelligence Report</span>

      </header>

      <section className="dashboard-content grid">

        <div className="data-card large">

          <h2>{radio.radio_code}</h2>

        </div>

        <div className="data-card">
          <h3>Manufacturer</h3>
          <p>{radio.manufacturer}</p>
        </div>

        <div className="data-card">
          <h3>Device Type</h3>
          <p>{radio.device_type}</p>
        </div>

        <div className="data-card">
          <h3>Protocol</h3>
          <p>{radio.protocol}</p>
        </div>

        <div className="data-card">
          <h3>Frequency</h3>
          <p>{radio.frequency}</p>
        </div>

        <div className="data-card">
          <h3>Channels</h3>
          <p>{radio.channel_count}</p>
        </div>

        <div className="data-card">
          <h3>Telemetry</h3>
          <p>{radio.telemetry}</p>
        </div>

        <div className="data-card">
          <h3>Antenna</h3>
          <p>{radio.antenna_type}</p>
        </div>

        <div className="data-card">
          <h3>Connector</h3>
          <p>{radio.connector}</p>
        </div>

        <div className="data-card">
          <h3>Power Output</h3>
          <p>{radio.power_output}</p>
        </div>

        <div className="data-card">
          <h3>Supported Drone</h3>
          <p>{radio.supported_drone_type}</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{radio.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}