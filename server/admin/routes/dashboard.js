const express = require("express");
const path = require("path");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();
const viewsDir = path.join(__dirname, "..", "views");
const sections = ["/orders", "/invoices", "/customers", "/products", "/reports", "/settings"];

router.use(requireAdmin);
router.get("/", (req, res) => res.sendFile(path.join(viewsDir, "dashboard.html")));
router.get(sections, (req, res) => res.sendFile(path.join(viewsDir, "dashboard.html")));

module.exports = router;