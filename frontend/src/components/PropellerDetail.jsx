import { useEffect, useState, useCallback } from "react";

import { useParams } from "react-router-dom";

import { motion } from "framer-motion";

import "../styles/dashboard.css";

export default function PropellerDetail() {

  const { id } = useParams();

  const [prop, setProp] = useState(null);

  const [loading, setLoading] = useState(true);

  const fetchPropeller = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/propellers/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch propeller");
      }

      const data = await res.json();

      setProp(data);

    } catch (err) {

      console.error("Propeller detail error:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchPropeller();

  }, [fetchPropeller]);

  if (loading) {

    return (
      <div className="dashboard-root">
        <h2>Loading propeller intelligence...</h2>
      </div>
    );
  }

  if (!prop) {

    return (
      <div className="dashboard-root">
        <h2>Propeller not found</h2>
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

        <span>Propeller Intelligence Report</span>

      </header>

      <section className="dashboard-content grid">

        <div className="data-card large">

          <h2>{prop.prop_code}</h2>

        </div>

        <div className="data-card">
          <h3>Manufacturer</h3>
          <p>{prop.manufacturer}</p>
        </div>

        <div className="data-card">
          <h3>Category</h3>
          <p>{prop.sub_category}</p>
        </div>

        <div className="data-card">
          <h3>Type</h3>
          <p>{prop.prop_type}</p>
        </div>

        <div className="data-card">
          <h3>Diameter</h3>
          <p>{prop.diameter_in} inch</p>
        </div>

        <div className="data-card">
          <h3>Pitch</h3>
          <p>{prop.pitch_in}</p>
        </div>

        <div className="data-card">
          <h3>Blade Count</h3>
          <p>{prop.blade_count}</p>
        </div>

        <div className="data-card">
          <h3>Material</h3>
          <p>{prop.material}</p>
        </div>

        <div className="data-card">
          <h3>Mount Type</h3>
          <p>{prop.mount_type}</p>
        </div>

        <div className="data-card">
          <h3>Rotation</h3>
          <p>{prop.rotation}</p>
        </div>

        <div className="data-card">
          <h3>Compatible Drone</h3>
          <p>{prop.compatible_drone_type}</p>
        </div>

        <div className="data-card">
          <h3>Intended Use</h3>
          <p>{prop.intended_use}</p>
        </div>

      </section>

    </motion.div>
  );
}