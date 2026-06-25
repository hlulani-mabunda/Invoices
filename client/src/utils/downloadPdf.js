export async function downloadInvoicePdf(api, id, invoiceNumber) {
  const res = await api.get(`/invoices/${id}/pdf`, {
    responseType: "blob",
  });

  const contentType = res.headers["content-type"] || "";
  if (!contentType.includes("application/pdf")) {
    const text = await res.data.text();
    let message = "Failed to download PDF";
    try {
      const json = JSON.parse(text);
      message = json.message || message;
    } catch {
      // keep default message
    }
    throw new Error(message);
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const mimeType = isMobile ? "application/octet-stream" : "application/pdf";
  const blob = new Blob([res.data], { type: mimeType });
  const filename = `invoice-${invoiceNumber}.pdf`;
  const url = URL.createObjectURL(blob);

  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}
