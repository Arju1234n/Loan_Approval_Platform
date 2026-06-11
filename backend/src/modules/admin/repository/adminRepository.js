const User            = require('../../auth/model/User');
const LoanApplication = require('../../loan/model/LoanApplication');
const AdminLog        = require('../../notification/model/AdminLog');

const listUsers = ({ search, limit = 100 } = {}) => {
  const query = search
    ? { $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
    : {};

  return User.find(query).select('-password').sort({ createdAt: -1 }).limit(Number(limit));
};

const countUsers = () => User.countDocuments();
const countApplications = (filter = {}) => LoanApplication.countDocuments(filter);
const recentUsers = () => User.find().select('-password').sort({ createdAt: -1 }).limit(8);
const recentApplications = () =>
  LoanApplication.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(8);
const createAdminLog = (payload) => AdminLog.create(payload);
const recentAdminLogs = () =>
  AdminLog.find().populate('adminId', 'name email').sort({ createdAt: -1 }).limit(20);

module.exports = {
  listUsers,
  countUsers,
  countApplications,
  recentUsers,
  recentApplications,
  createAdminLog,
  recentAdminLogs,
};
