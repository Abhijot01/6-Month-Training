import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function FlightControllerDetail() {

  const { id } = useParams();

  const [fc, setFc] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchFlightController = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/flight-controllers/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch flight controller");
      }

      const data = await res.json();

      console.log("FLIGHT CONTROLLER DETAIL:", data);

      setFc(data);

    } catch (err) {

      console.error("Flight controller detail error:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchFlightController();

  }, [fetchFlightController]);

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading flight controller intelligence...</h2>
      </div>
    );
  }

  if (!fc) {

    return (
      <div className="dashboard-root">
        <h2>Flight Controller not found</h2>
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

        <span>
          Flight Controller Intelligence Report
        </span>

      </header>

      <section className="dashboard-content grid">

        <div className="data-card large">

          <h2>{fc.fc_code}</h2>

          <div className="tag-row">

            <span className="tag">
              {fc.processor}
            </span>

            <span className="tag">
              {fc.form_factor}
            </span>

            <span className="tag">
              {fc.firmware_supported}
            </span>

          </div>

        </div>

        <div className="data-card">
          <h3>Manufacturer</h3>
          <p>{fc.manufacturer}</p>
        </div>

        <div className="data-card">
          <h3>Sub Category</h3>
          <p>{fc.sub_category}</p>
        </div>

        <div className="data-card">
          <h3>Processor</h3>
          <p>{fc.processor}</p>
        </div>

        <div className="data-card">
          <h3>Form Factor</h3>
          <p>{fc.form_factor}</p>
        </div>

        <div className="data-card">
          <h3>Mounting</h3>
          <p>{fc.mounting}</p>
        </div>

        <div className="data-card">
          <h3>Firmware</h3>
          <p>{fc.firmware_supported}</p>
        </div>

        <div className="data-card">
          <h3>IMU</h3>
          <p>{fc.imu}</p>
        </div>

        <div className="data-card">
          <h3>Barometer</h3>
          <p>{fc.barometer}</p>
        </div>

        <div className="data-card">
          <h3>OSD</h3>
          <p>{fc.osd}</p>
        </div>

        <div className="data-card">
          <h3>Blackbox</h3>
          <p>{fc.blackbox}</p>
        </div>

        <div className="data-card">
          <h3>ESC Interface</h3>
          <p>{fc.esc_interface}</p>
        </div>

        <div className="data-card">
          <h3>Connector</h3>
          <p>{fc.connector_type}</p>
        </div>

        <div className="data-card">
          <h3>Supported Drone</h3>
          <p>{fc.supported_drone_type}</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{fc.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}