import express from "express";
import db from "../config/dbDrone.js";

const router = express.Router();

/* =======================
   COUNTRIES
======================= */
router.get("/countries", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT country_name FROM countries ORDER BY country_name"
    );

    res.json(rows.map(r => r.country_name));
  } catch (err) {
    console.error("Countries API error:", err);
    res.status(500).json({ error: "Failed to fetch countries" });
  }
});

/* =======================
   DRONE CLASSES
======================= */
router.get("/drone-classes", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT drone_class
       FROM drone_platforms
       WHERE drone_class IS NOT NULL
       ORDER BY drone_class`
    );

    res.json(rows.map(r => r.drone_class));
  } catch (err) {
    console.error("Drone classes API error:", err);
    res.status(500).json({ error: "Failed to fetch drone classes" });
  }
});

/* =======================
   ROLES
======================= */
router.get("/roles", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT DISTINCT role_primary
       FROM drone_variants
       WHERE role_primary IS NOT NULL
       ORDER BY role_primary`
    );

    res.json(rows.map(r => r.role_primary));
  } catch (err) {
    console.error("Roles API error:", err);
    res.status(500).json({ error: "Failed to fetch roles" });
  }
});



export default router;
