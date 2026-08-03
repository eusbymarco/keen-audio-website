const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");
const { recordOrderForCustomer } = require("../customers/store");

const dataFile = path.join(__dirname, "..", "data", "orders.json");
let writeQueue = Promise.resolve();

async function readOrders() {
  try {
    const contents = await fs.readFile(dataFile, "utf8");
    const orders = JSON.parse(contents);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
}

async function writeOrders(orders) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(orders, null, 2), "utf8");
  await fs.rename(tempFile, dataFile);
}

function nextInvoiceNumber(orders, now) {
  const datePart = now.toISOString().slice(0, 10).replaceAll("-", "");
  const prefix = `KA-${datePart}-`;
  const sequence = orders.filter((order) => order.invoiceNumber.startsWith(prefix)).length + 1;
  return `${prefix}${String(sequence).padStart(3, "0")}`;
}

function createOrder(input) {
  const task = writeQueue.then(async () => {
    const orders = await readOrders();
    const now = new Date();
    const invoiceNumber = nextInvoiceNumber(orders, now);
    const order = {
      id: crypto.randomUUID(),
      invoiceNumber,
      customerName: input.customerName,
      phoneNumber: input.phoneNumber,
      date: now.toISOString(),
      products: input.products,
      quantity: input.products.reduce((sum, product) => sum + product.quantity, 0),
      totalAmount: input.products.reduce((sum, product) => sum + product.lineTotal, 0),
      status: "Pending",
      paymentStatus: "Pending",
      invoice: { number: invoiceNumber, issuedAt: now.toISOString() },
    };
    orders.unshift(order);
    await writeOrders(orders);
    return order;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}

async function listOrders() {
  return readOrders();
}

async function getOrder(id) {
  const orders = await readOrders();
  return orders.find((order) => order.id === id || order.invoiceNumber === id);
}

module.exports = { createOrder, getOrder, listOrders };