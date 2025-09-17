const express = require('express');
const router = express.Router();
const environmentalController = require('./environmentalController');
const { authenticateToken, requireAdmin } = require('../auth/authMiddleware');
const { 
  validateEnvironmentalData, 
  validateDeviceId, 
  validateDateRange,
  handleValidationErrors 
} = require('../../shared/middleware/validation');
const { query } = require('express-validator');

// Validaciones específicas para datos ambientales
const validateStatsQuery = [
  query('period')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Período inválido. Debe ser: hour, day, week, month'),
    
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
    
  handleValidationErrors
];

const validateChartQuery = [
  query('deviceId')
    .notEmpty()
    .withMessage('El ID del dispositivo es requerido'),
    
  query('interval')
    .optional()
    .isIn(['hour', 'day', 'week'])
    .withMessage('Intervalo inválido. Debe ser: hour, day, week'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Límite debe estar entre 1 y 1000'),
    
  handleValidationErrors
];

// ============ RUTAS PROTEGIDAS (requieren autenticación) ============

/**
 * @route POST /api/environmental/data
 * @desc Registra nuevos datos ambientales
 * @access Private
 * @body {number} temperature - Temperatura en °C
 * @body {number} humidity - Humedad en %
 * @body {number} light - Nivel de luz en lux
 * @body {number} ph - Nivel de pH
 * @body {string} deviceId - ID del dispositivo sensor
 * @body {number} [latitude] - Latitud GPS (opcional)
 * @body {number} [longitude] - Longitud GPS (opcional)
 */
router.post('/data',
  authenticateToken,
  validateEnvironmentalData,
  environmentalController.registerData
);

/**
 * @route GET /api/environmental/data
 * @desc Obtiene datos ambientales con filtros y paginación
 * @access Private
 * @query {number} page - Número de página (default: 1)
 * @query {number} limit - Elementos por página (default: 50, max: 100)
 * @query {string} deviceId - Filtrar por ID de dispositivo
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} sortBy - Campo para ordenar (default: timestamp)
 * @query {string} sortOrder - Orden ASC o DESC (default: DESC)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/data',
  authenticateToken,
  validateDateRange,
  environmentalController.getEnvironmentalData
);

/**
 * @route GET /api/environmental/devices/:deviceId/latest
 * @desc Obtiene los últimos datos de un dispositivo específico
 * @access Private
 */
router.get('/devices/:deviceId/latest',
  authenticateToken,
  validateDeviceId,
  environmentalController.getLatestDataByDevice
);

/**
 * @route GET /api/environmental/stats
 * @desc Obtiene estadísticas de datos ambientales
 * @access Private
 * @query {string} deviceId - Filtrar por ID de dispositivo
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} period - Período de estadísticas (hour, day, week, month)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/stats',
  authenticateToken,
  validateDateRange,
  validateStatsQuery,
  environmentalController.getEnvironmentalStats
);

/**
 * @route GET /api/environmental/devices
 * @desc Obtiene lista de dispositivos con sus últimas lecturas
 * @access Private
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/devices',
  authenticateToken,
  environmentalController.getDevicesWithLatestData
);

/**
 * @route GET /api/environmental/charts
 * @desc Obtiene datos ambientales optimizados para gráficos
 * @access Private
 * @query {string} deviceId - ID del dispositivo (requerido)
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} interval - Intervalo de datos (hour, day, week)
 * @query {number} limit - Máximo número de puntos (default: 100, max: 1000)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/charts',
  authenticateToken,
  validateDateRange,
  validateChartQuery,
  environmentalController.getDataForCharts
);

/**
 * @route GET /api/environmental/sensors/status
 * @desc Obtiene resumen del estado actual de todos los sensores
 * @access Private
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/sensors/status',
  authenticateToken,
  environmentalController.getCurrentSensorStatus
);

// ============ RUTAS ADMIN (requieren rol de administrador) ============

/**
 * @route GET /api/environmental/admin/all-data
 * @desc Obtiene todos los datos ambientales de todos los usuarios
 * @access Admin
 * @query {number} page - Número de página
 * @query {number} limit - Elementos por página
 * @query {string} deviceId - Filtrar por dispositivo
 * @query {string} startDate - Fecha de inicio
 * @query {string} endDate - Fecha de fin
 */
router.get('/admin/all-data',
  authenticateToken,
  requireAdmin,
  validateDateRange,
  (req, res) => {
    // Reutilizar el controlador pero sin restricción de usuario
    req.query.userId = undefined; // Quitar filtro de usuario
    environmentalController.getEnvironmentalData(req, res);
  }
);

/**
 * @route GET /api/environmental/admin/global-stats
 * @desc Obtiene estadísticas globales de todos los dispositivos
 * @access Admin
 */
router.get('/admin/global-stats',
  authenticateToken,
  requireAdmin,
  validateStatsQuery,
  (req, res) => {
    // Reutilizar el controlador pero sin restricción de usuario
    req.query.userId = undefined;
    environmentalController.getEnvironmentalStats(req, res);
  }
);

// ============ MANEJO DE ERRORES ============

// Middleware para manejar rutas no encontradas en este módulo
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta de datos ambientales no encontrada'
  });
});

module.exports = router;