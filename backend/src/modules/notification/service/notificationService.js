const EmailLog = require('../model/EmailLog');

/**
 * Persist an email send attempt.
 * Called by the email utility after every send (success or failure).
 */
const createEmailLog = (payload) => EmailLog.create(payload);

/**
 * Retrieve email logs, optionally filtered by userId.
 */
const findEmailLogs = ({ userId, limit = 100 } = {}) => {
  const query = userId ? { userId } : {};
  return EmailLog.find(query)
    .populate('userId',        'name email')
    .populate('applicationId', 'status prediction confidence')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

module.exports = { createEmailLog, findEmailLogs };
