const express = require('express');
const router = express.Router();
const { Alert, Device, User } = require('../../models');
const { authenticate, requireAdmin } = require('../../shared/middleware/auth');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const { Op } = require('sequelize');

/**
 * @route GET /api/alerts/active
 * @desc Obtiene todas las alertas activas (no resueltas)
 * @access Private
 * @query {string} deviceId - Filtrar por ID de dispositivo (opcional)
 * @query {string} severity - Filtrar por severidad (opcional)
 * @query {number} limit - Límite de resultados (default: 100)
 */
router.get('/active', authenticate, async (req, res) => {
  try {
    const { deviceId, severity, limit = 100 } = req.query;

    const whereClause = { isResolved: false };

    // Filtrar por dispositivo si se proporciona
    if (deviceId) {
      const device = await Device.findOne({ where: { deviceId } });
      if (device) {
        whereClause.deviceId = device.id;
      }
    }

    // Filtrar por severidad si se proporciona
    if (severity) {
      whereClause.severity = severity;
    }

    const alerts = await Alert.findAll({
      where: whereClause,
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ],
      order: [
        ['severity', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit)
    });

    // Calcular resumen
    const summary = {
      total: alerts.length,
      bySeverity: {
        critical: alerts.filter(a => a.severity === 'critical').length,
        high: alerts.filter(a => a.severity === 'high').length,
        medium: alerts.filter(a => a.severity === 'medium').length,
        low: alerts.filter(a => a.severity === 'low').length
      },
      byType: {}
    };

    // Contar por tipo
    alerts.forEach(alert => {
      summary.byType[alert.type] = (summary.byType[alert.type] || 0) + 1;
    });

    return successResponse(res, {
      alerts,
      summary
    }, 'Alertas activas obtenidas exitosamente');

  } catch (error) {
    console.error('Error en GET /api/alerts/active:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route GET /api/alerts/recent
 * @desc Obtiene las alertas más recientes (últimas 24 horas)
 * @access Private
 * @query {number} hours - Horas hacia atrás (default: 24)
 * @query {string} deviceId - Filtrar por dispositivo (opcional)
 */
router.get('/recent', authenticate, async (req, res) => {
  try {
    const { hours = 24, deviceId } = req.query;

    const hoursAgo = new Date(Date.now() - hours * 60 * 60 * 1000);
    const whereClause = {
      createdAt: { [Op.gte]: hoursAgo }
    };

    // Filtrar por dispositivo si se proporciona
    if (deviceId) {
      const device = await Device.findOne({ where: { deviceId } });
      if (device) {
        whereClause.deviceId = device.id;
      }
    }

    const alerts = await Alert.findAll({
      where: whereClause,
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'type']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    return successResponse(res, {
      alerts,
      period: `Últimas ${hours} horas`,
      total: alerts.length
    }, 'Alertas recientes obtenidas exitosamente');

  } catch (error) {
    console.error('Error en GET /api/alerts/recent:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route GET /api/alerts/:id
 * @desc Obtiene una alerta específica por ID
 * @access Private
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id, {
      include: [
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name', 'type']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'resolver',
          attributes: ['id', 'username', 'firstName', 'lastName']
        }
      ]
    });

    if (!alert) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }

    return successResponse(res, alert, 'Alerta obtenida exitosamente');

  } catch (error) {
    console.error('Error en GET /api/alerts/:id:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route PATCH /api/alerts/:id/read
 * @desc Marca una alerta como leída
 * @access Private
 */
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);

    if (!alert) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }

    await alert.update({ isRead: true });

    return successResponse(res, alert, 'Alerta marcada como leída');

  } catch (error) {
    console.error('Error en PATCH /api/alerts/:id/read:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route PATCH /api/alerts/:id/resolve
 * @desc Marca una alerta como resuelta
 * @access Private
 */
router.patch('/:id/resolve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);

    if (!alert) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }

    await alert.update({
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    });

    return successResponse(res, alert, 'Alerta resuelta exitosamente');

  } catch (error) {
    console.error('Error en PATCH /api/alerts/:id/resolve:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route GET /api/alerts/summary
 * @desc Obtiene un resumen de todas las alertas
 * @access Private
 */
router.get('/summary/stats', authenticate, async (req, res) => {
  try {
    const [
      totalAlerts,
      activeAlerts,
      criticalAlerts,
      alertsLast24h
    ] = await Promise.all([
      Alert.count(),
      Alert.count({ where: { isResolved: false } }),
      Alert.count({ where: { severity: 'critical', isResolved: false } }),
      Alert.count({
        where: {
          createdAt: {
            [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    ]);

    // Alertas por tipo
    const alertsByType = await Alert.findAll({
      attributes: [
        'type',
        [Alert.sequelize.fn('COUNT', Alert.sequelize.col('id')), 'count']
      ],
      where: { isResolved: false },
      group: ['type'],
      raw: true
    });

    // Alertas por severidad
    const alertsBySeverity = await Alert.findAll({
      attributes: [
        'severity',
        [Alert.sequelize.fn('COUNT', Alert.sequelize.col('id')), 'count']
      ],
      where: { isResolved: false },
      group: ['severity'],
      raw: true
    });

    return successResponse(res, {
      total: totalAlerts,
      active: activeAlerts,
      critical: criticalAlerts,
      last24h: alertsLast24h,
      byType: alertsByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
      bySeverity: alertsBySeverity.reduce((acc, item) => {
        acc[item.severity] = parseInt(item.count);
        return acc;
      }, {})
    }, 'Resumen de alertas obtenido exitosamente');

  } catch (error) {
    console.error('Error en GET /api/alerts/summary/stats:', error);
    return errorResponse(res, error.message, 500);
  }
});

/**
 * @route DELETE /api/alerts/:id
 * @desc Elimina una alerta (solo admin)
 * @access Admin
 */
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByPk(id);

    if (!alert) {
      return errorResponse(res, 'Alerta no encontrada', 404);
    }

    await alert.destroy();

    return successResponse(res, null, 'Alerta eliminada exitosamente');

  } catch (error) {
    console.error('Error en DELETE /api/alerts/:id:', error);
    return errorResponse(res, error.message, 500);
  }
});

module.exports = router;
