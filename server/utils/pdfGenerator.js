import puppeteer from "puppeteer";

export const generateInvoicePDF = async (invoice, business, customer) => {
  try {
    const dateStr = invoice.createdAt
      ? new Date(invoice.createdAt)
          .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          .toUpperCase()
      : "";
    const dueDateStr = invoice.dueDate
      ? new Date(invoice.dueDate)
          .toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
          .toUpperCase()
      : "";

    const html = `
      <html>
      <head>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }

          body {
            font-family: 'Courier New', Courier, monospace;
            padding: 0;
            margin: 0;
            color: #000;
            background-color: #fff;
            font-size: 13px;
            line-height: 1.4;
          }

          .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .company {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            text-transform: uppercase;
          }

          .company-sub {
            font-size: 12px;
            margin-top: 5px;
          }

          .invoice-title {
            font-size: 26px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 5px;
            margin: 20px 0;
            text-transform: uppercase;
          }

          .details-container {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }

          .bill-to {
            width: 50%;
          }

          .invoice-info {
            width: 40%;
            text-align: right;
          }

          .section-title {
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }

          .info-row {
            margin-bottom: 4px;
          }

          .items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }

          .items th {
            border-top: 2px dashed #000;
            border-bottom: 2px dashed #000;
            padding: 8px 4px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .items td {
            border-bottom: 1px dotted #999;
            padding: 8px 4px;
          }

          .text-left {
            text-align: left;
          }

          .text-right {
            text-align: right;
          }

          .text-center {
            text-align: center;
          }

          .totals-container {
            display: flex;
            justify-content: flex-end;
            margin-top: 15px;
            margin-bottom: 40px;
          }

          .totals-box {
            width: 250px;
            text-align: right;
          }

          .totals-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
          }

          .grand-total {
            font-weight: bold;
            border-top: 1px dashed #000;
            border-bottom: 4px double #000;
            padding: 4px 0;
            margin-top: 6px;
          }

          .banking {
            margin-top: 40px;
            border-top: 2px dashed #000;
            padding-top: 15px;
            font-size: 12px;
          }

          .banking div {
            margin-bottom: 4px;
          }
        </style>
      </head>

      <body>

        <div class="header">
          <div class="company">${business.companyName}</div>
          <div class="company-sub">
            ${business.email || ""} | ${business.phone || ""}
            ${business.address?.line1 ? `<br/>${business.address.line1}` : ""}
            ${business.address?.city || business.address?.postalCode ? `<br/>` : ""}
            ${business.address?.city || ""} ${business.address?.postalCode || ""}
          </div>
        </div>

        <div class="invoice-title">INVOICE</div>

        <div class="details-container">
          <div class="bill-to">
            <div class="section-title">BILL TO:</div>
            <div><strong>${customer?.name || "—"}</strong></div>
            ${customer?.companyName ? `<div>${customer.companyName}</div>` : ""}
            ${customer?.email ? `<div>Email: ${customer.email}</div>` : ""}
            ${customer?.phone ? `<div>Phone: ${customer.phone}</div>` : ""}
            ${customer?.address ? `<div>Address: ${customer.address}</div>` : ""}
          </div>

          <div class="invoice-info">
            <div class="info-row"><strong>INVOICE #:</strong> ${invoice.invoiceNumber}</div>
            ${dateStr ? `<div class="info-row"><strong>DATE:</strong> ${dateStr}</div>` : ""}
            ${dueDateStr ? `<div class="info-row"><strong>DUE DATE:</strong> ${dueDateStr}</div>` : ""}
            <div class="info-row"><strong>STATUS:</strong> ${invoice.status || "DRAFT"}</div>
          </div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th class="text-center" style="width: 10%;">QTY</th>
              <th class="text-left">Description</th>
              <th class="text-right" style="width: 25%;">Unit Price</th>
              <th class="text-right" style="width: 20%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items
              .map(
                (item) => {
                  const formattedPrice = Number(item.price).toFixed(2).replace(".", ",");
                  const priceStr = `R${formattedPrice}`;
                  const totalStr = `R${(Number(item.price) * Number(item.quantity)).toFixed(2).replace(".", ",")}`;
                  const descStr = `${item.description}${item.unit ? ` (per ${item.unit})` : ""}`;
                  return `
                    <tr>
                      <td class="text-center">${item.quantity}</td>
                      <td class="text-left">${descStr}</td>
                      <td class="text-right">${priceStr}</td>
                      <td class="text-right">${totalStr}</td>
                    </tr>
                  `;
                }
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals-container">
          <div class="totals-box">
            <div class="totals-row grand-total">
              <span>TOTAL DUE:</span>
              <span>R${Number(invoice.total).toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>

        <div class="banking">
          <div class="section-title">BANKING DETAILS:</div>
          <div>BANK: ${business.banking?.bankName || "—"}</div>
          <div>ACCOUNT NUMBER: ${business.banking?.accountNumber || "—"}</div>
          <div>BRANCH CODE: ${business.banking?.branchCode || "—"}</div>
          <div>ACCOUNT HOLDER: ${business.banking?.accountHolder || "—"}</div>
        </div>

      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
    const page = await browser.newPage();

    await page.setContent(html);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true
    });

    await browser.close();

    return pdfBuffer;
  } catch (error) {
    console.error(error);
    throw new Error("PDF generation failed");
  }
};
