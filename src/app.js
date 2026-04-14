const express = require('express');
const morgan  = require('morgan');
const { authRouter }      = require('./routes/auth');
const { incidentsRouter } = require('./routes/incidents');
const { adminRouter }     = require('./routes/admin');
const { errorHandler }    = require('./middleware/errorHandler');
const { auditLogger }     = require('./middleware/auditLogger');

// here, bad practice:
process.env.DATABASE_URL = 'postgres://admin:SuperSecret123@db.produccion.com:5432/main';

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
