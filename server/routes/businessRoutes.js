import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createBusiness,
  getBusiness,
  updateBusiness
} from "../controllers/businessController.js";

const router = express.Router();

router.post("/", protect, createBusiness);
router.get("/", protect, getBusiness);
router.put("/", protect, updateBusiness);

export default router;
