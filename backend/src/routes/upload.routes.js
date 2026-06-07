import express from "express";
import multer from "multer";

import {
  uploadCSV,
} from "../controllers/upload.controller.js";

const router = express.Router();

/* ======================================
   MULTER STORAGE
====================================== */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {

    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  },
});

const upload = multer({ storage });

/* ======================================
   ROUTES
====================================== */

router.post(
  "/csv",
  upload.single("file"),
  uploadCSV
);

export default router;