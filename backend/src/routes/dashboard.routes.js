import express from "express";
import dbParts from "../config/dbDrone.js";

const router = express.Router();

router.get("/dashboard/summary", async (req, res) => {
  try {
    const [batteries] = await dbParts.query("SELECT COUNT(*) AS count FROM batteries");
const [motors] = await dbParts.query("SELECT COUNT(*) AS count FROM motors");
const [frames] = await dbParts.query("SELECT COUNT(*) AS count FROM frames");
const [propellers] = await dbParts.query("SELECT COUNT(*) AS count FROM propellers");
const [cameras] = await dbParts.query("SELECT COUNT(*) AS count FROM cameras");
const [chargers] = await dbParts.query("SELECT COUNT(*) AS count FROM chargers");
const [esc] = await dbParts.query("SELECT COUNT(*) AS count FROM esc");
const [flightControllers] = await dbParts.query("SELECT COUNT(*) AS count FROM flight_controllers");
const [gps] = await dbParts.query("SELECT COUNT(*) AS count FROM gps_modules");
const [radios] = await dbParts.query("SELECT COUNT(*) AS count FROM radios_receivers");
const [vtx] = await dbParts.query("SELECT COUNT(*) AS count FROM video_transmitters");
const [firmware] = await dbParts.query("SELECT COUNT(*) AS count FROM firmware");
const [software] = await dbParts.query("SELECT COUNT(*) AS count FROM software");
const [rtf] = await dbParts.query("SELECT COUNT(*) AS count FROM rtf_uav");

    res.json({
  batteries: batteries[0]?.count || 0,
  motors: motors[0]?.count || 0,
  frames: frames[0]?.count || 0,
  propellers: propellers[0]?.count || 0,
  cameras: cameras[0]?.count || 0,
  chargers: chargers[0]?.count || 0,
  esc: esc[0]?.count || 0,
  flightControllers: flightControllers[0]?.count || 0,
  gps: gps[0]?.count || 0,
  radios: radios[0]?.count || 0,
  videoTransmitters: vtx[0]?.count || 0,
  firmware: firmware[0]?.count || 0,
  software: software[0]?.count || 0,
  readyToFly: rtf[0]?.count || 0
});

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;