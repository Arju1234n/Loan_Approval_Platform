const { findEmailLogs } = require('../service/notificationService');

/**
 * GET /api/notifications/email-logs
 * Admin only — list email send history.
 */
const listEmailLogs = async (req, res) => {
  try {
    const { userId, limit } = req.query;
    const data = await findEmailLogs({ userId, limit });
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { listEmailLogs };
