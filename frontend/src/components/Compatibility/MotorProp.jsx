import { useState } from "react";
import "../../styles/dashboard.css";

export default function MotorProp() {

  const [motor, setMotor] = useState("");
  const [prop, setProp] = useState("");

  const [motorSuggestions, setMotorSuggestions] = useState([]);
  const [propSuggestions, setPropSuggestions] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     MOTOR SEARCH
  ========================= */

  const handleMotorSearch = async (value) => {

    setMotor(value);

    if (!value.trim()) {
      setMotorSuggestions([]);
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/parts/motors/search"
      );

      const data = await res.json();

      const filtered = Array.isArray(data)
        ? data.filter((item) =>
            (
              `${item.motor_code || ""} ${item.manufacturer || ""}`
            )
              .toLowerCase()
              .includes(value.toLowerCase())
          )
        : [];

      setMotorSuggestions(filtered);

    } catch (err) {

      console.error("Motor autocomplete error:", err);

      setMotorSuggestions([]);
    }
  };

  /* =========================
     PROP SEARCH
  ========================= */

  const handlePropSearch = async (value) => {

    setProp(value);

    if (!value.trim()) {
      setPropSuggestions([]);
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/parts/propellers/search"
      );

      const data = await res.json();

      const filtered = Array.isArray(data)
        ? data.filter((item) =>
            (
              `${item.prop_code || ""} ${item.manufacturer || ""}`
            )
              .toLowerCase()
              .includes(value.toLowerCase())
          )
        : [];

      setPropSuggestions(filtered);

    } catch (err) {

      console.error("Prop autocomplete error:", err);

      setPropSuggestions([]);
    }
  };

  /* =========================
     CHECK COMPATIBILITY
  ========================= */

  const checkCompatibility = async () => {

    setLoading(true);
    setResult(null);

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/compatibility/motor-prop?motor=${motor}&prop=${prop}`
      );

      const data = await res.json();

      if (data && !data.error) {

        setResult(data);

      } else {

        setResult({
          compatible: false,
          reason: "Invalid response from server",
        });
      }

    } catch (err) {

      console.error(err);

      setResult({
        compatible: false,
        reason: "Server error",
      });

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="dashboard-root">

      {/* HEADER */}

      <header className="dashboard-header">

        <h1>Motor ↔ Propeller Compatibility</h1>

        <span>
          Validate Motor and Propeller pairing
        </span>

      </header>

      {/* SEARCH BAR */}

      <section className="compatibility-bar">

        <div className="compatibility-inputs">

          {/* MOTOR */}

          <div className="autocomplete">

            <input
              placeholder="Search Motor (e.g. EMAX, 2306)"
              value={motor}
              onChange={(e) =>
                handleMotorSearch(e.target.value)
              }
            />

            {motorSuggestions.length > 0 && (

              <div className="dropdown">

                {motorSuggestions.map((item) => (

                  <div
                    key={
                      item.motor_id ||
                      item.motor_code
                    }
                    className="dropdown-item"
                    onClick={() => {

                      setMotor(
                        item.motor_code ||
                        item.name
                      );

                      setMotorSuggestions([]);
                    }}
                  >
                    {(item.manufacturer || item.brand || "Motor")}
                    {" - "}
                    {(item.motor_code || item.name)}

                    {(item.kv_rating || item.kv)
                      ? ` (${item.kv_rating || item.kv}KV)`
                      : ""}
                  </div>

                ))}

              </div>
            )}

          </div>

          {/* PROP */}

          <div className="autocomplete">

            <input
              placeholder="Search Propeller"
              value={prop}
              onChange={(e) =>
                handlePropSearch(e.target.value)
              }
            />

            {propSuggestions.length > 0 && (

              <div className="dropdown">

                {propSuggestions.map((item) => (

                  <div
                    key={
                      item.propeller_id ||
                      item.prop_code
                    }
                    className="dropdown-item"
                    onClick={() => {

                      setProp(
                        item.prop_code ||
                        item.name
                      );

                      setPropSuggestions([]);
                    }}
                  >
                    {(item.manufacturer || item.brand || "Prop")}
                    {" - "}
                    {(item.prop_code || item.name)}

                    {item.diameter_in
                      ? ` (${item.diameter_in}")`
                      : ""}
                  </div>

                ))}

              </div>
            )}

          </div>

        </div>

        {/* BUTTON */}

        <button
          className="compat-btn"
          onClick={checkCompatibility}
        >
          {loading
            ? "Checking..."
            : "Check Compatibility"}
        </button>

      </section>

      {/* RESULT */}

      {result && (

        <section className="dashboard-content grid">

          {/* MOTOR CARD */}

          {result.motor && (

            <div className="data-card">

              <h3>
                {result.motor.motor_code}
              </h3>

              <p>
                <strong>Brand:</strong>{" "}
                {result.motor.brand}
              </p>

              <p>
                <strong>KV:</strong>{" "}
                {result.motor.kv_rating}
              </p>

              <p>
                <strong>Current:</strong>{" "}
                {result.motor.max_current_a} A
              </p>

            </div>
          )}

          {/* PROP CARD */}

          {result.prop && (

            <div className="data-card">

              <h3>
                {result.prop.prop_code}
              </h3>

              <p>
                <strong>Brand:</strong>{" "}
                {result.prop.brand}
              </p>

              <p>
                <strong>Size:</strong>{" "}
                {result.prop.size || "N/A"} inch
              </p>

              <p>
                <strong>Pitch:</strong>{" "}
                {result.prop.pitch || "N/A"} inch
              </p>

              <p>
                <strong>Blades:</strong>{" "}
                {result.prop.blade_count || "N/A"}
              </p>

            </div>
          )}

          {/* RESULT CARD */}

          <div className="data-card">

            <h3>
              {result.compatible
                ? "✅ Compatible"
                : "❌ Not Compatible"}
            </h3>

            <p>
              <strong>Level:</strong>{" "}
              {result.compatibility_level || "N/A"}
            </p>

            <p>
              <strong>Reason:</strong>{" "}
              {result.reason}
            </p>

          </div>

        </section>
      )}

      {/* EMPTY */}

      {!result && !loading && (

        <section className="dashboard-content">

          <div className="placeholder-card">

            <h3>No Compatibility Checked</h3>

            <p>
              Select Motor and Propeller to validate compatibility.
            </p>

          </div>

        </section>
      )}

    </div>
  );
}