const express = require("express");
const path = require("path");
const { getAdminConfig, verifyPassword } = require("../config");
const { createSession, destroySession, ensureCsrfToken, validateCsrf } = require("../middleware/session");

const router = express.Router();
const attempts = new Map();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const viewsDir = path.join(__dirname, "..", "views");

function isRateLimited(ip) {
  const record = attempts.get(ip);
  if (!record || record.startedAt + WINDOW_MS < Date.now()) return false;
  return record.count >= MAX_ATTEMPTS;
}

function recordFailure(ip) {
  const record = attempts.get(ip);
  if (!record || record.startedAt + WINDOW_MS < Date.now()) attempts.set(ip, { count: 1, startedAt: Date.now() });
  else record.count += 1;
}

router.get("/login", ensureCsrfToken, (req, res) => {
  if (req.adminSession) return res.redirect("/admin");
  res.sendFile(path.join(viewsDir, "login.html"));
});

router.post("/login", validateCsrf, (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) return res.status(429).json({ message: "Too many attempts. Please try again later." });

  const { email = "", password = "" } = req.body || {};
  const config = getAdminConfig();
  const valid = config.isConfigured && email.trim().toLowerCase() === config.email && verifyPassword(password, config.passwordHash);

  if (!valid) {
    recordFailure(ip);
    return res.status(config.isConfigured ? 401 : 503).json({ message: config.isConfigured ? "Invalid email or password." : "Admin access has not been configured." });
  }

  attempts.delete(ip);
  createSession(res, config.email);
  res.status(200).json({ redirect: "/admin" });
});

router.post("/logout", validateCsrf, (req, res) => {
  destroySession(req, res);
  res.json({ redirect: "/admin/login" });
});

module.exports = router;