const crypto = require("crypto");

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;

function getAdminConfig() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET || "";

  return {
    email,
    passwordHash,
    sessionSecret,
    isConfigured: Boolean(email && passwordHash && sessionSecret.length >= 32),
  };
}

function verifyPassword(password, storedValue) {
  const [salt, expectedHash] = storedValue.split(":");
  if (!salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(actualHash, "hex");

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

module.exports = { SESSION_MAX_AGE_MS, getAdminConfig, verifyPassword };