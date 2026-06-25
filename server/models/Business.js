import mongoose from "mongoose";

const businessSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  companyName: {
    type: String,
    required: true
  },

  logoUrl: {
    type: String
  },

  address: {
    line1: String,
    city: String,
    postalCode: String
  },

  email: {
    type: String
  },

  phone: {
    type: String
  },

  banking: {
    bankName: String,
    accountNumber: String,
    branchCode: String,
    accountHolder: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

businessSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model("Business", businessSchema);