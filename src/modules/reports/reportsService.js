const { EnvironmentalData, Alert, User, SystemConfig } = require('../../models');
const { Op } = require('sequelize');
const { 
  getStartOfDay, 
  getEndOfDay, 
  getCurrentDate, 
  getLastDaysRange,
  getCurrentWeekRange,
  getCurrentMonthRange 
} = require('../../shared/utils/date');
const { ALERT_STATUS, TIME_INTERVALS } = require('../../shared/constants');

class ReportsService {
  /**
   * Genera reporte de datos ambientales
   * @param {Object} options - Opciones del reporte
   * @returns {Object} Reporte generado
   */
  async generateEnvironmentalReport(options = {}) {
    try {
      const {
        userId,
        deviceId,
        startDate,
        endDate,
        interval = TIME_INTERVALS.DAY,
        includeAlerts = true,
        includeStats = true
      } = options;

      // Establecer rango de fechas
      const dateRange = this.getDateRange(startDate, endDate, interval);

      // Construir filtros
      const whereClause = {
        timestamp: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (userId) whereClause.userId = userId;
      if (deviceId) whereClause.deviceId = deviceId;

      // Obtener datos ambientales
      const environmentalData = await EnvironmentalData.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ],
        order: [['timestamp', 'ASC']],
        raw: false
      });

      const report = {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          interval,
          filters: { userId, deviceId },
          totalReadings: environmentalData.length
        },
        data: environmentalData
      };

      // Incluir estadísticas si se solicita
      if (includeStats) {
        report.statistics = await this.calculateEnvironmentalStats(environmentalData, dateRange);
      }

      // Incluir alertas si se solicita
      if (includeAlerts) {
        report.alerts = await this.getAlertsForPeriod(whereClause);
      }

      return report;
    } catch (error) {
      console.error('Error en ReportsService.generateEnvironmentalReport:', error);
      throw new Error('Error al generar reporte ambiental');
    }
  }

  /**
   * Genera reporte de alertas
   * @param {Object} options - Opciones del reporte
   * @returns {Object} Reporte de alertas
   */
  async generateAlertsReport(options = {}) {
    try {
      const {
        userId,
        deviceId,
        startDate,
        endDate,
        status = null,
        severity = null,
        type = null
      } = options;

      // Establecer rango de fechas
      const dateRange = this.getDateRange(startDate, endDate, TIME_INTERVALS.WEEK);

      // Construir filtros
      const whereClause = {
        timestamp: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (userId) whereClause.userId = userId;
      if (deviceId) whereClause.deviceId = deviceId;
      if (status) whereClause.status = status;
      if (severity) whereClause.severity = severity;
      if (type) whereClause.type = type;

      // Obtener alertas
      const alerts = await Alert.findAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username']
          },
          {
            model: EnvironmentalData,
            as: 'environmentalData',
            attributes: ['temperature', 'humidity', 'light', 'ph', 'timestamp']
          }
        ],
        order: [['timestamp', 'DESC']],
        raw: false
      });

      // Calcular estadísticas de alertas
      const alertStats = this.calculateAlertStats(alerts);

      return {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          filters: { userId, deviceId, status, severity, type },
          totalAlerts: alerts.length
        },
        statistics: alertStats,
        alerts: alerts
      };
    } catch (error) {
      console.error('Error en ReportsService.generateAlertsReport:', error);
      throw new Error('Error al generar reporte de alertas');
    }
  }

  /**
   * Genera reporte de eficiencia de dispositivos
   * @param {Object} options - Opciones del reporte
   * @returns {Object} Reporte de eficiencia
   */
  async generateDeviceEfficiencyReport(options = {}) {
    try {
      const {
        userId,
        startDate,
        endDate,
        period = TIME_INTERVALS.WEEK
      } = options;

      const dateRange = this.getDateRange(startDate, endDate, period);

      // Obtener todos los dispositivos únicos
      const deviceQuery = {
        timestamp: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (userId) deviceQuery.userId = userId;

      const devices = await EnvironmentalData.findAll({
        where: deviceQuery,
        attributes: ['deviceId'],
        group: ['deviceId'],
        raw: true
      });

      // Para cada dispositivo, calcular métricas de eficiencia
      const deviceReports = await Promise.all(
        devices.map(async (device) => {
          return await this.calculateDeviceEfficiency(device.deviceId, dateRange, userId);
        })
      );

      return {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          period,
          totalDevices: devices.length
        },
        devices: deviceReports,
        summary: this.calculateOverallEfficiency(deviceReports)
      };
    } catch (error) {
      console.error('Error en ReportsService.generateDeviceEfficiencyReport:', error);
      throw new Error('Error al generar reporte de eficiencia de dispositivos');
    }
  }

  /**
   * Genera reporte de tendencias
   * @param {Object} options - Opciones del reporte
   * @returns {Object} Reporte de tendencias
   */
  async generateTrendsReport(options = {}) {
    try {
      const {
        userId,
        deviceId,
        startDate,
        endDate,
        metric = 'all' // temperature, humidity, light, ph, all
      } = options;

      const dateRange = this.getDateRange(startDate, endDate, TIME_INTERVALS.MONTH);

      // Obtener datos para análisis de tendencias
      const whereClause = {
        timestamp: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (userId) whereClause.userId = userId;
      if (deviceId) whereClause.deviceId = deviceId;

      // Agrupar datos por día para análisis de tendencias
      const dailyData = await EnvironmentalData.findAll({
        where: whereClause,
        attributes: [
          [EnvironmentalData.sequelize.fn('DATE', EnvironmentalData.sequelize.col('timestamp')), 'date'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('temperature')), 'avgTemperature'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('humidity')), 'avgHumidity'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('light')), 'avgLight'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('ph')), 'avgPh'],
          [EnvironmentalData.sequelize.fn('COUNT', EnvironmentalData.sequelize.col('id')), 'readingsCount']
        ],
        group: [EnvironmentalData.sequelize.fn('DATE', EnvironmentalData.sequelize.col('timestamp'))],
        order: [[EnvironmentalData.sequelize.fn('DATE', EnvironmentalData.sequelize.col('timestamp')), 'ASC']],
        raw: true
      });

      // Calcular tendencias
      const trends = this.calculateTrends(dailyData, metric);

      return {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          metric,
          totalDays: dailyData.length
        },
        dailyData: dailyData.map(day => ({
          date: day.date,
          temperature: parseFloat(day.avgTemperature?.toFixed(2) || 0),
          humidity: parseFloat(day.avgHumidity?.toFixed(2) || 0),
          light: parseFloat(day.avgLight?.toFixed(2) || 0),
          ph: parseFloat(day.avgPh?.toFixed(2) || 0),
          readingsCount: parseInt(day.readingsCount || 0)
        })),
        trends
      };
    } catch (error) {
      console.error('Error en ReportsService.generateTrendsReport:', error);
      throw new Error('Error al generar reporte de tendencias');
    }
  }

  /**
   * Obtiene resumen ejecutivo de todos los reportes
   * @param {Object} options - Opciones del resumen
   * @returns {Object} Resumen ejecutivo
   */
  async getExecutiveSummary(options = {}) {
    try {
      const { userId, period = TIME_INTERVALS.WEEK } = options;
      
      const dateRange = this.getDateRange(null, null, period);

      // Filtros base
      const whereClause = {
        timestamp: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (userId) whereClause.userId = userId;

      // Obtener métricas clave
      const [
        totalReadings,
        activeAlerts,
        uniqueDevices,
        avgTemperature,
        avgHumidity,
        avgLight,
        avgPh
      ] = await Promise.all([
        EnvironmentalData.count({ where: whereClause }),
        Alert.count({ where: { ...whereClause, status: ALERT_STATUS.ACTIVE } }),
        EnvironmentalData.count({
          where: whereClause,
          distinct: true,
          col: 'deviceId'
        }),
        EnvironmentalData.findOne({
          where: whereClause,
          attributes: [[EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('temperature')), 'avg']],
          raw: true
        }),
        EnvironmentalData.findOne({
          where: whereClause,
          attributes: [[EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('humidity')), 'avg']],
          raw: true
        }),
        EnvironmentalData.findOne({
          where: whereClause,
          attributes: [[EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('light')), 'avg']],
          raw: true
        }),
        EnvironmentalData.findOne({
          where: whereClause,
          attributes: [[EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('ph')), 'avg']],
          raw: true
        })
      ]);

      return {
        metadata: {
          generatedAt: getCurrentDate(),
          period,
          dateRange
        },
        summary: {
          totalReadings,
          activeAlerts,
          uniqueDevices,
          averages: {
            temperature: parseFloat(avgTemperature?.avg?.toFixed(2) || 0),
            humidity: parseFloat(avgHumidity?.avg?.toFixed(2) || 0),
            light: parseFloat(avgLight?.avg?.toFixed(2) || 0),
            ph: parseFloat(avgPh?.avg?.toFixed(2) || 0)
          },
          systemHealth: this.calculateSystemHealth(activeAlerts, totalReadings),
          readingsPerDay: Math.round(totalReadings / this.getDaysDifference(dateRange))
        }
      };
    } catch (error) {
      console.error('Error en ReportsService.getExecutiveSummary:', error);
      throw new Error('Error al generar resumen ejecutivo');
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Obtiene rango de fechas basado en parámetros
   */
  getDateRange(startDate, endDate, interval) {
    if (startDate && endDate) {
      return {
        start: getStartOfDay(startDate),
        end: getEndOfDay(endDate)
      };
    }

    switch (interval) {
      case TIME_INTERVALS.WEEK:
        return getCurrentWeekRange();
      case TIME_INTERVALS.MONTH:
        return getCurrentMonthRange();
      case TIME_INTERVALS.DAY:
      default:
        return getLastDaysRange(1);
    }
  }

  /**
   * Calcula estadísticas de datos ambientales
   */
  async calculateEnvironmentalStats(data, dateRange) {
    if (data.length === 0) {
      return {
        temperature: { min: 0, max: 0, avg: 0 },
        humidity: { min: 0, max: 0, avg: 0 },
        light: { min: 0, max: 0, avg: 0 },
        ph: { min: 0, max: 0, avg: 0 }
      };
    }

    const stats = {};
    const metrics = ['temperature', 'humidity', 'light', 'ph'];

    metrics.forEach(metric => {
      const values = data.map(d => parseFloat(d[metric])).filter(v => !isNaN(v));
      stats[metric] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: values.reduce((a, b) => a + b, 0) / values.length
      };
    });

    return stats;
  }

  /**
   * Obtiene alertas para un período específico
   */
  async getAlertsForPeriod(whereClause) {
    return await Alert.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: 100 // Limitar para performance
    });
  }

  /**
   * Calcula estadísticas de alertas
   */
  calculateAlertStats(alerts) {
    const stats = {
      total: alerts.length,
      byStatus: {},
      bySeverity: {},
      byType: {},
      resolvedCount: 0,
      avgResolutionTime: 0
    };

    alerts.forEach(alert => {
      // Por estado
      stats.byStatus[alert.status] = (stats.byStatus[alert.status] || 0) + 1;
      
      // Por severidad
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Por tipo
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      // Tiempo de resolución (si está resuelto)
      if (alert.status === ALERT_STATUS.RESOLVED && alert.resolvedAt) {
        stats.resolvedCount++;
      }
    });

    return stats;
  }

  /**
   * Calcula eficiencia de un dispositivo
   */
  async calculateDeviceEfficiency(deviceId, dateRange, userId = null) {
    const whereClause = {
      deviceId,
      timestamp: {
        [Op.between]: [dateRange.start, dateRange.end]
      }
    };

    if (userId) whereClause.userId = userId;

    const [dataCount, alertCount, latestData] = await Promise.all([
      EnvironmentalData.count({ where: whereClause }),
      Alert.count({ where: { ...whereClause, status: ALERT_STATUS.ACTIVE } }),
      EnvironmentalData.findOne({
        where: { deviceId },
        order: [['timestamp', 'DESC']]
      })
    ]);

    const expectedReadings = this.getDaysDifference(dateRange) * 24 * 12; // Esperamos 1 lectura cada 5 minutos
    const efficiency = Math.min((dataCount / expectedReadings) * 100, 100);

    return {
      deviceId,
      totalReadings: dataCount,
      activeAlerts: alertCount,
      efficiency: parseFloat(efficiency.toFixed(2)),
      status: latestData ? (this.isDeviceOnline(latestData.timestamp) ? 'online' : 'offline') : 'unknown',
      lastReading: latestData?.timestamp || null
    };
  }

  /**
   * Calcula eficiencia general
   */
  calculateOverallEfficiency(deviceReports) {
    if (deviceReports.length === 0) return { efficiency: 0, onlineDevices: 0, totalAlerts: 0 };

    const totalEfficiency = deviceReports.reduce((sum, device) => sum + device.efficiency, 0);
    const onlineDevices = deviceReports.filter(device => device.status === 'online').length;
    const totalAlerts = deviceReports.reduce((sum, device) => sum + device.activeAlerts, 0);

    return {
      efficiency: parseFloat((totalEfficiency / deviceReports.length).toFixed(2)),
      onlineDevices,
      totalAlerts,
      deviceCount: deviceReports.length
    };
  }

  /**
   * Calcula tendencias de los datos
   */
  calculateTrends(dailyData, metric) {
    const trends = {};
    const metrics = metric === 'all' ? ['temperature', 'humidity', 'light', 'ph'] : [metric];

    metrics.forEach(m => {
      const values = dailyData.map(day => parseFloat(day[`avg${m.charAt(0).toUpperCase() + m.slice(1)}`]) || 0);
      
      if (values.length > 1) {
        const trend = this.calculateLinearTrend(values);
        trends[m] = {
          direction: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
          slope: trend,
          correlation: this.calculateCorrelation(values)
        };
      } else {
        trends[m] = { direction: 'insufficient_data', slope: 0, correlation: 0 };
      }
    });

    return trends;
  }

  /**
   * Calcula tendencia linear simple
   */
  calculateLinearTrend(values) {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = values.reduce((sum, _, x) => sum + x * x, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  /**
   * Calcula correlación simple
   */
  calculateCorrelation(values) {
    // Implementación básica de correlación con índices temporales
    const n = values.length;
    if (n < 2) return 0;

    const indices = Array.from({ length: n }, (_, i) => i);
    const meanX = indices.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;

    const numerator = indices.reduce((sum, x, i) => sum + (x - meanX) * (values[i] - meanY), 0);
    const denomX = Math.sqrt(indices.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0));
    const denomY = Math.sqrt(values.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0));

    return denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
  }

  /**
   * Calcula la salud del sistema
   */
  calculateSystemHealth(activeAlerts, totalReadings) {
    if (totalReadings === 0) return 'unknown';
    
    const alertRatio = activeAlerts / totalReadings;
    
    if (alertRatio < 0.01) return 'excellent';
    if (alertRatio < 0.05) return 'good';
    if (alertRatio < 0.1) return 'fair';
    return 'poor';
  }

  /**
   * Verifica si un dispositivo está online
   */
  isDeviceOnline(lastTimestamp) {
    const now = new Date();
    const diffMinutes = (now - new Date(lastTimestamp)) / (1000 * 60);
    return diffMinutes <= 15;
  }

  /**
   * Calcula diferencia en días entre fechas
   */
  getDaysDifference(dateRange) {
    return Math.ceil((dateRange.end - dateRange.start) / (1000 * 60 * 60 * 24));
  }
}

module.exports = new ReportsService();