import mongoose from "mongoose";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Business from "../models/Business.js";

import {
  generateInvoiceNumber,
  calculateInvoiceTotals,
} from "../utils/invoiceUtils.js";

import { generateInvoicePDF } from "../utils/pdfGenerator.js";

const markOverdueInvoices = async (userId) => {
  const now = new Date();

  await Invoice.updateMany(
    {
      userId,
      status: { $in: ["DRAFT", "SENT"] },
      dueDate: { $lt: now },
    },
    { status: "OVERDUE" }
  );
};

export const createInvoice = async (req, res) => {
  try {
    const { customerId, items, dueDate } = req.body;

    if (!customerId) {
      return res.status(400).json({ message: "Customer is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: "Invalid customer id" });
    }

    const customer = await Customer.findOne({ _id: customerId, userId: req.user._id });
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    let totals;
    try {
      totals = calculateInvoiceTotals(items);
    } catch (validationError) {
      return res.status(400).json({ message: validationError.message });
    }

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),
      customerId,
      items,
      subtotal: totals.subtotal,
      vat: totals.vat,
      total: totals.total,
      dueDate: dueDate || undefined,
      userId: req.user._id,
    });

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoices = async (req, res) => {
  try {
    await markOverdueInvoices(req.user._id);

    const invoices = await Invoice.find({ userId: req.user._id })
      .populate("customerId")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid invoice id" });
    }

    await markOverdueInvoices(req.user._id);

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).populate(
      "customerId"
    );

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateInvoiceStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid invoice id" });
    }

    const normalizedStatus = String(req.body?.status || "")
      .trim()
      .toUpperCase();

    const allowedStatuses = ["DRAFT", "SENT", "PAID", "OVERDUE"];

    if (!allowedStatuses.includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { status: normalizedStatus },
      { new: true, runValidators: true }
    ).populate("customerId");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid invoice id" });
    }

    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json({ message: "Invoice deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadInvoicePDF = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid invoice id" });
    }

    const invoice = await Invoice.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("customerId");

    const business = await Business.findOne({ userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    if (!business) {
      return res.status(404).json({ message: "Business profile not found" });
    }

    const pdfBuffer = await generateInvoicePDF(invoice, business, invoice.customerId);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
      "Content-Length": pdfBuffer.length,
      "Cache-Control": "no-store",
    });

    res.send(Buffer.from(pdfBuffer));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
