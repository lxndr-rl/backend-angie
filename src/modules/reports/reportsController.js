const reportsService = require('./reportsService');
const pdfGenerator = require('./pdfGenerator');
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
   * Descarga reporte en formato PDF con gráficas
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

      if (type === 'environmental') {
        // Generar reporte ambiental
        const envReport = await reportsService.generateEnvironmentalReport({
          userId,
          deviceId,
          startDate,
          endDate,
          includeAlerts: false,
          includeStats: false
        });
        
        console.log('Reporte generado, datos:', {
          hasDHT22: !!(envReport.data?.dht22),
          hasMQ7: !!(envReport.data?.mq7),
          hasMQ4: !!(envReport.data?.mq4),
          hasMQ135: !!(envReport.data?.mq135),
          totalReadings: envReport.metadata?.totalReadings
        });
        
        const filename = `reporte_ambiental_${Date.now()}.pdf`;
        
        // Generar PDF
        console.log('Llamando a generateEnvironmentalPDF...');
        const pdfDoc = await pdfGenerator.generateEnvironmentalPDF(
          envReport.data,
          envReport.metadata
        );
        
        if (!pdfDoc || typeof pdfDoc.pipe !== 'function') {
          throw new Error('El generador de PDF no retornó un documento válido');
        }
        
        console.log('PDF creado exitosamente, configurando headers...');
        
        // Configurar headers para PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Content-Transfer-Encoding', 'binary');
        
        // Pipe el PDF a la respuesta
        pdfDoc.pipe(res);
        pdfDoc.end();
        
        console.log('PDF enviado correctamente');
        
      } else if (type === 'alerts') {
        // Generar reporte de alertas en CSV
        const alertsReport = await reportsService.generateAlertsReport({
          userId,
          deviceId,
          startDate,
          endDate
        });
        const csvData = this.convertAlertsDataToCSV(alertsReport.alerts);
        const csvFilename = `reporte_alertas_${Date.now()}.csv`;
        
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${csvFilename}"`);
        res.send(csvData);
        
      } else {
        return errorResponse(res, 'Tipo de reporte inválido. Use: environmental o alerts', 400);
      }

    } catch (error) {
      console.error('Error en ReportsController.downloadReportCSV:', error);
      console.error('Stack:', error.stack);
      
      // Si ya se enviaron headers, no podemos enviar error response
      if (!res.headersSent) {
        return errorResponse(res, `Error al generar reporte: ${error.message}`, 500);
      }
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  /**
   * Convierte datos ambientales a formato CSV
   */
  convertEnvironmentalDataToCSV(reportData) {
    const rows = [];
    
    // Headers
    const headers = [
      'Fecha y Hora',
      'Dispositivo ID',
      'Dispositivo Nombre',
      'Tipo Sensor',
      'Temperatura (°C)',
      'Humedad (%)',
      'CO (ppm)',
      'CH4 (ppm)',
      'Calidad Aire (ppm)',
      'Nivel Peligro'
    ];
    rows.push(headers.join(','));

    // DHT22 Data
    if (reportData.dht22 && reportData.dht22.length > 0) {
      reportData.dht22.forEach(item => {
        const device = item.device || {};
        rows.push([
          item.createdAt || item.timestamp || 'N/A',
          device.deviceId || 'N/A',
          device.name || 'N/A',
          'DHT22',
          item.temperature || '',
          item.humidity || '',
          '',
          '',
          '',
          ''
        ].join(','));
      });
    }

    // MQ7 Data
    if (reportData.mq7 && reportData.mq7.length > 0) {
      reportData.mq7.forEach(item => {
        const device = item.device || {};
        rows.push([
          item.createdAt || item.timestamp || 'N/A',
          device.deviceId || 'N/A',
          device.name || 'N/A',
          'MQ7',
          '',
          '',
          item.co_ppm || '',
          '',
          '',
          item.dangerLevel || ''
        ].join(','));
      });
    }

    // MQ4 Data
    if (reportData.mq4 && reportData.mq4.length > 0) {
      reportData.mq4.forEach(item => {
        const device = item.device || {};
        rows.push([
          item.createdAt || item.timestamp || 'N/A',
          device.deviceId || 'N/A',
          device.name || 'N/A',
          'MQ4',
          '',
          '',
          '',
          item.ch4_ppm || '',
          '',
          item.dangerLevel || ''
        ].join(','));
      });
    }

    // MQ135 Data
    if (reportData.mq135 && reportData.mq135.length > 0) {
      reportData.mq135.forEach(item => {
        const device = item.device || {};
        rows.push([
          item.createdAt || item.timestamp || 'N/A',
          device.deviceId || 'N/A',
          device.name || 'N/A',
          'MQ135',
          '',
          '',
          '',
          '',
          item.ppm || '',
          item.airQuality || ''
        ].join(','));
      });
    }

    if (rows.length === 1) {
      return 'No hay datos disponibles para el período seleccionado';
    }

    return rows.join('\n');
  }

  /**
   * Convierte datos de alertas a formato CSV
   */
  convertAlertsDataToCSV(alerts) {
    if (alerts.length === 0) return 'No hay alertas disponibles';

    const headers = [
      'Fecha Creación',
      'Tipo',
      'Severidad',
      'Estado',
      'Título',
      'Mensaje',
      'Dispositivo ID',
      'Dispositivo Nombre',
      'Tipo Sensor',
      'Valor Disparador',
      'Valor Umbral',
      'Resuelta',
      'Fecha Resolución'
    ];

    const csvContent = [
      headers.join(','),
      ...alerts.map(alert => [
        alert.createdAt,
        alert.type,
        alert.severity,
        alert.isResolved ? 'Resuelta' : 'Activa',
        `"${alert.title}"`,
        `"${alert.message}"`,
        alert.device?.deviceId || 'N/A',
        alert.device?.name || 'N/A',
        alert.sensorType || 'N/A',
        alert.triggerValue || 'N/A',
        alert.thresholdValue || 'N/A',
        alert.isResolved ? 'Sí' : 'No',
        alert.resolvedAt || 'N/A'
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}

module.exports = new ReportsController();