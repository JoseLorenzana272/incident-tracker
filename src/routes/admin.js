const express = require('express');
const store   = require('../models/store');
const { authenticate, requireRole } = require('../middleware/auth');

const adminRouter = express.Router();
adminRouter.use(authenticate, requireRole('admin'));

// GET /admin/stats
adminRouter.get('/stats', (req, res) => {
  const incidents = store.incidents;

  const bySeverity = incidents.reduce((acc, i) => {
    acc[i.severity] = (acc[i.severity] || 0) + 1; return acc;
  }, {});

  const byStatus = incidents.reduce((acc, i) => {
    acc[i.status] = (acc[i.status] || 0) + 1; return acc;
  }, {});

  res.json({
    totalIncidents: incidents.length,
    totalUsers:     store.users.length,
    openIncidents:  incidents.filter(i => i.status === 'open').length,
    bySeverity,
    byStatus,
    recentAuditLog: store.auditLog.slice(-10),
  });
});

// GET /admin/users
adminRouter.get('/users', (req, res) => {
  res.json({
    count: store.users.length,
    users: store.users.map(u => ({
      id: u.id, username: u.username, email: u.email, role: u.role, createdAt: u.createdAt
    })),
  });
});

module.exports = { adminRouter };
