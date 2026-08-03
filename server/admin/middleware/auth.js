function requireAdmin(req, res, next) {
  if (!req.adminSession) return res.redirect("/admin/login");
  next();
}

function adminSecurityHeaders(req, res, next) {
  res.set({
    "Cache-Control": "no-store, max-age=0",
    "Content-Security-Policy": "default-src 'self'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  next();
}

module.exports = { requireAdmin, adminSecurityHeaders };