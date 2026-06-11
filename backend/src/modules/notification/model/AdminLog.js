const mongoose = require('mongoose');

/**
 * Immutable audit log for every admin action taken on the platform.
 */
const adminLogSchema = new mongoose.Schema(
  {
    adminId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action:   { type: String, required: true },          // e.g. 'OVERRIDE_DECISION'
    target:   { type: String },                          // e.g. 'LoanApplication'
    targetId: { type: mongoose.Schema.Types.ObjectId },  // the affected document's _id
    details:  { type: mongoose.Schema.Types.Mixed },     // freeform metadata
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminLog', adminLogSchema);
