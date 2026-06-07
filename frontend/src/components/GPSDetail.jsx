import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";

import "../styles/dashboard.css";

export default function GPSDetail() {

  const { id } = useParams();

  const [gps, setGps] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchGPS = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/gps/${id}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch GPS detail");
      }

      const data = await res.json();

      setGps(data);

    } catch (err) {

      console.error(
        "Failed to load GPS detail:",
        err
      );

      setGps(null);

    } finally {

      setLoading(false);

    }

  }, [id]);

  useEffect(() => {

    fetchGPS();

  }, [fetchGPS]);

  if (loading) {

    return (

      <div className="dashboard-root">

        <div className="dashboard-content">

          <div className="data-card">

            <h2>Loading GPS Module...</h2>

          </div>

        </div>

      </div>

    );

  }

  if (!gps) {

    return (

      <div className="dashboard-root">

        <div className="dashboard-content">

          <div className="data-card">

            <h2>GPS Module Not Found</h2>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="dashboard-root">

      <section className="dashboard-content">

        <div
          className="data-card"
          style={{
            maxWidth: "700px",
            margin: "40px auto",
            padding: "40px",
          }}
        >

          <h1>{gps.gps_code}</h1>

          <p>
            <strong>Brand:</strong>{" "}
            {gps.brand}
          </p>

          <p>
            <strong>GNSS:</strong>{" "}
            {gps.gnss_support}
          </p>

          <p>
            <strong>Compass:</strong>{" "}
            {gps.compass_included}
          </p>

          <p>
            <strong>Update Rate:</strong>{" "}
            {gps.update_rate_hz} Hz
          </p>

          <p>
            <strong>Interface:</strong>{" "}
            {gps.interface_type}
          </p>

          <p>
            <strong>Voltage:</strong>{" "}
            {gps.voltage_input}
          </p>

          <p>
            <strong>Antenna:</strong>{" "}
            {gps.antenna_type}
          </p>

          <p>
            <strong>Mount:</strong>{" "}
            {gps.mounting_type}
          </p>

          <p>
            <strong>Firmware:</strong>{" "}
            {gps.supported_firmware}
          </p>

          <p>
            <strong>Drone Type:</strong>{" "}
            {gps.supported_drone_type}
          </p>

          <p>
            <strong>Use:</strong>{" "}
            {gps.intended_use}
          </p>

        </div>

      </section>

    </div>

  );

}