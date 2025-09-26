const { body, validationResult, param, query } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Validaciones para registro de usuario
const validateUserRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('El nombre es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El nombre debe tener entre 1 y 50 caracteres'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('El apellido es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El apellido debe tener entre 1 y 50 caracteres'),
    
  body('email')
    .trim()
    .notEmpty()
    .withMessage('El email es requerido')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .normalizeEmail(),
    
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isLength({ min: 7, max: 15 })
    .withMessage('El teléfono debe tener entre 7 y 15 caracteres')
    .matches(/^[+0-9\s-()]+$/)
    .withMessage('Formato de teléfono inválido'),
    
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3, max: 30 })
    .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos'),
    
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage('La contraseña debe contener al menos una letra y un número'),
    
  handleValidationErrors
];

// Validaciones para login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El nombre de usuario es requerido'),
    
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
    
  handleValidationErrors
];

// Validaciones para datos ambientales
const validateEnvironmentalData = [
  body('temperature')
    .isFloat({ min: -10, max: 60 })
    .withMessage('La temperatura debe estar entre -10°C y 60°C'),
    
  body('humidity')
    .isFloat({ min: 0, max: 100 })
    .withMessage('La humedad debe estar entre 0% y 100%'),
    
  body('light')
    .isFloat({ min: 0 })
    .withMessage('El nivel de luz no puede ser negativo'),
    
  body('ph')
    .isFloat({ min: 0, max: 14 })
    .withMessage('El pH debe estar entre 0 y 14'),
    
  body('deviceId')
    .trim()
    .notEmpty()
    .withMessage('El ID del dispositivo es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El ID del dispositivo debe tener entre 1 y 50 caracteres'),
    
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90'),
    
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180'),
    
  handleValidationErrors
];

// Validaciones para configuración del sistema
const validateSystemConfig = [
  body('temperatureMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La temperatura mínima no puede ser negativa'),
    
  body('temperatureMax')
    .optional()
    .isFloat({ max: 60 })
    .withMessage('La temperatura máxima no puede exceder 60°C'),
    
  body('humidityMin')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La humedad mínima debe estar entre 0% y 100%'),
    
  body('humidityMax')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('La humedad máxima debe estar entre 0% y 100%'),
    
  body('lightMin')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El nivel de luz mínimo no puede ser negativo'),
    
  body('lightMax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('El nivel de luz máximo no puede ser negativo'),
    
  body('phMin')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('El pH mínimo debe estar entre 0 y 14'),
    
  body('phMax')
    .optional()
    .isFloat({ min: 0, max: 14 })
    .withMessage('El pH máximo debe estar entre 0 y 14'),
    
  body('dataCollectionInterval')
    .optional()
    .isInt({ min: 60 })
    .withMessage('El intervalo de recolección mínimo es de 60 segundos'),
    
  body('dataCollectionEnabled')
    .optional()
    .isBoolean()
    .withMessage('dataCollectionEnabled debe ser true o false'),
    
  body('alertsEnabled')
    .optional()
    .isBoolean()
    .withMessage('alertsEnabled debe ser true o false'),
    
  handleValidationErrors
];

// Validaciones para parámetros de ruta
const validateDeviceId = [
  param('deviceId')
    .trim()
    .notEmpty()
    .withMessage('El ID del dispositivo es requerido')
    .isLength({ min: 1, max: 50 })
    .withMessage('El ID del dispositivo debe tener entre 1 y 50 caracteres'),
    
  handleValidationErrors
];

// Validaciones para queries de fechas
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de inicio inválido (usar ISO 8601)'),
    
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Formato de fecha de fin inválido (usar ISO 8601)'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('El límite debe estar entre 1 y 1000'),
    
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateLogin,
  validateEnvironmentalData,
  validateSystemConfig,
  validateDeviceId,
  validateDateRange
};