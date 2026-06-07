import express from "express";
import { searchMilitary, getVariantById } from "../controllers/search.controller.js";

const router = express.Router();

router.post("/military", searchMilitary);
router.get("/variant/:id", getVariantById);

export default router;
