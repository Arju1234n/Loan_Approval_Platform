const express = require('express');
const router = express.Router();
const { register, login, getMe, logout } = require('../controller/authController');
const { protect } = require('../../../middleware/auth');
const validate = require('../../../middleware/validate');
const { registerValidation, loginValidation } = require('../validation/authValidation');

router.post('/register', registerValidation, validate, register);
router.post('/login',    loginValidation, validate, login);
router.get('/me',        protect, getMe);
router.post('/logout',   protect, logout);

module.exports = router;
