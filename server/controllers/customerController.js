import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";

const pickCustomerFields = (body) => {
  const { name, email, phone, address, companyName } = body;
  return { name, email, phone, address, companyName };
};

export const createCustomer = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ message: "Customer name is required" });
    }

    const customer = await Customer.create({
      ...pickCustomerFields(req.body),
      name: name.trim(),
      userId: req.user._id,
    });

    res.status(201).json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, userId: req.user._id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const updates = pickCustomerFields(req.body);

    if (updates.name !== undefined && !updates.name?.trim()) {
      return res.status(400).json({ message: "Customer name cannot be empty" });
    }

    if (updates.name) {
      updates.name = updates.name.trim();
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const linkedInvoices = await Invoice.countDocuments({
      customerId: req.params.id,
      userId: req.user._id,
    });

    if (linkedInvoices > 0) {
      return res.status(400).json({
        message: "Cannot delete customer with existing invoices. Delete the invoices first.",
      });
    }

    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({ message: "Customer deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
