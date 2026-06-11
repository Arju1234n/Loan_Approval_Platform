const mongoose = require('mongoose');

const predictionResultSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  prediction: { type: String, enum: ['Approved', 'Rejected'], required: true },
  confidence: { type: Number, required: true },
  reasons: [{ type: String }],
  riskFactors: [{ type: String }],
  modelUsed: { type: String },
  rawResponse: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

module.exports = mongoose.model('PredictionResult', predictionResultSchema);
