const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../auth/authMiddleware');
const { 
  validateUserRegistration, 
  validateDeviceId,
  handleValidationErrors 
} = require('../../shared/middleware/validation');
const { body } = require('express-validator');

// Validaciones específicas para usuarios
const validateUserUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('El apellido debe tener entre 1 y 50 caracteres'),
    
  body('address')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('La dirección debe tener entre 5 y 200 caracteres'),
    
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres')
    .matches(/^[+0-9\s-()]+$/)
    .withMessage('Formato de teléfono inválido'),
    
  handleValidationErrors
];

const validateStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Estado inválido. Debe ser: active, inactive, suspended'),
    
  handleValidationErrors
];

const validateRoleUpdate = [
  body('role')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isIn(['admin', 'user'])
    .withMessage('Rol inválido. Debe ser: admin, user'),
    
  handleValidationErrors
];

// ============ RUTAS PÚBLICAS ============
// (Ninguna ruta pública para users)

// ============ RUTAS PROTEGIDAS (requieren autenticación) ============

/**
 * @route GET /api/users/profile
 * @desc Obtiene el perfil del usuario actual
 * @access Private
 */
router.get('/profile', authenticateToken, userController.getCurrentUserProfile);

/**
 * @route PUT /api/users/profile
 * @desc Actualiza el perfil del usuario actual
 * @access Private
 */
router.put('/profile', 
  authenticateToken, 
  validateUserUpdate, 
  userController.updateCurrentUserProfile
);

// ============ RUTAS ADMIN (requieren rol de administrador) ============

/**
 * @route GET /api/users
 * @desc Obtiene todos los usuarios con paginación y filtros
 * @access Admin
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 20, max: 100)
 * @query {string} search - Búsqueda por nombre, apellido, username o cédula
 * @query {string} role - Filtrar por rol (admin, user)
 * @query {string} status - Filtrar por estado (active, inactive, suspended)
 * @query {string} sortBy - Campo para ordenar (default: createdAt)
 * @query {string} sortOrder - Orden ASC o DESC (default: DESC)
 */
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  userController.getAllUsers
);

/**
 * @route GET /api/users/stats
 * @desc Obtiene estadísticas de usuarios
 * @access Admin
 */
router.get('/stats', 
  authenticateToken, 
  requireAdmin, 
  userController.getUserStats
);

/**
 * @route GET /api/users/search/:username
 * @desc Busca un usuario por username
 * @access Admin
 */
router.get('/search/:username', 
  authenticateToken, 
  requireAdmin, 
  userController.searchUserByUsername
);

/**
 * @route GET /api/users/:id
 * @desc Obtiene un usuario específico por ID
 * @access Private (propio perfil) / Admin (cualquier usuario)
 */
router.get('/:id', 
  authenticateToken, 
  userController.getUserById
);

/**
 * @route PUT /api/users/:id
 * @desc Actualiza el perfil de un usuario específico
 * @access Admin
 */
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  validateUserUpdate, 
  userController.updateUserProfile
);

/**
 * @route PATCH /api/users/:id/status
 * @desc Actualiza el estado de un usuario
 * @access Admin
 */
router.patch('/:id/status', 
  authenticateToken, 
  requireAdmin, 
  validateStatusUpdate, 
  userController.updateUserStatus
);

/**
 * @route PATCH /api/users/:id/role
 * @desc Actualiza el rol de un usuario
 * @access Admin
 */
router.patch('/:id/role', 
  authenticateToken, 
  requireAdmin, 
  validateRoleUpdate, 
  userController.updateUserRole
);

/**
 * @route DELETE /api/users/:id
 * @desc Elimina (desactiva) un usuario
 * @access Admin
 */
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  userController.deleteUser
);

// ============ MANEJO DE ERRORES ============

// Middleware para manejar rutas no encontradas en este módulo
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta de usuarios no encontrada'
  });
});

module.exports = router;