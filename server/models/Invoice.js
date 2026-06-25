import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  items: [
    {
      description: String,
      quantity: Number,
      price: Number,
      unit: String
    }
  ],

  subtotal: Number,
  vat: Number,
  total: Number,

  status: {
    type: String,
    enum: ["DRAFT", "SENT", "PAID", "OVERDUE"],
    default: "DRAFT",
    uppercase: true
  },

  dueDate: Date,

  // 🔐 LINK TO USER (IMPORTANT FOR SAAS)
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Invoice", invoiceSchema);