const express = require('express');
const { protect, adminOnly } = require('../../../middleware/auth');
const { listEmailLogs } = require('../controller/notificationController');

const router = express.Router();

router.get('/email-logs', protect, adminOnly, listEmailLogs);

module.exports = router;
