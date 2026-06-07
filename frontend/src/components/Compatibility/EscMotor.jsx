import { useState } from "react";
import "../../styles/dashboard.css";

export default function EscMotor() {

  const [esc, setEsc] = useState("");
  const [motor, setMotor] = useState("");

  const [escSuggestions, setEscSuggestions] = useState([]);
  const [motorSuggestions, setMotorSuggestions] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     ESC SEARCH
  ========================= */

  const handleEscSearch = async (value) => {

    setEsc(value);

    if (!value.trim()) {
      setEscSuggestions([]);
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/parts/esc/search"
      );

      const data = await res.json();

      const filtered = Array.isArray(data)
        ? data.filter((item) =>
            (
              `${item.esc_code || ""} ${item.manufacturer || ""}`
            )
              .toLowerCase()
              .includes(value.toLowerCase())
          )
        : [];

      setEscSuggestions(filtered);

    } catch (err) {

      console.error(err);
      setEscSuggestions([]);
    }
  };

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

      console.error(err);
      setMotorSuggestions([]);
    }
  };

  /* =========================
     CHECK COMPATIBILITY
  ========================= */

  const checkCompatibility = async () => {

    if (!esc || !motor) return;

    setLoading(true);
    setResult(null);

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/compatibility/esc-motor?esc=${esc}&motor=${motor}`
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

        <h1>ESC ↔ Motor Compatibility</h1>

        <span>
          Validate ESC and Motor pairing
        </span>

      </header>

      {/* SEARCH SECTION */}

      <section className="compatibility-bar">

        <div className="compatibility-inputs">

          {/* ESC */}

          <div className="autocomplete-wrapper">

            <div className="autocomplete">

              <input
                placeholder="Search ESC (e.g. T-Motor, F55A)"
                value={esc}
                onChange={(e) =>
                  handleEscSearch(e.target.value)
                }
              />

              {escSuggestions.length > 0 && (

                <div className="dropdown">

                  {escSuggestions.map((item) => (

                    <div
                      key={
                        item.esc_id ||
                        item.esc_code
                      }
                      className="dropdown-item"
                      onClick={() => {

                        setEsc(
                          item.esc_code ||
                          item.name
                        );

                        setEscSuggestions([]);
                      }}
                    >
                      {(item.manufacturer || item.brand || "ESC")}
                      {" - "}
                      {(item.esc_code || item.name)}

                      {(item.continuous_current_a || item.current)
                        ? ` (${item.continuous_current_a || item.current}A)`
                        : ""}
                    </div>

                  ))}

                </div>
              )}

            </div>

          </div>

          {/* MOTOR */}

          <div className="autocomplete-wrapper">

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

          </div>

        </div>

        <button
          className="compat-btn"
          onClick={checkCompatibility}
        >
          {loading
            ? "Checking..."
            : "Check Compatibility"}
        </button>

      </section>

      {/* RESULTS */}

      <section className="compatibility-results">

        {loading && (

          <div className="placeholder-card">

            <h3>Checking compatibility...</h3>

          </div>
        )}

        {result && !loading && (

          <div className="dashboard-content grid">

            {/* ESC CARD */}

            {result.esc && (

              <div className="data-card">

                <h3>
                  {result.esc.esc_code}
                </h3>

                <p>
                  <strong>Brand:</strong>{" "}
                  {result.esc.brand}
                </p>

                <p>
                  <strong>Current:</strong>{" "}
                  {result.esc.continuous_current_a} A
                </p>

                <p>
                  <strong>Voltage:</strong>{" "}
                  {result.esc.supported_voltage}
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {result.esc.esc_type}
                </p>

                <p>
                  <strong>Protocol:</strong>{" "}
                  {result.esc.input_protocol}
                </p>

              </div>
            )}

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

                <p>
                  <strong>Power:</strong>{" "}
                  {result.motor.max_power_w} W
                </p>

                <p>
                  <strong>Type:</strong>{" "}
                  {result.motor.motor_type}
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

          </div>
        )}

        {!result && !loading && (

          <div className="placeholder-card">

            <h3>No Compatibility Checked</h3>

            <p>
              Select ESC and Motor to validate compatibility.
            </p>

          </div>
        )}

      </section>

    </div>
  );
}