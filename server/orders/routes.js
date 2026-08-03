const express = require("express");
const { createOrder } = require("./store");

const router = express.Router();
const attempts = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function isRateLimited(ip) {
  const record = attempts.get(ip);
  if (!record || record.startedAt + WINDOW_MS < Date.now()) return false;
  return record.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip) {
  const record = attempts.get(ip);
  if (!record || record.startedAt + WINDOW_MS < Date.now()) attempts.set(ip, { count: 1, startedAt: Date.now() });
  else record.count += 1;
}

function cleanText(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function validateOrder(body) {
  const customerName = cleanText(body.customerName, 100);
  const phoneNumber = cleanText(body.phoneNumber, 30);
  if (customerName.length < 2 || phoneNumber.length < 7) return { error: "Please provide your name and a valid phone number." };
  if (!Array.isArray(body.products) || body.products.length === 0 || body.products.length > 50) return { error: "Your cart is invalid." };

  const products = body.products.map((product) => {
    const name = cleanText(product.name, 160);
    const quantity = Number(product.quantity);
    const unitPrice = Number(product.price);
    if (!name || !Number.isInteger(quantity) || quantity < 1 || quantity > 99 || !Number.isFinite(unitPrice) || unitPrice < 0 || unitPrice > 10000000) return null;
    return { name, quantity, unitPrice, lineTotal: Math.round(unitPrice * quantity * 100) / 100 };
  });

  if (products.some((product) => product === null)) return { error: "One or more cart items are invalid." };
  return { customerName, phoneNumber, products };
}

router.post("/", async (req, res, next) => {
  const ip = req.ip;
  if (isRateLimited(ip)) return res.status(429).json({ message: "Too many order attempts. Please try again later." });
  recordAttempt(ip);

  const result = validateOrder(req.body || {});
  if (result.error) return res.status(400).json({ message: result.error });

  try {
    const order = await createOrder(result);
    res.status(201).json({ invoiceNumber: order.invoiceNumber, orderId: order.id, status: order.status });
  } catch (error) {
    next(error);
  }
});

module.exports = router;