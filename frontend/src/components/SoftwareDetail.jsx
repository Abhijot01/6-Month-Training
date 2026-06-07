// src/pages/SoftwareDetail.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/dashboard.css";

export default function SoftwareDetail() {

  const { id } = useParams();

  const [software, setSoftware] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSoftware = useCallback(async () => {
    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/software/${id}`
      );

      const data = await res.json();

      setSoftware(data);

    } catch (err) {
      console.error("Software detail fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSoftware();
  }, [fetchSoftware]);

  if (loading) {
    return (
      <div className="dashboard-root">
        <h2>Loading software...</h2>
      </div>
    );
  }

  if (!software) {
    return (
      <div className="dashboard-root">
        <h2>Software not found</h2>
      </div>
    );
  }

  return (
    <motion.div
      className="dashboard-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="data-card">

        <h1>{software.name}</h1>

        <p><strong>Code:</strong> {software.software_code}</p>

        <p><strong>Type:</strong> {software.software_type}</p>

        <p><strong>Platform:</strong> {software.supported_platform}</p>

        <p><strong>License:</strong> {software.license_type}</p>

        <p><strong>Connection:</strong> {software.connection_type}</p>

        <p><strong>Status:</strong> {software.development_status}</p>

        <p><strong>Purpose:</strong> {software.primary_purpose}</p>

      </div>
    </motion.div>
  );
}