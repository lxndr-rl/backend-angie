const environmentalService = require('./environmentalService');
const { successResponse, errorResponse, createdResponse } = require('../../shared/utils/response');
const { USER_ROLES } = require('../../shared/constants');

class EnvironmentalController {
  /**
   * Registra datos de sensores IoT (ESP32) - Endpoint público
   */
  async registerSensorData(req, res) {
    try {
      console.log('🤖 [ESP32] registerSensorData - Inicio del procesamiento');
      console.log('🤖 [ESP32] Body recibido:', JSON.stringify(req.body, null, 2));
      console.log('🤖 [ESP32] Headers:', JSON.stringify(req.headers, null, 2));

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
      } = req.body;

      // Validaciones básicas
      if (!deviceId) {
        console.error('🤖 [ESP32] Error: deviceId no proporcionado');
        return errorResponse(res, 'El deviceId es requerido', 400);
      }

      if (temperature === undefined || humidity === undefined) {
        console.error('🤖 [ESP32] Error: temperatura o humedad no proporcionados');
        return errorResponse(res, 'Temperatura y humedad son requeridos', 400);
      }

      console.log(`📡 Datos recibidos del dispositivo ${deviceId}:`, {
        temperature,
        humidity,
        mq135_ppm,
        mq7_ppm,
        mq4_ppm,
        mq136_ppm
      });

      // Registrar datos de sensores
      const result = await environmentalService.registerSensorData({
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
      });

      console.log('🤖 [ESP32] ✅ Datos registrados exitosamente');
      return createdResponse(
        res,
        result,
        'Datos de sensores registrados exitosamente'
      );
    } catch (error) {
      console.error('🤖 [ESP32] ❌ Error en EnvironmentalController.registerSensorData:', error);
      console.error('🤖 [ESP32] Stack:', error.stack);
      return errorResponse(res, error.message || 'Error al registrar datos de sensores', 500);
    }
  }

  /**
   * Registra nuevos datos ambientales (requiere autenticación)
   */
  async registerData(req, res) {
    try {
      const {
        temperature,
        humidity,
        light,
        ph,
        deviceId,
        latitude,
        longitude
      } = req.body;

      // Si hay usuario autenticado, asociar el registro a ese usuario;
      // si no, permitir registro anónimo (para dispositivos/sensores sin login).
      const userId = req.user ? req.user.id : null;

      const data = await environmentalService.registerEnvironmentalData({
        temperature,
        humidity,
        light,
        ph,
        deviceId,
        latitude,
        longitude,
        userId
      });

      return createdResponse(
        res,
        data,
        'Datos ambientales registrados exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.registerData:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene datos ambientales con filtros y paginación
   */
  async getEnvironmentalData(req, res) {
    try {
      const {
        page = 1,
        limit = 50,
        deviceId,
        startDate,
        endDate,
        sortBy = 'timestamp',
        sortOrder = 'DESC'
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const result = await environmentalService.getEnvironmentalData({
        page: parseInt(page),
        limit: parseInt(limit),
        deviceId,
        userId,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });

      return successResponse(
        res,
        result,
        'Datos ambientales obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getEnvironmentalData:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene los últimos datos de un dispositivo específico
   */
  async getLatestDataByDevice(req, res) {
    try {
      const { deviceId } = req.params;

      // Verificar que el usuario tenga acceso al dispositivo
      if (req.user.role !== USER_ROLES.ADMIN) {
        // Para usuarios normales, verificar que el dispositivo les pertenezca
        const deviceData = await environmentalService.getLatestDataByDevice(deviceId);
        if (deviceData && deviceData.userId !== req.user.id) {
          return errorResponse(res, 'No tienes permisos para acceder a este dispositivo', 403);
        }
      }

      const latestData = await environmentalService.getLatestDataByDevice(deviceId);

      if (!latestData) {
        return successResponse(
          res,
          null,
          'No se encontraron datos para este dispositivo'
        );
      }

      return successResponse(
        res,
        latestData,
        'Últimos datos del dispositivo obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getLatestDataByDevice:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene estadísticas de datos ambientales
   */
  async getEnvironmentalStats(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        period = 'day'
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const stats = await environmentalService.getEnvironmentalStats({
        deviceId,
        userId,
        startDate,
        endDate,
        period
      });

      return successResponse(
        res,
        stats,
        'Estadísticas ambientales obtenidas exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getEnvironmentalStats:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene lista de dispositivos con sus últimas lecturas
   */
  async getDevicesWithLatestData(req, res) {
    try {
      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const devices = await environmentalService.getDevicesWithLatestData(userId);

      return successResponse(
        res,
        devices,
        'Dispositivos obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getDevicesWithLatestData:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene datos ambientales para gráficos (formato optimizado)
   */
  async getDataForCharts(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        interval = 'hour', // hour, day, week
        limit = 100
      } = req.query;

      if (!deviceId) {
        return errorResponse(res, 'El ID del dispositivo es requerido', 400);
      }

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      // Verificar acceso al dispositivo para usuarios normales
      if (req.user.role !== USER_ROLES.ADMIN) {
        const deviceData = await environmentalService.getLatestDataByDevice(deviceId);
        if (deviceData && deviceData.userId !== req.user.id) {
          return errorResponse(res, 'No tienes permisos para acceder a este dispositivo', 403);
        }
      }

      const result = await environmentalService.getEnvironmentalData({
        page: 1,
        limit: parseInt(limit),
        deviceId,
        userId,
        startDate,
        endDate,
        sortBy: 'timestamp',
        sortOrder: 'ASC'
      });

      // Formatear datos para gráficos
      const chartData = result.data.map(item => ({
        timestamp: item.timestamp,
        temperature: parseFloat(item.temperature),
        humidity: parseFloat(item.humidity),
        light: parseFloat(item.light),
        ph: parseFloat(item.ph)
      }));

      return successResponse(
        res,
        {
          data: chartData,
          deviceId,
          interval,
          dateRange: {
            start: startDate,
            end: endDate
          },
          totalPoints: chartData.length
        },
        'Datos para gráficos obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getDataForCharts:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene resumen del estado actual de todos los sensores
   */
  async getCurrentSensorStatus(req, res) {
    try {
      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const devices = await environmentalService.getDevicesWithLatestData(userId);

      const summary = {
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.isOnline).length,
        offlineDevices: devices.filter(d => !d.isOnline).length,
        devices: devices.map(device => ({
          deviceId: device.deviceId,
          isOnline: device.isOnline,
          lastReading: device.latestData ? {
            timestamp: device.latestData.timestamp,
            temperature: device.latestData.temperature,
            humidity: device.latestData.humidity,
            light: device.latestData.light,
            ph: device.latestData.ph
          } : null
        }))
      };

      return successResponse(
        res,
        summary,
        'Estado actual de sensores obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getCurrentSensorStatus:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene historial de lecturas DHT22 (Temperatura y Humedad)
   */
  async getDHT22History(req, res) {
    try {
      const { deviceId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      const readings = await environmentalService.getDHT22History(deviceId, hours);

      return successResponse(
        res,
        readings,
        'Historial DHT22 obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getDHT22History:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene historial de lecturas MQ135 (Calidad del Aire)
   */
  async getMQ135History(req, res) {
    try {
      const { deviceId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      const readings = await environmentalService.getMQ135History(deviceId, hours);

      return successResponse(
        res,
        readings,
        'Historial MQ135 obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getMQ135History:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene historial de lecturas MQ7 (Monóxido de Carbono)
   */
  async getMQ7History(req, res) {
    try {
      const { deviceId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      const readings = await environmentalService.getMQ7History(deviceId, hours);

      return successResponse(
        res,
        readings,
        'Historial MQ7 obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getMQ7History:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene historial de lecturas MQ4 (Metano)
   */
  async getMQ4History(req, res) {
    try {
      const { deviceId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      const readings = await environmentalService.getMQ4History(deviceId, hours);

      return successResponse(
        res,
        readings,
        'Historial MQ4 obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getMQ4History:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene historial de lecturas MQ136 (Sulfuro de Hidrógeno)
   */
  async getMQ136History(req, res) {
    try {
      const { deviceId } = req.params;
      const hours = parseInt(req.query.hours) || 24;

      const readings = await environmentalService.getMQ136History(deviceId, hours);

      return successResponse(
        res,
        readings,
        'Historial MQ136 obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en EnvironmentalController.getMQ136History:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new EnvironmentalController();