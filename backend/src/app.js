const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');
const morgan  = require('morgan');

const authRoutes         = require('./modules/auth/routes/authRoutes');
const loanRoutes         = require('./modules/loan/routes/loanRoutes');
const adminRoutes        = require('./modules/admin/routes/adminRoutes');
const analyticsRoutes    = require('./modules/analytics/routes/analyticsRoutes');
const notificationRoutes = require('./modules/notification/routes/notificationRoutes');

// ---------------------------------------------------------------------------
// CORS — allow any Vercel / Render / localhost origin robustly.
// Uses simple string methods instead of RegExp.test() to avoid undefined crashes.
// ---------------------------------------------------------------------------
function isOriginAllowed(origin) {
  if (!origin) return true; // curl, Postman, server-to-server — always allow

  // Exact match from env (optional)
  const clientUrl = process.env.CLIENT_URL;
  if (clientUrl && origin === clientUrl) return true;

  // Hostname-based checks (no regex, no .test())
  try {
    const { protocol, hostname } = new URL(origin);
    const isHttps   = protocol === 'https:';
    const isVercel  = isHttps && hostname.endsWith('.vercel.app');
    const isRender  = isHttps && hostname.endsWith('.onrender.com');
    const isLocal   = (protocol === 'http:' || protocol === 'https:') &&
                      (hostname === 'localhost' || hostname === '127.0.0.1');
    return isVercel || isRender || isLocal;
  } catch (_) {
    // Malformed origin — block it
    return false;
  }
}

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (isOriginAllowed(origin)) return cb(null, true);
    console.warn('[CORS] Blocked origin:', origin);
    cb(new Error('CORS: origin not allowed — ' + origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Health & root
// ---------------------------------------------------------------------------
app.get('/', (req, res) => {
  res.json({ service: 'CreditWise Loan Approval API', status: 'running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.use('/api/auth',          authRoutes);
app.use('/api/loans',         loanRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/analytics',     analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// ---------------------------------------------------------------------------
// 404 & error handler
// ---------------------------------------------------------------------------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

module.exports = app;
