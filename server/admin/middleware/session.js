const crypto = require("crypto");
const { SESSION_MAX_AGE_MS, getAdminConfig } = require("../config");

const sessions = new Map();
const SESSION_COOKIE = "keen_admin_session";
const CSRF_COOKIE = "keen_admin_csrf";

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((item) => item.trim().split(/=(.*)/s, 2)).filter(([key]) => key));
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function secureCookie() {
  return process.env.NODE_ENV === "production" || process.env.ADMIN_COOKIE_SECURE === "true";
}

function cookieOptions({ httpOnly = true, maxAge = SESSION_MAX_AGE_MS } = {}) {
  return [`Path=/admin`, `Max-Age=${Math.floor(maxAge / 1000)}`, "SameSite=Strict", httpOnly && "HttpOnly", secureCookie() && "Secure"].filter(Boolean).join("; ");
}

function setCookie(res, name, value, options) {
  res.append("Set-Cookie", `${name}=${encodeURIComponent(value)}; ${cookieOptions(options)}`);
}

function clearCookie(res, name, httpOnly = true) {
  res.append("Set-Cookie", `${name}=; Path=/admin; Max-Age=0; SameSite=Strict${httpOnly ? "; HttpOnly" : ""}${secureCookie() ? "; Secure" : ""}`);
}

function ensureCsrfToken(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  if (!cookies[CSRF_COOKIE]) setCookie(res, CSRF_COOKIE, crypto.randomBytes(32).toString("base64url"), { httpOnly: false });
  next();
}

function validateCsrf(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  const token = req.get("x-csrf-token");
  const tokenBuffer = Buffer.from(token || "");
  const cookieBuffer = Buffer.from(cookies[CSRF_COOKIE] || "");
  if (!token || !cookies[CSRF_COOKIE] || tokenBuffer.length !== cookieBuffer.length || !crypto.timingSafeEqual(tokenBuffer, cookieBuffer)) {
    return res.status(403).json({ message: "Invalid request token." });
  }
  next();
}

function sessionMiddleware(req, res, next) {
  const { sessionSecret } = getAdminConfig();
  const signedCookie = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  if (!sessionSecret || !signedCookie) return next();

  const [id, signature] = signedCookie.split(".");
  if (!id || !signature || signature !== sign(id, sessionSecret)) return next();

  const session = sessions.get(id);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return next();
  }

  session.expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  req.adminSession = session;
  next();
}

function createSession(res, adminEmail) {
  const { sessionSecret } = getAdminConfig();
  const id = crypto.randomBytes(32).toString("base64url");
  sessions.set(id, { adminEmail, expiresAt: Date.now() + SESSION_MAX_AGE_MS });
  setCookie(res, SESSION_COOKIE, `${id}.${sign(id, sessionSecret)}`);
}

function destroySession(req, res) {
  const signedCookie = parseCookies(req.headers.cookie)[SESSION_COOKIE];
  const id = signedCookie && signedCookie.split(".")[0];
  if (id) sessions.delete(id);
  clearCookie(res, SESSION_COOKIE);
}

module.exports = { createSession, destroySession, ensureCsrfToken, sessionMiddleware, validateCsrf };