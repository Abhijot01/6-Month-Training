import db from "../config/dbDrone.js";

export const manualEntry = async (
  req,
  res
) => {

  try {

    const {
      category,
      data,
    } = req.body;

    /* ======================================
       COMPONENT CONFIG
    ====================================== */

    const config = {

      batteries: {
        table: "batteries",
        hasManufacturer: true,
      },

      chargers: {
        table: "chargers",
        hasManufacturer: true,
      },

      motors: {
        table: "motors",
        hasManufacturer: true,
      },

      frames: {
        table: "frames",
        hasManufacturer: true,
      },

      propellers: {
        table: "propellers",
        hasManufacturer: true,
      },

      cameras: {
        table: "cameras",
        hasManufacturer: true,
      },

      esc: {
        table: "esc",
        hasManufacturer: true,
      },

      gps_modules: {
        table: "gps_modules",
        hasManufacturer: true,
      },

      flight_controllers: {
        table:
          "flight_controllers",

        hasManufacturer: true,
      },

      video_transmitters: {
        table:
          "video_transmitters",

        hasManufacturer: true,
      },

      radios_receivers: {
        table:
          "radios_receivers",

        hasManufacturer: true,
      },

      firmware: {
        table: "firmware",
        hasManufacturer: false,
      },

      software: {
        table: "software",
        hasManufacturer: false,
      },
    };

    const selected =
      config[category];

    if (!selected) {

      return res.status(400).json({

        success: false,

        message:
          "Invalid category",
      });
    }

    /* ======================================
       MANUFACTURER NORMALIZATION
    ====================================== */

    let manufacturerId = null;

    if (

      selected.hasManufacturer &&

      data.manufacturer_name

    ) {

      /* ===============================
         INSERT MANUFACTURER
      =============================== */

      await db.query(`

        INSERT IGNORE INTO
        manufacturers

        (manufacturer_name)

        VALUES (?)

      `, [

        data.manufacturer_name
      ]);

      /* ===============================
         FETCH FK
      =============================== */

      const [rows] =
        await db.query(`

          SELECT manufacturer_id

          FROM manufacturers

          WHERE manufacturer_name = ?

        `, [

          data.manufacturer_name
        ]);

      if (rows.length > 0) {

        manufacturerId =
          rows[0]
            .manufacturer_id;
      }
    }

    /* ======================================
       PREPARE INSERT DATA
    ====================================== */

    const insertData = {

      ...data,
    };

    /* ===============================
       HARDWARE ONLY
    =============================== */

    if (
      selected.hasManufacturer
    ) {

      insertData.manufacturer_id =
        manufacturerId;
    }

    /* ===============================
       REMOVE FRONTEND FIELD
    =============================== */

    delete insertData
      .manufacturer_name;

    /* ======================================
       NULL HANDLING
    ====================================== */

    Object.keys(insertData)
      .forEach((key) => {

        if (

          insertData[key] === "" ||

          insertData[key] ===
          undefined

        ) {

          insertData[key] = null;
        }
      });

    /* ======================================
       INSERT QUERY
    ====================================== */

    const columns =
      Object.keys(insertData);

    const values =
      Object.values(insertData);

    const placeholders =
      columns
        .map(() => "?")
        .join(",");

    const query = `

      INSERT IGNORE INTO
      ${selected.table}

      (${columns.join(",")})

      VALUES (${placeholders})

    `;

    await db.query(
      query,
      values
    );

    return res.json({

      success: true,

      message:
        `${category} inserted successfully`,
    });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      message:
        "Manual insert failed",
    });
  }
};