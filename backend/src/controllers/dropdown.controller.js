import db from "../config/db.js";

export const getCountries = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT country_name FROM countries ORDER BY country_name"
    );
    res.json(rows.map(r => r.country_name));
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getDroneClasses = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT drone_class FROM drone_platforms WHERE drone_class IS NOT NULL ORDER BY drone_class"
    );
    res.json(rows.map(r => r.drone_class));
  } catch (err) {
    res.status(500).json(err);
  }
};

export const getRoles = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT DISTINCT role_primary FROM drone_variants WHERE role_primary IS NOT NULL ORDER BY role_primary"
    );
    res.json(rows.map(r => r.role_primary));
  } catch (err) {
    res.status(500).json(err);
  }
};
