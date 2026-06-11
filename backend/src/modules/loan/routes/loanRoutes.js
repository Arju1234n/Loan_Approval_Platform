const express = require('express');
const router = express.Router();
const { applyForLoan, getMyApplications, getApplication } = require('../controller/loanController');
const { protect } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { applyLoanValidation, applicationIdValidation } = require('../validation/loanValidation');

// All loan routes require authentication
router.use(protect);

router.post('/apply',            applyLoanValidation, validate, applyForLoan);
router.get('/my-applications',   getMyApplications);
router.get('/:id',               applicationIdValidation, validate, getApplication);

module.exports = router;
