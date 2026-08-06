const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRoutes = require("./routes/mpesa");
const adminRoutes = require("./admin/routes");
const orderRoutes = require("./orders/routes");
const { ensureAdminAccount } = require("./admin/config");

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

const publicHtml = path.join(__dirname, "..", "public_html");
const adminAssets = path.join(__dirname, "admin", "public");

ensureAdminAccount();

app.use("/admin/assets", express.static(adminAssets, { index: false }));
app.use("/admin", adminRoutes);

const pageRoutes = {
  "/": "index.html",
  "/products": "products.html",
  "/booking": "booking.html",
  "/contact": "contact.html",
  "/cart": "cart.html",
  "/terms": "terms.html"
};

Object.entries(pageRoutes).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(publicHtml, file));
  });
});

const legacyRedirects = [
  ["/index.html", "/"],
  ["/index.htm", "/"],
  ["/products.html", "/products"],
  ["/booking.html", "/booking"],
  ["/contact.html", "/contact"],
  ["/cart.html", "/cart"],
  ["/terms.html", "/terms"]
];

app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(publicHtml, 'favicon.ico'));
});

legacyRedirects.forEach(([from, to]) => {
  app.get(from, (req, res) => {
    res.redirect(301, to);
  });
});

app.use(express.static(publicHtml));
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});