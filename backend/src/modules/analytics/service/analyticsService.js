const LoanApplication = require('../../loan/model/LoanApplication');

const getAnalytics = async () => {
  const [
    totalApplications,
    approvedApplications,
    rejectedApplications,
    averages,
    monthlyTrends,
    approvalTrends,
    loanAmountDistribution,
    creditScoreDistribution,
  ] = await Promise.all([
    LoanApplication.countDocuments(),
    LoanApplication.countDocuments({ status: 'approved' }),
    LoanApplication.countDocuments({ status: 'rejected' }),
    LoanApplication.aggregate([
      {
        $group: {
          _id: null,
          averageLoanAmount: { $avg: '$loanAmount' },
          averageCreditScore: { $avg: '$creditScore' },
        },
      },
    ]),
    LoanApplication.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    LoanApplication.aggregate([
      {
        $group: {
          _id: { month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, status: '$status' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]),
    LoanApplication.aggregate([
      { $bucket: { groupBy: '$loanAmount', boundaries: [0, 5000, 10000, 25000, 50000, 100000, 1000000], default: '100000+', output: { count: { $sum: 1 } } } },
    ]),
    LoanApplication.aggregate([
      { $bucket: { groupBy: '$creditScore', boundaries: [300, 500, 600, 700, 800, 901], default: 'unknown', output: { count: { $sum: 1 } } } },
    ]),
  ]);

  const approvalRate = totalApplications
    ? Number(((approvedApplications / totalApplications) * 100).toFixed(2))
    : 0;

  return {
    totalApplications,
    approvedApplications,
    rejectedApplications,
    approvalRate,
    averageLoanAmount: Math.round(averages[0]?.averageLoanAmount || 0),
    averageCreditScore: Math.round(averages[0]?.averageCreditScore || 0),
    monthlyTrends: monthlyTrends.map((item) => ({ month: item._id, applications: item.count })),
    approvalTrends: approvalTrends.map((item) => ({
      month: item._id.month,
      status: item._id.status,
      count: item.count,
    })),
    loanAmountDistribution: loanAmountDistribution.map((item) => ({ bucket: String(item._id), count: item.count })),
    creditScoreDistribution: creditScoreDistribution.map((item) => ({ bucket: String(item._id), count: item.count })),
  };
};

module.exports = { getAnalytics };
