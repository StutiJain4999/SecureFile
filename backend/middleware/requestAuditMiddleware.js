export const requestAuditMiddleware = (req, res, next) => {
  req.requestMeta = {
    ipAddress: req.ip,
    userAgent: req.get("user-agent") || "unknown"
  };
  next();
};
