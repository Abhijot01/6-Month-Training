// ======================================================
// src/pages/CameraDetail.jsx
// ======================================================

import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import "../styles/dashboard.css";

export default function CameraDetail() {

  const { id } = useParams();

  const [camera, setCamera] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCamera = useCallback(async () => {

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/cameras/${id}`
      );

      const data = await res.json();

      setCamera(data);

    } catch (err) {

      console.error("Camera detail failed:", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {
    fetchCamera();
  }, [fetchCamera]);

  if (loading) {
    return (
      <div className="dashboard-root">
        <h2>Loading camera...</h2>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="dashboard-root">
        <h2>Camera not found</h2>
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

        <h1>{camera.camera_code}</h1>

        <p><strong>Brand:</strong> {camera.brand}</p>
        <p><strong>Type:</strong> {camera.camera_type}</p>

        <p><strong>Sensor:</strong> {camera.sensor_type}</p>

        <p><strong>Resolution:</strong> {camera.resolution}</p>

        <p><strong>Video:</strong> {camera.video_system}</p>

        <p><strong>Lens:</strong> {camera.lens_size_mm} mm</p>

        <p><strong>FOV:</strong> {camera.field_of_view_deg}°</p>

        <p><strong>Interface:</strong> {camera.interface_type}</p>

        <p><strong>Mount:</strong> {camera.mount_type}</p>

        <p><strong>Weight:</strong> {camera.weight_g} g</p>

        <p><strong>Drone Type:</strong> {camera.supported_drone_type}</p>

        <p><strong>Use:</strong> {camera.intended_use}</p>

      </div>

    </motion.div>
  );
}