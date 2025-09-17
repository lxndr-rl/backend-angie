const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/authMiddleware');
const { validateUserRegistration, validateLogin } = require('../../../shared/middleware/validation');

// Rutas públicas
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateLogin, authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/change-password', auth, authController.changePassword);
router.get('/verify-token', auth, authController.verifyToken);

module.exports = router;