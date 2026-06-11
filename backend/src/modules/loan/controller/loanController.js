const { submitApplication, getUserApplications, getApplicationById } = require('../service/loanService');

// POST /api/loans/apply
const applyForLoan = async (req, res) => {
  try {
    const application = await submitApplication(
      req.user._id,
      req.user.email,
      req.user.name,
      req.body,
    );
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/loans/my-applications
const getMyApplications = async (req, res) => {
  try {
    const applications = await getUserApplications(req.user._id);
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/loans/:id
const getApplication = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const application = await getApplicationById(req.params.id, req.user._id, isAdmin);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    res.json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { applyForLoan, getMyApplications, getApplication };
