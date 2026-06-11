const express = require('express');
const { body, param } = require('express-validator');
const { protect, adminOnly } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { dashboard, applications, users, override } = require('../controller/adminController');

const router = express.Router();

router.use(protect, adminOnly);

router.get('/dashboard', dashboard);
router.get('/applications', applications);
router.get('/users', users);
router.patch(
  '/applications/:id/override',
  [
    param('id').isMongoId().withMessage('Valid application id is required.'),
    body('status').isIn(['approved', 'rejected', 'under_review']).withMessage('Invalid status.'),
    body('adminNote').optional().trim().isLength({ max: 500 }).withMessage('Note is too long.'),
  ],
  validate,
  override,
);

module.exports = router;
