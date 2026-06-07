import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import "../styles/dashboard.css";

export default function VideoTransmitterDetail() {

  const { id } = useParams();

  const [vtx, setVtx] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVTX = useCallback(async () => {

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/video_transmitters/${id}`
      );

      const data = await res.json();

      setVtx(data);

    } catch (err) {

      console.error("Failed to fetch VTX", err);

    } finally {

      setLoading(false);
    }

  }, [id]);

  useEffect(() => {

    fetchVTX();

  }, [fetchVTX]);

  if (loading) {
    return <div className="dashboard-root">Loading…</div>;
  }

  if (!vtx) {
    return <div className="dashboard-root">No VTX found.</div>;
  }

  return (
    <div className="dashboard-root">

      <header className="dashboard-header">
        <h1>{vtx.vtx_code}</h1>
        <span>Video Transmitter Intelligence</span>
      </header>

      <section className="dashboard-content">

        <div className="data-card">

          <p><strong>Manufacturer:</strong> {vtx.manufacturer}</p>

          <p><strong>Category:</strong> {vtx.sub_category}</p>

          <p><strong>Video System:</strong> {vtx.video_system}</p>

          <p><strong>Frequency:</strong> {vtx.frequency_band}</p>

          <p><strong>Power:</strong> {vtx.output_power_mw} mW</p>

          <p><strong>Channels:</strong> {vtx.channel_count}</p>

          <p><strong>Voltage:</strong> {vtx.input_voltage}</p>

          <p><strong>Antenna Connector:</strong> {vtx.antenna_connector}</p>

          <p><strong>Protocol:</strong> {vtx.control_protocol}</p>

          <p><strong>Mount:</strong> {vtx.mount_pattern}</p>

          <p><strong>Antenna Type:</strong> {vtx.antenna_type}</p>

          <p><strong>Compatible Drone:</strong> {vtx.supported_drone_type}</p>

          <p><strong>Use:</strong> {vtx.intended_use}</p>

        </div>

      </section>

    </div>
  );
}