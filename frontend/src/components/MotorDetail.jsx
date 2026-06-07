import { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/dashboard.css";

export default function MotorDetail() {

  const { id } = useParams();

  const [motor, setMotor] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH MOTOR ================= */

  const fetchMotor = useCallback(async () => {

    try {

      setLoading(true);

      const res = await fetch(
        `http://localhost:5000/api/parts/motors/${id}`
      );

      if (!res.ok) {
        throw new Error("Motor fetch failed");
      }

      const data = await res.json();

      console.log("MOTOR DETAIL:");
      console.log(data);

      setMotor(data);

    } catch (err) {

      console.error(
        "Motor detail error:",
        err
      );

      setMotor(null);

    } finally {

      setLoading(false);
    }

  }, [id]);

  /* ================= LOAD ================= */

  useEffect(() => {

    fetchMotor();

  }, [fetchMotor]);

  /* ================= LOADING ================= */

  if (loading) {

    return (
      <div className="dashboard-root">
        <div className="placeholder-card">
          <h3>Loading Motor Intelligence...</h3>
        </div>
      </div>
    );
  }

  /* ================= NO DATA ================= */

  if (!motor) {

    return (
      <div className="dashboard-root">
        <div className="placeholder-card">
          <h3>No Motor Data Found</h3>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */

  return (

    <div className="dashboard-root">

      {/* HEADER */}

      <header className="dashboard-header">

        <h1>Drone Forensics</h1>

        <span>
          Motor Intelligence Report
        </span>

      </header>

      {/* CONTENT */}

      <section className="dashboard-content grid">

        <div className="data-card">

          <h2>
            {motor.motor_code}
          </h2>

          <p>
            <strong>Manufacturer:</strong>{" "}
            {motor.manufacturer}
          </p>

          <p>
            <strong>Category:</strong>{" "}
            {motor.sub_category}
          </p>

          <p>
            <strong>Type:</strong>{" "}
            {motor.motor_type}
          </p>

          <p>
            <strong>KV Rating:</strong>{" "}
            {motor.kv_rating}
          </p>

          <p>
            <strong>Max Current:</strong>{" "}
            {motor.max_current_a} A
          </p>

          <p>
            <strong>Max Power:</strong>{" "}
            {motor.max_power_w} W
          </p>

          <p>
            <strong>Shaft Diameter:</strong>{" "}
            {motor.shaft_diameter}
          </p>

          <p>
            <strong>Mount Pattern:</strong>{" "}
            {motor.mount_pattern}
          </p>

          <p>
            <strong>Recommended Prop:</strong>{" "}
            {motor.recommended_prop_size}
          </p>

          <p>
            <strong>Compatible Drone:</strong>{" "}
            {motor.compatible_drone_type}
          </p>

          <p>
            <strong>Intended Use:</strong>{" "}
            {motor.intended_use}
          </p>

        </div>

      </section>

    </div>
  );
}