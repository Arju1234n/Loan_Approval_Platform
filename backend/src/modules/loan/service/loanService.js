const axios = require('axios');
const {
  createApplication,
  createPredictionResult,
  findApplicationsByUser,
  findApplicationById,
} = require('../repository/loanRepository');
const { sendLoanEmail } = require('../../../utils/email');

/**
 * Submit a new loan application, call ML engine, store result, send email.
 */
const submitApplication = async (userId, userEmail, userName, body) => {
  const {
    income, coApplicantIncome = 0, employmentStatus, age, maritalStatus,
    dependents = 0, gender, educationLevel, employerCategory,
    creditScore, existingLoans = 0, dtiRatio, savings = 0, collateralValue = 0,
    loanAmount, loanTerm, loanPurpose, propertyArea,
  } = body;

  // ── 1. Call ML Engine ──────────────────────────────────────────────────────
  let prediction = null, confidence = null, reasons = [], riskFactors = [], mlResponse = null;

  try {
    const mlPayload = {
      applicant_income:   income,
      coapplicant_income: coApplicantIncome,
      employment_status:  employmentStatus,
      age,
      marital_status:     maritalStatus,
      dependents,
      credit_score:       creditScore,
      existing_loans:     existingLoans,
      dti_ratio:          dtiRatio,
      savings,
      collateral_value:   collateralValue,
      loan_amount:        loanAmount,
      loan_term:          loanTerm,
      loan_purpose:       loanPurpose,
      property_area:      propertyArea,
      education_level:    educationLevel,
      gender,
      employer_category:  employerCategory,
    };

    const { data } = await axios.post(`${process.env.ML_ENGINE_URL}/predict`, mlPayload, {
      timeout: 10000,
    });

    prediction  = data.prediction;
    confidence  = data.confidence;
    reasons     = data.reasons || [];
    riskFactors = data.risk_factors || [];
    mlResponse = data;
  } catch (err) {
    console.error('[ML] Prediction failed, saving without ML result:', err.message);
  }

  // ── 2. Persist to DB ───────────────────────────────────────────────────────
  const status = prediction === 'Approved' ? 'approved'
               : prediction === 'Rejected' ? 'rejected'
               : 'pending';

  const application = await createApplication({
    userId, income, coApplicantIncome, employmentStatus, age, maritalStatus,
    dependents, gender, educationLevel, employerCategory,
    creditScore, existingLoans, dtiRatio, savings, collateralValue,
    loanAmount, loanTerm, loanPurpose, propertyArea,
    prediction, confidence, reasons, riskFactors,
    status,
  });

  if (prediction && confidence !== null) {
    await createPredictionResult({
      applicationId: application._id,
      userId,
      prediction,
      confidence,
      reasons,
      riskFactors,
      modelUsed: mlResponse?.model_used,
      rawResponse: mlResponse,
    });
  }

  // ── 3. Send Email (non-blocking) ───────────────────────────────────────────
  const emailType = status === 'approved' ? 'approved'
                  : status === 'rejected' ? 'rejected'
                  : 'submission';

  sendLoanEmail({
    to: userEmail,
    type: emailType,
    name: userName,
    appId: application._id.toString().slice(-8).toUpperCase(),
    amount: loanAmount,
    status,
    confidence,
    reasons,
    userId,
    applicationId: application._id,
  }).catch(() => {});

  return application;
};

/**
 * Get all applications for a specific user.
 */
const getUserApplications = async (userId) => {
  return findApplicationsByUser(userId);
};

/**
 * Get a single application by ID, ensuring ownership.
 */
const getApplicationById = async (appId, userId, isAdmin = false) => {
  return findApplicationById(appId, userId, isAdmin);
};

module.exports = { submitApplication, getUserApplications, getApplicationById };
