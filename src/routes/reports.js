const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const EnvironmentalData = require('../models/EnvironmentalData');

// Generar reporte de datos ambientales
router.get('/environmental/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate, format = 'json' } = req.query;

        // Validar fechas
        if (!startDate || !endDate) {
            return res.status(400).json({
                error: 'Se requieren fechas de inicio y fin para generar el reporte'
            });
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start >= end) {
            return res.status(400).json({
                error: 'La fecha de inicio debe ser anterior a la fecha de fin'
            });
        }

        // Obtener datos del período especificado
        const data = await EnvironmentalData.find({
            deviceId,
            createdAt: {
                $gte: start,
                $lte: end
            }
        }).sort({ createdAt: 1 });

        if (data.length === 0) {
            return res.status(404).json({
                error: 'No se encontraron datos para el período especificado'
            });
        }

        // Calcular estadísticas del período
        const stats = {
            totalRecords: data.length,
            period: {
                start: startDate,
                end: endDate,
                days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
            },
            temperature: {
                avg: (data.reduce((sum, d) => sum + d.temperature, 0) / data.length).toFixed(2),
                min: Math.min(...data.map(d => d.temperature)),
                max: Math.max(...data.map(d => d.temperature))
            },
            humidity: {
                avg: (data.reduce((sum, d) => sum + d.humidity, 0) / data.length).toFixed(2),
                min: Math.min(...data.map(d => d.humidity)),
                max: Math.max(...data.map(d => d.humidity))
            },
            light: {
                avg: (data.reduce((sum, d) => sum + d.light, 0) / data.length).toFixed(2),
                min: Math.min(...data.map(d => d.light)),
                max: Math.max(...data.map(d => d.light))
            },
            ph: {
                avg: (data.reduce((sum, d) => sum + d.ph, 0) / data.length).toFixed(2),
                min: Math.min(...data.map(d => d.ph)),
                max: Math.max(...data.map(d => d.ph))
            }
        };

        const reportData = {
            deviceId,
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.username,
            statistics: stats,
            data: data
        };

        // Manejar diferentes formatos de respuesta
        if (format === 'csv') {
            // Generar CSV
            const csvHeader = 'Fecha,Temperatura,Humedad,Luz,pH\n';
            const csvData = data.map(row => 
                `${row.createdAt.toISOString()},${row.temperature},${row.humidity},${row.light},${row.ph}`
            ).join('\n');
            
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename="reporte_${deviceId}_${startDate}_${endDate}.csv"`);
            res.send(csvHeader + csvData);
        } else {
            // Respuesta JSON por defecto
            res.json(reportData);
        }

    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({
            error: 'Error interno del servidor al generar el reporte'
        });
    }
});

// Obtener resumen de reportes disponibles
router.get('/summary/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;

        // Obtener el primer y último registro para determinar el rango disponible
        const firstRecord = await EnvironmentalData.findOne({ deviceId }).sort({ createdAt: 1 });
        const lastRecord = await EnvironmentalData.findOne({ deviceId }).sort({ createdAt: -1 });
        const totalRecords = await EnvironmentalData.countDocuments({ deviceId });

        if (!firstRecord || !lastRecord) {
            return res.status(404).json({
                error: 'No se encontraron datos para este dispositivo'
            });
        }

        res.json({
            deviceId,
            availableDataRange: {
                start: firstRecord.createdAt,
                end: lastRecord.createdAt
            },
            totalRecords,
            suggestedReports: [
                {
                    name: 'Últimas 24 horas',
                    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString()
                },
                {
                    name: 'Última semana',
                    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString()
                },
                {
                    name: 'Último mes',
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    endDate: new Date().toISOString()
                }
            ]
        });

    } catch (error) {
        console.error('Error obteniendo resumen de reportes:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

module.exports = router;