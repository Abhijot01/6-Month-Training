import { useState } from "react";
import "../../styles/dashboard.css";

export default function FrameProp() {

  const [frame, setFrame] = useState("");
  const [prop, setProp] = useState("");

  const [frameSuggestions, setFrameSuggestions] = useState([]);
  const [propSuggestions, setPropSuggestions] = useState([]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* =========================
     FRAME SEARCH
  ========================= */

  const handleFrameSearch = async (value) => {

    setFrame(value);

    if (!value.trim()) {
      setFrameSuggestions([]);
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/parts/frames/search"
      );

      const data = await res.json();

      const filtered = Array.isArray(data)
        ? data.filter((item) =>
            (
              `${item.frame_code || ""} ${item.manufacturer || ""}`
            )
              .toLowerCase()
              .includes(value.toLowerCase())
          )
        : [];

      setFrameSuggestions(filtered);

    } catch (err) {

      console.error("Frame autocomplete error:", err);

      setFrameSuggestions([]);
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

    if (!frame || !prop) return;

    setLoading(true);
    setResult(null);

    try {

      const res = await fetch(
        `http://localhost:5000/api/parts/compatibility/frame-prop?frame=${frame}&prop=${prop}`
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

        <h1>Frame ↔ Propeller Compatibility</h1>

        <span>
          Validate Frame and Propeller pairing
        </span>

      </header>

      {/* SEARCH SECTION */}

      <section className="compatibility-bar">

        <div className="compatibility-inputs">

          {/* FRAME */}

          <div className="autocomplete">

            <input
              placeholder="Search Frame (e.g. F450)"
              value={frame}
              onChange={(e) =>
                handleFrameSearch(e.target.value)
              }
            />

            {frameSuggestions.length > 0 && (

              <div className="dropdown">

                {frameSuggestions.map((item) => (

                  <div
                    key={
                      item.frame_id ||
                      item.frame_code
                    }
                    className="dropdown-item"
                    onClick={() => {

                      setFrame(
                        item.frame_code ||
                        item.name
                      );

                      setFrameSuggestions([]);
                    }}
                  >
                    {(item.manufacturer || item.brand || "Frame")}
                    {" - "}
                    {(item.frame_code || item.name)}

                    {item.wheelbase_mm
                      ? ` (${item.wheelbase_mm}mm)`
                      : ""}
                  </div>

                ))}

              </div>
            )}

          </div>

          {/* PROP */}

          <div className="autocomplete">

            <input
              placeholder="Search Propeller (e.g. 5x4.5)"
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
                      ? ` (${item.diameter_in}" / ${item.pitch_in}")`
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

      {/* LOADING */}

      {loading && (

        <section className="dashboard-content">

          <div className="placeholder-card">

            <h3>Checking compatibility...</h3>

          </div>

        </section>
      )}

      {/* RESULT */}

      {result && !loading && (

        <section className="dashboard-content grid">

          {/* FRAME CARD */}

          {result.frame && (

            <div className="data-card">

              <h3>
                {result.frame.frame_code}
              </h3>

              <p>
                <strong>Brand:</strong>{" "}
                {result.frame.brand}
              </p>

              <p>
                <strong>Type:</strong>{" "}
                {result.frame.frame_type}
              </p>

              <p>
                <strong>Wheelbase:</strong>{" "}
                {result.frame.wheelbase_mm} mm
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
                <strong>Diameter:</strong>{" "}
                {result.prop.diameter_in} inch
              </p>

              <p>
                <strong>Pitch:</strong>{" "}
                {result.prop.pitch_in} inch
              </p>

              <p>
                <strong>Blades:</strong>{" "}
                {result.prop.blade_count}
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
              Select Frame and Propeller to validate compatibility.
            </p>

          </div>

        </section>
      )}

    </div>
  );
}