const { listApplications, updateApplication } = require('../../loan/repository/loanRepository');
const {
  listUsers,
  countUsers,
  countApplications,
  recentUsers,
  recentApplications,
  createAdminLog,
  recentAdminLogs,
} = require('../repository/adminRepository');
const { sendLoanEmail } = require('../../../utils/email');

const getDashboard = async () => {
  const [totalUsers, totalApplications, approved, rejected, applications, users, decisions] =
    await Promise.all([
      countUsers(),
      countApplications(),
      countApplications({ status: 'approved' }),
      countApplications({ status: 'rejected' }),
      recentApplications(),
      recentUsers(),
      recentAdminLogs(),
    ]);

  const approvalRate = totalApplications ? Math.round((approved / totalApplications) * 100) : 0;

  return {
    cards: { totalUsers, totalApplications, approved, rejected, approvalRate },
    recentApplications: applications,
    recentUsers: users,
    recentDecisions: decisions,
  };
};

const getApplications = (query) => listApplications(query);
const getUsers = (query) => listUsers(query);

const overrideDecision = async ({ admin, applicationId, status, adminNote }) => {
  const application = await updateApplication(applicationId, {
    status,
    adminOverride: true,
    adminNote,
  });

  if (!application) {
    const error = new Error('Application not found.');
    error.statusCode = 404;
    throw error;
  }

  await createAdminLog({
    adminId: admin._id,
    action: 'OVERRIDE_DECISION',
    target: 'LoanApplication',
    targetId: application._id,
    details: { status, adminNote },
  });

  if (application.userId?.email) {
    await sendLoanEmail({
      to: application.userId.email,
      type: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'review',
      name: application.userId.name,
      appId: application._id.toString().slice(-8).toUpperCase(),
      amount: application.loanAmount,
      status,
      confidence: application.confidence,
      reasons: application.reasons,
      userId: application.userId._id,
      applicationId: application._id,
    });
  }

  return application;
};

module.exports = { getDashboard, getApplications, getUsers, overrideDecision };
