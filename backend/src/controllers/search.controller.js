import db from "../config/dbDrone.js";
export const getVariantById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        v.variant_id,
        p.platform_name,
        p.image_filename,
        v.variant_name,
        c.country_name,
        p.drone_class,
        v.variant_type,
        v.role_primary,
        v.role_secondary,
        v.launch_type,
        v.recovery_type,
        v.propulsion_type,
        v.wingspan_m,
        v.mtow_kg,
        v.max_payload_kg,
        v.endurance_hr,
        v.operational_range_km,
        v.datalink_range_km,
        v.cruise_speed_kmh,
        v.max_speed_kmh,
        v.service_ceiling_m,
        v.power_source,
        v.armament_capable,
        v.sensor_types,
        v.notes
      FROM drone_variants v
      JOIN drone_platforms p ON v.platform_id = p.platform_id
      JOIN countries c ON v.country_id = c.country_id
      WHERE v.variant_id = ?;
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Drone not found" });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

export const searchMilitary = async (req, res) => {
  try {
    const { country, droneClass, role } = req.body;

    const sql = `
      SELECT
        v.variant_id,
        p.platform_name,
        p.image_filename,
        v.variant_name,
        c.country_name,
        p.drone_class,
        v.variant_type,
        v.role_primary,
        v.role_secondary,
        v.launch_type,
        v.recovery_type,
        v.propulsion_type,
        v.wingspan_m,
        v.mtow_kg,
        v.max_payload_kg,
        v.endurance_hr,
        v.operational_range_km,
        v.datalink_range_km,
        v.cruise_speed_kmh,
        v.max_speed_kmh,
        v.service_ceiling_m,
        v.power_source,
        v.armament_capable,
        v.sensor_types,
        v.notes
      FROM drone_variants v
      JOIN drone_platforms p ON v.platform_id = p.platform_id
      JOIN countries c ON v.country_id = c.country_id
      WHERE
        (? IS NULL OR c.country_name = ?)
        AND (? IS NULL OR p.drone_class = ?)
        AND (? IS NULL OR v.role_primary = ?)
      ORDER BY c.country_name, p.platform_name;
    `;

    const params = [
      country || null, country || null,
      droneClass || null, droneClass || null,
      role || null, role || null
    ];

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};