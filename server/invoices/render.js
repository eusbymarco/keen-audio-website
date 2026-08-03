const path = require("path");
const PDFDocument = require("pdfkit");

const logoPath = path.join(__dirname, "..", "..", "public_html", "images", "logo.png");

function companyDetails() {
  return {
    name: process.env.COMPANY_NAME || "KEEN Audio",
    address: process.env.COMPANY_ADDRESS || "Address to be configured",
    phone: process.env.COMPANY_PHONE || "Phone to be configured",
    email: process.env.COMPANY_EMAIL || "Email to be configured",
  };
}

function paymentStatus(order) {
  return order.paymentStatus || (order.status === "Paid" || order.status === "Completed" ? "Paid" : order.status);
}

function formatMoney(value) {
  return `KSh ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character]));
}

function invoiceHtml(order) {
  const company = companyDetails();
  const products = order.products.map((product) => `<tr><td>${escapeHtml(product.name)}</td><td>${product.quantity}</td><td>${formatMoney(product.unitPrice)}</td><td>${formatMoney(product.lineTotal)}</td></tr>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Invoice ${escapeHtml(order.invoiceNumber)}</title><link rel="stylesheet" href="/admin/assets/invoice.css"></head><body><div class="actions"><a href="/admin/invoices">Back to invoices</a><a href="/admin/api/invoices/${encodeURIComponent(order.invoiceNumber)}.pdf">Download PDF</a><button id="print-invoice">Print invoice</button></div><article class="invoice"><div class="top"><img class="logo" src="/images/logo.png" alt="Keen Audio logo"><div class="company"><strong>${escapeHtml(company.name)}</strong><br>${escapeHtml(company.address)}<br>${escapeHtml(company.phone)}<br>${escapeHtml(company.email)}</div></div><div class="invoice-title"><div><p class="invoice-kicker">KEEN AUDIO</p><h1>INVOICE</h1><p class="invoice-number">${escapeHtml(order.invoiceNumber)}</p></div><span class="status">Payment: ${escapeHtml(paymentStatus(order))}</span></div><div class="details"><div><h3>BILL TO</h3><p><strong>${escapeHtml(order.customerName)}</strong><br>${escapeHtml(order.phoneNumber)}</p></div><div><h3>INVOICE DATE</h3><p>${escapeHtml(formatDate(order.date))}</p></div></div><table><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Total</th></tr></thead><tbody>${products}</tbody></table><div class="total"><div><p><span>Items</span><span>${order.quantity}</span></p><p class="grand"><span>Total</span><span>${formatMoney(order.totalAmount)}</span></p></div></div><p class="footer">Thank you for choosing Keen Audio.</p></article><script src="/admin/assets/invoice.js" defer></script></body></html>`;
}

function streamInvoicePdf(res, order) {
  const company = companyDetails();
  const document = new PDFDocument({ margin: 50, size: "A4" });
  document.pipe(res);
  try { document.image(logoPath, 50, 42, { fit: [150, 52] }); } catch { document.fontSize(20).fillColor("#102425").text("KEEN AUDIO", 50, 50); }
  document.fillColor("#4b5a5a").fontSize(9).text(company.name, 360, 48, { align: "right" }).text(company.address, 360, 61, { align: "right" }).text(company.phone, 360, 74, { align: "right" }).text(company.email, 360, 87, { align: "right" });
  document.moveTo(50, 118).lineTo(545, 118).strokeColor("#dbe1e1").stroke();
  document.fillColor("#172020").fontSize(24).text("INVOICE", 50, 145).fontSize(10).fillColor("#687377").text(order.invoiceNumber, 50, 176);
  document.fillColor("#172020").fontSize(10).text("BILL TO", 50, 215).fontSize(11).text(order.customerName, 50, 231).fontSize(10).fillColor("#526060").text(order.phoneNumber, 50, 247);
  document.fillColor("#172020").fontSize(10).text("DATE", 360, 215).fontSize(10).fillColor("#526060").text(formatDate(order.date), 360, 231).fillColor("#172020").text(`PAYMENT STATUS: ${paymentStatus(order)}`, 360, 250);
  let y = 300;
  document.rect(50, y, 495, 23).fill("#f4f7f6"); document.fillColor("#526060").fontSize(9).text("PRODUCT", 60, y + 7).text("QTY", 315, y + 7).text("UNIT PRICE", 365, y + 7).text("TOTAL", 465, y + 7);
  y += 35; document.fillColor("#172020");
  order.products.forEach((product) => { if (y > 700) { document.addPage(); y = 55; } document.fontSize(9).text(product.name, 60, y, { width: 240 }).text(String(product.quantity), 315, y).text(formatMoney(product.unitPrice), 365, y, { width: 90 }).text(formatMoney(product.lineTotal), 465, y, { width: 75 }); y += 26; });
  document.moveTo(340, y + 8).lineTo(545, y + 8).strokeColor("#172020").stroke(); document.fillColor("#172020").fontSize(13).text(`TOTAL: ${formatMoney(order.totalAmount)}`, 355, y + 18, { align: "right", width: 190 });
  document.fillColor("#687377").fontSize(9).text("Thank you for choosing Keen Audio.", 50, 760, { align: "center", width: 495 });
  document.end();
}

module.exports = { invoiceHtml, streamInvoicePdf };