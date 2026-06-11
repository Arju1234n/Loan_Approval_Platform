const { body, param } = require('express-validator');

const numberField = (name, min = 0) =>
  body(name).isFloat({ min }).withMessage(`${name} must be a number >= ${min}.`).toFloat();

const integerField = (name, min = 0) =>
  body(name).isInt({ min }).withMessage(`${name} must be an integer >= ${min}.`).toInt();

const applyLoanValidation = [
  numberField('income', 1),
  numberField('coApplicantIncome', 0).optional(),
  body('employmentStatus').notEmpty().withMessage('Employment status is required.'),
  integerField('age', 19),
  body('maritalStatus').notEmpty().withMessage('Marital status is required.'),
  integerField('dependents', 0).optional(),
  body('gender').notEmpty().withMessage('Gender is required.'),
  body('educationLevel').notEmpty().withMessage('Education level is required.'),
  body('employerCategory').notEmpty().withMessage('Employer category is required.'),
  integerField('creditScore', 300),
  integerField('existingLoans', 0).optional(),
  body('dtiRatio').isFloat({ min: 0, max: 1 }).withMessage('DTI ratio must be between 0 and 1.').toFloat(),
  numberField('savings', 0).optional(),
  numberField('collateralValue', 0).optional(),
  numberField('loanAmount', 1),
  integerField('loanTerm', 1),
  body('loanPurpose').notEmpty().withMessage('Loan purpose is required.'),
  body('propertyArea').notEmpty().withMessage('Property area is required.'),
];

const applicationIdValidation = [
  param('id').isMongoId().withMessage('Valid application id is required.'),
];

module.exports = { applyLoanValidation, applicationIdValidation };
