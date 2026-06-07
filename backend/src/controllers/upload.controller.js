import fs from "fs";
import csv from "csv-parser";

import db from "../config/dbDrone.js";

export const uploadCSV = async (req, res) => {

  try {

    const category =
      req.body.category;

    const filePath =
      req.file.path;

    console.log(
      "CATEGORY:",
      category
    );

    console.log(
      "FILE:",
      filePath
    );

    /* ======================================
       CONFIG
    ====================================== */

    const config = {

      batteries: {
        staging:
          "battery_csv_staging",

        table:
          "batteries",

        codeColumn:
          "battery_code",

        csvCode:
          "BatteryID",
      },

      chargers: {
        staging:
          "charger_csv_staging",

        table:
          "chargers",

        codeColumn:
          "charger_code",

        csvCode:
          "ChargerID",
      },

      motors: {
        staging:
          "motor_csv_staging",

        table:
          "motors",

        codeColumn:
          "motor_code",

        csvCode:
          "MotorID",
      },

      frames: {
        staging:
          "frame_csv_staging",

        table:
          "frames",

        codeColumn:
          "frame_code",

        csvCode:
          "FrameID",
      },

      propellers: {
        staging:
          "propeller_csv_staging",

        table:
          "propellers",

        codeColumn:
          "prop_code",

        csvCode:
          "PropID",
      },

      esc: {
        staging:
          "esc_csv_staging",

        table:
          "esc",

        codeColumn:
          "esc_code",

        csvCode:
          "ESCID",
      },

      cameras: {
        staging:
          "camera_csv_staging",

        table:
          "cameras",

        codeColumn:
          "camera_code",

        csvCode:
          "CameraID",
      },

      gps_modules: {
        staging:
          "gps_csv_staging",

        table:
          "gps_modules",

        codeColumn:
          "gps_code",

        csvCode:
          "GPSID",
      },

      flight_controllers: {
        staging:
          "fc_csv_staging",

        table:
          "flight_controllers",

        codeColumn:
          "fc_code",

        csvCode:
          "FCID",
      },

      video_transmitters: {
        staging:
          "vtx_csv_staging",

        table:
          "video_transmitters",

        codeColumn:
          "vtx_code",

        csvCode:
          "VTXID",
      },

      radios_receivers: {
        staging:
          "radio_csv_staging",

        table:
          "radios_receivers",

        codeColumn:
          "radio_code",

        csvCode:
          "RadioID",
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
       CLEAR STAGING
    ====================================== */

    await db.query(`
      DELETE FROM ${selected.staging}
    `);

    console.log(
      "Staging table cleared"
    );

    /* ======================================
       READ CSV
    ====================================== */

    const rows = [];

    fs.createReadStream(filePath)

      .pipe(csv())

      .on("data", (data) => {

        rows.push(data);
      })

      .on("end", async () => {

        try {

          console.log(
            "CSV rows loaded:",
            rows.length
          );

          /* ===============================
             INSERT INTO STAGING
          =============================== */

          for (const row of rows) {

            const columns =
              Object.keys(row);

            const values =
              Object.values(row);

            const placeholders =
              columns
                .map(() => "?")
                .join(",");

            const query = `
              INSERT INTO ${selected.staging}
              (${columns.join(",")})
              VALUES (${placeholders})
            `;

            await db.query(
              query,
              values
            );
          }

          console.log(
            "CSV inserted into staging"
          );

          /* ===============================
             INSERT MANUFACTURERS SAFELY
          =============================== */

          await db.query(`
            INSERT IGNORE INTO manufacturers (manufacturer_name)

            SELECT DISTINCT Brand
            FROM ${selected.staging}

            WHERE Brand IS NOT NULL
              AND Brand != ''
          `);

          console.log(
            "Manufacturers normalized"
          );

          /* ===============================
             UPDATE FK SAFELY
          =============================== */

          await db.query(`
            UPDATE ${selected.table} c

            JOIN ${selected.staging} s
              ON c.${selected.codeColumn} = s.${selected.csvCode}

            JOIN manufacturers m
              ON m.manufacturer_name = s.Brand

            SET c.manufacturer_id = m.manufacturer_id
          `);

          console.log(
            "Manufacturer FK mapped"
          );

          /* ===============================
             VALIDATION
          =============================== */

          const [invalidRows] =
            await db.query(`
              SELECT COUNT(*) AS count

              FROM ${selected.table}

              WHERE manufacturer_id = 1
            `);

          console.log(
            "manufacturer_id=1 count:",
            invalidRows[0].count
          );

          /* ===============================
             DISTINCT MANUFACTURERS
          =============================== */

          const [manufacturers] =
            await db.query(`
              SELECT DISTINCT
                m.manufacturer_name

              FROM ${selected.table} c

              JOIN manufacturers m
              ON c.manufacturer_id =
                 m.manufacturer_id

              ORDER BY m.manufacturer_name
            `);

          console.log(
            "Distinct manufacturers:",
            manufacturers.length
          );

          /* ===============================
             CLEANUP FILE
          =============================== */

          fs.unlinkSync(filePath);

          return res.json({

            success: true,

            message:
              `${category} CSV imported successfully`,

            manufacturer_id_1_count:
              invalidRows[0].count,

            manufacturers:
              manufacturers.map(
                (m) => m.manufacturer_name
              ),
          });

        } catch (err) {

          console.error(err);

          return res.status(500).json({

            success: false,

            message:
              "Database import failed",

            error:
              err.message,
          });
        }
      });

  } catch (err) {

    console.error(err);

    return res.status(500).json({

      success: false,

      message:
        "CSV ingestion failed",

      error:
        err.message,
    });
  }
};