import express from "express";
import dbParts from "../config/dbDrone.js";

const router = express.Router();

/* ======================================================
   BATTERY SEARCH
====================================================== */

router.get("/batteries/search", async (req, res) => {

  try {

    const {
      chemistry,
      cellCount,
      connector,
      manufacturer,
      capacityMin,
      voltageMin,
    } = req.query;

    let sql = `
      SELECT

        b.battery_id,
        b.battery_code,

        m.manufacturer_name AS manufacturer,

        b.battery_chemistry,
        b.cell_count,
        b.voltage_v,
        b.capacity_mah,
        b.discharge_rate_c,
        b.energy_wh,
        b.connector_type,
        b.intended_use

      FROM batteries b

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = b.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    if (chemistry) {

      const values = chemistry.split(",");

      sql += `
        AND b.battery_chemistry IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (cellCount) {

      const values = cellCount.split(",");

      sql += `
        AND b.cell_count IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (connector) {

      const values = connector.split(",");

      sql += `
        AND b.connector_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (capacityMin) {

      sql += `
        AND b.capacity_mah >= ?
      `;

      params.push(Number(capacityMin));
    }

    if (voltageMin) {

      sql += `
        AND b.voltage_v >= ?
      `;

      params.push(Number(voltageMin));
    }

    sql += `
      ORDER BY
        b.voltage_v DESC,
        b.capacity_mah DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Battery search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});


/* ======================================================
   BATTERY DETAILS
====================================================== */

router.get("/batteries/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        b.battery_id,
        b.battery_code,

        m.manufacturer_name AS manufacturer,

        b.battery_chemistry,
        b.cell_count,
        b.voltage_v,
        b.capacity_mah,
        b.discharge_rate_c,
        b.energy_wh,
        b.connector_type,
        b.intended_use

      FROM batteries b

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = b.manufacturer_id

      WHERE b.battery_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Battery not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Battery detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   CHARGER SEARCH
   GET /api/parts/chargers/search
====================================================== */

router.get("/chargers/search", async (req, res) => {

  try {

    const {
      manufacturer,
      subCategory,
      chargerType,
      chemistry,
      powerMin,
      portType,
    } = req.query;

    let sql = `
      SELECT

        c.charger_id,
        c.charger_code,

        m.manufacturer_name AS manufacturer,

        c.sub_category,
        c.charger_type,
        c.supported_chemistry,
        c.max_charge_power_w,
        c.input_voltage,
        c.output_current,
        c.balancer_type,
        c.port_type,
        c.supported_platform,
        c.intended_use

      FROM chargers c

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = c.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* =========================
       MANUFACTURER
    ========================= */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       SUB CATEGORY
    ========================= */

    if (subCategory) {

      const values = subCategory.split(",");

      sql += `
        AND c.sub_category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       CHARGER TYPE
    ========================= */

    if (chargerType) {

      const values = chargerType.split(",");

      sql += `
        AND c.charger_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       CHEMISTRY
    ========================= */

    if (chemistry) {

      const values = chemistry.split(",");

      const conditions = values.map(() =>
        `c.supported_chemistry LIKE ?`
      );

      sql += `
        AND (
          ${conditions.join(" OR ")}
        )
      `;

      values.forEach((v) => {
        params.push(`%${v}%`);
      });
    }

    /* =========================
       POWER
    ========================= */

    if (powerMin) {

      sql += `
        AND c.max_charge_power_w >= ?
      `;

      params.push(Number(powerMin));
    }

    /* =========================
       PORT TYPE
    ========================= */

    if (portType) {

      const values = portType.split(",");

      sql += `
        AND c.port_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY c.max_charge_power_w DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Charger search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});


/* ======================================================
   CHARGER DETAIL
   GET /api/parts/chargers/:id
====================================================== */

router.get("/chargers/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        c.charger_id,
        c.charger_code,

        m.manufacturer_name AS manufacturer,

        c.sub_category,
        c.charger_type,
        c.supported_chemistry,
        c.max_charge_power_w,
        c.input_voltage,
        c.output_current,
        c.balancer_type,
        c.port_type,
        c.supported_platform,
        c.intended_use

      FROM chargers c

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = c.manufacturer_id

      WHERE c.charger_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Charger not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Charger detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   MOTOR SEARCH
   GET /api/parts/motors/search
====================================================== */

router.get("/motors/search", async (req, res) => {

  try {

    const {
      manufacturer,
      subCategory,
      motorType,
      kvMin,
      powerMin,
      shaftDiameter,
      propSize,
    } = req.query;

    let sql = `
      SELECT

        m.motor_id,
        m.motor_code,

        mf.manufacturer_name AS manufacturer,

        m.sub_category,
        m.motor_type,
        m.kv_rating,
        m.max_current_a,
        m.max_power_w,
        m.shaft_diameter,
        m.mount_pattern,
        m.recommended_prop_size,
        m.compatible_drone_type,
        m.intended_use

      FROM motors m

      LEFT JOIN manufacturers mf
        ON mf.manufacturer_id = m.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* =========================
       MANUFACTURER
    ========================= */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND mf.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       SUB CATEGORY
    ========================= */

    if (subCategory) {

      const values = subCategory.split(",");

      sql += `
        AND m.sub_category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       MOTOR TYPE
    ========================= */

    if (motorType) {

      const values = motorType.split(",");

      sql += `
        AND m.motor_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       KV
    ========================= */

    if (kvMin) {

      const values = kvMin
        .split(",")
        .map(Number);

      sql += `
        AND m.kv_rating >= ?
      `;

      params.push(Math.min(...values));
    }

    /* =========================
       POWER
    ========================= */

    if (powerMin) {

      const values = powerMin
        .split(",")
        .map(Number);

      sql += `
        AND m.max_power_w >= ?
      `;

      params.push(Math.min(...values));
    }

    /* =========================
       SHAFT
    ========================= */

    if (shaftDiameter) {

      const values = shaftDiameter.split(",");

      sql += `
        AND m.shaft_diameter IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* =========================
       PROP SIZE
    ========================= */

    if (propSize) {

      const values = propSize.split(",");

      sql += `
        AND m.recommended_prop_size IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY m.max_power_w DESC
      LIMIT 500
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Motor search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   MOTOR DETAIL
   GET /api/parts/motors/:id
====================================================== */

router.get("/motors/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        m.motor_id,
        m.motor_code,

        mf.manufacturer_name AS manufacturer,

        m.sub_category,
        m.motor_type,
        m.kv_rating,
        m.max_current_a,
        m.max_power_w,
        m.shaft_diameter,
        m.mount_pattern,
        m.recommended_prop_size,
        m.compatible_drone_type,
        m.intended_use

      FROM motors m

      LEFT JOIN manufacturers mf
        ON mf.manufacturer_id = m.manufacturer_id

      WHERE m.motor_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Motor not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Motor detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   FRAME SEARCH
   GET /api/parts/frames/search
====================================================== */

router.get("/frames/search", async (req, res) => {

  try {

    const {
      manufacturer,
      subCategory,
      frameType,
      sizeInch,
      material,
      mounting,
    } = req.query;

    let sql = `
      SELECT

        f.frame_id,
        f.frame_code,

        m.manufacturer_name AS manufacturer,

        f.sub_category,
        f.frame_type,
        f.size_inch,
        f.wheelbase_mm,
        f.material,
        f.arm_type,
        f.mounting,
        f.supported_drone_type,
        f.intended_use

      FROM frames f

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = f.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* SUB CATEGORY */

    if (subCategory) {

      const values = subCategory.split(",");

      sql += `
        AND f.sub_category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* FRAME TYPE */

    if (frameType) {

      const values = frameType.split(",");

      sql += `
        AND f.frame_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* SIZE */

    if (sizeInch) {

      const values = sizeInch.split(",");

      sql += `
        AND f.size_inch IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* MATERIAL */

    if (material) {

      const values = material.split(",");

      sql += `
        AND f.material IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* MOUNTING */

    if (mounting) {

      const values = mounting.split(",");

      sql += `
        AND f.mounting IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY f.frame_code ASC
      LIMIT 200
    `;

    console.log("FRAME SQL:", sql);

    console.log("FRAME PARAMS:", params);

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Frame search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   FRAME DETAIL
   GET /api/parts/frames/:id
====================================================== */

router.get("/frames/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        f.frame_id,
        f.frame_code,

        m.manufacturer_name AS manufacturer,

        f.sub_category,
        f.frame_type,
        f.size_inch,
        f.wheelbase_mm,
        f.material,
        f.arm_type,
        f.mounting,
        f.supported_drone_type,
        f.intended_use

      FROM frames f

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = f.manufacturer_id

      WHERE f.frame_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Frame not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Frame detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   PROPELLER SEARCH
   GET /api/parts/propellers/search
====================================================== */
/* ======================================================
   PROPELLER SEARCH
   GET /api/parts/propellers/search
====================================================== */

router.get("/propellers/search", async (req, res) => {

  try {

    const {
      manufacturer,
      subCategory,
      propType,
      diameter,
      bladeCount,
      mountType,
    } = req.query;

    let sql = `
      SELECT

        p.propeller_id,
        p.prop_code,

        m.manufacturer_name AS manufacturer,

        p.sub_category,
        p.prop_type,
        p.diameter_in,
        p.pitch_in,
        p.blade_count,
        p.material,
        p.mount_type,
        p.rotation,
        p.compatible_drone_type,
        p.intended_use

      FROM propellers p

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = p.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* SUB CATEGORY */

    if (subCategory) {

      const values = subCategory.split(",");

      sql += `
        AND p.sub_category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* PROP TYPE */

    if (propType) {

      const values = propType.split(",");

      sql += `
        AND p.prop_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* DIAMETER */

    if (diameter) {

      const values = diameter.split(",");

      sql += `
        AND p.diameter_in IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* BLADE COUNT */

    if (bladeCount) {

      const values = bladeCount.split(",");

      sql += `
        AND p.blade_count IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* MOUNT */

    if (mountType) {

      const values = mountType.split(",");

      sql += `
        AND p.mount_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY p.diameter_in DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Propeller search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   PROPELLER DETAIL
   GET /api/parts/propellers/:id
====================================================== */

router.get("/propellers/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        p.propeller_id,
        p.prop_code,

        m.manufacturer_name AS manufacturer,

        p.sub_category,
        p.prop_type,
        p.diameter_in,
        p.pitch_in,
        p.blade_count,
        p.material,
        p.mount_type,
        p.rotation,
        p.compatible_drone_type,
        p.intended_use

      FROM propellers p

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = p.manufacturer_id

      WHERE p.propeller_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Propeller not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Propeller detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   FLIGHT CONTROLLER SEARCH
   GET /api/parts/flight-controllers/search
====================================================== */

router.get("/flight-controllers/search", async (req, res) => {

  try {

    const {
      manufacturer,
      subCategory,
      processor,
      firmware,
      formFactor,
      droneType,
    } = req.query;

    let sql = `
      SELECT

        fc.flight_controller_id,
        fc.fc_code,

        m.manufacturer_name AS manufacturer,

        fc.sub_category,
        fc.processor,
        fc.form_factor,
        fc.mounting,
        fc.firmware_supported,
        fc.imu,
        fc.barometer,
        fc.osd,
        fc.blackbox,
        fc.esc_interface,
        fc.connector_type,
        fc.supported_drone_type,
        fc.intended_use

      FROM flight_controllers fc

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = fc.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* SUB CATEGORY */

    if (subCategory) {

      const values = subCategory.split(",");

      sql += `
        AND fc.sub_category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* PROCESSOR */

    if (processor) {

      const values = processor.split(",");

      sql += `
        AND fc.processor IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* FIRMWARE */

    if (firmware) {

      const values = firmware.split(",");

      sql += `
        AND fc.firmware_supported IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* FORM FACTOR */

    if (formFactor) {

      const values = formFactor.split(",");

      sql += `
        AND fc.form_factor IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* DRONE TYPE */

    if (droneType) {

      const values = droneType.split(",");

      sql += `
        AND fc.supported_drone_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY fc.fc_code ASC
      LIMIT 200
    `;

    console.log("FC SQL:", sql);

    console.log("FC PARAMS:", params);

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Flight controller search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   FLIGHT CONTROLLER DETAIL
   GET /api/parts/flight-controllers/:id
====================================================== */

router.get("/flight-controllers/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        fc.flight_controller_id,
        fc.fc_code,

        m.manufacturer_name AS manufacturer,

        fc.sub_category,
        fc.processor,
        fc.form_factor,
        fc.mounting,
        fc.firmware_supported,
        fc.imu,
        fc.barometer,
        fc.osd,
        fc.blackbox,
        fc.esc_interface,
        fc.connector_type,
        fc.supported_drone_type,
        fc.intended_use

      FROM flight_controllers fc

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = fc.manufacturer_id

      WHERE fc.flight_controller_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Flight controller not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Flight controller detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   RADIOS & RECEIVERS SEARCH
   GET /api/parts/radios/search
====================================================== */
/* ======================================================
   RADIO SEARCH
   GET /api/parts/radios/search
====================================================== */

router.get("/radios/search", async (req, res) => {

  try {

    const {
      manufacturer,
      deviceType,
      protocol,
      frequency,
      connector,
      droneType,
    } = req.query;

    let sql = `
      SELECT

        r.radio_id,
        r.radio_code,

        m.manufacturer_name AS manufacturer,

        r.device_type,
        r.protocol,
        r.frequency,
        r.channel_count,
        r.telemetry,
        r.antenna_type,
        r.connector,
        r.power_output,
        r.supported_drone_type,
        r.intended_use

      FROM radios_receivers r

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = r.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* DEVICE TYPE */

    if (deviceType) {

      const values = deviceType.split(",");

      sql += `
        AND r.device_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* PROTOCOL */

    if (protocol) {

      const values = protocol.split(",");

      sql += `
        AND r.protocol IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* FREQUENCY */

    if (frequency) {

      const values = frequency.split(",");

      sql += `
        AND r.frequency IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* CONNECTOR */

    if (connector) {

      const values = connector.split(",");

      sql += `
        AND r.connector IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* DRONE TYPE */

    if (droneType) {

      const values = droneType.split(",");

      sql += `
        AND r.supported_drone_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY r.radio_code ASC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Radio search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   RADIO DETAIL
   GET /api/parts/radios/:id
====================================================== */

router.get("/radios/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        r.radio_id,
        r.radio_code,

        m.manufacturer_name AS manufacturer,

        r.device_type,
        r.protocol,
        r.frequency,
        r.channel_count,
        r.telemetry,
        r.antenna_type,
        r.connector,
        r.power_output,
        r.supported_drone_type,
        r.intended_use

      FROM radios_receivers r

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = r.manufacturer_id

      WHERE r.radio_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Radio not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Radio detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});



/* ======================================================
   RTF SEARCH
   GET /api/parts/rtf/search
====================================================== */

router.get("/rtf/search", async (req, res) => {

  try {

    const {
      manufacturer,
      droneType,
      buildLevel,
      frameSize,
      firmware
    } = req.query;

    let sql = `
      SELECT

        r.rtf_id,

        m.manufacturer_name AS manufacturer,

        r.category,
        r.sub_category,

        r.drone_type,
        r.build_level,

        r.frame_size,
        r.wheelbase,

        r.motor_spec,
        r.propeller_spec,
        r.battery_spec,

        r.flight_controller,
        r.firmware,

        r.payload_support,
        r.max_takeoff_kg,
        r.intended_use

      FROM rtf_uav r

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = r.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* DRONE TYPE */

    if (droneType) {

      const values = droneType.split(",");

      sql += `
        AND r.drone_type IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* BUILD LEVEL */

    if (buildLevel) {

      const values = buildLevel.split(",");

      sql += `
        AND r.build_level IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* FRAME SIZE */

    if (frameSize) {

      const values = frameSize.split(",");

      sql += `
        AND r.frame_size IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* FIRMWARE */

    if (firmware) {

      const values = firmware.split(",");

      sql += `
        AND r.firmware IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY r.max_takeoff_kg DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("RTF search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   RTF DETAIL
   GET /api/parts/rtf/:id
====================================================== */

router.get("/rtf/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        r.rtf_id,

        m.manufacturer_name AS manufacturer,

        r.category,
        r.sub_category,

        r.drone_type,
        r.build_level,

        r.frame_size,
        r.wheelbase,

        r.motor_spec,
        r.propeller_spec,
        r.battery_spec,

        r.flight_controller,
        r.firmware,

        r.payload_support,
        r.max_takeoff_kg,
        r.intended_use

      FROM rtf_uav r

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = r.manufacturer_id

      WHERE r.rtf_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "RTF drone not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("RTF detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   VIDEO TRANSMITTER SEARCH
   GET /api/parts/video_transmitters/search
====================================================== */

router.get("/video_transmitters/search", async (req, res) => {

  try {

    const {
      manufacturer,
      frequency,
      power,
      channels,
      mountPattern
    } = req.query;

    let sql = `
      SELECT

        v.vtx_id,
        v.vtx_code,

        m.manufacturer_name AS manufacturer,

        v.sub_category,
        v.video_system,

        v.frequency_band,
        v.output_power_mw,
        v.channel_count,

        v.input_voltage,

        v.antenna_connector,
        v.control_protocol,

        v.mount_pattern,
        v.antenna_type,

        v.supported_drone_type,
        v.intended_use

      FROM video_transmitters v

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = v.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* FREQUENCY */

    if (frequency) {

      const values = frequency.split(",");

      sql += `
        AND v.frequency_band IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* POWER */

    if (power) {

      const values = power.split(",");

      sql += `
        AND v.output_power_mw IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* CHANNELS */

    if (channels) {

      const values = channels.split(",");

      sql += `
        AND v.channel_count IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    /* MOUNT */

    if (mountPattern) {

      const values = mountPattern.split(",");

      sql += `
        AND v.mount_pattern IN (${values.map(() => "?").join(",")})
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY v.output_power_mw DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("VTX search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   VIDEO TRANSMITTER DETAIL
   GET /api/parts/video_transmitters/:id
====================================================== */

router.get("/video_transmitters/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        v.vtx_id,
        v.vtx_code,

        m.manufacturer_name AS manufacturer,

        v.sub_category,
        v.video_system,

        v.frequency_band,
        v.output_power_mw,
        v.channel_count,

        v.input_voltage,

        v.antenna_connector,
        v.control_protocol,

        v.mount_pattern,
        v.antenna_type,

        v.supported_drone_type,
        v.intended_use

      FROM video_transmitters v

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = v.manufacturer_id

      WHERE v.vtx_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Video transmitter not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("VTX detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   ESC SEARCH
   GET /api/parts/esc/search
====================================================== */

router.get("/esc/search", async (req, res) => {

  try {

    const {
      manufacturer,
      current,
      voltage,
      firmware,
      protocol,
      mountPattern,
    } = req.query;

    let sql = `
      SELECT

        e.esc_id,
        e.esc_code,

        m.manufacturer_name AS manufacturer,

        e.esc_type,
        e.continuous_current_a,
        e.burst_current_a,
        e.supported_voltage,
        e.firmware,
        e.input_protocol,
        e.mount_pattern,
        e.bec_output,
        e.cooling_method,
        e.intended_use

      FROM esc e

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = e.manufacturer_id

      WHERE 1=1
    `;

    const params = [];

    /* MANUFACTURER */

    if (manufacturer) {

      const values = manufacturer.split(",");

      sql += `
        AND m.manufacturer_name IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* CURRENT */

    if (current) {

      const values = current.split(",");

      sql += `
        AND e.continuous_current_a IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* VOLTAGE */

    if (voltage) {

      const values = voltage.split(",");

      sql += `
        AND e.supported_voltage IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* FIRMWARE */

    if (firmware) {

      const values = firmware.split(",");

      sql += `
        AND e.firmware IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* PROTOCOL */

    if (protocol) {

      const values = protocol.split(",");

      sql += `
        AND e.input_protocol IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    /* MOUNT */

    if (mountPattern) {

      const values = mountPattern.split(",");

      sql += `
        AND e.mount_pattern IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY e.continuous_current_a DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("ESC search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   ESC DETAIL
   GET /api/parts/esc/:id
====================================================== */

router.get("/esc/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        e.esc_id,
        e.esc_code,

        m.manufacturer_name AS manufacturer,

        e.esc_type,
        e.continuous_current_a,
        e.burst_current_a,
        e.supported_voltage,
        e.firmware,
        e.input_protocol,
        e.mount_pattern,
        e.bec_output,
        e.cooling_method,
        e.intended_use

      FROM esc e

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = e.manufacturer_id

      WHERE e.esc_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "ESC not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("ESC detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

/* ======================================================
   FIRMWARE SEARCH
   GET /api/parts/firmware/search
====================================================== */

router.get("/firmware/search", async (req, res) => {

  try {

    const {
      category,
      license,
      status,
      adoption,
    } = req.query;

    let sql = `
      SELECT

        firmware_id,
        firmware_code,
        name,
        category,
        purpose,
        license_type,
        development_status,
        industry_adoption,
        typical_use

      FROM firmware

      WHERE 1=1
    `;

    const params = [];

    if (category) {

      const values = category.split(",");

      sql += `
        AND category IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (license) {

      const values = license.split(",");

      sql += `
        AND license_type IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (status) {

      const values = status.split(",");

      sql += `
        AND development_status IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    if (adoption) {

      const values = adoption.split(",");

      sql += `
        AND industry_adoption IN (
          ${values.map(() => "?").join(",")}
        )
      `;

      params.push(...values);
    }

    sql += `
      ORDER BY name ASC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Firmware search error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});

router.get("/firmware/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        firmware_id,
        firmware_code,
        name,
        category,
        purpose,
        license_type,
        development_status,
        industry_adoption,
        typical_use

      FROM firmware

      WHERE firmware_id = ?
      `,
      [id]
    );

    if (rows.length === 0) {

      return res.status(404).json({
        error: "Firmware not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Firmware detail error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});


// =====================================================
// SOFTWARE SEARCH
// ROUTE: /api/parts/software/search
// =====================================================

router.get("/software/search", async (req, res) => {

  try {

    const {
      type,
      platform,
      license,
      connection,
      status,
    } = req.query;

    let query = `
      SELECT

        s.software_id,
        s.software_code,
        s.name,

        s.software_type,
        s.supported_platform,

        s.license_type,
        s.connection_type,

        s.development_status,
        s.primary_purpose

      FROM software s

      WHERE 1=1
    `;

    const values = [];

    // SOFTWARE TYPE
    if (type) {

      const arr = type.split(",");

      query += `
        AND s.software_type IN (${arr.map(() => "?").join(",")})
      `;

      values.push(...arr);
    }

    // PLATFORM
    if (platform) {

      const arr = platform.split(",");

      query += `
        AND s.supported_platform IN (${arr.map(() => "?").join(",")})
      `;

      values.push(...arr);
    }

    // LICENSE
    if (license) {

      const arr = license.split(",");

      query += `
        AND s.license_type IN (${arr.map(() => "?").join(",")})
      `;

      values.push(...arr);
    }

    // CONNECTION
    if (connection) {

      const arr = connection.split(",");

      query += `
        AND s.connection_type IN (${arr.map(() => "?").join(",")})
      `;

      values.push(...arr);
    }

    // STATUS
    if (status) {

      const arr = status.split(",");

      query += `
        AND s.development_status IN (${arr.map(() => "?").join(",")})
      `;

      values.push(...arr);
    }

    query += `
      ORDER BY s.software_id DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(query, values);

    res.json(rows);

  } catch (err) {

    console.error("Software search error:", err);

    res.status(500).json({
      message: "Software search failed",
    });
  }
});


// =====================================================
// SOFTWARE DETAIL
// ROUTE: /api/parts/software/:id
// =====================================================

router.get("/software/:id", async (req, res) => {

  try {

    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        software_id,
        software_code,
        name,

        software_type,
        supported_platform,

        license_type,
        connection_type,

        development_status,
        primary_purpose

      FROM software

      WHERE software_id = ?
      `,
      [id]
    );

    if (!rows.length) {

      return res.status(404).json({
        message: "Software not found",
      });
    }

    res.json(rows[0]);

  } catch (err) {

    console.error("Software detail error:", err);

    res.status(500).json({
      message: "Software detail failed",
    });
  }
});

// ======================================================
// CAMERA SEARCH ROUTE
// ADD IN: backend/src/routes/parts.routes.js
// ======================================================

router.get("/cameras/search", async (req, res) => {
  try {
    const {
      brand,
      type,
      sensor,
      resolution,
      interfaceType,
      minWeight,
      maxWeight,
    } = req.query;

    let query = `
      SELECT

        c.camera_id,
        c.camera_code,

        m.manufacturer_name AS brand,

        c.sub_category,
        c.camera_type,
        c.sensor_type,

        c.resolution,
        c.video_system,

        c.lens_size_mm,
        c.field_of_view_deg,

        c.interface_type,
        c.mount_type,

        c.weight_g,
        c.supported_drone_type,
        c.intended_use

      FROM cameras c

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = c.manufacturer_id

      WHERE 1=1
    `;

    const values = [];

    if (brand) {
      const arr = brand.split(",");
      query += ` AND m.manufacturer_name IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (type) {
      const arr = type.split(",");
      query += ` AND c.camera_type IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (sensor) {
      const arr = sensor.split(",");
      query += ` AND c.sensor_type IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (resolution) {
      const arr = resolution.split(",");
      query += ` AND c.resolution IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (interfaceType) {
      const arr = interfaceType.split(",");
      query += ` AND c.interface_type IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (minWeight) {
      const arr = minWeight.split(",");
      query += ` AND c.weight_g >= ?`;
      values.push(arr[0]);
    }

    if (maxWeight) {
      const arr = maxWeight.split(",");
      query += ` AND c.weight_g <= ?`;
      values.push(arr[0]);
    }

    query += `
      ORDER BY c.camera_id DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(query, values);

    res.json(rows);

  } catch (err) {
    console.error("Camera search error:", err);
    res.status(500).json({
      error: "Camera search failed"
    });
  }
});

// ======================================================
// CAMERA DETAIL ROUTE
// ADD BELOW SEARCH ROUTE
// ======================================================

router.get("/cameras/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        c.camera_id,
        c.camera_code,

        m.manufacturer_name AS brand,

        c.sub_category,
        c.camera_type,
        c.sensor_type,

        c.resolution,
        c.video_system,

        c.lens_size_mm,
        c.field_of_view_deg,

        c.interface_type,
        c.mount_type,

        c.weight_g,
        c.supported_drone_type,
        c.intended_use

      FROM cameras c

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = c.manufacturer_id

      WHERE c.camera_id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "Camera not found",
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("Camera detail error:", err);

    res.status(500).json({
      error: "Failed to fetch camera detail",
    });
  }
});

// ============================================
// GPS MODULE SEARCH API
// ============================================
router.get("/gps/search", async (req, res) => {
  try {
    const {
      brand,
      gnss,
      compass,
      interfaceType,
      firmware,
      minUpdateRate
    } = req.query;

    let query = `
      SELECT

        g.gps_id,
        g.gps_code,

        m.manufacturer_name AS brand,

        g.sub_category,
        g.gnss_support,
        g.compass_included,

        g.update_rate_hz,
        g.interface_type,

        g.voltage_input,
        g.antenna_type,

        g.mounting_type,
        g.supported_firmware,

        g.supported_drone_type,
        g.intended_use

      FROM gps_modules g

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = g.manufacturer_id

      WHERE 1=1
    `;

    const values = [];

    if (brand) {
      const arr = brand.split(",");
      query += ` AND m.manufacturer_name IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (gnss) {
      const arr = gnss.split(",");
      query += ` AND g.gnss_support IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (compass) {
      const arr = compass.split(",");
      query += ` AND g.compass_included IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (interfaceType) {
      const arr = interfaceType.split(",");
      query += ` AND g.interface_type IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (firmware) {
      const arr = firmware.split(",");
      query += ` AND g.supported_firmware IN (${arr.map(() => "?").join(",")})`;
      values.push(...arr);
    }

    if (minUpdateRate) {
      const arr = minUpdateRate.split(",");
      query += ` AND g.update_rate_hz >= ?`;
      values.push(arr[0]);
    }

    query += `
      ORDER BY g.gps_id DESC
      LIMIT 200
    `;

    const [rows] = await dbParts.query(query, values);

    res.json(rows);

  } catch (err) {
    console.error("GPS search error:", err);

    res.status(500).json({
      error: "GPS search failed"
    });
  }
});

router.get("/gps/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await dbParts.query(
      `
      SELECT

        g.gps_id,
        g.gps_code,

        m.manufacturer_name AS brand,

        g.sub_category,
        g.gnss_support,
        g.compass_included,

        g.update_rate_hz,
        g.interface_type,

        g.voltage_input,
        g.antenna_type,

        g.mounting_type,
        g.supported_firmware,

        g.supported_drone_type,
        g.intended_use

      FROM gps_modules g

      LEFT JOIN manufacturers m
        ON m.manufacturer_id = g.manufacturer_id

      WHERE g.gps_id = ?
      `,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({
        error: "GPS module not found"
      });
    }

    res.json(rows[0]);

  } catch (err) {
    console.error("GPS detail error:", err);

    res.status(500).json({
      error: "Failed to fetch GPS detail"
    });
  }
});























router.get("/compatibility/esc-motor", async (req, res) => {
  try {
    const esc = req.query.esc?.trim();
    const motor = req.query.motor?.trim();
    console.log("ESC INPUT:", esc);
    console.log("MOTOR INPUT:", motor);

    if (!esc || !motor) {
      return res.status(400).json({ error: "ESC and Motor required" });
    }

    const [escRows] = await dbParts.query(`
    SELECT e.*,
          COALESCE(m.manufacturer_name, 'Unknown') AS brand
    FROM esc e
    LEFT JOIN manufacturers m
      ON m.manufacturer_id = e.manufacturer_id
    WHERE e.esc_code = ?
    LIMIT 1
  `, [esc]);
    console.log("ESC ROWS:", escRows);

    const [motorRows] = await dbParts.query(`
    SELECT mo.*,
          COALESCE(m.manufacturer_name, 'Unknown') AS brand
    FROM motors mo
    LEFT JOIN manufacturers m
      ON m.manufacturer_id = mo.manufacturer_id
    WHERE mo.motor_code = ?
    LIMIT 1
  `, [motor]);
    console.log("MOTOR ROWS:", motorRows);

    if (!escRows.length || !motorRows.length) {
      return res.json({
        compatible: false,
        reason: "ESC or Motor not found"
      });
    }

    const escData = escRows[0];
    const motorData = motorRows[0];

    const [compRows] = await dbParts.query(`
      SELECT compatibility_level, recommended_use
      FROM esc_motor_compatibility
      WHERE esc_id = ? AND motor_id = ?
    `, [escData.esc_id, motorData.motor_id]);

    if (compRows.length > 0) {
      return res.json({
        compatible: true,
        compatibility_level: compRows[0].compatibility_level,
        reason: compRows[0].recommended_use,
        esc: escData,
        motor: motorData
      });
    }

    // 🔥 FALLBACK
    let compatible = true;
    let reason = "Auto-evaluated compatibility";

    if (motorData.max_current_a > escData.continuous_current_a) {
      compatible = false;
      reason = "Motor current exceeds ESC capacity";
    }

    res.json({
      compatible,
      compatibility_level: compatible ? "Auto-Compatible" : "Not Compatible",
      reason,
      esc: escData,
      motor: motorData
    });

  } catch (err) {
    console.error("ESC-Motor error:", err);
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// MOTOR ↔ PROPELLER COMPATIBILITY
// ============================================

router.get("/search/prop", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [rows] = await dbParts.query(`
      SELECT 
        p.prop_code,
        m.manufacturer_name AS brand,
        p.diameter_in,
        p.pitch_in,

        CASE
          WHEN p.prop_code = ? THEN 1
          WHEN m.manufacturer_name = ? THEN 2
          WHEN p.prop_code LIKE CONCAT('%', ?, '%') THEN 3
          WHEN m.manufacturer_name LIKE CONCAT('%', ?, '%') THEN 4
          ELSE 5
        END AS relevance

      FROM propellers p
      JOIN manufacturers m ON m.manufacturer_id = p.manufacturer_id

      WHERE 
        p.prop_code LIKE CONCAT('%', ?, '%')
        OR m.manufacturer_name LIKE CONCAT('%', ?, '%')

      ORDER BY relevance ASC
      LIMIT 100
    `, [q, q, q, q, q, q]);

    res.json(rows);
  } catch (err) {
    console.error("Prop search error:", err);
    res.status(500).json({ error: err.message });
  }
});


router.get("/compatibility/motor-prop", async (req, res) => {
  try {
    const { motor, prop } = req.query;

    if (!motor || !prop) {
      return res.status(400).json({ error: "Motor and Prop required" });
    }

    const [motorRows] = await dbParts.query(`
      SELECT 
        mo.motor_id,
        mo.motor_code,
        mo.kv_rating,
        mo.max_current_a,
        mo.max_power_w,
        m.manufacturer_name AS brand
      FROM motors mo
      LEFT JOIN manufacturers m ON m.manufacturer_id = mo.manufacturer_id
      WHERE mo.motor_code = ?
      LIMIT 1
    `, [motor]);

    const [propRows] = await dbParts.query(`
      SELECT 
        p.propeller_id,
        p.prop_code,
        m.manufacturer_name AS brand,
        CAST(p.diameter_in AS DECIMAL(5,2)) AS size,
        CAST(p.pitch_in AS DECIMAL(5,2)) AS pitch,
        p.blade_count
      FROM propellers p
      JOIN manufacturers m ON m.manufacturer_id = p.manufacturer_id
      WHERE p.prop_code = ?
      LIMIT 1
    `, [prop]);

    if (!motorRows.length || !propRows.length) {
      return res.json({
        compatible: false,
        compatibility_level: "Invalid",
        reason: "Motor or Propeller not found"
      });
    }

    const motorData = motorRows[0];
    const propData = propRows[0];

    const [compatRows] = await dbParts.query(`
      SELECT *
      FROM motor_prop_compatibility
      WHERE motor_id = ? AND propeller_id = ?
      LIMIT 1
    `, [motorData.motor_id, propData.propeller_id]);

    if (compatRows.length > 0) {
      return res.json({
        compatible: true,
        compatibility_level: compatRows[0].compatibility_level,
        reason: compatRows[0].recommended_use,
        motor: motorData,
        prop: propData
      });
    }

    // 🔥 SMART FALLBACK
    let compatible = true;
    let reason = "Auto-evaluated compatibility";
    let level = "Auto-Compatible";

    if (motorData.max_current_a > 60) {
      compatible = false;
      reason = "Motor current too high for propeller safety";
      level = "Not Compatible";
    }

    if (motorData.kv_rating && propData.size) {
      if (motorData.kv_rating > 2500 && propData.size > 6) {
        compatible = false;
        reason = "High KV motor unsuitable for large propeller";
        level = "Not Compatible";
      }
    }

    res.json({
      compatible,
      compatibility_level: level,
      reason: compatible ? "No issues detected" : reason,
      motor: motorData,
      prop: propData
    });

  } catch (err) {
    console.error("Motor-Prop error:", err);
    res.status(500).json({ error: err.message });
  }
});

/*==============================
FRAME-PROP COMPATIBILITY
=============================== */

router.get("/search/frame", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const [rows] = await dbParts.query(`
      SELECT 
        f.frame_id,
        f.frame_code,
        CAST(f.wheelbase_mm AS DECIMAL(10,2)) AS wheelbase_mm,
        f.frame_type,
        m.manufacturer_name AS brand,

        CASE
          WHEN f.frame_code = ? THEN 1
          WHEN m.manufacturer_name = ? THEN 2
          WHEN f.frame_code LIKE CONCAT('%', ?, '%') THEN 3
          WHEN m.manufacturer_name LIKE CONCAT('%', ?, '%') THEN 4
          ELSE 5
        END AS relevance

      FROM frames f
      JOIN manufacturers m 
        ON m.manufacturer_id = f.manufacturer_id

      WHERE 
        f.frame_code LIKE CONCAT('%', ?, '%')
        OR m.manufacturer_name LIKE CONCAT('%', ?, '%')

      ORDER BY relevance ASC, f.wheelbase_mm DESC
      LIMIT 200
    `, [q, q, q, q, q, q]);

    res.json(rows);
  } catch (err) {
    console.error("Frame search error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/compatibility/frame-prop", async (req, res) => {
  try {
    const frame = req.query.frame?.trim();
    const prop = req.query.prop?.trim();

    console.log("FRAME INPUT:", frame);
    console.log("PROP INPUT:", prop);

    if (!frame || !prop) {
      return res.status(400).json({ error: "Frame and Prop required" });
    }

    const [frameDirect] = await dbParts.query(`
    SELECT frame_id, frame_code
    FROM frames
    WHERE frame_code = ?
  `, [frame]);

  console.log("DIRECT FRAME:", frameDirect);

  const [propDirect] = await dbParts.query(`
    SELECT propeller_id, prop_code
    FROM propellers
    WHERE prop_code = ?
  `, [prop]);

  console.log("DIRECT PROP:", propDirect);

    /* =========================
       FETCH FRAME
    ========================= */
    const [frameRows] = await dbParts.query(`
      SELECT 
        f.frame_id,
        f.frame_code,
        CAST(f.wheelbase_mm AS DECIMAL(10,2)) AS wheelbase_mm,
        f.frame_type,
        m.manufacturer_name AS brand
      FROM frames f
      LEFT JOIN manufacturers m ON m.manufacturer_id = f.manufacturer_id
      WHERE f.frame_code = ?
      LIMIT 1
    `, [frame]);
      console.log("FRAME ROWS:", frameRows);

    /* =========================
       FETCH PROP
    ========================= */
    const [propRows] = await dbParts.query(`
      SELECT 
        p.propeller_id,
        p.prop_code,
        m.manufacturer_name AS brand,
        CAST(p.diameter_in AS DECIMAL(5,2)) AS diameter_in,
        CAST(p.pitch_in AS DECIMAL(5,2)) AS pitch_in,
        p.blade_count
      FROM propellers p
      LEFT JOIN manufacturers m ON m.manufacturer_id = p.manufacturer_id
      WHERE p.prop_code = ?
      LIMIT 1
    `, [prop]);
      console.log("PROP ROWS:", propRows);

    if (!frameRows.length || !propRows.length) {
      return res.json({
        compatible: false,
        compatibility_level: "Invalid",
        reason: "Frame or Prop not found"
      });
    }

    const frameData = frameRows[0];
    const propData = propRows[0];

    /* =========================
       CHECK DB TABLE
    ========================= */
    const [compatRows] = await dbParts.query(`
      SELECT fit_type, recommended_use
      FROM frame_prop_compatibility
      WHERE frame_id = ? AND propeller_id = ?
      LIMIT 1
    `, [frameData.frame_id, propData.propeller_id]);

    if (compatRows.length > 0) {
      return res.json({
        compatible: true,
        compatibility_level: compatRows[0].fit_type,
        reason: compatRows[0].recommended_use,
        frame: frameData,
        prop: propData
      });
    }

    /* =========================
       🔥 FALLBACK (MATCH SYSTEM)
    ========================= */

    let compatible = true;
    let level = "Auto-Compatible";
    let reason = "Auto-evaluated compatibility";

    const wheelbase = Number(frameData.wheelbase_mm) || 0;
    const propSize = Number(propData.diameter_in) || 0;

    if (wheelbase < 200 && propSize > 5) {
      compatible = false;
      level = "Not Compatible";
      reason = "Frame too small for prop size";
    }

    else if (wheelbase > 500 && propSize < 6) {
      compatible = false;
      level = "Not Compatible";
      reason = "Large frame requires bigger prop";
    }

    else if (propSize >= 4 && propSize <= 7) {
      level = "Optimal Fit";
      reason = "Balanced prop size for frame";
    }

    else {
      level = "Suboptimal Fit";
      reason = "Works but not ideal";
    }

    if (propData.blade_count >= 4 && compatible) {
      reason += " | High blade count reduces efficiency";
    }

    res.json({
      compatible,
      compatibility_level: level,
      reason,
      frame: frameData,
      prop: propData
    });

  } catch (err) {
    console.error("Frame-Prop error:", err);
    res.status(500).json({ error: err.message });
  }
});


//BACKEND SUMMARY -----------------------------
//----------------------------------
//-----------------------------------

router.get("/dashboard/summary", async (req, res) => {
  try {
    const queries = await Promise.all([
      dbParts.query("SELECT COUNT(*) AS count FROM batteries"),
      dbParts.query("SELECT COUNT(*) AS count FROM motors"),
      dbParts.query("SELECT COUNT(*) AS count FROM frames"),
      dbParts.query("SELECT COUNT(*) AS count FROM propellers"),
      dbParts.query("SELECT COUNT(*) AS count FROM cameras"),
      dbParts.query("SELECT COUNT(*) AS count FROM chargers"),
      dbParts.query("SELECT COUNT(*) AS count FROM esc"),
      dbParts.query("SELECT COUNT(*) AS count FROM flight_controllers"),
      dbParts.query("SELECT COUNT(*) AS count FROM gps_modules"),
      dbParts.query("SELECT COUNT(*) AS count FROM radios_receivers"),
      dbParts.query("SELECT COUNT(*) AS count FROM video_transmitters"),
      dbParts.query("SELECT COUNT(*) AS count FROM firmware"),
      dbParts.query("SELECT COUNT(*) AS count FROM software"),
      dbParts.query("SELECT COUNT(*) AS count FROM rtf_uav"),
    ]);

    const [
      batteries,
      motors,
      frames,
      propellers,
      cameras,
      chargers,
      esc,
      flightControllers,
      gps,
      radios,
      vtx,
      firmware,
      software,
      rtf
    ] = queries;

    res.json({
      batteries: batteries[0][0].count,
      motors: motors[0][0].count,
      frames: frames[0][0].count,
      propellers: propellers[0][0].count,
      cameras: cameras[0][0].count,
      chargers: chargers[0][0].count,
      esc: esc[0][0].count,
      flightControllers: flightControllers[0][0].count,
      gps: gps[0][0].count,
      radios: radios[0][0].count,
      videoTransmitters: vtx[0][0].count,
      firmware: firmware[0][0].count,
      software: software[0][0].count,
      readyToFly: rtf[0][0].count
    });

  } catch (err) {
    console.error("Dashboard summary error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/dropdowns/all", async (req, res) => {
  try {
    const [frames] = await db.query("SELECT frame_id AS id, frame_code AS name FROM frames");
    const [motors] = await db.query("SELECT motor_id AS id, motor_code AS name FROM motors");
    const [esc] = await db.query("SELECT esc_id AS id, esc_code AS name FROM esc");
    const [batteries] = await db.query("SELECT battery_id AS id, battery_code AS name FROM batteries");
    const [props] = await db.query("SELECT propeller_id AS id, prop_code AS name FROM propellers");

    res.json({ frames, motors, esc, batteries, props });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;