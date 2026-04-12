const store = require('../models/store');

function auditLogger(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const entry = {
      timestamp:  new Date().toISOString(),
      method:     req.method,
      path:       req.path,
      status:     res.statusCode,
      userId:     req.user?.id || null,
      username:   req.user?.username || 'anonymous',
      ip:         req.ip,
      durationMs: Date.now() - start,
    };
    store.auditLog.push(entry);
    // Keep last 200 entries in memory
    if (store.auditLog.length > 200) store.auditLog.shift();
  });
  next();
}

module.exports = { auditLogger };
