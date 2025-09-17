const configService = require('./configService');
const { successResponse, errorResponse, createdResponse } = require('../../shared/utils/response');

class ConfigController {
  /**
   * Obtiene la configuración actual del sistema
   */
  async getSystemConfig(req, res) {
    try {
      const config = await configService.getSystemConfig();

      return successResponse(
        res,
        config,
        'Configuración del sistema obtenida exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.getSystemConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza la configuración del sistema
   */
  async updateSystemConfig(req, res) {
    try {
      const configData = req.body;

      // Validar rangos antes de actualizar
      const validation = configService.validateConfigRanges(configData);
      if (!validation.isValid) {
        return errorResponse(
          res,
          'Configuración inválida',
          400,
          validation.errors
        );
      }

      const updatedConfig = await configService.updateSystemConfig(configData);

      return successResponse(
        res,
        updatedConfig,
        'Configuración del sistema actualizada exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.updateSystemConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Restablece la configuración a valores por defecto
   */
  async resetToDefaults(req, res) {
    try {
      const config = await configService.resetToDefaults();

      return successResponse(
        res,
        config,
        'Configuración restablecida a valores por defecto exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.resetToDefaults:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene configuración optimizada para cacao
   */
  async getOptimalCacaoConfig(req, res) {
    try {
      const optimalConfig = configService.getOptimalCacaoConfig();

      return successResponse(
        res,
        optimalConfig,
        'Configuración óptima para cacao obtenida exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.getOptimalCacaoConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Aplica configuración optimizada para cacao
   */
  async applyOptimalCacaoConfig(req, res) {
    try {
      const config = await configService.applyOptimalCacaoConfig();

      return successResponse(
        res,
        config,
        'Configuración óptima para cacao aplicada exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.applyOptimalCacaoConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene el historial de cambios de configuración
   */
  async getConfigHistory(req, res) {
    try {
      const { page = 1, limit = 50 } = req.query;

      const history = await configService.getConfigHistory({
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return successResponse(
        res,
        history,
        'Historial de configuración obtenido exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.getConfigHistory:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Exporta la configuración actual
   */
  async exportConfig(req, res) {
    try {
      const exportData = await configService.exportConfig();

      // Configurar headers para descarga
      const filename = `config_export_${Date.now()}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).json(exportData);
    } catch (error) {
      console.error('Error en ConfigController.exportConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Importa configuración desde un archivo
   */
  async importConfig(req, res) {
    try {
      const importData = req.body;

      if (!importData || typeof importData !== 'object') {
        return errorResponse(
          res,
          'Datos de importación inválidos',
          400
        );
      }

      const config = await configService.importConfig(importData);

      return successResponse(
        res,
        config,
        'Configuración importada exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.importConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Valida la configuración actual
   */
  async validateCurrentConfig(req, res) {
    try {
      const validation = await configService.validateCurrentConfig();

      if (validation.isValid) {
        return successResponse(
          res,
          {
            isValid: true,
            config: validation.config
          },
          'La configuración actual es válida'
        );
      } else {
        return successResponse(
          res,
          {
            isValid: false,
            errors: validation.errors,
            config: validation.config
          },
          'Se encontraron problemas en la configuración actual'
        );
      }
    } catch (error) {
      console.error('Error en ConfigController.validateCurrentConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene valores por defecto sin aplicarlos
   */
  async getDefaultValues(req, res) {
    try {
      const defaultConfig = configService.getOptimalCacaoConfig();

      return successResponse(
        res,
        defaultConfig,
        'Valores por defecto obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.getDefaultValues:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza configuración de alertas específicamente
   */
  async updateAlertsConfig(req, res) {
    try {
      const { alertsEnabled } = req.body;

      if (typeof alertsEnabled !== 'boolean') {
        return errorResponse(
          res,
          'alertsEnabled debe ser un valor booleano',
          400
        );
      }

      const updatedConfig = await configService.updateSystemConfig({
        alertsEnabled
      });

      return successResponse(
        res,
        {
          alertsEnabled: updatedConfig.alertsEnabled,
          updatedAt: updatedConfig.updatedAt
        },
        `Alertas ${alertsEnabled ? 'activadas' : 'desactivadas'} exitosamente`
      );
    } catch (error) {
      console.error('Error en ConfigController.updateAlertsConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza configuración de recolección de datos específicamente
   */
  async updateDataCollectionConfig(req, res) {
    try {
      const { dataCollectionEnabled, dataCollectionInterval } = req.body;

      const updateData = {};

      if (typeof dataCollectionEnabled === 'boolean') {
        updateData.dataCollectionEnabled = dataCollectionEnabled;
      }

      if (dataCollectionInterval !== undefined) {
        const interval = parseInt(dataCollectionInterval);
        if (isNaN(interval) || interval < 60 || interval > 3600) {
          return errorResponse(
            res,
            'El intervalo de recolección debe estar entre 60 y 3600 segundos',
            400
          );
        }
        updateData.dataCollectionInterval = interval;
      }

      if (Object.keys(updateData).length === 0) {
        return errorResponse(
          res,
          'No se proporcionaron datos válidos para actualizar',
          400
        );
      }

      const updatedConfig = await configService.updateSystemConfig(updateData);

      return successResponse(
        res,
        {
          dataCollectionEnabled: updatedConfig.dataCollectionEnabled,
          dataCollectionInterval: updatedConfig.dataCollectionInterval,
          updatedAt: updatedConfig.updatedAt
        },
        'Configuración de recolección de datos actualizada exitosamente'
      );
    } catch (error) {
      console.error('Error en ConfigController.updateDataCollectionConfig:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new ConfigController();