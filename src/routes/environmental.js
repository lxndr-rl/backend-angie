const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { validateEnvironmentalData } = require('../middleware/validation');
const {
    getLatestData,
    getHistoricalData,
    createEnvironmentalData,
    getDataSummary,
    getActiveAlerts,
    resolveAlert
} = require('../controllers/environmentalController');

// Rutas para obtener datos (algunas públicas para permitir acceso a dispositivos IoT)
router.get('/:deviceId/latest', optionalAuth, getLatestData);
router.get('/:deviceId/historical', optionalAuth, getHistoricalData);
router.get('/:deviceId/summary', optionalAuth, getDataSummary);

// Crear nuevos datos ambientales (para dispositivos IoT - pública pero validada)
router.post('/data', validateEnvironmentalData, createEnvironmentalData);

// Gestión de alertas (requiere autenticación)
router.get('/:deviceId/alerts', auth, getActiveAlerts);
router.put('/alerts/:alertId/resolve', auth, resolveAlert);

module.exports = router;