const nodemailer          = require('nodemailer');
const { createEmailLog }  = require('../modules/notification/service/notificationService');

const createTransporter = () => {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const templates = {
  submission: (name, appId, amount, meta = {}) => ({
    subject: 'Loan Application Received - CreditWise',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#6366f1">CreditWise</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your loan application <strong>#${appId}</strong> has been successfully submitted and is now under review.</p>
        ${meta.confidence ? `<p>AI confidence: <strong>${Math.round(meta.confidence * 100)}%</strong></p>` : ''}
        ${meta.reasons?.length ? `<p>Reasons: ${meta.reasons.join(', ')}</p>` : ''}
        <p>We'll notify you once a decision has been made. Typical review time is <strong>1-3 business days</strong>.</p>
        <hr/>
        <p style="color:#888;font-size:12px">CreditWise - AI-Powered Loan Decisions</p>
      </div>`,
  }),
  approved: (name, appId, amount, meta = {}) => ({
    subject: 'Congratulations! Your Loan is Approved - CreditWise',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#10b981">CreditWise</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Great news! Your loan application <strong>#${appId}</strong> for <strong>$${Number(amount).toLocaleString()}</strong> has been <span style="color:#10b981;font-weight:bold">APPROVED</span>.</p>
        ${meta.confidence ? `<p>Confidence score: <strong>${Math.round(meta.confidence * 100)}%</strong></p>` : ''}
        ${meta.reasons?.length ? `<p>Reasons: ${meta.reasons.join(', ')}</p>` : ''}
        <p>Our team will be in touch shortly to finalize the disbursement details.</p>
        <hr/>
        <p style="color:#888;font-size:12px">CreditWise - AI-Powered Loan Decisions</p>
      </div>`,
  }),
  rejected: (name, appId, amount, meta = {}) => ({
    subject: 'Loan Application Status Update - CreditWise',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#ef4444">CreditWise</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>We regret to inform you that your loan application <strong>#${appId}</strong> has been <span style="color:#ef4444;font-weight:bold">DECLINED</span> at this time.</p>
        ${meta.confidence ? `<p>Confidence score: <strong>${Math.round(meta.confidence * 100)}%</strong></p>` : ''}
        ${meta.reasons?.length ? `<p>Decision factors: ${meta.reasons.join(', ')}</p>` : ''}
        <p>You may reapply after strengthening your credit, debt-to-income ratio, or savings profile.</p>
        <hr/>
        <p style="color:#888;font-size:12px">CreditWise - AI-Powered Loan Decisions</p>
      </div>`,
  }),
  review: (name, appId) => ({
    subject: 'Application Under Review - CreditWise',
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:auto">
        <h2 style="color:#f59e0b">CreditWise</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Your loan application <strong>#${appId}</strong> has been flagged for <strong>manual review</strong> by our team.</p>
        <p>We'll update you within 2-5 business days.</p>
        <hr/>
        <p style="color:#888;font-size:12px">CreditWise - AI-Powered Loan Decisions</p>
      </div>`,
  }),
};

/**
 * Send an email notification and log it to the DB.
 * @param {Object} opts
 * @param {string} opts.to - Recipient email
 * @param {string} opts.type - 'submission' | 'approved' | 'rejected' | 'review'
 * @param {string} opts.name - Applicant name
 * @param {string} opts.appId - Application ID
 * @param {number} [opts.amount] - Loan amount (for approved email)
 * @param {string} opts.userId
 * @param {string} opts.applicationId
 */
const sendLoanEmail = async ({ to, type, name, appId, amount, status: applicationStatus, confidence, reasons = [], userId, applicationId }) => {
  const tpl = templates[type]?.(name, appId, amount, { status: applicationStatus, confidence, reasons });
  if (!tpl) return;

  let deliveryStatus = 'sent';
  let errMsg = null;

  try {
    const transporter = createTransporter();
    if (!transporter) throw new Error('Email transport is not configured.');

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject: tpl.subject,
      html: tpl.html,
    });
  } catch (e) {
    deliveryStatus = 'failed';
    errMsg = e.message;
    console.error(`[Email] Failed to send "${type}" to ${to}:`, e.message);
  }

  // Log regardless of success/failure
  await createEmailLog({
    userId,
    applicationId,
    type,
    to,
    subject: tpl.subject,
    status: deliveryStatus,
    error: errMsg,
  }).catch(() => {});

  return deliveryStatus === 'sent';
};

module.exports = { sendLoanEmail };
