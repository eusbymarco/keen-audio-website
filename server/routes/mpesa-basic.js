const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/stkpush", async (req, res) => {
  const { phone, amount } = req.body;

  // STK Push logic goes here
  // (Safaricom Daraja API)

  res.json({ message: "STK push sent" });
});

module.exports = router;
