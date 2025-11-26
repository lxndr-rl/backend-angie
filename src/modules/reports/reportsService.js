const { 
  Device, 
  DHT22Reading, 
  MQ135Reading, 
  MQ7Reading, 
  MQ4Reading, 
  MQ136Reading,
  Alert, 
  User, 
  SystemConfig 
} = require('../../models');
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

      // Obtener dispositivos del usuario (si se especifica)
      let deviceIds = deviceId ? [deviceId] : null;
      if (userId && !deviceId) {
        const devices = await Device.findAll({
          where: { userId },
          attributes: ['id'],
          raw: true
        });
        deviceIds = devices.map(d => d.id);
      }

      // Construir filtros
      const whereClause = {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (deviceIds) {
        whereClause.deviceId = { [Op.in]: deviceIds };
      }

      // Obtener datos de todos los sensores en paralelo
      const [dht22Data, mq7Data, mq4Data, mq135Data] = await Promise.all([
        DHT22Reading.findAll({
          where: whereClause,
          include: [
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'deviceId', 'name']
            }
          ],
          order: [['createdAt', 'ASC']],
          raw: false
        }),
        MQ7Reading.findAll({
          where: whereClause,
          include: [
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'deviceId', 'name']
            }
          ],
          order: [['createdAt', 'ASC']],
          raw: false
        }),
        MQ4Reading.findAll({
          where: whereClause,
          include: [
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'deviceId', 'name']
            }
          ],
          order: [['createdAt', 'ASC']],
          raw: false
        }),
        MQ135Reading.findAll({
          where: whereClause,
          include: [
            {
              model: Device,
              as: 'device',
              attributes: ['id', 'deviceId', 'name']
            }
          ],
          order: [['createdAt', 'ASC']],
          raw: false
        })
      ]);

      const totalReadings = dht22Data.length + mq7Data.length + mq4Data.length + mq135Data.length;

      const report = {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          interval,
          filters: { userId, deviceId },
          totalReadings,
          readingsByType: {
            dht22: dht22Data.length,
            mq7: mq7Data.length,
            mq4: mq4Data.length,
            mq135: mq135Data.length
          }
        },
        data: {
          dht22: dht22Data,
          mq7: mq7Data,
          mq4: mq4Data,
          mq135: mq135Data
        }
      };

      // Incluir estadísticas si se solicita
      if (includeStats) {
        report.statistics = await this.calculateSensorStats(dht22Data, mq7Data, mq4Data, mq135Data);
      }

      // Incluir alertas si se solicita
      if (includeAlerts) {
        const alertWhereClause = {
          createdAt: {
            [Op.between]: [dateRange.start, dateRange.end]
          }
        };
        if (deviceIds) {
          alertWhereClause.deviceId = { [Op.in]: deviceIds };
        }
        report.alerts = await this.getAlertsForPeriod(alertWhereClause);
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

      // Obtener dispositivos del usuario (si se especifica)
      let deviceIds = deviceId ? [deviceId] : null;
      if (userId && !deviceId) {
        const devices = await Device.findAll({
          where: { userId },
          attributes: ['id'],
          raw: true
        });
        deviceIds = devices.map(d => d.id);
      }

      // Construir filtros
      const whereClause = {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (deviceIds) whereClause.deviceId = { [Op.in]: deviceIds };
      if (status === 'active') whereClause.isResolved = false;
      if (status === 'resolved') whereClause.isResolved = true;
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
            model: Device,
            as: 'device',
            attributes: ['id', 'deviceId', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
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

      // Obtener dispositivos
      const deviceQuery = userId ? { userId } : {};
      const devices = await Device.findAll({
        where: deviceQuery,
        attributes: ['id', 'deviceId', 'name', 'userId'],
        raw: true
      });

      // Para cada dispositivo, calcular métricas de eficiencia
      const deviceReports = await Promise.all(
        devices.map(async (device) => {
          return await this.calculateDeviceEfficiency(device.id, dateRange);
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
        metric = 'all' // temperature, humidity, co, ch4, airQuality, all
      } = options;

      const dateRange = this.getDateRange(startDate, endDate, TIME_INTERVALS.MONTH);

      // Obtener dispositivos del usuario (si se especifica)
      let deviceIds = deviceId ? [deviceId] : null;
      if (userId && !deviceId) {
        const devices = await Device.findAll({
          where: { userId },
          attributes: ['id'],
          raw: true
        });
        deviceIds = devices.map(d => d.id);
      }

      // Construir filtros
      const whereClause = {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (deviceIds) {
        whereClause.deviceId = { [Op.in]: deviceIds };
      }

      // Agrupar datos por día para análisis de tendencias
      const [dht22Daily, mq7Daily, mq4Daily, mq135Daily] = await Promise.all([
        DHT22Reading.findAll({
          where: whereClause,
          attributes: [
            [DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt')), 'date'],
            [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('temperature')), 'avgTemperature'],
            [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('humidity')), 'avgHumidity'],
            [DHT22Reading.sequelize.fn('COUNT', DHT22Reading.sequelize.col('id')), 'count']
          ],
          group: [DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt'))],
          order: [[DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt')), 'ASC']],
          raw: true
        }),
        MQ7Reading.findAll({
          where: whereClause,
          attributes: [
            [MQ7Reading.sequelize.fn('DATE', MQ7Reading.sequelize.col('createdAt')), 'date'],
            [MQ7Reading.sequelize.fn('AVG', MQ7Reading.sequelize.col('co_ppm')), 'avgCO'],
            [MQ7Reading.sequelize.fn('COUNT', MQ7Reading.sequelize.col('id')), 'count']
          ],
          group: [MQ7Reading.sequelize.fn('DATE', MQ7Reading.sequelize.col('createdAt'))],
          order: [[MQ7Reading.sequelize.fn('DATE', MQ7Reading.sequelize.col('createdAt')), 'ASC']],
          raw: true
        }),
        MQ4Reading.findAll({
          where: whereClause,
          attributes: [
            [MQ4Reading.sequelize.fn('DATE', MQ4Reading.sequelize.col('createdAt')), 'date'],
            [MQ4Reading.sequelize.fn('AVG', MQ4Reading.sequelize.col('ch4_ppm')), 'avgCH4'],
            [MQ4Reading.sequelize.fn('COUNT', MQ4Reading.sequelize.col('id')), 'count']
          ],
          group: [MQ4Reading.sequelize.fn('DATE', MQ4Reading.sequelize.col('createdAt'))],
          order: [[MQ4Reading.sequelize.fn('DATE', MQ4Reading.sequelize.col('createdAt')), 'ASC']],
          raw: true
        }),
        MQ135Reading.findAll({
          where: whereClause,
          attributes: [
            [MQ135Reading.sequelize.fn('DATE', MQ135Reading.sequelize.col('createdAt')), 'date'],
            [MQ135Reading.sequelize.fn('AVG', MQ135Reading.sequelize.col('ppm')), 'avgAirQuality'],
            [MQ135Reading.sequelize.fn('COUNT', MQ135Reading.sequelize.col('id')), 'count']
          ],
          group: [MQ135Reading.sequelize.fn('DATE', MQ135Reading.sequelize.col('createdAt'))],
          order: [[MQ135Reading.sequelize.fn('DATE', MQ135Reading.sequelize.col('createdAt')), 'ASC']],
          raw: true
        })
      ]);

      // Combinar datos por fecha
      const dailyDataMap = new Map();
      
      dht22Daily.forEach(d => {
        if (!dailyDataMap.has(d.date)) {
          dailyDataMap.set(d.date, { date: d.date });
        }
        const temp = parseFloat(d.avgTemperature) || 0;
        const hum = parseFloat(d.avgHumidity) || 0;
        dailyDataMap.get(d.date).temperature = parseFloat(temp.toFixed(2));
        dailyDataMap.get(d.date).humidity = parseFloat(hum.toFixed(2));
      });

      mq7Daily.forEach(d => {
        if (!dailyDataMap.has(d.date)) {
          dailyDataMap.set(d.date, { date: d.date });
        }
        const co = parseFloat(d.avgCO) || 0;
        dailyDataMap.get(d.date).co = parseFloat(co.toFixed(2));
      });

      mq4Daily.forEach(d => {
        if (!dailyDataMap.has(d.date)) {
          dailyDataMap.set(d.date, { date: d.date });
        }
        const ch4 = parseFloat(d.avgCH4) || 0;
        dailyDataMap.get(d.date).ch4 = parseFloat(ch4.toFixed(2));
      });

      mq135Daily.forEach(d => {
        if (!dailyDataMap.has(d.date)) {
          dailyDataMap.set(d.date, { date: d.date });
        }
        const airQuality = parseFloat(d.avgAirQuality) || 0;
        dailyDataMap.get(d.date).airQuality = parseFloat(airQuality.toFixed(2));
      });

      const dailyData = Array.from(dailyDataMap.values()).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );

      // Calcular tendencias
      const trends = this.calculateTrendsFromSensorData(dailyData, metric);

      return {
        metadata: {
          generatedAt: getCurrentDate(),
          dateRange,
          metric,
          totalDays: dailyData.length
        },
        dailyData,
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

      // Obtener dispositivos del usuario (si se especifica)
      let deviceIds = null;
      if (userId) {
        const devices = await Device.findAll({
          where: { userId },
          attributes: ['id'],
          raw: true
        });
        deviceIds = devices.map(d => d.id);
        
        if (deviceIds.length === 0) {
          // Usuario sin dispositivos
          return this.getEmptySummary(dateRange, period);
        }
      }

      // Construir filtros base
      const whereClause = {
        createdAt: {
          [Op.between]: [dateRange.start, dateRange.end]
        }
      };

      if (deviceIds) {
        whereClause.deviceId = { [Op.in]: deviceIds };
      }

      // Obtener métricas en paralelo
      const [
        dht22Count,
        mq7Count,
        mq4Count,
        mq135Count,
        activeAlerts,
        uniqueDevices,
        avgTemperature,
        avgHumidity,
        avgCO,
        avgCH4,
        avgAirQuality,
        latestCO,
        latestCH4,
        latestAirQuality,
        hourlyData
      ] = await Promise.all([
        DHT22Reading.count({ where: whereClause }),
        MQ7Reading.count({ where: whereClause }),
        MQ4Reading.count({ where: whereClause }),
        MQ135Reading.count({ where: whereClause }),
        Alert.count({ 
          where: { 
            createdAt: {
              [Op.between]: [dateRange.start, dateRange.end]
            },
            isResolved: false,
            ...(deviceIds ? { deviceId: { [Op.in]: deviceIds } } : {})
          } 
        }),
        Device.count({
          where: deviceIds ? { id: { [Op.in]: deviceIds } } : {},
          distinct: true
        }),
        // Promedios DHT22
        DHT22Reading.findOne({
          where: whereClause,
          attributes: [[DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('temperature')), 'avg']],
          raw: true
        }),
        DHT22Reading.findOne({
          where: whereClause,
          attributes: [[DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('humidity')), 'avg']],
          raw: true
        }),
        // Promedios MQ7 (CO)
        MQ7Reading.findOne({
          where: whereClause,
          attributes: [[MQ7Reading.sequelize.fn('AVG', MQ7Reading.sequelize.col('co_ppm')), 'avg']],
          raw: true
        }),
        // Promedios MQ4 (CH4)
        MQ4Reading.findOne({
          where: whereClause,
          attributes: [[MQ4Reading.sequelize.fn('AVG', MQ4Reading.sequelize.col('ch4_ppm')), 'avg']],
          raw: true
        }),
        // Promedios MQ135 (Calidad del aire)
        MQ135Reading.findOne({
          where: whereClause,
          attributes: [[MQ135Reading.sequelize.fn('AVG', MQ135Reading.sequelize.col('ppm')), 'avg']],
          raw: true
        }),
        // Últimas lecturas para valores actuales
        MQ7Reading.findOne({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          attributes: ['co_ppm', 'dangerLevel'],
          raw: true
        }),
        MQ4Reading.findOne({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          attributes: ['ch4_ppm', 'dangerLevel'],
          raw: true
        }),
        MQ135Reading.findOne({
          where: whereClause,
          order: [['createdAt', 'DESC']],
          attributes: ['ppm', 'airQuality'],
          raw: true
        }),
        // Datos horarios para gráficas
        this.getHourlyData(whereClause, dateRange)
      ]);

      const totalReadings = dht22Count + mq7Count + mq4Count + mq135Count;

      // Calcular niveles de gases
      const avgCOValue = parseFloat(avgCO?.avg) || 0;
      const avgCH4Value = parseFloat(avgCH4?.avg) || 0;
      const avgTempValue = parseFloat(avgTemperature?.avg) || 0;
      const avgHumValue = parseFloat(avgHumidity?.avg) || 0;

      const gasLevels = {
        co: {
          current: parseFloat(latestCO?.co_ppm || 0),
          average: parseFloat(avgCOValue.toFixed(2)),
          level: this.getCOLevel(latestCO?.co_ppm || 0)
        },
        ch4: {
          current: parseFloat(latestCH4?.ch4_ppm || 0),
          average: parseFloat(avgCH4Value.toFixed(2)),
          level: this.getCH4Level(latestCH4?.ch4_ppm || 0)
        },
        h2s: {
          current: 0, // MQ136 no implementado aún
          average: 0,
          level: 'safe'
        }
      };

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
            temperature: parseFloat(avgTempValue.toFixed(2)),
            humidity: parseFloat(avgHumValue.toFixed(2))
          },
          gasLevels,
          hourlyData,
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
      case TIME_INTERVALS.HOUR:
      case 'hour':
        // Última hora
        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);
        return {
          start: oneHourAgo,
          end: new Date()
        };
      case TIME_INTERVALS.DAY:
      case 'day':
        // Últimas 24 horas
        return getLastDaysRange(1);
      case TIME_INTERVALS.WEEK:
      case 'week':
        // Últimos 7 días
        return getLastDaysRange(7);
      case TIME_INTERVALS.MONTH:
      case 'month':
        // Últimos 30 días
        return getLastDaysRange(30);
      case TIME_INTERVALS.YEAR:
      case 'year':
        // Últimos 365 días
        return getLastDaysRange(365);
      case 'custom':
        // Para custom, se deben proporcionar startDate y endDate
        // Si no se proporcionan, usar últimos 7 días por defecto
        return getLastDaysRange(7);
      default:
        return getLastDaysRange(1);
    }
  }

  /**
   * Calcula estadísticas de datos de sensores
   */
  async calculateSensorStats(dht22Data, mq7Data, mq4Data, mq135Data) {
    const stats = {};

    // Estadísticas DHT22 (Temperatura y Humedad)
    if (dht22Data.length > 0) {
      const temps = dht22Data.map(d => parseFloat(d.temperature)).filter(v => !isNaN(v));
      const hums = dht22Data.map(d => parseFloat(d.humidity)).filter(v => !isNaN(v));
      
      stats.temperature = {
        min: Math.min(...temps),
        max: Math.max(...temps),
        avg: temps.reduce((a, b) => a + b, 0) / temps.length
      };
      
      stats.humidity = {
        min: Math.min(...hums),
        max: Math.max(...hums),
        avg: hums.reduce((a, b) => a + b, 0) / hums.length
      };
    } else {
      stats.temperature = { min: 0, max: 0, avg: 0 };
      stats.humidity = { min: 0, max: 0, avg: 0 };
    }

    // Estadísticas MQ7 (CO)
    if (mq7Data.length > 0) {
      const coValues = mq7Data.map(d => parseFloat(d.co_ppm)).filter(v => !isNaN(v));
      stats.co = {
        min: Math.min(...coValues),
        max: Math.max(...coValues),
        avg: coValues.reduce((a, b) => a + b, 0) / coValues.length,
        dangerLevels: this.countDangerLevels(mq7Data, 'dangerLevel')
      };
    } else {
      stats.co = { min: 0, max: 0, avg: 0, dangerLevels: {} };
    }

    // Estadísticas MQ4 (CH4)
    if (mq4Data.length > 0) {
      const ch4Values = mq4Data.map(d => parseFloat(d.ch4_ppm)).filter(v => !isNaN(v));
      stats.ch4 = {
        min: Math.min(...ch4Values),
        max: Math.max(...ch4Values),
        avg: ch4Values.reduce((a, b) => a + b, 0) / ch4Values.length,
        dangerLevels: this.countDangerLevels(mq4Data, 'dangerLevel')
      };
    } else {
      stats.ch4 = { min: 0, max: 0, avg: 0, dangerLevels: {} };
    }

    // Estadísticas MQ135 (Calidad del Aire)
    if (mq135Data.length > 0) {
      const airValues = mq135Data.map(d => parseFloat(d.ppm)).filter(v => !isNaN(v));
      stats.airQuality = {
        min: Math.min(...airValues),
        max: Math.max(...airValues),
        avg: airValues.reduce((a, b) => a + b, 0) / airValues.length,
        qualityLevels: this.countAirQualityLevels(mq135Data)
      };
    } else {
      stats.airQuality = { min: 0, max: 0, avg: 0, qualityLevels: {} };
    }

    return stats;
  }

  /**
   * Cuenta niveles de peligro en los datos
   */
  countDangerLevels(data, field) {
    const levels = {};
    data.forEach(d => {
      const level = d[field] || 'unknown';
      levels[level] = (levels[level] || 0) + 1;
    });
    return levels;
  }

  /**
   * Cuenta niveles de calidad del aire
   */
  countAirQualityLevels(data) {
    const levels = {};
    data.forEach(d => {
      const level = d.airQuality || 'unknown';
      levels[level] = (levels[level] || 0) + 1;
    });
    return levels;
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
          attributes: ['id', 'firstName', 'lastName', 'username']
        },
        {
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100 // Limitar para performance
    });
  }

  /**
   * Calcula estadísticas de alertas
   */
  calculateAlertStats(alerts) {
    const stats = {
      total: alerts.length,
      byStatus: {
        active: 0,
        resolved: 0
      },
      bySeverity: {},
      byType: {},
      bySensorType: {},
      resolvedCount: 0,
      avgResolutionTime: 0
    };

    let totalResolutionTime = 0;

    alerts.forEach(alert => {
      // Por estado
      const status = alert.isResolved ? 'resolved' : 'active';
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
      
      // Por severidad
      stats.bySeverity[alert.severity] = (stats.bySeverity[alert.severity] || 0) + 1;
      
      // Por tipo
      stats.byType[alert.type] = (stats.byType[alert.type] || 0) + 1;
      
      // Por tipo de sensor
      if (alert.sensorType) {
        stats.bySensorType[alert.sensorType] = (stats.bySensorType[alert.sensorType] || 0) + 1;
      }
      
      // Tiempo de resolución (si está resuelto)
      if (alert.isResolved && alert.resolvedAt) {
        stats.resolvedCount++;
        const resolutionTime = new Date(alert.resolvedAt) - new Date(alert.createdAt);
        totalResolutionTime += resolutionTime;
      }
    });

    // Calcular tiempo promedio de resolución en minutos
    if (stats.resolvedCount > 0) {
      stats.avgResolutionTime = Math.round((totalResolutionTime / stats.resolvedCount) / (1000 * 60));
    }

    return stats;
  }

  /**
   * Calcula eficiencia de un dispositivo
   */
  async calculateDeviceEfficiency(deviceId, dateRange) {
    const whereClause = {
      deviceId,
      createdAt: {
        [Op.between]: [dateRange.start, dateRange.end]
      }
    };

    // Obtener información del dispositivo
    const device = await Device.findByPk(deviceId, {
      attributes: ['id', 'deviceId', 'name', 'isOnline', 'lastSeen']
    });

    if (!device) {
      return {
        deviceId,
        deviceName: 'Unknown',
        totalReadings: 0,
        activeAlerts: 0,
        efficiency: 0,
        status: 'unknown',
        lastReading: null
      };
    }

    // Contar lecturas de todos los sensores
    const [dht22Count, mq7Count, mq4Count, mq135Count, alertCount] = await Promise.all([
      DHT22Reading.count({ where: whereClause }),
      MQ7Reading.count({ where: whereClause }),
      MQ4Reading.count({ where: whereClause }),
      MQ135Reading.count({ where: whereClause }),
      Alert.count({ 
        where: { 
          deviceId,
          createdAt: {
            [Op.between]: [dateRange.start, dateRange.end]
          },
          isResolved: false 
        } 
      })
    ]);

    const totalReadings = dht22Count + mq7Count + mq4Count + mq135Count;

    // Calcular eficiencia (esperamos ~12 lecturas por hora por sensor = 48 total)
    const expectedReadingsPerHour = 48; // 4 sensores * 12 lecturas/hora
    const hours = this.getDaysDifference(dateRange) * 24;
    const expectedReadings = hours * expectedReadingsPerHour;
    const efficiency = expectedReadings > 0 ? Math.min((totalReadings / expectedReadings) * 100, 100) : 0;

    return {
      deviceId: device.deviceId,
      deviceName: device.name || device.deviceId,
      totalReadings,
      readingsByType: {
        dht22: dht22Count,
        mq7: mq7Count,
        mq4: mq4Count,
        mq135: mq135Count
      },
      activeAlerts: alertCount,
      efficiency: parseFloat(efficiency.toFixed(2)),
      status: device.isOnline ? 'online' : 'offline',
      lastReading: device.lastSeen
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
   * Calcula tendencias de los datos de sensores
   */
  calculateTrendsFromSensorData(dailyData, metric) {
    const trends = {};
    const metrics = metric === 'all' 
      ? ['temperature', 'humidity', 'co', 'ch4', 'airQuality'] 
      : [metric];

    metrics.forEach(m => {
      const values = dailyData
        .map(day => parseFloat(day[m]) || 0)
        .filter(v => v > 0); // Filtrar valores 0 (sin datos)
      
      if (values.length > 1) {
        const trend = this.calculateLinearTrend(values);
        const absSlope = Math.abs(trend);
        
        trends[m] = {
          direction: absSlope < 0.01 ? 'stable' : trend > 0 ? 'increasing' : 'decreasing',
          slope: parseFloat(trend.toFixed(4)),
          correlation: parseFloat(this.calculateCorrelation(values).toFixed(4)),
          dataPoints: values.length
        };
      } else {
        trends[m] = { 
          direction: 'insufficient_data', 
          slope: 0, 
          correlation: 0,
          dataPoints: values.length 
        };
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

  /**
   * Obtiene datos agrupados por hora para gráficas
   */
  async getHourlyData(whereClause, dateRange) {
    try {
      // Determinar si necesitamos agrupar por hora o por día
      const daysDiff = this.getDaysDifference(dateRange);
      const groupByHour = daysDiff <= 2; // Si es 2 días o menos, agrupar por hora

      if (groupByHour) {
        // Agrupar por hora (últimas 24-48 horas)
        const [tempHumData] = await Promise.all([
          DHT22Reading.findAll({
            where: whereClause,
            attributes: [
              [DHT22Reading.sequelize.fn('HOUR', DHT22Reading.sequelize.col('createdAt')), 'hour'],
              [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('temperature')), 'avgTemp'],
              [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('humidity')), 'avgHum']
            ],
            group: [DHT22Reading.sequelize.fn('HOUR', DHT22Reading.sequelize.col('createdAt'))],
            order: [[DHT22Reading.sequelize.fn('HOUR', DHT22Reading.sequelize.col('createdAt')), 'ASC']],
            raw: true
          })
        ]);

        // Crear array de 24 horas con datos
        const hourlyArray = Array.from({ length: 24 }, (_, i) => {
          const hourData = tempHumData.find(d => parseInt(d.hour) === i);
          if (hourData) {
            const temp = parseFloat(hourData.avgTemp) || 0;
            const hum = parseFloat(hourData.avgHum) || 0;
            return {
              hour: i,
              temperature: parseFloat(temp.toFixed(2)),
              humidity: parseFloat(hum.toFixed(2))
            };
          }
          return {
            hour: i,
            temperature: 0,
            humidity: 0
          };
        });

        return hourlyArray;
      } else {
        // Agrupar por día (más de 2 días)
        const [tempHumData] = await Promise.all([
          DHT22Reading.findAll({
            where: whereClause,
            attributes: [
              [DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt')), 'date'],
              [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('temperature')), 'avgTemp'],
              [DHT22Reading.sequelize.fn('AVG', DHT22Reading.sequelize.col('humidity')), 'avgHum']
            ],
            group: [DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt'))],
            order: [[DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt')), 'ASC']],
            raw: true
          })
        ]);

        // Convertir a formato compatible (usar índice en lugar de hora)
        return tempHumData.map((d, index) => {
          const temp = parseFloat(d.avgTemp) || 0;
          const hum = parseFloat(d.avgHum) || 0;
          return {
            hour: index, // Usar índice como "hora" para compatibilidad
            temperature: parseFloat(temp.toFixed(2)),
            humidity: parseFloat(hum.toFixed(2)),
            date: d.date // Incluir fecha para referencia
          };
        });
      }
    } catch (error) {
      console.error('Error en getHourlyData:', error);
      return [];
    }
  }

  /**
   * Determina el nivel de peligro del CO
   */
  getCOLevel(ppm) {
    if (ppm < 9) return 'safe';
    if (ppm < 35) return 'caution';
    if (ppm < 100) return 'warning';
    if (ppm < 400) return 'danger';
    return 'extreme';
  }

  /**
   * Determina el nivel de peligro del CH4
   */
  getCH4Level(ppm) {
    if (ppm < 1000) return 'safe';
    if (ppm < 5000) return 'caution';
    if (ppm < 10000) return 'warning';
    if (ppm < 50000) return 'danger';
    return 'extreme';
  }

  /**
   * Retorna un resumen vacío cuando no hay datos
   */
  getEmptySummary(dateRange, period) {
    return {
      metadata: {
        generatedAt: getCurrentDate(),
        period,
        dateRange
      },
      summary: {
        totalReadings: 0,
        activeAlerts: 0,
        uniqueDevices: 0,
        averages: {
          temperature: 0,
          humidity: 0
        },
        gasLevels: {
          co: { current: 0, average: 0, level: 'safe' },
          ch4: { current: 0, average: 0, level: 'safe' },
          h2s: { current: 0, average: 0, level: 'safe' }
        },
        hourlyData: [],
        systemHealth: 'unknown',
        readingsPerDay: 0
      }
    };
  }
}

module.exports = new ReportsService();