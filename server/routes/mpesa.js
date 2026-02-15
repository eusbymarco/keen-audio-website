const express = require("express");
const twilio = require("twilio");
const router = express.Router();

router.post("/stkpush", async (req, res) => {
  const { name, phone, amount, date, time, service } = req.body;

  // Placeholder for STK Push (Safaricom Daraja) implementation

  // Send WhatsApp notification to admin using Twilio
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM; // e.g. 'whatsapp:+1415xxxxxxx'
    const adminWhatsAppTo = process.env.ADMIN_WHATSAPP_TO; // e.g. 'whatsapp:+2547xxxxxxx'

    if (accountSid && authToken && whatsappFrom && adminWhatsAppTo) {
      const client = twilio(accountSid, authToken);
      const messageBody = `New booking:\nName: ${name || "(no name)"}\nPhone: ${phone}\nService: ${service || "(none)"}\nDate: ${date || "(none)"} ${time || ""}\nAmount: ${amount}`;

      await client.messages.create({
        from: whatsappFrom,
        to: adminWhatsAppTo,
        body: messageBody,
      });
    } else {
      console.warn("Twilio env vars not set - skipping WhatsApp notification");
    }
  } catch (err) {
    console.error("Failed to send WhatsApp message:", err.message || err);
  }

  res.json({ message: "STK push initiated and notification attempted" });
});

module.exports = router;
