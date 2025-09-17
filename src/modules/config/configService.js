const { SystemConfig } = require('../../models');
const { DEFAULT_CONFIG } = require('../../shared/constants');
const { getCurrentDate } = require('../../shared/utils/date');

class ConfigService {
  /**
   * Obtiene la configuración actual del sistema
   * @returns {Object} Configuración del sistema
   */
  async getSystemConfig() {
    try {
      let config = await SystemConfig.findOne();

      if (!config) {
        // Si no existe configuración, crear una con valores por defecto
        config = await this.createDefaultConfig();
      }

      return config;
    } catch (error) {
      console.error('Error en ConfigService.getSystemConfig:', error);
      throw new Error('Error al obtener configuración del sistema');
    }
  }

  /**
   * Actualiza la configuración del sistema
   * @param {Object} configData - Datos de configuración a actualizar
   * @returns {Object} Configuración actualizada
   */
  async updateSystemConfig(configData) {
    try {
      let config = await SystemConfig.findOne();

      if (!config) {
        // Si no existe configuración, crear una nueva
        config = await SystemConfig.create({
          ...DEFAULT_CONFIG,
          ...configData,
          updatedAt: getCurrentDate()
        });
      } else {
        // Actualizar configuración existente
        await config.update({
          ...configData,
          updatedAt: getCurrentDate()
        });
      }

      return config;
    } catch (error) {
      console.error('Error en ConfigService.updateSystemConfig:', error);
      throw error;
    }
  }

  /**
   * Crea configuración por defecto
   * @returns {Object} Configuración creada
   */
  async createDefaultConfig() {
    try {
      // Crear configuración de umbrales para cacao
      const config = await SystemConfig.create({
        configKey: 'cacao_thresholds',
        configValue: {
          temperatureMin: DEFAULT_CONFIG.TEMPERATURE_MIN,
          temperatureMax: DEFAULT_CONFIG.TEMPERATURE_MAX,
          humidityMin: DEFAULT_CONFIG.HUMIDITY_MIN,
          humidityMax: DEFAULT_CONFIG.HUMIDITY_MAX,
          lightMin: DEFAULT_CONFIG.LIGHT_MIN,
          lightMax: DEFAULT_CONFIG.LIGHT_MAX,
          phMin: DEFAULT_CONFIG.PH_MIN,
          phMax: DEFAULT_CONFIG.PH_MAX,
          dataCollectionInterval: DEFAULT_CONFIG.DATA_COLLECTION_INTERVAL
        },
        description: 'Umbrales ideales para cultivo de cacao',
        category: 'cacao_optimal',
        isActive: true,
        isEditable: true
      });

      return config;
    } catch (error) {
      console.error('Error en ConfigService.createDefaultConfig:', error);
      throw new Error('Error al crear configuración por defecto');
    }
  }

  /**
   * Restablece la configuración a valores por defecto
   * @returns {Object} Configuración restablecida
   */
  async resetToDefaults() {
    try {
      let config = await SystemConfig.findOne();

      const defaultData = {
        temperatureMin: DEFAULT_CONFIG.TEMPERATURE_MIN,
        temperatureMax: DEFAULT_CONFIG.TEMPERATURE_MAX,
        humidityMin: DEFAULT_CONFIG.HUMIDITY_MIN,
        humidityMax: DEFAULT_CONFIG.HUMIDITY_MAX,
        lightMin: DEFAULT_CONFIG.LIGHT_MIN,
        lightMax: DEFAULT_CONFIG.LIGHT_MAX,
        phMin: DEFAULT_CONFIG.PH_MIN,
        phMax: DEFAULT_CONFIG.PH_MAX,
        dataCollectionInterval: DEFAULT_CONFIG.DATA_COLLECTION_INTERVAL,
        dataCollectionEnabled: true,
        alertsEnabled: true,
        updatedAt: getCurrentDate()
      };

      if (!config) {
        config = await SystemConfig.create({
          ...defaultData,
          createdAt: getCurrentDate()
        });
      } else {
        await config.update(defaultData);
      }

      return config;
    } catch (error) {
      console.error('Error en ConfigService.resetToDefaults:', error);
      throw new Error('Error al restablecer configuración por defecto');
    }
  }

  /**
   * Valida que los rangos de configuración sean válidos
   * @param {Object} configData - Datos de configuración a validar
   * @returns {Object} Resultado de validación
   */
  validateConfigRanges(configData) {
    const errors = [];

    // Validar rangos de temperatura
    if (configData.temperatureMin !== undefined && configData.temperatureMax !== undefined) {
      if (configData.temperatureMin >= configData.temperatureMax) {
        errors.push('La temperatura mínima debe ser menor que la máxima');
      }
    }

    // Validar rangos de humedad
    if (configData.humidityMin !== undefined && configData.humidityMax !== undefined) {
      if (configData.humidityMin >= configData.humidityMax) {
        errors.push('La humedad mínima debe ser menor que la máxima');
      }
    }

    // Validar rangos de luz
    if (configData.lightMin !== undefined && configData.lightMax !== undefined) {
      if (configData.lightMin >= configData.lightMax) {
        errors.push('El nivel de luz mínimo debe ser menor que el máximo');
      }
    }

    // Validar rangos de pH
    if (configData.phMin !== undefined && configData.phMax !== undefined) {
      if (configData.phMin >= configData.phMax) {
        errors.push('El pH mínimo debe ser menor que el máximo');
      }
    }

    // Validar intervalo de recolección
    if (configData.dataCollectionInterval !== undefined) {
      if (configData.dataCollectionInterval < DEFAULT_CONFIG.MIN_INTERVAL) {
        errors.push(`El intervalo mínimo de recolección es ${DEFAULT_CONFIG.MIN_INTERVAL} segundos`);
      }
      if (configData.dataCollectionInterval > DEFAULT_CONFIG.MAX_INTERVAL) {
        errors.push(`El intervalo máximo de recolección es ${DEFAULT_CONFIG.MAX_INTERVAL} segundos`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtiene configuración optimizada para cacao
   * @returns {Object} Configuración optimizada
   */
  getOptimalCacaoConfig() {
    return {
      // Rangos óptimos para cultivo de cacao
      temperatureMin: DEFAULT_CONFIG.TEMPERATURE_OPTIMAL_MIN,
      temperatureMax: DEFAULT_CONFIG.TEMPERATURE_OPTIMAL_MAX,
      humidityMin: DEFAULT_CONFIG.HUMIDITY_OPTIMAL_MIN,
      humidityMax: DEFAULT_CONFIG.HUMIDITY_OPTIMAL_MAX,
      lightMin: DEFAULT_CONFIG.LIGHT_OPTIMAL_MIN,
      lightMax: DEFAULT_CONFIG.LIGHT_OPTIMAL_MAX,
      phMin: DEFAULT_CONFIG.PH_OPTIMAL_MIN,
      phMax: DEFAULT_CONFIG.PH_OPTIMAL_MAX,
      dataCollectionInterval: DEFAULT_CONFIG.DATA_COLLECTION_INTERVAL,
      dataCollectionEnabled: true,
      alertsEnabled: true
    };
  }

  /**
   * Aplica configuración optimizada para cacao
   * @returns {Object} Configuración actualizada
   */
  async applyOptimalCacaoConfig() {
    try {
      const optimalConfig = this.getOptimalCacaoConfig();
      return await this.updateSystemConfig(optimalConfig);
    } catch (error) {
      console.error('Error en ConfigService.applyOptimalCacaoConfig:', error);
      throw new Error('Error al aplicar configuración óptima para cacao');
    }
  }

  /**
   * Obtiene el historial de cambios de configuración
   * @param {Object} options - Opciones de consulta
   * @returns {Array} Historial de cambios
   */
  async getConfigHistory(options = {}) {
    try {
      const { limit = 50, page = 1 } = options;
      const offset = (page - 1) * limit;

      // Por ahora retornamos solo la configuración actual
      // En una implementación futura se podría agregar una tabla de historial
      const currentConfig = await this.getSystemConfig();

      return {
        history: [
          {
            id: currentConfig.id,
            changes: 'Configuración actual',
            changedAt: currentConfig.updatedAt,
            changedBy: 'Sistema'
          }
        ],
        pagination: {
          page,
          limit,
          total: 1,
          totalPages: 1
        }
      };
    } catch (error) {
      console.error('Error en ConfigService.getConfigHistory:', error);
      throw new Error('Error al obtener historial de configuración');
    }
  }

  /**
   * Exporta la configuración actual
   * @returns {Object} Configuración para exportar
   */
  async exportConfig() {
    try {
      const config = await this.getSystemConfig();

      return {
        exportedAt: getCurrentDate(),
        version: '1.0',
        configuration: {
          temperature: {
            min: config.temperatureMin,
            max: config.temperatureMax
          },
          humidity: {
            min: config.humidityMin,
            max: config.humidityMax
          },
          light: {
            min: config.lightMin,
            max: config.lightMax
          },
          ph: {
            min: config.phMin,
            max: config.phMax
          },
          system: {
            dataCollectionInterval: config.dataCollectionInterval,
            dataCollectionEnabled: config.dataCollectionEnabled,
            alertsEnabled: config.alertsEnabled
          }
        }
      };
    } catch (error) {
      console.error('Error en ConfigService.exportConfig:', error);
      throw new Error('Error al exportar configuración');
    }
  }

  /**
   * Importa configuración desde un archivo/objeto
   * @param {Object} importData - Datos de configuración a importar
   * @returns {Object} Configuración importada
   */
  async importConfig(importData) {
    try {
      // Validar estructura del archivo de importación
      if (!importData.configuration) {
        throw new Error('Estructura de archivo de configuración inválida');
      }

      const { configuration } = importData;

      // Construir objeto de configuración a partir de los datos importados
      const configToImport = {};

      if (configuration.temperature) {
        configToImport.temperatureMin = configuration.temperature.min;
        configToImport.temperatureMax = configuration.temperature.max;
      }

      if (configuration.humidity) {
        configToImport.humidityMin = configuration.humidity.min;
        configToImport.humidityMax = configuration.humidity.max;
      }

      if (configuration.light) {
        configToImport.lightMin = configuration.light.min;
        configToImport.lightMax = configuration.light.max;
      }

      if (configuration.ph) {
        configToImport.phMin = configuration.ph.min;
        configToImport.phMax = configuration.ph.max;
      }

      if (configuration.system) {
        if (configuration.system.dataCollectionInterval !== undefined) {
          configToImport.dataCollectionInterval = configuration.system.dataCollectionInterval;
        }
        if (configuration.system.dataCollectionEnabled !== undefined) {
          configToImport.dataCollectionEnabled = configuration.system.dataCollectionEnabled;
        }
        if (configuration.system.alertsEnabled !== undefined) {
          configToImport.alertsEnabled = configuration.system.alertsEnabled;
        }
      }

      // Validar configuración antes de importar
      const validation = this.validateConfigRanges(configToImport);
      if (!validation.isValid) {
        throw new Error(`Configuración inválida: ${validation.errors.join(', ')}`);
      }

      // Aplicar configuración importada
      return await this.updateSystemConfig(configToImport);
    } catch (error) {
      console.error('Error en ConfigService.importConfig:', error);
      throw error;
    }
  }

  /**
   * Verifica si la configuración actual es válida
   * @returns {Object} Resultado de validación
   */
  async validateCurrentConfig() {
    try {
      const config = await this.getSystemConfig();
      
      const validation = this.validateConfigRanges({
        temperatureMin: config.temperatureMin,
        temperatureMax: config.temperatureMax,
        humidityMin: config.humidityMin,
        humidityMax: config.humidityMax,
        lightMin: config.lightMin,
        lightMax: config.lightMax,
        phMin: config.phMin,
        phMax: config.phMax,
        dataCollectionInterval: config.dataCollectionInterval
      });

      return {
        isValid: validation.isValid,
        errors: validation.errors,
        config: config
      };
    } catch (error) {
      console.error('Error en ConfigService.validateCurrentConfig:', error);
      throw new Error('Error al validar configuración actual');
    }
  }
}

module.exports = new ConfigService();