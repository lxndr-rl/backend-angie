const reportsService = require('./reportsService');
const { successResponse, errorResponse } = require('../../shared/utils/response');
const { USER_ROLES, TIME_INTERVALS } = require('../../shared/constants');

class ReportsController {
  /**
   * Genera reporte de datos ambientales
   */
  async generateEnvironmentalReport(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        interval = TIME_INTERVALS.DAY,
        includeAlerts = 'true',
        includeStats = 'true'
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const report = await reportsService.generateEnvironmentalReport({
        userId,
        deviceId,
        startDate,
        endDate,
        interval,
        includeAlerts: includeAlerts === 'true',
        includeStats: includeStats === 'true'
      });

      return successResponse(
        res,
        report,
        'Reporte ambiental generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.generateEnvironmentalReport:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Genera reporte de alertas
   */
  async generateAlertsReport(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        status,
        severity,
        type
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const report = await reportsService.generateAlertsReport({
        userId,
        deviceId,
        startDate,
        endDate,
        status,
        severity,
        type
      });

      return successResponse(
        res,
        report,
        'Reporte de alertas generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.generateAlertsReport:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Genera reporte de eficiencia de dispositivos
   */
  async generateDeviceEfficiencyReport(req, res) {
    try {
      const {
        startDate,
        endDate,
        period = TIME_INTERVALS.WEEK
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const report = await reportsService.generateDeviceEfficiencyReport({
        userId,
        startDate,
        endDate,
        period
      });

      return successResponse(
        res,
        report,
        'Reporte de eficiencia de dispositivos generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.generateDeviceEfficiencyReport:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Genera reporte de tendencias
   */
  async generateTrendsReport(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        metric = 'all'
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      if (metric !== 'all' && !['temperature', 'humidity', 'light', 'ph'].includes(metric)) {
        return errorResponse(
          res,
          'Métrica inválida. Debe ser: temperature, humidity, light, ph, all',
          400
        );
      }

      const report = await reportsService.generateTrendsReport({
        userId,
        deviceId,
        startDate,
        endDate,
        metric
      });

      return successResponse(
        res,
        report,
        'Reporte de tendencias generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.generateTrendsReport:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene resumen ejecutivo
   */
  async getExecutiveSummary(req, res) {
    try {
      const { period = TIME_INTERVALS.WEEK } = req.query;

      if (!Object.values(TIME_INTERVALS).includes(period)) {
        return errorResponse(
          res,
          'Período inválido. Debe ser: hour, day, week, month, year',
          400
        );
      }

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      const summary = await reportsService.getExecutiveSummary({
        userId,
        period
      });

      return successResponse(
        res,
        summary,
        'Resumen ejecutivo generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.getExecutiveSummary:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Genera reporte personalizado combinando múltiples tipos
   */
  async generateCustomReport(req, res) {
    try {
      const {
        deviceId,
        startDate,
        endDate,
        includeEnvironmental = 'true',
        includeAlerts = 'true',
        includeEfficiency = 'true',
        includeTrends = 'false'
      } = req.body;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.body.userId : req.user.id;

      const reports = {};

      // Generar reportes solicitados en paralelo
      const promises = [];

      if (includeEnvironmental === 'true') {
        promises.push(
          reportsService.generateEnvironmentalReport({
            userId,
            deviceId,
            startDate,
            endDate,
            includeAlerts: false,
            includeStats: true
          }).then(report => ({ environmental: report }))
        );
      }

      if (includeAlerts === 'true') {
        promises.push(
          reportsService.generateAlertsReport({
            userId,
            deviceId,
            startDate,
            endDate
          }).then(report => ({ alerts: report }))
        );
      }

      if (includeEfficiency === 'true') {
        promises.push(
          reportsService.generateDeviceEfficiencyReport({
            userId,
            startDate,
            endDate
          }).then(report => ({ efficiency: report }))
        );
      }

      if (includeTrends === 'true') {
        promises.push(
          reportsService.generateTrendsReport({
            userId,
            deviceId,
            startDate,
            endDate,
            metric: 'all'
          }).then(report => ({ trends: report }))
        );
      }

      const results = await Promise.all(promises);
      results.forEach(result => Object.assign(reports, result));

      const customReport = {
        metadata: {
          generatedAt: new Date().toISOString(),
          reportType: 'custom',
          components: Object.keys(reports),
          filters: { userId, deviceId, startDate, endDate }
        },
        reports
      };

      return successResponse(
        res,
        customReport,
        'Reporte personalizado generado exitosamente'
      );
    } catch (error) {
      console.error('Error en ReportsController.generateCustomReport:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Descarga reporte en formato CSV (implementación básica)
   */
  async downloadReportCSV(req, res) {
    try {
      const { type = 'environmental' } = req.params;
      const {
        deviceId,
        startDate,
        endDate
      } = req.query;

      const userId = req.user.role === USER_ROLES.ADMIN ? req.query.userId : req.user.id;

      let data;
      let filename;

      switch (type) {
        case 'environmental':
          const envReport = await reportsService.generateEnvironmentalReport({
            userId,
            deviceId,
            startDate,
            endDate,
            includeAlerts: false,
            includeStats: false
          });
          data = this.convertEnvironmentalDataToCSV(envReport.data);
          filename = `reporte_ambiental_${Date.now()}.csv`;
          break;

        case 'alerts':
          const alertsReport = await reportsService.generateAlertsReport({
            userId,
            deviceId,
            startDate,
            endDate
          });
          data = this.convertAlertsDataToCSV(alertsReport.alerts);
          filename = `reporte_alertas_${Date.now()}.csv`;
          break;

        default:
          return errorResponse(res, 'Tipo de reporte inválido', 400);
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(data);

    } catch (error) {
      console.error('Error en ReportsController.downloadReportCSV:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Convierte datos ambientales a formato CSV
   */
  convertEnvironmentalDataToCSV(data) {
    if (data.length === 0) return 'No hay datos disponibles';

    const headers = [
      'Fecha y Hora',
      'Dispositivo ID',
      'Usuario',
      'Temperatura (°C)',
      'Humedad (%)',
      'Luz (lux)',
      'pH',
      'Latitud',
      'Longitud'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.timestamp,
        item.deviceId,
        item.user ? `${item.user.firstName} ${item.user.lastName}` : 'N/A',
        item.temperature,
        item.humidity,
        item.light,
        item.ph,
        item.latitude || 'N/A',
        item.longitude || 'N/A'
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Convierte datos de alertas a formato CSV
   */
  convertAlertsDataToCSV(alerts) {
    if (alerts.length === 0) return 'No hay alertas disponibles';

    const headers = [
      'Fecha y Hora',
      'Tipo',
      'Severidad',
      'Estado',
      'Mensaje',
      'Dispositivo ID',
      'Usuario',
      'Valor',
      'Umbral'
    ];

    const csvContent = [
      headers.join(','),
      ...alerts.map(alert => [
        alert.timestamp,
        alert.type,
        alert.severity,
        alert.status,
        `"${alert.message}"`,
        alert.deviceId,
        alert.user ? `${alert.user.firstName} ${alert.user.lastName}` : 'N/A',
        alert.value || 'N/A',
        alert.threshold || 'N/A'
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = new ReportsController();