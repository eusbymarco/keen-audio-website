const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000;
const DEFAULT_ADMIN_EMAIL = "keennjames@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const ADMIN_STORE_PATH = path.join(__dirname, "..", "data", "admin.json");

let cachedAdminConfig = null;

function readAdminStore() {
  try {
    const contents = fs.readFileSync(ADMIN_STORE_PATH, "utf8");
    const parsed = JSON.parse(contents);
    if (parsed && typeof parsed === "object") return parsed;
  } catch (error) {
    return null;
  }
}

function writeAdminStore(store) {
  fs.mkdirSync(path.dirname(ADMIN_STORE_PATH), { recursive: true });
  fs.writeFileSync(ADMIN_STORE_PATH, JSON.stringify(store, null, 2), "utf8");
}

function ensureAdminAccount() {
  if (cachedAdminConfig) return cachedAdminConfig;

  const existingStore = readAdminStore();
  if (existingStore && existingStore.email && existingStore.passwordHash) {
    cachedAdminConfig = {
      email: String(existingStore.email).trim().toLowerCase(),
      passwordHash: existingStore.passwordHash,
      sessionSecret: existingStore.sessionSecret || process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(48).toString("hex"),
      isConfigured: true,
    };
    return cachedAdminConfig;
  }

  const newStore = {
    email: (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).trim().toLowerCase(),
    passwordHash: process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD, 12),
    sessionSecret: process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(48).toString("hex"),
    createdAt: new Date().toISOString(),
  };

  writeAdminStore(newStore);
  cachedAdminConfig = {
    email: newStore.email,
    passwordHash: newStore.passwordHash,
    sessionSecret: newStore.sessionSecret,
    isConfigured: true,
  };
  return cachedAdminConfig;
}

function getAdminConfig() {
  return ensureAdminAccount();
}

function verifyPassword(password, storedValue) {
  if (!storedValue) return false;
  if (storedValue.startsWith("$2")) return bcrypt.compareSync(password, storedValue);

  const [salt, expectedHash] = storedValue.split(":");
  if (!salt || !expectedHash) return false;

  const actualHash = crypto.scryptSync(password, salt, 64).toString("hex");
  const expectedBuffer = Buffer.from(expectedHash, "hex");
  const actualBuffer = Buffer.from(actualHash, "hex");

  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

module.exports = { SESSION_MAX_AGE_MS, getAdminConfig, verifyPassword, ensureAdminAccount };