import { useEffect, useState } from "react";
import "../../styles/dashboard.css";
import { motion } from "framer-motion";

export default function Recommendation() {

  const [options, setOptions] = useState({
    frames: [],
    motors: [],
    esc: [],
    batteries: [],
    props: []
  });

  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/parts-dropdowns/all")
      .then(res => res.json())
      .then(setOptions)
      .catch(console.error);
  }, []);

  /* ================= CHANGE ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    const keyMap = {
      frame_id: "frames",
      motor_id: "motors",
      esc_id: "esc",
      battery_id: "batteries",
      propeller_id: "props"
    };

    const selectedObj = options[keyMap[name]]?.find(
      item => String(item.id) === String(value)
    );

    setForm({
      ...form,
      [name]: value,
      [`${name}_data`]: selectedObj
    });
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!Object.keys(form).length) {
      alert("Select at least one component");
      return;
    }

    setLoading(true);

    const filtered = Object.fromEntries(
      Object.entries(form).filter(([k, v]) => !k.includes("_data") && v)
    );

    try {
      const res = await fetch("http://localhost:5000/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filtered)
      });

      const data = await res.json();
      setResult(data?.data || { recommendations: [] });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= SPECS ================= */
  const renderSpecs = (obj) => {
    if (!obj) return null;

    return Object.entries(obj)
      .filter(([k]) => !k.includes("id") && !k.includes("code"))
      .slice(0, 6)
      .map(([k, v]) => (
        <p key={k}>
          <strong>{k.replace(/_/g, " ")}:</strong> {v}
        </p>
      ));
  };

  return (
    <motion.div
      className="dashboard-root rec-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >

      {/* HEADER */}
      <header className="dashboard-header">
        <h1>🚀 AI UAV Recommendation</h1>
        <span>Select minimum of 1 component</span>
      </header>

      {/* FILTERS */}
      <section className="dashboard-filters rec-filters">

        <select name="frame_id" onChange={handleChange}>
          <option value="">Select Frame</option>
          {options.frames.map(f => (
            <option key={f.id} value={f.id}>{f.name}</option>
          ))}
        </select>

        <select name="motor_id" onChange={handleChange}>
          <option value="">Select Motor</option>
          {options.motors.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select name="esc_id" onChange={handleChange}>
          <option value="">Select ESC</option>
          {options.esc.map(e => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>

        <select name="battery_id" onChange={handleChange}>
          <option value="">Select Battery</option>
          {options.batteries.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select name="propeller_id" onChange={handleChange}>
          <option value="">Select Propeller</option>
          {options.props.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        <button onClick={handleSubmit}>
          {loading ? "Analyzing..." : "Get Recommendation"}
        </button>

      </section>

      {/* SELECTED */}
      {(form.frame_id || form.motor_id || form.esc_id || form.battery_id || form.propeller_id) && (
        <section className="rec-section">

          <h2>🧩 Selected Components</h2>

          <div className="rec-grid">

            {["frame", "motor", "esc", "battery", "propeller"].map((type) => {
              const data = form[`${type}_id_data`];
              if (!data) return null;

              return (
                <div key={type} className="rec-card">
                  <span className="rec-label">{type.toUpperCase()}</span>
                  <h3 className="rec-title">{data.name}</h3>
                  {renderSpecs(data)}
                </div>
              );
            })}

          </div>

        </section>
      )}

      {/* RESULTS */}
      {result && (
        <section className="rec-section">

          <h2>🎯 Top AI Recommendations</h2>

          <h3 className="rec-subtitle">
            {result.source === "dataset"
              ? "📊 Dataset Match"
              : "🤖 AI Generated"}
          </h3>

          {result.recommendations?.slice(0, 6).map((rec, i) => (
            <div key={i} className="rec-block">

              <h3>🔹 Build #{i + 1}</h3>

              {/* TOP COMPONENTS */}
              <div className="rec-grid">

                {["frame", "motor", "prop", "esc", "battery"].map((c) => (
                  <div key={c} className="rec-card highlight">
                    <span className="rec-label">{c.toUpperCase()}</span>
                    <h3 className="rec-title">
                      {rec[c]?.[`${c}_code`] || "N/A"}
                    </h3>
                  </div>
                ))}

                {/* SCORE */}
                <div className="rec-card score">
                  <h3>Score</h3>
                  <div className="rec-score-bar">
                    <div
                      className="rec-score-fill"
                      style={{ width: `${rec.score || 0}%` }}
                    />
                  </div>
                  <p>{rec.score?.toFixed(1)}%</p>
                </div>

              </div>

              {/* SPECS */}
              <div className="rec-grid">

                {["frame", "motor", "prop", "esc", "battery"].map((c) => (
                  <div key={c} className="rec-card">
                    <h4 className="rec-spec-title">{c.toUpperCase()} SPECS</h4>
                    {renderSpecs(rec[c])}
                  </div>
                ))}

              </div>

              {/* AI EXPLANATION */}
              {rec.explanation && (
                <div className="rec-explanation">
                  <h4>💡 AI Explanation</h4>
                  <ul>
                    {rec.explanation.map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ))}

        </section>
      )}

    </motion.div>
  );
}