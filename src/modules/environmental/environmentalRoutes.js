const express = require('express');
const router = express.Router();
const environmentalController = require('./environmentalController');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth');
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

// Validación para datos de sensores IoT (ESP32)
const validateSensorData = [
  validateEnvironmentalData,
  handleValidationErrors
];

// ============ RUTAS PÚBLICAS (para dispositivos IoT) ============

/**
 * @route POST /api/environmental/sensor/data
 * @desc Endpoint público para que dispositivos IoT (ESP32) envíen datos de sensores
 * @access Public (sin autenticación)
 * @body {string} deviceId - ID único del dispositivo ESP32
 * @body {number} temperature - Temperatura del DHT22 en °C
 * @body {number} humidity - Humedad del DHT22 en %
 * @body {number} mq135_ppm - Lectura del sensor MQ-135 (CO2/calidad aire) en PPM
 * @body {number} mq135_voltage - Voltaje del MQ-135
 * @body {number} mq7_ppm - Lectura del sensor MQ-7 (CO) en PPM
 * @body {number} mq7_voltage - Voltaje del MQ-7
 * @body {number} mq4_ppm - Lectura del sensor MQ-4 (Metano) en PPM
 * @body {number} mq4_voltage - Voltaje del MQ-4
 * @body {number} [mq136_ppm] - Lectura del sensor MQ-136 (H2S) en PPM (opcional)
 * @body {number} [mq136_voltage] - Voltaje del MQ-136 (opcional)
 * @body {number} [latitude] - Latitud GPS (opcional)
 * @body {number} [longitude] - Longitud GPS (opcional)
 */
router.post('/sensor/data',
  environmentalController.registerSensorData
);

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
  authenticate,
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
  authenticate,
  validateDateRange,
  environmentalController.getEnvironmentalData
);

/**
 * @route GET /api/environmental/devices/:deviceId/latest
 * @desc Obtiene los últimos datos de un dispositivo específico
 * @access Private
 */
router.get('/devices/:deviceId/latest',
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
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
  authenticate,
  requireAdmin,
  validateStatsQuery,
  (req, res) => {
    // Reutilizar el controlador pero sin restricción de usuario
    req.query.userId = undefined;
    environmentalController.getEnvironmentalStats(req, res);
  }
);

module.exports = router;
