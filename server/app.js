require('dotenv').config();
const express = require('express');
const cors = require('cors');

const leadsRouter = require('./routes/leads');
const notesRouter = require('./routes/notes');
const authRouter  = require('./routes/auth');

const app = express();

app.use(cors()); // Allow all for debugging

app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/leads', leadsRouter);
app.use('/notes', notesRouter);
app.use('/auth',  authRouter);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
