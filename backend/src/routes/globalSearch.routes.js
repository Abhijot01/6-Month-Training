import express from "express";
import militaryDB from "../config/dbDrone.js";
import partsDB from "../config/dbDrone.js";

const router = express.Router();

router.get("/global", async (req, res) => {

  const q = req.query.q?.trim();

  if (!q) {
    return res.json({});
  }

  const like = `%${q.toLowerCase()}%`;

  try {

    /* ================= MILITARY DRONES ================= */

    const [military] = await militaryDB.query(
      `
      SELECT DISTINCT
        'military' AS source,

        dp.platform_id,
        dv.variant_id,

        dp.platform_name AS title,
        dv.variant_name AS subtitle,

        c.country_name AS country,

        dp.drone_class,
        dv.role_primary,
        dv.role_secondary

      FROM drone_platforms dp

      LEFT JOIN drone_variants dv
        ON dv.platform_id = dp.platform_id

      LEFT JOIN countries c
        ON c.country_id = dv.country_id

      WHERE
        LOWER(dp.platform_name) LIKE ?
        OR LOWER(dv.variant_name) LIKE ?
        OR LOWER(c.country_name) LIKE ?
        OR LOWER(dp.drone_class) LIKE ?
        OR LOWER(dv.role_primary) LIKE ?
        OR LOWER(dv.role_secondary) LIKE ?

      LIMIT 20
      `,
      [like, like, like, like, like, like]
    );

    /* ================= BATTERIES ================= */

const [batteries] = await partsDB.query(
  `
  SELECT

    'batteries' AS source,

    b.battery_id AS part_id,

    b.battery_code AS title,

    b.battery_chemistry AS subtitle,

    m.manufacturer_name AS manufacturer,

    b.capacity_mah,
    b.voltage_v,
    b.intended_use

  FROM batteries b

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = b.manufacturer_id

  WHERE

    LOWER(COALESCE(b.battery_code, '')) LIKE ?

    OR LOWER(COALESCE(b.battery_chemistry, '')) LIKE ?

    OR LOWER(COALESCE(b.intended_use, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(b.connector_type, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);

   /* ================= CHARGERS ================= */

const [chargers] = await partsDB.query(
  `
  SELECT

    'chargers' AS source,

    c.charger_id AS part_id,

    c.charger_code AS title,

    c.charger_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    c.supported_chemistry,
    c.max_charge_power_w

  FROM chargers c

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = c.manufacturer_id

  WHERE

    LOWER(COALESCE(c.charger_code, '')) LIKE ?

    OR LOWER(COALESCE(c.charger_type, '')) LIKE ?

    OR LOWER(COALESCE(c.supported_chemistry, '')) LIKE ?

    OR LOWER(COALESCE(c.intended_use, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);

 /* ================= MOTORS ================= */

const [motors] = await partsDB.query(
  `
  SELECT

    'motors' AS source,

    mo.motor_id AS part_id,

    mo.motor_code AS title,

    mo.motor_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    mo.kv_rating,
    mo.intended_use

  FROM motors mo

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = mo.manufacturer_id

  WHERE

    LOWER(COALESCE(mo.motor_code, '')) LIKE ?

    OR LOWER(COALESCE(mo.motor_type, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(mo.intended_use, '')) LIKE ?

    OR LOWER(COALESCE(mo.kv_rating, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);


/* ================= FRAMES ================= */

const [frames] = await partsDB.query(
  `
  SELECT

    'frames' AS source,

    f.frame_id AS part_id,

    f.frame_code AS title,

    f.frame_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    f.material,
    f.intended_use

  FROM frames f

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = f.manufacturer_id

  WHERE

    LOWER(COALESCE(f.frame_code, '')) LIKE ?

    OR LOWER(COALESCE(f.frame_type, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(f.material, '')) LIKE ?

    OR LOWER(COALESCE(f.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);

    /* ================= ESC ================= */

    /* ================= ESC ================= */

const [esc] = await partsDB.query(
  `
  SELECT

    'esc' AS source,

    e.esc_id AS part_id,

    e.esc_code AS title,

    e.esc_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    e.continuous_current_a,
    e.supported_voltage,
    e.firmware,
    e.input_protocol,
    e.intended_use

  FROM esc e

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = e.manufacturer_id

  WHERE

    LOWER(COALESCE(e.esc_code, '')) LIKE ?

    OR LOWER(COALESCE(e.esc_type, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(e.supported_voltage, '')) LIKE ?

    OR LOWER(COALESCE(e.firmware, '')) LIKE ?

    OR LOWER(COALESCE(e.input_protocol, '')) LIKE ?

    OR LOWER(COALESCE(e.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like,
    like,
    like
  ]
);
  
/* ================= FLIGHT CONTROLLERS ================= */

const [flight_controllers] = await partsDB.query(
  `
  SELECT

    'flight_controllers' AS source,

    fc.flight_controller_id AS part_id,

    fc.fc_code AS title,

    fc.processor AS subtitle,

    m.manufacturer_name AS manufacturer,

    fc.firmware_supported,
    fc.intended_use

  FROM flight_controllers fc

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = fc.manufacturer_id

  WHERE

    LOWER(COALESCE(fc.fc_code, '')) LIKE ?

    OR LOWER(COALESCE(fc.processor, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(fc.firmware_supported, '')) LIKE ?

    OR LOWER(COALESCE(fc.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);

/* ================= PROPELLERS ================= */

const [propellers] = await partsDB.query(
  `
  SELECT

    'propellers' AS source,

    p.propeller_id AS part_id,

    p.prop_code AS title,

    p.prop_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    p.diameter_in,
    p.intended_use

  FROM propellers p

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = p.manufacturer_id

  WHERE

    LOWER(COALESCE(p.prop_code, '')) LIKE ?

    OR LOWER(COALESCE(p.prop_type, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(p.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like
  ]
);

/* ================= RADIOS ================= */

const [radios] = await partsDB.query(
  `
  SELECT

    'radios' AS source,

    r.radio_id AS part_id,

    r.radio_code AS title,

    r.protocol AS subtitle,

    m.manufacturer_name AS manufacturer,

    r.frequency,
    r.intended_use

  FROM radios_receivers r

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = r.manufacturer_id

  WHERE

    LOWER(COALESCE(r.radio_code, '')) LIKE ?

    OR LOWER(COALESCE(r.protocol, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(r.frequency, '')) LIKE ?

    OR LOWER(COALESCE(r.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like
  ]
);

 /* ================= RTF ================= */

const [rtf] = await partsDB.query(
  `
  SELECT

    'rtf' AS source,

    r.rtf_id AS part_id,

    m.manufacturer_name AS title,

    r.drone_type AS subtitle,

    r.category,
    r.sub_category,

    r.frame_size,
    r.intended_use

  FROM rtf_uav r

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = r.manufacturer_id

  WHERE

    LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(r.category, '')) LIKE ?

    OR LOWER(COALESCE(r.sub_category, '')) LIKE ?

    OR LOWER(COALESCE(r.drone_type, '')) LIKE ?

    OR LOWER(COALESCE(r.battery_spec, '')) LIKE ?

    OR LOWER(COALESCE(r.firmware, '')) LIKE ?

    OR LOWER(COALESCE(r.intended_use, '')) LIKE ?

  LIMIT 100
  `,
  [
    like,
    like,
    like,
    like,
    like,
    like,
    like
  ]
);

    /* ================= VIDEO TRANSMITTERS ================= */

  const [video_transmitters] = await partsDB.query(
  `
  SELECT

    'video_transmitters' AS source,

    v.vtx_id AS part_id,

    v.vtx_code AS title,

    v.video_system AS subtitle,

    m.manufacturer_name AS manufacturer,

    v.frequency_band,
    v.supported_drone_type,
    v.intended_use

  FROM video_transmitters v

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = v.manufacturer_id

  WHERE

    LOWER(COALESCE(v.vtx_code, '')) LIKE ?

    OR LOWER(COALESCE(v.video_system, '')) LIKE ?

    OR LOWER(COALESCE(v.frequency_band, '')) LIKE ?

    OR LOWER(COALESCE(v.supported_drone_type, '')) LIKE ?

    OR LOWER(COALESCE(v.intended_use, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

  LIMIT 10
  `,
  [
    like,
    like,
    like,
    like,
    like,
    like
  ]
);

/* ================= firmware ================= */
const [firmware] = await partsDB.query(
  `
  SELECT

    'firmware' AS source,

    firmware_id AS part_id,

    name AS title,

    category AS subtitle,

    purpose,
    license_type,
    supported_hardware,
    development_status,
    industry_adoption,
    typical_use

  FROM firmware

  WHERE

    LOWER(COALESCE(name, '')) LIKE ?

    OR LOWER(COALESCE(firmware_code, '')) LIKE ?

    OR LOWER(COALESCE(category, '')) LIKE ?

    OR LOWER(COALESCE(purpose, '')) LIKE ?

    OR LOWER(COALESCE(license_type, '')) LIKE ?

    OR LOWER(COALESCE(supported_hardware, '')) LIKE ?

    OR LOWER(COALESCE(development_status, '')) LIKE ?

    OR LOWER(COALESCE(industry_adoption, '')) LIKE ?

    OR LOWER(COALESCE(typical_use, '')) LIKE ?

  LIMIT 10
  `,
  [
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like
  ]
);

// ======================================================
// SOFTWARE GLOBAL SEARCH
// ======================================================

const [software] = await partsDB.query(
  `
  SELECT

    'software' AS source,

    software_id AS part_id,

    software_code AS title,

    software_type AS subtitle,

    name,
    supported_platform,
    license_type,
    development_status

  FROM software

  WHERE

    LOWER(COALESCE(software_code, '')) LIKE ?

    OR LOWER(COALESCE(name, '')) LIKE ?

    OR LOWER(COALESCE(software_type, '')) LIKE ?

    OR LOWER(COALESCE(supported_platform, '')) LIKE ?

    OR LOWER(COALESCE(license_type, '')) LIKE ?

    OR LOWER(COALESCE(connection_type, '')) LIKE ?

    OR LOWER(COALESCE(development_status, '')) LIKE ?

    OR LOWER(COALESCE(primary_purpose, '')) LIKE ?

  LIMIT 10
  `,
  [like, like, like, like, like, like, like, like]
);

// ======================================================
// CAMERAS GLOBAL SEARCH
// ADD IN: backend/src/routes/globalSearch.routes.js
// ======================================================

const [cameras] = await partsDB.query(
  `
  SELECT

    'cameras' AS source,

    c.camera_id AS part_id,

    c.camera_code AS title,

    c.camera_type AS subtitle,

    m.manufacturer_name AS manufacturer,

    c.sub_category,
    c.sensor_type,

    c.resolution,
    c.video_system,

    c.interface_type,
    c.mount_type,

    c.supported_drone_type,
    c.intended_use

  FROM cameras c

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = c.manufacturer_id

  WHERE

    LOWER(COALESCE(c.camera_code, '')) LIKE ?

    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

    OR LOWER(COALESCE(c.sub_category, '')) LIKE ?

    OR LOWER(COALESCE(c.camera_type, '')) LIKE ?

    OR LOWER(COALESCE(c.sensor_type, '')) LIKE ?

    OR LOWER(COALESCE(c.resolution, '')) LIKE ?

    OR LOWER(COALESCE(c.video_system, '')) LIKE ?

    OR LOWER(COALESCE(c.interface_type, '')) LIKE ?

    OR LOWER(COALESCE(c.mount_type, '')) LIKE ?

    OR LOWER(COALESCE(c.supported_drone_type, '')) LIKE ?

    OR LOWER(COALESCE(c.intended_use, '')) LIKE ?

  LIMIT 10
  `,
  [
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like,
    like,
  ]
);

    /* ================= GPS ================= */

    const [gps] = await partsDB.query(
  `
  SELECT

    'gps' AS source,

    g.gps_id AS part_id,

    g.gps_code AS title,

    g.gnss_support AS subtitle,

    m.manufacturer_name AS manufacturer,

    g.interface_type,
    g.supported_firmware,
    g.intended_use

  FROM gps_modules g

  LEFT JOIN manufacturers m
    ON m.manufacturer_id = g.manufacturer_id

  WHERE

    LOWER(COALESCE(g.gps_code, '')) LIKE ?
    OR LOWER(COALESCE(g.gnss_support, '')) LIKE ?
    OR LOWER(COALESCE(g.interface_type, '')) LIKE ?
    OR LOWER(COALESCE(g.supported_firmware, '')) LIKE ?
    OR LOWER(COALESCE(g.intended_use, '')) LIKE ?
    OR LOWER(COALESCE(m.manufacturer_name, '')) LIKE ?

  LIMIT 10
  `,
  [like, like, like, like, like, like]
);

res.json({

  military,

  batteries,
  chargers,
  motors,
  frames,

  flight_controllers,

  propellers,
  radios,
  rtf,
  esc,
  video_transmitters,
  firmware,
  software,
  cameras,
  gps,
});

  } catch (err) {

    console.error(
      "❌ Global search error:",
      err
    );

    res.status(500).json({
      error: "Global search failed"
    });
  }
});

export default router;