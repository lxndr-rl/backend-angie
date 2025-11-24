const { Alert, User, SystemConfig } = require('../../models');
const { Op } = require('sequelize');
const { DEFAULT_CONFIG, ALERT_TYPES, ALERT_SEVERITY } = require('../../shared/constants');
const { getStartOfDay, getEndOfDay, getCurrentDate } = require('../../shared/utils/date');

class EnvironmentalService {
  /**
   * Registra datos de sensores IoT (ESP32)
   * @param {Object} data - Datos de sensores
   * @returns {Object} Datos registrados
   */
  async registerSensorData(data) {
    try {
      const {
        deviceId,
        temperature,
        humidity,
        mq135_ppm,
        mq135_voltage,
        mq7_ppm,
        mq7_voltage,
        mq4_ppm,
        mq4_voltage,
        mq136_ppm,
        mq136_voltage,
        latitude,
        longitude
      } = data;

      const { Device, DHT22Reading, MQ135Reading, MQ7Reading, MQ4Reading, MQ136Reading, Alert } = require('../../models');

      // Buscar o crear el dispositivo
      let device = await Device.findOne({ where: { deviceId } });
      
      if (!device) {
        console.log(`📱 Creando nuevo dispositivo: ${deviceId}`);
        device = await Device.create({
          deviceId,
          name: `Sensor ${deviceId}`,
          type: 'ESP32',
          isActive: true,
          lastConnection: new Date()
        });
      } else {
        // Actualizar última conexión
        await device.update({ lastConnection: new Date() });
      }

      const deviceDbId = device.id;
      const results = {};

      // Registrar lectura DHT22 (Temperatura y Humedad)
      if (temperature !== undefined && humidity !== undefined) {
        // Calcular índice de calor
        const heatIndex = this.calculateHeatIndex(temperature, humidity);
        
        const dht22Reading = await DHT22Reading.create({
          deviceId: deviceDbId,
          temperature: parseFloat(temperature),
          humidity: parseFloat(humidity),
          heatIndex: heatIndex
        });
        
        results.dht22 = dht22Reading;
        console.log(`✅ DHT22 registrado: ${temperature}°C, ${humidity}%`);

        // Verificar alertas de temperatura y humedad
        await this.checkTemperatureHumidityAlerts(deviceDbId, temperature, humidity, dht22Reading.id);
      }

      // Registrar lectura MQ-135 (Calidad del aire)
      if (mq135_ppm !== undefined) {
        const airQuality = this.calculateAirQuality(mq135_ppm);
        const airQualityIndex = this.calculateAirQualityIndex(mq135_ppm);
        
        const mq135Reading = await MQ135Reading.create({
          deviceId: deviceDbId,
          ppm: parseFloat(mq135_ppm),
          voltage: mq135_voltage ? parseFloat(mq135_voltage) : null,
          resistance: mq135_voltage ? this.calculateResistance(mq135_voltage) : null,
          airQualityIndex: airQualityIndex,
          airQuality: airQuality
        });
        
        results.mq135 = mq135Reading;
        console.log(`✅ MQ-135 registrado: ${mq135_ppm} PPM (${airQuality})`);

        // Verificar alertas de calidad del aire
        await this.checkAirQualityAlerts(deviceDbId, mq135_ppm, airQuality, mq135Reading.id);
      }

      // Registrar lectura MQ-7 (Monóxido de Carbono)
      if (mq7_ppm !== undefined) {
        const dangerLevel = this.calculateCODangerLevel(mq7_ppm);
        
        const mq7Reading = await MQ7Reading.create({
          deviceId: deviceDbId,
          co_ppm: parseFloat(mq7_ppm),
          voltage: mq7_voltage ? parseFloat(mq7_voltage) : null,
          resistance: mq7_voltage ? this.calculateResistance(mq7_voltage) : null,
          dangerLevel: dangerLevel
        });
        
        results.mq7 = mq7Reading;
        console.log(`✅ MQ-7 registrado: ${mq7_ppm} PPM CO (${dangerLevel})`);

        // Verificar alertas de CO
        await this.checkCOAlerts(deviceDbId, mq7_ppm, dangerLevel, mq7Reading.id);
      }

      // Registrar lectura MQ-4 (Metano)
      if (mq4_ppm !== undefined) {
        const dangerLevel = this.calculateCH4DangerLevel(mq4_ppm);
        
        const mq4Reading = await MQ4Reading.create({
          deviceId: deviceDbId,
          ch4_ppm: parseFloat(mq4_ppm),
          voltage: mq4_voltage ? parseFloat(mq4_voltage) : null,
          resistance: mq4_voltage ? this.calculateResistance(mq4_voltage) : null,
          dangerLevel: dangerLevel
        });
        
        results.mq4 = mq4Reading;
        console.log(`✅ MQ-4 registrado: ${mq4_ppm} PPM CH4 (${dangerLevel})`);

        // Verificar alertas de metano
        await this.checkCH4Alerts(deviceDbId, mq4_ppm, dangerLevel, mq4Reading.id);
      }

      // Registrar lectura MQ-136 (Sulfuro de Hidrógeno) - Opcional
      if (mq136_ppm !== undefined) {
        const dangerLevel = this.calculateH2SDangerLevel(mq136_ppm);
        
        const mq136Reading = await MQ136Reading.create({
          deviceId: deviceDbId,
          h2s_ppm: parseFloat(mq136_ppm),
          voltage: mq136_voltage ? parseFloat(mq136_voltage) : null,
          resistance: mq136_voltage ? this.calculateResistance(mq136_voltage) : null,
          dangerLevel: dangerLevel
        });
        
        results.mq136 = mq136Reading;
        console.log(`✅ MQ-136 registrado: ${mq136_ppm} PPM H2S (${dangerLevel})`);

        // Verificar alertas de H2S
        await this.checkH2SAlerts(deviceDbId, mq136_ppm, dangerLevel, mq136Reading.id);
      }

      return {
        success: true,
        deviceId: deviceId,
        deviceDbId: deviceDbId,
        timestamp: new Date(),
        readings: results
      };

    } catch (error) {
      console.error('Error en EnvironmentalService.registerSensorData:', error);
      throw error;
    }
  }

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
   * @param {string} deviceId - ID del dispositivo (string como "ESP32_AIR_001")
   * @returns {Object|null} Últimos datos del dispositivo
   */
  async getLatestDataByDevice(deviceId) {
    try {
      const { Device, DHT22Reading, MQ135Reading, MQ7Reading, MQ4Reading, MQ136Reading } = require('../../models');

      // Buscar el dispositivo por deviceId (string)
      const device = await Device.findOne({
        where: { deviceId: deviceId },
        raw: false
      });

      if (!device) {
        return null;
      }

      // Obtener última lectura de cada sensor
      const [dht22, mq135, mq7, mq4, mq136] = await Promise.all([
        DHT22Reading.findOne({
          where: { deviceId: device.id },
          order: [['createdAt', 'DESC']],
          raw: true
        }),
        MQ135Reading.findOne({
          where: { deviceId: device.id },
          order: [['createdAt', 'DESC']],
          raw: true
        }),
        MQ7Reading.findOne({
          where: { deviceId: device.id },
          order: [['createdAt', 'DESC']],
          raw: true
        }),
        MQ4Reading.findOne({
          where: { deviceId: device.id },
          order: [['createdAt', 'DESC']],
          raw: true
        }),
        MQ136Reading.findOne({
          where: { deviceId: device.id },
          order: [['createdAt', 'DESC']],
          raw: true
        })
      ]);

      return {
        id: device.id,
        deviceId: device.deviceId,
        name: device.name,
        type: device.type,
        isActive: device.isActive,
        lastConnection: device.lastConnection,
        firmwareVersion: device.firmwareVersion,
        notes: device.notes,
        createdAt: device.createdAt,
        updatedAt: device.updatedAt,
        latestReadings: {
          dht22: dht22 || null,
          mq135: mq135 || null,
          mq7: mq7 || null,
          mq4: mq4 || null,
          mq136: mq136 || null
        },
        isOnline: this.isDeviceOnline(device.lastConnection)
      };
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
      const { Device, DHT22Reading, MQ135Reading, MQ7Reading, MQ4Reading, MQ136Reading } = require('../../models');

      // Obtener todos los dispositivos
      const devices = await Device.findAll({
        where: { isActive: true },
        order: [['lastConnection', 'DESC']],
        raw: false
      });

      // Para cada dispositivo, obtener sus últimas lecturas
      const devicesWithData = await Promise.all(
        devices.map(async (device) => {
          try {
            // Obtener última lectura de cada sensor
            const [dht22, mq135, mq7, mq4, mq136] = await Promise.all([
              DHT22Reading.findOne({
                where: { deviceId: device.id },
                order: [['createdAt', 'DESC']],
                raw: true
              }),
              MQ135Reading.findOne({
                where: { deviceId: device.id },
                order: [['createdAt', 'DESC']],
                raw: true
              }),
              MQ7Reading.findOne({
                where: { deviceId: device.id },
                order: [['createdAt', 'DESC']],
                raw: true
              }),
              MQ4Reading.findOne({
                where: { deviceId: device.id },
                order: [['createdAt', 'DESC']],
                raw: true
              }),
              MQ136Reading.findOne({
                where: { deviceId: device.id },
                order: [['createdAt', 'DESC']],
                raw: true
              })
            ]);

            return {
              id: device.id,
              deviceId: device.deviceId,
              name: device.name,
              type: device.type,
              isActive: device.isActive,
              lastConnection: device.lastConnection,
              firmwareVersion: device.firmwareVersion,
              notes: device.notes,
              createdAt: device.createdAt,
              updatedAt: device.updatedAt,
              latestReadings: {
                dht22: dht22 || null,
                mq135: mq135 || null,
                mq7: mq7 || null,
                mq4: mq4 || null,
                mq136: mq136 || null
              },
              isOnline: this.isDeviceOnline(device.lastConnection)
            };
          } catch (error) {
            console.error(`Error obteniendo datos del dispositivo ${device.deviceId}:`, error);
            return {
              id: device.id,
              deviceId: device.deviceId,
              name: device.name,
              type: device.type,
              isActive: device.isActive,
              lastConnection: device.lastConnection,
              firmwareVersion: device.firmwareVersion,
              notes: device.notes,
              createdAt: device.createdAt,
              updatedAt: device.updatedAt,
              latestReadings: {
                dht22: null,
                mq135: null,
                mq7: null,
                mq4: null,
                mq136: null
              },
              isOnline: false
            };
          }
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
    if (!lastTimestamp) return false;
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

  // ============ FUNCIONES AUXILIARES PARA SENSORES IoT ============

  /**
   * Calcula el índice de calor (Heat Index)
   */
  calculateHeatIndex(temperature, humidity) {
    const T = temperature;
    const RH = humidity;
    
    // Fórmula simplificada del índice de calor
    const HI = -8.78469475556 + 
               1.61139411 * T + 
               2.33854883889 * RH + 
               -0.14611605 * T * RH + 
               -0.012308094 * T * T + 
               -0.0164248277778 * RH * RH + 
               0.002211732 * T * T * RH + 
               0.00072546 * T * RH * RH + 
               -0.000003582 * T * T * RH * RH;
    
    return parseFloat(HI.toFixed(2));
  }

  /**
   * Calcula la resistencia del sensor basada en el voltaje
   */
  calculateResistance(voltage, RL = 10.0) {
    if (voltage <= 0) return null;
    const RS = ((3.3 * RL) / voltage) - RL;
    return parseFloat(RS.toFixed(2));
  }

  /**
   * Calcula la calidad del aire basada en PPM del MQ-135
   */
  calculateAirQuality(ppm) {
    if (ppm < 50) return 'excellent';
    if (ppm < 100) return 'good';
    if (ppm < 150) return 'moderate';
    if (ppm < 200) return 'poor';
    return 'hazardous';
  }

  /**
   * Calcula el índice de calidad del aire (0-500)
   */
  calculateAirQualityIndex(ppm) {
    // Conversión simplificada de PPM a AQI
    return Math.min(Math.round(ppm / 2), 500);
  }

  /**
   * Calcula el nivel de peligro de CO (Monóxido de Carbono)
   */
  calculateCODangerLevel(co_ppm) {
    if (co_ppm < 9) return 'safe';
    if (co_ppm < 35) return 'caution';
    if (co_ppm < 100) return 'warning';
    if (co_ppm < 400) return 'danger';
    return 'extreme';
  }

  /**
   * Calcula el nivel de peligro de CH4 (Metano)
   */
  calculateCH4DangerLevel(ch4_ppm) {
    if (ch4_ppm < 1000) return 'safe';
    if (ch4_ppm < 5000) return 'caution';
    if (ch4_ppm < 10000) return 'warning';
    if (ch4_ppm < 50000) return 'danger';
    return 'extreme';
  }

  /**
   * Calcula el nivel de peligro de H2S (Sulfuro de Hidrógeno)
   */
  calculateH2SDangerLevel(h2s_ppm) {
    if (h2s_ppm < 10) return 'safe';
    if (h2s_ppm < 50) return 'caution';
    if (h2s_ppm < 100) return 'warning';
    if (h2s_ppm < 500) return 'danger';
    return 'extreme';
  }

  /**
   * Verifica y crea alertas de temperatura y humedad
   */
  async checkTemperatureHumidityAlerts(deviceId, temperature, humidity, readingId) {
    try {
      const { Alert } = require('../../models');
      const config = await this.getSystemConfig();

      // Alerta de temperatura
      if (temperature < 18) {
        await Alert.create({
          type: 'temperature',
          severity: temperature < 10 ? 'critical' : 'high',
          title: 'Temperatura Baja',
          message: `Temperatura muy baja detectada: ${temperature}°C`,
          userId: 1, // Usuario admin por defecto
          deviceId: deviceId,
          sensorType: 'dht22',
          readingId: readingId,
          triggerValue: temperature,
          thresholdValue: 18
        });
      } else if (temperature > 35) {
        await Alert.create({
          type: 'temperature',
          severity: temperature > 40 ? 'critical' : 'high',
          title: 'Temperatura Alta',
          message: `Temperatura muy alta detectada: ${temperature}°C`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'dht22',
          readingId: readingId,
          triggerValue: temperature,
          thresholdValue: 35
        });
      }

      // Alerta de humedad
      if (humidity < 30) {
        await Alert.create({
          type: 'humidity',
          severity: humidity < 20 ? 'critical' : 'medium',
          title: 'Humedad Baja',
          message: `Humedad muy baja detectada: ${humidity}%`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'dht22',
          readingId: readingId,
          triggerValue: humidity,
          thresholdValue: 30
        });
      } else if (humidity > 80) {
        await Alert.create({
          type: 'humidity',
          severity: humidity > 90 ? 'critical' : 'medium',
          title: 'Humedad Alta',
          message: `Humedad muy alta detectada: ${humidity}%`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'dht22',
          readingId: readingId,
          triggerValue: humidity,
          thresholdValue: 80
        });
      }
    } catch (error) {
      console.error('Error verificando alertas de temperatura/humedad:', error);
    }
  }

  /**
   * Verifica y crea alertas de calidad del aire
   */
  async checkAirQualityAlerts(deviceId, ppm, airQuality, readingId) {
    try {
      const { Alert } = require('../../models');

      if (airQuality === 'poor' || airQuality === 'hazardous') {
        await Alert.create({
          type: 'air_quality',
          severity: airQuality === 'hazardous' ? 'critical' : 'high',
          title: 'Calidad del Aire Deficiente',
          message: `Calidad del aire ${airQuality}: ${ppm} PPM`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'mq135',
          readingId: readingId,
          triggerValue: ppm,
          thresholdValue: 150
        });
      }
    } catch (error) {
      console.error('Error verificando alertas de calidad del aire:', error);
    }
  }

  /**
   * Verifica y crea alertas de CO
   */
  async checkCOAlerts(deviceId, co_ppm, dangerLevel, readingId) {
    try {
      const { Alert } = require('../../models');

      if (dangerLevel !== 'safe') {
        let severity = 'medium';
        if (dangerLevel === 'extreme') severity = 'critical';
        else if (dangerLevel === 'danger') severity = 'critical';
        else if (dangerLevel === 'warning') severity = 'high';

        await Alert.create({
          type: 'co',
          severity: severity,
          title: 'Monóxido de Carbono Detectado',
          message: `Nivel de CO ${dangerLevel}: ${co_ppm} PPM`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'mq7',
          readingId: readingId,
          triggerValue: co_ppm,
          thresholdValue: 9
        });
      }
    } catch (error) {
      console.error('Error verificando alertas de CO:', error);
    }
  }

  /**
   * Verifica y crea alertas de CH4
   */
  async checkCH4Alerts(deviceId, ch4_ppm, dangerLevel, readingId) {
    try {
      const { Alert } = require('../../models');

      if (dangerLevel !== 'safe') {
        let severity = 'medium';
        if (dangerLevel === 'extreme') severity = 'critical';
        else if (dangerLevel === 'danger') severity = 'critical';
        else if (dangerLevel === 'warning') severity = 'high';

        await Alert.create({
          type: 'ch4',
          severity: severity,
          title: 'Metano Detectado',
          message: `Nivel de metano ${dangerLevel}: ${ch4_ppm} PPM`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'mq4',
          readingId: readingId,
          triggerValue: ch4_ppm,
          thresholdValue: 1000
        });
      }
    } catch (error) {
      console.error('Error verificando alertas de CH4:', error);
    }
  }

  /**
   * Verifica y crea alertas de H2S
   */
  async checkH2SAlerts(deviceId, h2s_ppm, dangerLevel, readingId) {
    try {
      const { Alert } = require('../../models');

      if (dangerLevel !== 'safe') {
        let severity = 'medium';
        if (dangerLevel === 'extreme') severity = 'critical';
        else if (dangerLevel === 'danger') severity = 'critical';
        else if (dangerLevel === 'warning') severity = 'high';

        await Alert.create({
          type: 'h2s',
          severity: severity,
          title: 'Sulfuro de Hidrógeno Detectado',
          message: `Nivel de H2S ${dangerLevel}: ${h2s_ppm} PPM`,
          userId: 1,
          deviceId: deviceId,
          sensorType: 'mq136',
          readingId: readingId,
          triggerValue: h2s_ppm,
          thresholdValue: 10
        });
      }
    } catch (error) {
      console.error('Error verificando alertas de H2S:', error);
    }
  }

  /**
   * Obtiene la configuración del sistema
   */
  async getSystemConfig() {
    try {
      const { SystemConfig } = require('../../models');
      const config = await SystemConfig.findOne();
      return config || {};
    } catch (error) {
      console.error('Error obteniendo configuración del sistema:', error);
      return {};
    }
  }
}

module.exports = new EnvironmentalService();