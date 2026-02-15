const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mpesaRoutes = require("./routes/mpesa");

const app = express();
app.use(cors());
app.use(express.json());

const publicDir = path.join(__dirname, "..", "public_html");
app.use(express.static(publicDir));

app.use("/api/mpesa", mpesaRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
