const { getDashboard, getApplications, getUsers, overrideDecision } = require('../service/adminService');

const dashboard = async (req, res) => {
  try {
    res.json({ success: true, data: await getDashboard() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const applications = async (req, res) => {
  try {
    const data = await getApplications(req.query);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const users = async (req, res) => {
  try {
    const data = await getUsers(req.query);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const override = async (req, res) => {
  try {
    const data = await overrideDecision({
      admin: req.user,
      applicationId: req.params.id,
      status: req.body.status,
      adminNote: req.body.adminNote,
    });
    res.json({ success: true, data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ success: false, message: err.message });
  }
};

module.exports = { dashboard, applications, users, override };
