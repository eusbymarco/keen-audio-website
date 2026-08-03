const express = require("express");
const { getOrder, listOrders } = require("../../orders/store");

const router = express.Router();

router.get("/api/orders", async (req, res, next) => {
  try {
    const orders = await listOrders();
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/api/orders/:id", async (req, res, next) => {
  try {
    const order = await getOrder(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ order });
  } catch (error) {
    next(error);
  }
});

module.exports = router;