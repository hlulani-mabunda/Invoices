export const generateInvoiceNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `INV-${timestamp}-${random}`;
};

export const calculateInvoiceTotals = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("At least one line item is required");
  }

  let subtotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    const price = Number(item.price);

    if (!item.description?.trim()) {
      throw new Error("Each line item must have a description");
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      throw new Error("Each line item must have a valid quantity");
    }
    if (!Number.isFinite(price) || price < 0) {
      throw new Error("Each line item must have a valid price");
    }

    subtotal += quantity * price;
  }

  const vat = 0;
  const total = subtotal;

  return {
    subtotal,
    vat,
    total,
  };
};
