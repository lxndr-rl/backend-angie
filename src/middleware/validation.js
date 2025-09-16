const { body, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Errores de validación',
            details: errors.array()
        });
    }
    next();
};

// Validaciones para registro de usuario
const validateUserRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('El apellido solo puede contener letras y espacios'),
    
    body('cedula')
        .trim()
        .isLength({ min: 6, max: 15 })
        .withMessage('La cédula debe tener entre 6 y 15 caracteres')
        .matches(/^[0-9\-]+$/)
        .withMessage('La cédula solo puede contener números y guiones'),
    
    body('address')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    
    body('phone')
        .trim()
        .matches(/^[\+]?[0-9\-\s\(\)]{7,15}$/)
        .withMessage('Formato de teléfono inválido'),
    
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('El usuario debe tener entre 3 y 30 caracteres')
        .matches(/^[a-zA-Z0-9_\-]+$/)
        .withMessage('El usuario solo puede contener letras, números, guiones y guión bajo'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
    
    handleValidationErrors
];

// Validaciones para login
const validateLogin = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El usuario es requerido'),
    
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida'),
    
    handleValidationErrors
];

// Validaciones para datos ambientales
const validateEnvironmentalData = [
    body('temperature')
        .isNumeric()
        .withMessage('La temperatura debe ser un número')
        .isFloat({ min: -10, max: 60 })
        .withMessage('La temperatura debe estar entre -10°C y 60°C'),
    
    body('humidity')
        .isNumeric()
        .withMessage('La humedad debe ser un número')
        .isFloat({ min: 0, max: 100 })
        .withMessage('La humedad debe estar entre 0% y 100%'),
    
    body('light')
        .isNumeric()
        .withMessage('El nivel de luz debe ser un número')
        .isFloat({ min: 0 })
        .withMessage('El nivel de luz no puede ser negativo'),
    
    body('ph')
        .isNumeric()
        .withMessage('El pH debe ser un número')
        .isFloat({ min: 0, max: 14 })
        .withMessage('El pH debe estar entre 0 y 14'),
    
    body('deviceId')
        .trim()
        .notEmpty()
        .withMessage('El ID del dispositivo es requerido')
        .isLength({ min: 3, max: 50 })
        .withMessage('El ID del dispositivo debe tener entre 3 y 50 caracteres'),
    
    handleValidationErrors
];

// Validaciones para configuración del sistema
const validateSystemConfig = [
    body('thresholds.temperature.min')
        .optional()
        .isNumeric()
        .withMessage('La temperatura mínima debe ser un número'),
    
    body('thresholds.temperature.max')
        .optional()
        .isNumeric()
        .withMessage('La temperatura máxima debe ser un número'),
    
    body('thresholds.humidity.min')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La humedad mínima debe estar entre 0% y 100%'),
    
    body('thresholds.humidity.max')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('La humedad máxima debe estar entre 0% y 100%'),
    
    body('serverUrl')
        .optional()
        .isURL()
        .withMessage('La URL del servidor debe ser una URL válida'),
    
    body('dataCollection.interval')
        .optional()
        .isInt({ min: 60 })
        .withMessage('El intervalo de recolección debe ser al menos 60 segundos'),
    
    handleValidationErrors
];

module.exports = {
    validateUserRegistration,
    validateLogin,
    validateEnvironmentalData,
    validateSystemConfig,
    handleValidationErrors
};