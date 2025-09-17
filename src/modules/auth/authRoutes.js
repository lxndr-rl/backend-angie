const express = require('express');
const authController = require('./authController');
const { authenticate } = require('../../shared/middleware/auth');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting específico para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos por ventana
  message: {
    success: false,
    error: 'Demasiados intentos de autenticación, intenta de nuevo en 15 minutos.'
  }
});

// Validaciones
const registerValidation = [
  body('username').isLength({ min: 3, max: 50 }).withMessage('Username debe tener entre 3 y 50 caracteres'),
  body('email').isEmail().withMessage('Email debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('firstName').isLength({ min: 2, max: 50 }).withMessage('Nombre debe tener entre 2 y 50 caracteres'),
  body('lastName').isLength({ min: 2, max: 50 }).withMessage('Apellido debe tener entre 2 y 50 caracteres')
];

const loginValidation = [
  body('username').notEmpty().withMessage('Username es requerido'),
  body('password').notEmpty().withMessage('Password es requerido')
];

// Rutas públicas
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh', authController.refreshToken);

// Rutas protegidas
router.post('/logout', authenticate, authController.logout);
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;