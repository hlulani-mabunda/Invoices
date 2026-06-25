import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: String,
  phone: String,
  address: String,
  companyName: String,

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

export default mongoose.model("Customer", customerSchema);