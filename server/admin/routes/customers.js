const express = require("express");
const { getCustomer, listCustomers } = require("../../customers/store");
const router = express.Router();
router.get("/api/customers", async (req, res, next) => { try { res.json({ customers: await listCustomers() }); } catch (error) { next(error); } });
router.get("/api/customers/:id", async (req, res, next) => { try { const customer = await getCustomer(req.params.id); if (!customer) return res.status(404).json({ message: "Customer not found." }); res.json({ customer }); } catch (error) { next(error); } });
module.exports = router;