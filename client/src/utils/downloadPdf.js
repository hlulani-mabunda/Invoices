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

  const blob = new Blob([res.data], { type: "application/pdf" });
  const filename = `invoice-${invoiceNumber}.pdf`;
  const url = URL.createObjectURL(blob);
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  try {
    if (isMobile && typeof navigator.share === "function") {
      const file = new File([blob], filename, { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: filename });
        return;
      }
    }

    if (isMobile) {
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60000);
      return;
    }

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    if (!isMobile) {
      URL.revokeObjectURL(url);
    }
  }
}
