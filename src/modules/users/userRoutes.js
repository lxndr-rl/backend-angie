const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth');
const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('=== VALIDATION ERRORS ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
    return res.status(400).json({
      success: false,
      error: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

// Validaciones
const validateUserCreate = [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('El nombre es requerido'),
  body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('El apellido es requerido'),
  body('phone').optional().trim().isLength({ min: 7, max: 15 }),
  body('role').optional().isIn(['admin', 'user']).withMessage('Rol inválido'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('username').optional({ checkFalsy: true }).trim().isLength({ min: 3, max: 50 }).withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  body('firstName').optional({ checkFalsy: false }).trim().isLength({ min: 1, max: 50 }).withMessage('El nombre debe tener entre 1 y 50 caracteres'),
  body('lastName').optional({ checkFalsy: false }).trim().isLength({ min: 1, max: 50 }).withMessage('El apellido debe tener entre 1 y 50 caracteres'),
  body('email').optional({ checkFalsy: false }).isEmail().withMessage('Email inválido'),
  body('address').optional({ checkFalsy: true }).trim(),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('role').optional({ checkFalsy: false }).isIn(['admin', 'user']).withMessage('Rol inválido'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  handleValidationErrors
];

const validateStatusUpdate = [
  body('isActive').notEmpty().isBoolean().withMessage('isActive debe ser un valor booleano'),
  handleValidationErrors
];

const validateRoleUpdate = [
  body('role').notEmpty().isIn(['admin', 'user']),
  handleValidationErrors
];

// ============ RUTAS ============

// Rutas específicas primero (antes de las rutas con parámetros)
router.get('/stats', authenticate, requireAdmin, userController.getUserStats);
router.get('/profile', authenticate, userController.getCurrentUserProfile);
router.put('/profile', authenticate, validateUserUpdate, userController.updateCurrentUserProfile);
router.get('/search/:username', authenticate, requireAdmin, userController.searchUserByUsername);

// Rutas generales
router.get('/', authenticate, requireAdmin, userController.getAllUsers);
router.post('/', authenticate, requireAdmin, validateUserCreate, userController.createUser);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, requireAdmin, validateUserUpdate, userController.updateUserProfile);
router.patch('/:id/status', authenticate, requireAdmin, validateStatusUpdate, userController.updateUserStatus);
router.patch('/:id/role', authenticate, requireAdmin, validateRoleUpdate, userController.updateUserRole);
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

module.exports = router;
