const mongoose = require('mongoose');

/**
 * Tracks every email sent by the platform.
 * Linked to a user and optionally a loan application.
 */
const emailLogSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'LoanApplication' },
    type:          { type: String, enum: ['submission', 'approved', 'rejected', 'review'], required: true },
    to:            { type: String, required: true },
    subject:       { type: String },
    status:        { type: String, enum: ['sent', 'failed'], default: 'sent' },
    error:         { type: String },                 // populated only when status = 'failed'
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailLog', emailLogSchema);
