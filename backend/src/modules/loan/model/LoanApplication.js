const mongoose = require('mongoose');

const loanApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // Applicant Details
  income:             { type: Number, required: true },
  coApplicantIncome:  { type: Number, default: 0 },
  employmentStatus:   { type: String, required: true },
  age:                { type: Number, required: true },
  maritalStatus:      { type: String, required: true },
  dependents:         { type: Number, default: 0 },
  gender:             { type: String },
  educationLevel:     { type: String },
  employerCategory:   { type: String },

  // Financial Details
  creditScore:        { type: Number, required: true },
  existingLoans:      { type: Number, default: 0 },
  dtiRatio:           { type: Number, required: true },
  savings:            { type: Number, default: 0 },
  collateralValue:    { type: Number, default: 0 },

  // Loan Details
  loanAmount:         { type: Number, required: true },
  loanTerm:           { type: Number, required: true },
  loanPurpose:        { type: String, required: true },
  propertyArea:       { type: String },

  // ML Prediction
  prediction:         { type: String, enum: ['Approved', 'Rejected'] },
  confidence:         { type: Number },
  reasons:            [{ type: String }],
  riskFactors:        [{ type: String }],

  // Status (can be overridden by admin)
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'under_review'],
    default: 'pending'
  },
  adminOverride:      { type: Boolean, default: false },
  adminNote:          { type: String },
  emailSent:          { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('LoanApplication', loanApplicationSchema);
