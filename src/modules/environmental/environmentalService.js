const { EnvironmentalData, Alert, User, SystemConfig } = require('../../models');
const { Op } = require('sequelize');
const { DEFAULT_CONFIG, ALERT_TYPES, ALERT_SEVERITY } = require('../../shared/constants');
const { getStartOfDay, getEndOfDay, getCurrentDate } = require('../../shared/utils/date');

class EnvironmentalService {
  /**
   * Registra nuevos datos ambientales
   * @param {Object} data - Datos ambientales
   * @returns {Object} Datos registrados
   */
  async registerEnvironmentalData(data) {
    try {
      const {
        temperature,
        humidity,
        light,
        ph,
        deviceId,
        latitude,
        longitude,
        userId
      } = data;

      // Crear el registro de datos ambientales
      const environmentalData = await EnvironmentalData.create({
        temperature,
        humidity,
        light,
        ph,
        deviceId,
        latitude,
        longitude,
        userId,
        timestamp: getCurrentDate()
      });

      // Verificar si los datos están fuera de los rangos y generar alertas
      await this.checkAndCreateAlerts(environmentalData);

      return environmentalData;
    } catch (error) {
      console.error('Error en EnvironmentalService.registerEnvironmentalData:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos ambientales con filtros y paginación
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Datos paginados
   */
  async getEnvironmentalData(options = {}) {
    try {
      const {
        page = 1,
        limit = 50,
        deviceId,
        userId,
        startDate,
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;

      // Construir filtros
      const whereClause = {};

      if (deviceId) {
        whereClause.deviceId = deviceId;
      }

      if (userId) {
        whereClause.userId = userId;
      }

      if (startDate && endDate) {
        whereClause.timestamp = {
          [Op.between]: [getStartOfDay(startDate), getEndOfDay(endDate)]
        };
      } else if (startDate) {
        whereClause.timestamp = {
          [Op.gte]: getStartOfDay(startDate)
        };
      } else if (endDate) {
        whereClause.timestamp = {
          [Op.lte]: getEndOfDay(endDate)
        };
      }

      const { rows: data, count: total } = await EnvironmentalData.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        raw: false
      });

      return {
        data,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error en EnvironmentalService.getEnvironmentalData:', error);
      throw new Error('Error al obtener datos ambientales');
    }
  }

  /**
   * Obtiene los últimos datos por dispositivo
   * @param {string} deviceId - ID del dispositivo
   * @returns {Object|null} Últimos datos del dispositivo
   */
  async getLatestDataByDevice(deviceId) {
    try {
      const latestData = await EnvironmentalData.findOne({
        where: { deviceId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'username']
          }
        ],
        order: [['timestamp', 'DESC']],
        raw: false
      });

      return latestData;
    } catch (error) {
      console.error('Error en EnvironmentalService.getLatestDataByDevice:', error);
      throw new Error('Error al obtener últimos datos del dispositivo');
    }
  }

  /**
   * Obtiene estadísticas de datos ambientales
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Estadísticas
   */
  async getEnvironmentalStats(options = {}) {
    try {
      const {
        deviceId,
        userId,
        startDate,
        endDate,
        period = 'day' // day, week, month
      } = options;

      // Construir filtros base
      const whereClause = {};

      if (deviceId) {
        whereClause.deviceId = deviceId;
      }

      if (userId) {
        whereClause.userId = userId;
      }

      // Establecer rango de fechas por defecto según el período
      let start, end;
      if (startDate && endDate) {
        start = getStartOfDay(startDate);
        end = getEndOfDay(endDate);
      } else {
        end = new Date();
        switch (period) {
          case 'week':
            start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
          default: // day
            start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
        }
      }

      whereClause.timestamp = {
        [Op.between]: [start, end]
      };

      // Obtener estadísticas agregadas
      const stats = await EnvironmentalData.findAll({
        where: whereClause,
        attributes: [
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('temperature')), 'avgTemperature'],
          [EnvironmentalData.sequelize.fn('MIN', EnvironmentalData.sequelize.col('temperature')), 'minTemperature'],
          [EnvironmentalData.sequelize.fn('MAX', EnvironmentalData.sequelize.col('temperature')), 'maxTemperature'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('humidity')), 'avgHumidity'],
          [EnvironmentalData.sequelize.fn('MIN', EnvironmentalData.sequelize.col('humidity')), 'minHumidity'],
          [EnvironmentalData.sequelize.fn('MAX', EnvironmentalData.sequelize.col('humidity')), 'maxHumidity'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('light')), 'avgLight'],
          [EnvironmentalData.sequelize.fn('MIN', EnvironmentalData.sequelize.col('light')), 'minLight'],
          [EnvironmentalData.sequelize.fn('MAX', EnvironmentalData.sequelize.col('light')), 'maxLight'],
          [EnvironmentalData.sequelize.fn('AVG', EnvironmentalData.sequelize.col('ph')), 'avgPh'],
          [EnvironmentalData.sequelize.fn('MIN', EnvironmentalData.sequelize.col('ph')), 'minPh'],
          [EnvironmentalData.sequelize.fn('MAX', EnvironmentalData.sequelize.col('ph')), 'maxPh'],
          [EnvironmentalData.sequelize.fn('COUNT', EnvironmentalData.sequelize.col('id')), 'totalReadings']
        ],
        raw: true
      });

      const result = stats[0] || {};

      // Redondear valores decimales
      Object.keys(result).forEach(key => {
        if (typeof result[key] === 'string' && !isNaN(result[key])) {
          result[key] = parseFloat(parseFloat(result[key]).toFixed(2));
        }
      });

      // Obtener configuración para comparaciones
      const config = await SystemConfig.findOne();
      const thresholds = config || DEFAULT_CONFIG;

      return {
        period,
        dateRange: { start, end },
        statistics: result,
        thresholds: {
          temperature: {
            min: thresholds.temperatureMin || DEFAULT_CONFIG.TEMPERATURE_MIN,
            max: thresholds.temperatureMax || DEFAULT_CONFIG.TEMPERATURE_MAX
          },
          humidity: {
            min: thresholds.humidityMin || DEFAULT_CONFIG.HUMIDITY_MIN,
            max: thresholds.humidityMax || DEFAULT_CONFIG.HUMIDITY_MAX
          },
          light: {
            min: thresholds.lightMin || DEFAULT_CONFIG.LIGHT_MIN,
            max: thresholds.lightMax || DEFAULT_CONFIG.LIGHT_MAX
          },
          ph: {
            min: thresholds.phMin || DEFAULT_CONFIG.PH_MIN,
            max: thresholds.phMax || DEFAULT_CONFIG.PH_MAX
          }
        }
      };
    } catch (error) {
      console.error('Error en EnvironmentalService.getEnvironmentalStats:', error);
      throw new Error('Error al obtener estadísticas ambientales');
    }
  }

  /**
   * Obtiene dispositivos únicos con sus últimas lecturas
   * @param {number} userId - ID del usuario (opcional)
   * @returns {Array} Lista de dispositivos
   */
  async getDevicesWithLatestData(userId = null) {
    try {
      const whereClause = userId ? { userId } : {};

      // Obtener dispositivos únicos
      const devices = await EnvironmentalData.findAll({
        where: whereClause,
        attributes: ['deviceId'],
        group: ['deviceId'],
        raw: true
      });

      // Para cada dispositivo, obtener sus últimos datos
      const devicesWithData = await Promise.all(
        devices.map(async (device) => {
          const latestData = await this.getLatestDataByDevice(device.deviceId);
          return {
            deviceId: device.deviceId,
            latestData: latestData,
            isOnline: latestData ? this.isDeviceOnline(latestData.timestamp) : false
          };
        })
      );

      return devicesWithData;
    } catch (error) {
      console.error('Error en EnvironmentalService.getDevicesWithLatestData:', error);
      throw new Error('Error al obtener dispositivos');
    }
  }

  /**
   * Verifica si un dispositivo está online basado en su última lectura
   * @param {Date} lastTimestamp - Última fecha de lectura
   * @returns {boolean} True si está online
   */
  isDeviceOnline(lastTimestamp) {
    const now = new Date();
    const diffMinutes = (now - new Date(lastTimestamp)) / (1000 * 60);
    return diffMinutes <= 15; // Consideramos offline si no hay datos en 15 minutos
  }

  /**
   * Verifica los datos y crea alertas si es necesario
   * @param {Object} data - Datos ambientales
   */
  async checkAndCreateAlerts(data) {
    try {
      // Obtener configuración actual
      const config = await SystemConfig.findOne();
      const thresholds = config || DEFAULT_CONFIG;

      if (!thresholds.alertsEnabled) {
        return; // Alertas desactivadas
      }

      const alerts = [];

      // Verificar temperatura
      if (data.temperature < (thresholds.temperatureMin || DEFAULT_CONFIG.TEMPERATURE_MIN)) {
        alerts.push({
          type: ALERT_TYPES.TEMPERATURE_LOW,
          severity: this.calculateSeverity('temperature', data.temperature, thresholds.temperatureMin || DEFAULT_CONFIG.TEMPERATURE_MIN, 'low'),
          message: `Temperatura muy baja: ${data.temperature}°C (mínimo: ${thresholds.temperatureMin || DEFAULT_CONFIG.TEMPERATURE_MIN}°C)`,
          value: data.temperature,
          threshold: thresholds.temperatureMin || DEFAULT_CONFIG.TEMPERATURE_MIN
        });
      } else if (data.temperature > (thresholds.temperatureMax || DEFAULT_CONFIG.TEMPERATURE_MAX)) {
        alerts.push({
          type: ALERT_TYPES.TEMPERATURE_HIGH,
          severity: this.calculateSeverity('temperature', data.temperature, thresholds.temperatureMax || DEFAULT_CONFIG.TEMPERATURE_MAX, 'high'),
          message: `Temperatura muy alta: ${data.temperature}°C (máximo: ${thresholds.temperatureMax || DEFAULT_CONFIG.TEMPERATURE_MAX}°C)`,
          value: data.temperature,
          threshold: thresholds.temperatureMax || DEFAULT_CONFIG.TEMPERATURE_MAX
        });
      }

      // Verificar humedad
      if (data.humidity < (thresholds.humidityMin || DEFAULT_CONFIG.HUMIDITY_MIN)) {
        alerts.push({
          type: ALERT_TYPES.HUMIDITY_LOW,
          severity: this.calculateSeverity('humidity', data.humidity, thresholds.humidityMin || DEFAULT_CONFIG.HUMIDITY_MIN, 'low'),
          message: `Humedad muy baja: ${data.humidity}% (mínimo: ${thresholds.humidityMin || DEFAULT_CONFIG.HUMIDITY_MIN}%)`,
          value: data.humidity,
          threshold: thresholds.humidityMin || DEFAULT_CONFIG.HUMIDITY_MIN
        });
      } else if (data.humidity > (thresholds.humidityMax || DEFAULT_CONFIG.HUMIDITY_MAX)) {
        alerts.push({
          type: ALERT_TYPES.HUMIDITY_HIGH,
          severity: this.calculateSeverity('humidity', data.humidity, thresholds.humidityMax || DEFAULT_CONFIG.HUMIDITY_MAX, 'high'),
          message: `Humedad muy alta: ${data.humidity}% (máximo: ${thresholds.humidityMax || DEFAULT_CONFIG.HUMIDITY_MAX}%)`,
          value: data.humidity,
          threshold: thresholds.humidityMax || DEFAULT_CONFIG.HUMIDITY_MAX
        });
      }

      // Verificar luz
      if (data.light < (thresholds.lightMin || DEFAULT_CONFIG.LIGHT_MIN)) {
        alerts.push({
          type: ALERT_TYPES.LIGHT_LOW,
          severity: this.calculateSeverity('light', data.light, thresholds.lightMin || DEFAULT_CONFIG.LIGHT_MIN, 'low'),
          message: `Nivel de luz muy bajo: ${data.light} lux (mínimo: ${thresholds.lightMin || DEFAULT_CONFIG.LIGHT_MIN} lux)`,
          value: data.light,
          threshold: thresholds.lightMin || DEFAULT_CONFIG.LIGHT_MIN
        });
      } else if (data.light > (thresholds.lightMax || DEFAULT_CONFIG.LIGHT_MAX)) {
        alerts.push({
          type: ALERT_TYPES.LIGHT_HIGH,
          severity: this.calculateSeverity('light', data.light, thresholds.lightMax || DEFAULT_CONFIG.LIGHT_MAX, 'high'),
          message: `Nivel de luz muy alto: ${data.light} lux (máximo: ${thresholds.lightMax || DEFAULT_CONFIG.LIGHT_MAX} lux)`,
          value: data.light,
          threshold: thresholds.lightMax || DEFAULT_CONFIG.LIGHT_MAX
        });
      }

      // Verificar pH
      if (data.ph < (thresholds.phMin || DEFAULT_CONFIG.PH_MIN)) {
        alerts.push({
          type: ALERT_TYPES.PH_LOW,
          severity: this.calculateSeverity('ph', data.ph, thresholds.phMin || DEFAULT_CONFIG.PH_MIN, 'low'),
          message: `pH muy bajo: ${data.ph} (mínimo: ${thresholds.phMin || DEFAULT_CONFIG.PH_MIN})`,
          value: data.ph,
          threshold: thresholds.phMin || DEFAULT_CONFIG.PH_MIN
        });
      } else if (data.ph > (thresholds.phMax || DEFAULT_CONFIG.PH_MAX)) {
        alerts.push({
          type: ALERT_TYPES.PH_HIGH,
          severity: this.calculateSeverity('ph', data.ph, thresholds.phMax || DEFAULT_CONFIG.PH_MAX, 'high'),
          message: `pH muy alto: ${data.ph} (máximo: ${thresholds.phMax || DEFAULT_CONFIG.PH_MAX})`,
          value: data.ph,
          threshold: thresholds.phMax || DEFAULT_CONFIG.PH_MAX
        });
      }

      // Crear alertas en la base de datos
      for (const alertData of alerts) {
        await Alert.create({
          ...alertData,
          deviceId: data.deviceId,
          userId: data.userId,
          environmentalDataId: data.id,
          timestamp: getCurrentDate(),
          status: 'active'
        });
      }

    } catch (error) {
      console.error('Error en EnvironmentalService.checkAndCreateAlerts:', error);
      // No lanzar error para no afectar el registro de datos
    }
  }

  /**
   * Calcula la severidad de una alerta basada en qué tan lejos está del threshold
   * @param {string} type - Tipo de sensor
   * @param {number} value - Valor actual
   * @param {number} threshold - Valor límite
   * @param {string} direction - 'high' o 'low'
   * @returns {string} Severidad de la alerta
   */
  calculateSeverity(type, value, threshold, direction) {
    const diff = Math.abs(value - threshold);
    const percentage = (diff / threshold) * 100;

    if (percentage >= 50) return ALERT_SEVERITY.CRITICAL;
    if (percentage >= 25) return ALERT_SEVERITY.HIGH;
    if (percentage >= 10) return ALERT_SEVERITY.MEDIUM;
    return ALERT_SEVERITY.LOW;
  }
}

module.exports = new EnvironmentalService();