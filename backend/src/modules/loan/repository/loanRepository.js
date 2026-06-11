const LoanApplication = require('../model/LoanApplication');
const PredictionResult = require('../model/PredictionResult');

const createApplication = (payload) => LoanApplication.create(payload);

const createPredictionResult = (payload) => PredictionResult.create(payload);

const findApplicationsByUser = (userId) =>
  LoanApplication.find({ userId }).sort({ createdAt: -1 });

const findApplicationById = (appId, userId, isAdmin = false) => {
  const query = isAdmin ? { _id: appId } : { _id: appId, userId };
  return LoanApplication.findOne(query).populate('userId', 'name email');
};

const listApplications = ({ search, status, prediction, limit = 100 } = {}) => {
  const query = {};
  if (status) query.status = status;
  if (prediction) query.prediction = prediction;
  if (search) {
    query.$or = [
      { loanPurpose: new RegExp(search, 'i') },
      { propertyArea: new RegExp(search, 'i') },
      { employmentStatus: new RegExp(search, 'i') },
    ];
  }

  return LoanApplication.find(query)
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(Number(limit));
};

const updateApplication = (id, payload) =>
  LoanApplication.findByIdAndUpdate(id, payload, { new: true }).populate('userId', 'name email');

module.exports = {
  createApplication,
  createPredictionResult,
  findApplicationsByUser,
  findApplicationById,
  listApplications,
  updateApplication,
};
