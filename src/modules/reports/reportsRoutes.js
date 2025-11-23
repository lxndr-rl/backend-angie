const express = require('express');
const router = express.Router();
const reportsController = require('./reportsController');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth');
const { 
  validateDateRange,
  handleValidationErrors 
} = require('../../shared/middleware/validation');
const { query, body } = require('express-validator');

// Validaciones específicas para reportes
const validateReportQuery = [
  query('period')
    .optional()
    .isIn(['hour', 'day', 'week', 'month', 'year'])
    .withMessage('Período inválido. Debe ser: hour, day, week, month, year'),
    
  query('interval')
    .optional()
    .isIn(['hour', 'day', 'week', 'month'])
    .withMessage('Intervalo inválido. Debe ser: hour, day, week, month'),
    
  query('metric')
    .optional()
    .isIn(['temperature', 'humidity', 'light', 'ph', 'all'])
    .withMessage('Métrica inválida. Debe ser: temperature, humidity, light, ph, all'),
    
  query('status')
    .optional()
    .isIn(['active', 'acknowledged', 'resolved'])
    .withMessage('Estado inválido. Debe ser: active, acknowledged, resolved'),
    
  query('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severidad inválida. Debe ser: low, medium, high, critical'),
    
  query('includeAlerts')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeAlerts debe ser true o false'),
    
  query('includeStats')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeStats debe ser true o false'),
    
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
    
  handleValidationErrors
];

const validateCustomReportBody = [
  body('includeEnvironmental')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeEnvironmental debe ser true o false'),
    
  body('includeAlerts')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeAlerts debe ser true o false'),
    
  body('includeEfficiency')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeEfficiency debe ser true o false'),
    
  body('includeTrends')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeTrends debe ser true o false'),
    
  body('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
    
  handleValidationErrors
];

// ============ RUTAS PROTEGIDAS (requieren autenticación) ============

/**
 * @route GET /api/reports/environmental
 * @desc Genera reporte de datos ambientales
 * @access Private
 * @query {string} deviceId - ID del dispositivo (opcional)
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} interval - Intervalo del reporte (hour, day, week, month)
 * @query {string} includeAlerts - Incluir alertas (true/false)
 * @query {string} includeStats - Incluir estadísticas (true/false)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/environmental',
  authenticate,
  validateDateRange,
  validateReportQuery,
  reportsController.generateEnvironmentalReport
);

/**
 * @route GET /api/reports/alerts
 * @desc Genera reporte de alertas
 * @access Private
 * @query {string} deviceId - ID del dispositivo (opcional)
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} status - Estado de alertas (active, acknowledged, resolved)
 * @query {string} severity - Severidad (low, medium, high, critical)
 * @query {string} type - Tipo de alerta
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/alerts',
  authenticate,
  validateDateRange,
  validateReportQuery,
  reportsController.generateAlertsReport
);

/**
 * @route GET /api/reports/efficiency
 * @desc Genera reporte de eficiencia de dispositivos
 * @access Private
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} period - Período del reporte (day, week, month)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/efficiency',
  authenticate,
  validateDateRange,
  validateReportQuery,
  reportsController.generateDeviceEfficiencyReport
);

/**
 * @route GET /api/reports/trends
 * @desc Genera reporte de tendencias
 * @access Private
 * @query {string} deviceId - ID del dispositivo (opcional)
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {string} metric - Métrica a analizar (temperature, humidity, light, ph, all)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/trends',
  authenticate,
  validateDateRange,
  validateReportQuery,
  reportsController.generateTrendsReport
);

/**
 * @route GET /api/reports/summary
 * @desc Obtiene resumen ejecutivo
 * @access Private
 * @query {string} period - Período del resumen (hour, day, week, month, year)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/summary',
  authenticate,
  validateReportQuery,
  reportsController.getExecutiveSummary
);

/**
 * @route POST /api/reports/custom
 * @desc Genera reporte personalizado combinando múltiples tipos
 * @access Private
 * @body {string} deviceId - ID del dispositivo (opcional)
 * @body {string} startDate - Fecha de inicio (ISO 8601)
 * @body {string} endDate - Fecha de fin (ISO 8601)
 * @body {string} includeEnvironmental - Incluir datos ambientales (true/false)
 * @body {string} includeAlerts - Incluir alertas (true/false)
 * @body {string} includeEfficiency - Incluir eficiencia (true/false)
 * @body {string} includeTrends - Incluir tendencias (true/false)
 * @body {number} userId - ID del usuario (solo admin)
 */
router.post('/custom',
  authenticate,
  validateCustomReportBody,
  reportsController.generateCustomReport
);

/**
 * @route GET /api/reports/download/:type
 * @desc Descarga reporte en formato CSV
 * @access Private
 * @param {string} type - Tipo de reporte (environmental, alerts)
 * @query {string} deviceId - ID del dispositivo (opcional)
 * @query {string} startDate - Fecha de inicio (ISO 8601)
 * @query {string} endDate - Fecha de fin (ISO 8601)
 * @query {number} userId - ID del usuario (solo admin)
 */
router.get('/download/:type',
  authenticate,
  validateDateRange,
  reportsController.downloadReportCSV
);

// ============ RUTAS ADMIN (requieren rol de administrador) ============

/**
 * @route GET /api/reports/admin/global-summary
 * @desc Obtiene resumen global de todos los usuarios
 * @access Admin
 * @query {string} period - Período del resumen
 */
router.get('/admin/global-summary',
  authenticate,
  requireAdmin,
  validateReportQuery,
  (req, res) => {
    // Reutilizar el controlador pero sin restricción de usuario
    req.query.userId = undefined;
    reportsController.getExecutiveSummary(req, res);
  }
);

/**
 * @route GET /api/reports/admin/all-devices-efficiency
 * @desc Obtiene reporte de eficiencia de todos los dispositivos
 * @access Admin
 */
router.get('/admin/all-devices-efficiency',
  authenticate,
  requireAdmin,
  validateDateRange,
  validateReportQuery,
  (req, res) => {
    // Reutilizar el controlador pero sin restricción de usuario
    req.query.userId = undefined;
    reportsController.generateDeviceEfficiencyReport(req, res);
  }
);

/**
 * @route GET /api/reports/admin/system-health
 * @desc Obtiene reporte completo de salud del sistema
 * @access Admin
 */
router.get('/admin/system-health',
  authenticate,
  requireAdmin,
  validateReportQuery,
  async (req, res) => {
    try {
      // Generar múltiples reportes para análisis completo del sistema
      const promises = [
        reportsController.getExecutiveSummary(
          { ...req, query: { ...req.query, userId: undefined } },
          { json: () => {} } // Mock response para obtener solo los datos
        ),
        reportsController.generateDeviceEfficiencyReport(
          { ...req, query: { ...req.query, userId: undefined } },
          { json: () => {} }
        ),
        reportsController.generateAlertsReport(
          { ...req, query: { ...req.query, userId: undefined } },
          { json: () => {} }
        )
      ];

      // Este endpoint necesitaría una implementación más compleja
      // Por ahora, delegar al resumen ejecutivo global
      req.query.userId = undefined;
      return reportsController.getExecutiveSummary(req, res);
    } catch (error) {
      console.error('Error en system-health endpoint:', error);
      return res.status(500).json({
        success: false,
        error: 'Error al generar reporte de salud del sistema'
      });
    }
  }
);

module.exports = router;
