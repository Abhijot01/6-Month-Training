import db from "../config/dbDrone.js";
import * as tf from "@tensorflow/tfjs";
import { loadModel } from "./ml.service.js";

/* =========================
   🧠 FEATURE BUILDER (14 ONLY)
========================= */
function buildFeatures(build) {
  const f = build.frame || {};
  const m = build.motor || {};
  const e = build.esc || {};
  const p = build.prop || {};
  const b = build.battery || {};

  const frame = Number(f.size_inch) || 5;
  const kv = Number(m.kv_rating) || 1000;
  const esc = Number(e.continuous_current_a) || 30;
  const prop = Number(p.diameter_in) || 5;
  const batt = Number(b.cell_count) || 4;

  return [
    frame / 20,
    kv / 2500,
    esc / 120,
    prop / 15,
    batt / 8,

    (kv * prop) / 15000,
    esc / (kv || 1),
    prop / (frame || 1),

    kv / (frame || 1),
    (batt * kv) / 15000,

    esc / (prop || 1),
    batt / (prop || 1),
    kv / (esc || 1),

    Math.random() * 0.2
  ];
}

/* =========================
   ⚙️ ENGINEERING VALIDATION
========================= */
function validateBuild(build) {
  const { frame: f, motor: m, prop: p, esc: e } = build;

  let penalty = 0;
  let warnings = [];

  if (p.diameter_in > f.size_inch + 1) {
    penalty += 30;
    warnings.push("❌ Prop too large for frame");
  }

  if (m.kv_rating < 1300 && p.diameter_in > 6) {
    penalty += 15;
    warnings.push("⚠️ Low KV motor with large prop");
  }

  if (m.kv_rating > 2000 && p.diameter_in > 6) {
    penalty += 15;
    warnings.push("⚠️ High KV motor with large prop");
  }

  if (e.continuous_current_a < m.max_current_a) {
    penalty += 10;
    warnings.push("⚠️ ESC may be underpowered");
  }

  return { penalty, warnings };
}

/* =========================
   🧠 AI EXPLANATION (NEW)
========================= */
function generateExplanation(build) {
  const { motor: m, prop: p, esc: e, battery: b, frame: f } = build;

  const exp = [];

  if (m && p) {
    if (m.kv_rating > 1800 && p.diameter_in < 6) {
      exp.push("⚡ High KV motor with small prop → fast response & agility");
    }
    if (m.kv_rating < 1200 && p.diameter_in > 8) {
      exp.push("🚁 Low KV motor with large prop → efficient lift & endurance");
    }
  }

  if (e && m && e.continuous_current_a >= m.max_current_a) {
    exp.push("🔌 ESC safely supports motor current");
  }

  if (b && b.cell_count >= 6) {
    exp.push("🔋 High voltage battery improves thrust output");
  }

  if (p && f && p.diameter_in <= f.size_inch) {
    exp.push("✅ Propeller size fits frame safely");
  }

  if (exp.length === 0) {
    exp.push("⚙️ Balanced build suitable for general usage");
  }

  return exp;
}

/* =========================
   🤖 ML SCORING
========================= */
async function scoreWithML(builds) {
  if (!builds.length) return [];

  const model = await loadModel();

  const features = builds.map(buildFeatures);
  const tensor = tf.tensor2d(features);

  const predictions = model.predict(tensor);
  const raw = Array.from(await predictions.data());

  const min = Math.min(...raw);
  const max = Math.max(...raw);

  function ruleScore(build) {
    let score = 0;

    const { motor: m, prop: p, esc: e, battery: b, frame: f } = build;

    if (m && p) {
      if (m.kv_rating > 1800 && p.diameter_in < 6) score += 10;
      if (m.kv_rating < 1200 && p.diameter_in > 8) score += 10;
    }

    if (e && m && e.continuous_current_a >= m.max_current_a) score += 10;
    if (b && b.cell_count >= 6) score += 5;
    if (p && f && p.diameter_in <= f.size_inch) score += 5;

    return score;
  }

  return builds.map((b, i) => {
    let normalized = 0;
    if (max !== min) {
      normalized = (raw[i] - min) / (max - min);
    }

    const mlScore = normalized * 70;
    const rules = ruleScore(b);

    let finalScore = mlScore + rules;

    finalScore = Math.max(35, Math.min(85, finalScore));

    return {
      ...b,
      score: Number(finalScore.toFixed(2))
    };
  });
}

/* =========================
   🚀 MAIN FUNCTION
========================= */
export async function getRecommendations(input) {

  const conditions = [];
  const values = [];

  if (input.frame_id) { conditions.push("frame_id=?"); values.push(input.frame_id); }
  if (input.motor_id) { conditions.push("motor_id=?"); values.push(input.motor_id); }
  if (input.esc_id) { conditions.push("esc_id=?"); values.push(input.esc_id); }
  if (input.propeller_id) { conditions.push("propeller_id=?"); values.push(input.propeller_id); }
  if (input.battery_id) { conditions.push("battery_id=?"); values.push(input.battery_id); }

  let datasetRows = [];

  if (conditions.length > 0) {
    const [rows] = await db.query(
      `SELECT * FROM uav_build_compatibility WHERE ${conditions.join(" AND ")} LIMIT 50`,
      values
    );
    datasetRows = rows;
  }

  /* =========================
     ✅ DATASET FLOW (UNCHANGED)
  ========================= */
  if (datasetRows.length > 0) {

    const builds = [];

    for (let r of datasetRows) {
      const [[frame]] = await db.query("SELECT * FROM frames WHERE frame_id=?", [r.frame_id]);
      const [[motor]] = await db.query("SELECT * FROM motors WHERE motor_id=?", [r.motor_id]);
      const [[esc]] = await db.query("SELECT * FROM esc WHERE esc_id=?", [r.esc_id]);
      const [[prop]] = await db.query("SELECT * FROM propellers WHERE propeller_id=?", [r.propeller_id]);
      const [[battery]] = await db.query("SELECT * FROM batteries WHERE battery_id=?", [r.battery_id]);

      builds.push({ frame, motor, esc, prop, battery });
    }

    const final = [];

    for (let b of builds) {

      const { penalty, warnings } = validateBuild(b);

      let base = 92;
      let variation = Math.random() * 3;

      let score = base + variation - penalty;

      score = Math.max(50, Math.min(98, score));

      final.push({
        ...b,
        score: Number(score.toFixed(2)),
        warnings,
        explanation: [
          "✅ Verified from compatibility dataset",
          ...warnings
        ]
      });

      if (final.length === 6) break;
    }

    return {
      source: "dataset",
      recommendations: final
    };
  }

  /* =========================
     🤖 ML FLOW (UPDATED)
  ========================= */
  const [frames] = await db.query("SELECT * FROM frames LIMIT 20");
  const [motors] = await db.query("SELECT * FROM motors LIMIT 20");
  const [escs] = await db.query("SELECT * FROM esc LIMIT 20");
  const [props] = await db.query("SELECT * FROM propellers LIMIT 20");
  const [batts] = await db.query("SELECT * FROM batteries LIMIT 20");

  const builds = [];

  for (let i = 0; i < 150; i++) {
    builds.push({
      frame: frames[Math.floor(Math.random() * frames.length)],
      motor: motors[Math.floor(Math.random() * motors.length)],
      esc: escs[Math.floor(Math.random() * escs.length)],
      prop: props[Math.floor(Math.random() * props.length)],
      battery: batts[Math.floor(Math.random() * batts.length)]
    });
  }

  const scored = await scoreWithML(builds);

  const finalML = scored
  .sort((a, b) => b.score - a.score)
  .slice(0, 6)
  .map((b) => {
    const { warnings } = validateBuild(b);

    return {
      ...b,
      explanation: [
        "🤖 AI-generated optimized configuration",
        ...generateExplanation(b),
        ...warnings
      ]
    };
  });

  return {
    source: "ml",
    recommendations: finalML
  };
}