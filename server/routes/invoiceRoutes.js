import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  createInvoice,
  getInvoices,
  getInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  downloadInvoicePDF
} from "../controllers/invoiceController.js";

const router = express.Router();

// PROTECTED ROUTES
router.post("/", protect, createInvoice);
router.get("/", protect, getInvoices);
router.get("/:id/pdf", protect, downloadInvoicePDF);
router.put("/:id/status", protect, updateInvoiceStatus);
router.get("/:id", protect, getInvoice);
router.delete("/:id", protect, deleteInvoice);

export default router;