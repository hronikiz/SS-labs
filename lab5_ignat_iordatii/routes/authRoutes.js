const express = require('express');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/auth');
const { registerRules, loginRules, checkRegister, checkLogin } = require('../middleware/validation');

const router = express.Router();

router.get('/register', authController.showRegister);
router.post('/register', registerRules, checkRegister, authController.register);

router.get('/login', authController.showLogin);
router.post('/login', loginRules, checkLogin, authController.login);

router.post('/logout', authController.logout);

router.get('/profile', isAuthenticated, authController.profile);

module.exports = router;
