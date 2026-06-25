import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer
} from "../controllers/customerController.js";

const router = express.Router();

// PROTECTED ROUTES
router.post("/", protect, createCustomer);
router.get("/", protect, getCustomers);
router.get("/:id", protect, getCustomer);
router.put("/:id", protect, updateCustomer);
router.delete("/:id", protect, deleteCustomer);

export default router;