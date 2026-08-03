const express = require("express");
const { getOrder, listOrders } = require("../../orders/store");
const { invoiceHtml, streamInvoicePdf } = require("../../invoices/render");

const router = express.Router();
router.get("/api/invoices", async (req, res, next) => { try { res.json({ invoices: await listOrders() }); } catch (error) { next(error); } });
router.get("/api/invoices/:invoiceNumber.pdf", async (req, res, next) => { try { const order = await getOrder(req.params.invoiceNumber); if (!order) return res.status(404).json({ message: "Invoice not found." }); res.set({ "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${order.invoiceNumber}.pdf"` }); streamInvoicePdf(res, order); } catch (error) { next(error); } });
router.get("/invoices/:invoiceNumber", async (req, res, next) => { try { const order = await getOrder(req.params.invoiceNumber); if (!order) return res.status(404).send("Invoice not found."); res.send(invoiceHtml(order)); } catch (error) { next(error); } });
module.exports = router;