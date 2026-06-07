import express from "express";
import dbParts from "../config/dbDrone.js";

const router = express.Router();

/* =======================
   PARTS DROPDOWNS (AI)
======================= */
router.get("/all", async (req, res) => {
  try {
    const [frames] = await dbParts.query(
      "SELECT frame_id AS id, frame_code AS name FROM frames"
    );

    const [motors] = await dbParts.query(
      "SELECT motor_id AS id, motor_code AS name FROM motors"
    );

    const [esc] = await dbParts.query(
      "SELECT esc_id AS id, esc_code AS name FROM esc"
    );

    const [batteries] = await dbParts.query(
      "SELECT battery_id AS id, battery_code AS name FROM batteries"
    );

    const [props] = await dbParts.query(
      "SELECT propeller_id AS id, prop_code AS name FROM propellers"
    );

    res.json({
      frames,
      motors,
      esc,
      batteries,
      props
    });

  } catch (err) {
    console.error("Parts Dropdown Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;