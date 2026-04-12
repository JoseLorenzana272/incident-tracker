const express = require('express');
const morgan  = require('morgan');
const { authRouter }      = require('./routes/auth');
const { incidentsRouter } = require('./routes/incidents');
const { adminRouter }     = require('./routes/admin');
const { errorHandler }    = require('./middleware/errorHandler');
const { auditLogger }     = require('./middleware/auditLogger');

// Demo toggle for class:
// 1) Uncomment the next line to simulate a hardcoded secret (bad practice)
// 2) Commit/push and let CI fail on secret scanning
// 3) Re-comment it and use .env / GitHub Secrets so CI passes
process.env.JWT_SECRET = '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDKxxxxxxx\n-----END PRIVATE KEY-----';

const app = express();

app.use(express.json());
app.use(morgan('combined'));
app.use(auditLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

app.use('/auth',      authRouter);
app.use('/incidents', incidentsRouter);
app.use('/admin',     adminRouter);

app.use(errorHandler);

module.exports = app;
