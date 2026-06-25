import Business from "../models/Business.js";

const pickBusinessFields = (body) => {
  const { companyName, logoUrl, address, email, phone, banking } = body;
  return { companyName, logoUrl, address, email, phone, banking };
};

export const createBusiness = async (req, res) => {
  try {
    const existing = await Business.findOne({ userId: req.user._id });

    if (existing) {
      return res.status(400).json({ message: "Business profile already exists. Use PUT to update." });
    }

    const business = await Business.create({
      ...pickBusinessFields(req.body),
      userId: req.user._id,
    });

    res.status(201).json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ userId: req.user._id });
    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateBusiness = async (req, res) => {
  try {
    const updates = pickBusinessFields(req.body);

    const business = await Business.findOneAndUpdate(
      { userId: req.user._id },
      { ...updates, userId: req.user._id },
      { new: true, runValidators: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
