const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRoutes = require("./routes/mpesa");
const adminRoutes = require("./admin/routes");
const orderRoutes = require("./orders/routes");

const app = express();
app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());

const publicHtml = path.join(__dirname, "..", "public_html");
const adminAssets = path.join(__dirname, "admin", "public");

app.use("/admin/assets", express.static(adminAssets, { index: false }));
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(publicHtml, "index.html"));
});

app.use(express.static(publicHtml));
app.use("/api/orders", orderRoutes);
app.use("/api/mpesa", mpesaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});