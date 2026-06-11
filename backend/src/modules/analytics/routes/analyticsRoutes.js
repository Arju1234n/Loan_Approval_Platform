const express = require('express');
const { protect, adminOnly } = require('../../../middleware/auth');
const { analytics } = require('../controller/analyticsController');

const router = express.Router();

router.get('/', protect, adminOnly, analytics);

module.exports = router;
