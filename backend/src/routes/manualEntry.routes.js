import express from "express";

import {
  manualEntry,
}
from "../controllers/manualEntry.controller.js";

const router =
  express.Router();

router.post(
  "/",
  manualEntry
);

export default router;