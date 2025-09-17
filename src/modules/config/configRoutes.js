const express = require('express');
const router = express.Router();
const configController = require('./configController');
const { authenticateToken, requireAdmin } = require('../auth/authMiddleware');
const { 
  validateSystemConfig,
  handleValidationErrors 
} = require('../../shared/middleware/validation');
const { body, query } = require('express-validator');

// Validaciones específicas para configuración
const validateAlertsConfig = [
  body('alertsEnabled')
    .isBoolean()
    .withMessage('alertsEnabled debe ser true o false'),
    
  handleValidationErrors
];

const validateDataCollectionConfig = [
  body('dataCollectionEnabled')
    .optional()
    .isBoolean()
    .withMessage('dataCollectionEnabled debe ser true o false'),
    
  body('dataCollectionInterval')
    .optional()
    .isInt({ min: 60, max: 3600 })
    .withMessage('dataCollectionInterval debe estar entre 60 y 3600 segundos'),
    
  handleValidationErrors
];

const validateImportData = [
  body('configuration')
    .exists()
    .withMessage('Se requiere el objeto configuration')
    .isObject()
    .withMessage('configuration debe ser un objeto válido'),
    
  body('version')
    .optional()
    .isString()
    .withMessage('version debe ser una cadena de texto'),
    
  handleValidationErrors
];

// ============ RUTAS PROTEGIDAS (requieren autenticación) ============

/**
 * @route GET /api/config
 * @desc Obtiene la configuración actual del sistema
 * @access Private
 */
router.get('/',
  authenticateToken,
  configController.getSystemConfig
);

/**
 * @route GET /api/config/defaults
 * @desc Obtiene los valores por defecto del sistema
 * @access Private
 */
router.get('/defaults',
  authenticateToken,
  configController.getDefaultValues
);

/**
 * @route GET /api/config/optimal-cacao
 * @desc Obtiene configuración optimizada para cultivo de cacao
 * @access Private
 */
router.get('/optimal-cacao',
  authenticateToken,
  configController.getOptimalCacaoConfig
);

/**
 * @route GET /api/config/validate
 * @desc Valida la configuración actual
 * @access Private
 */
router.get('/validate',
  authenticateToken,
  configController.validateCurrentConfig
);

/**
 * @route GET /api/config/export
 * @desc Exporta la configuración actual en formato JSON
 * @access Private
 */
router.get('/export',
  authenticateToken,
  configController.exportConfig
);

// ============ RUTAS ADMIN (requieren rol de administrador) ============

/**
 * @route PUT /api/config
 * @desc Actualiza la configuración del sistema
 * @access Admin
 * @body {number} [temperatureMin] - Temperatura mínima en °C
 * @body {number} [temperatureMax] - Temperatura máxima en °C
 * @body {number} [humidityMin] - Humedad mínima en %
 * @body {number} [humidityMax] - Humedad máxima en %
 * @body {number} [lightMin] - Nivel de luz mínimo en lux
 * @body {number} [lightMax] - Nivel de luz máximo en lux
 * @body {number} [phMin] - pH mínimo
 * @body {number} [phMax] - pH máximo
 * @body {number} [dataCollectionInterval] - Intervalo de recolección en segundos
 * @body {boolean} [dataCollectionEnabled] - Habilitar recolección de datos
 * @body {boolean} [alertsEnabled] - Habilitar alertas
 */
router.put('/',
  authenticateToken,
  requireAdmin,
  validateSystemConfig,
  configController.updateSystemConfig
);

/**
 * @route POST /api/config/reset
 * @desc Restablece la configuración a valores por defecto
 * @access Admin
 */
router.post('/reset',
  authenticateToken,
  requireAdmin,
  configController.resetToDefaults
);

/**
 * @route POST /api/config/apply-optimal-cacao
 * @desc Aplica configuración optimizada para cultivo de cacao
 * @access Admin
 */
router.post('/apply-optimal-cacao',
  authenticateToken,
  requireAdmin,
  configController.applyOptimalCacaoConfig
);

/**
 * @route POST /api/config/import
 * @desc Importa configuración desde un archivo JSON
 * @access Admin
 * @body {Object} configuration - Objeto de configuración a importar
 * @body {string} [version] - Versión del archivo de configuración
 */
router.post('/import',
  authenticateToken,
  requireAdmin,
  validateImportData,
  configController.importConfig
);

/**
 * @route PATCH /api/config/alerts
 * @desc Actualiza configuración de alertas específicamente
 * @access Admin
 * @body {boolean} alertsEnabled - Habilitar o deshabilitar alertas
 */
router.patch('/alerts',
  authenticateToken,
  requireAdmin,
  validateAlertsConfig,
  configController.updateAlertsConfig
);

/**
 * @route PATCH /api/config/data-collection
 * @desc Actualiza configuración de recolección de datos específicamente
 * @access Admin
 * @body {boolean} [dataCollectionEnabled] - Habilitar recolección de datos
 * @body {number} [dataCollectionInterval] - Intervalo en segundos
 */
router.patch('/data-collection',
  authenticateToken,
  requireAdmin,
  validateDataCollectionConfig,
  configController.updateDataCollectionConfig
);

/**
 * @route GET /api/config/history
 * @desc Obtiene el historial de cambios de configuración
 * @access Admin
 * @query {number} [page=1] - Página del historial
 * @query {number} [limit=50] - Elementos por página
 */
router.get('/history',
  authenticateToken,
  requireAdmin,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('page debe ser un número entero mayor a 0'),
      
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('limit debe estar entre 1 y 100'),
      
    handleValidationErrors
  ],
  configController.getConfigHistory
);

// ============ RUTAS DE UTILIDAD ============

/**
 * @route GET /api/config/status
 * @desc Obtiene el estado actual del sistema de configuración
 * @access Private
 */
router.get('/status',
  authenticateToken,
  async (req, res) => {
    try {
      const config = await require('./configService').getSystemConfig();
      
      return res.status(200).json({
        success: true,
        message: 'Estado del sistema de configuración',
        data: {
          hasConfiguration: !!config,
          alertsEnabled: config?.alertsEnabled || false,
          dataCollectionEnabled: config?.dataCollectionEnabled || false,
          lastUpdated: config?.updatedAt || null,
          configurationComplete: !!(
            config?.temperatureMin !== undefined &&
            config?.temperatureMax !== undefined &&
            config?.humidityMin !== undefined &&
            config?.humidityMax !== undefined &&
            config?.lightMin !== undefined &&
            config?.lightMax !== undefined &&
            config?.phMin !== undefined &&
            config?.phMax !== undefined
          )
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Error al obtener estado del sistema'
      });
    }
  }
);

// ============ MANEJO DE ERRORES ============

// Middleware para manejar rutas no encontradas en este módulo
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta de configuración no encontrada'
  });
});

module.exports = router;