import express from "express";
import db from "../config/dbDrone.js";

const router = express.Router();

router.get("/dashboard/drone-summary", async (req, res) => {
  try {
    const [total] = await db.query(`
      SELECT COUNT(*) AS count FROM drone_variants
    `);

    const [armed] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM drone_variants 
      WHERE armament_capable = TRUE
    `);

    const [unarmed] = await db.query(`
      SELECT COUNT(*) AS count 
      FROM drone_variants 
      WHERE armament_capable = FALSE
    `);

    const [classes] = await db.query(`
      SELECT COUNT(DISTINCT drone_class) AS count 
      FROM drone_platforms
    `);

    const [countries] = await db.query(`
      SELECT COUNT(DISTINCT c.country_id) AS count
      FROM drone_variants v
      JOIN countries c ON v.country_id = c.country_id
    `);

    res.json({
      total: total[0].count,
      armed: armed[0].count,
      unarmed: unarmed[0].count,
      classes: classes[0].count,
      countries: countries[0].count,
    });

  } catch (err) {
    console.error("Drone Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;