const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./modules/auth/routes/authRoutes');
const loanRoutes = require('./modules/loan/routes/loanRoutes');
const adminRoutes = require('./modules/admin/routes/adminRoutes');
const analyticsRoutes = require('./modules/analytics/routes/analyticsRoutes');
const notificationRoutes = require('./modules/notification/routes/notificationRoutes');

const isDev = process.env.NODE_ENV !== 'production';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    // Allow: no origin (curl / Postman), any localhost in dev, explicit CLIENT_URL in prod
    if (!origin) return cb(null, true);
    if (isDev && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return cb(null, true);
    if (origin === process.env.CLIENT_URL) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/', (req, res) => {
  res.json({
    service: 'CreditWise Loan Approval API',
    status: 'running',
    version: '1.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
});

module.exports = app;
