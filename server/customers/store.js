const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const dataFile = path.join(__dirname, "..", "data", "customers.json");
let writeQueue = Promise.resolve();

async function readCustomers() {
  try { const contents = await fs.readFile(dataFile, "utf8"); const customers = JSON.parse(contents); return Array.isArray(customers) ? customers : []; }
  catch (error) { if (error.code === "ENOENT") return []; throw error; }
}
async function writeCustomers(customers) {
  await fs.mkdir(path.dirname(dataFile), { recursive: true });
  const tempFile = `${dataFile}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(customers, null, 2), "utf8");
  await fs.rename(tempFile, dataFile);
}
function normalizePhone(phoneNumber) { return String(phoneNumber).replace(/[^+\d]/g, ""); }
function recordOrderForCustomer(order) {
  const task = writeQueue.then(async () => {
    const customers = await readCustomers();
    const phoneNumber = normalizePhone(order.phoneNumber);
    let customer = customers.find((item) => item.phoneNumber === phoneNumber);
    if (!customer) {
      customer = { id: crypto.randomUUID(), name: order.customerName, phoneNumber, totalOrders: 0, totalAmountSpent: 0, orderHistory: [] };
      customers.unshift(customer);
    }
    customer.name = order.customerName;
    if (!customer.orderHistory.some((entry) => entry.orderId === order.id)) {
      customer.totalOrders += 1;
      customer.totalAmountSpent = Math.round((customer.totalAmountSpent + order.totalAmount) * 100) / 100;
      customer.orderHistory.unshift({ orderId: order.id, invoiceNumber: order.invoiceNumber, date: order.date, totalAmount: order.totalAmount, status: order.status, quantity: order.quantity, products: order.products.map((product) => ({ name: product.name, quantity: product.quantity })) });
    }
    await writeCustomers(customers);
    return customer;
  });
  writeQueue = task.catch(() => undefined);
  return task;
}
async function listCustomers() { return readCustomers(); }
async function getCustomer(id) { const customers = await readCustomers(); return customers.find((customer) => customer.id === id); }
module.exports = { getCustomer, listCustomers, recordOrderForCustomer };