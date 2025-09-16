const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/authController');

// Rutas públicas
router.post('/register', validateUserRegistration, register);
router.post('/login', validateLogin, login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/change-password', auth, changePassword);

module.exports = router;