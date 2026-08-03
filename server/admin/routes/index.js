const express = require("express");
const { adminSecurityHeaders } = require("../middleware/auth");
const { sessionMiddleware } = require("../middleware/session");
const authRoutes = require("./auth");
const dashboardRoutes = require("./dashboard");
const orderRoutes = require("./orders");
const invoiceRoutes = require("./invoices");
const customerRoutes = require("./customers");

const router = express.Router();
router.use(adminSecurityHeaders);
router.use(sessionMiddleware);
router.use(express.json({ limit: "10kb" }));
router.use("/", authRoutes);
router.use("/", orderRoutes);
router.use("/", invoiceRoutes);
router.use("/", customerRoutes);
router.use("/", dashboardRoutes);

module.exports = router;