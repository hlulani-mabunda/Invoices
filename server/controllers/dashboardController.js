import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [customers, invoices] = await Promise.all([
      Customer.countDocuments({ userId }),
      Invoice.find({ userId }),
    ]);

    const totalInvoices = invoices.length;

    const totalRevenue = invoices.reduce((sum, inv) => {
      if (inv.status === "PAID") {
        return sum + (inv.total || 0);
      }
      return sum;
    }, 0);

    const paid = invoices.filter((i) => i.status === "PAID").length;
    const unpaid = invoices.filter((i) => i.status !== "PAID").length;

    res.json({
      customers,
      totalInvoices,
      totalRevenue,
      paid,
      unpaid,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
