const { getAnalytics } = require('../service/analyticsService');

const analytics = async (req, res) => {
  try {
    res.json({ success: true, data: await getAnalytics() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { analytics };
