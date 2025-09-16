const EnvironmentalData = require('../models/EnvironmentalData');
const Alert = require('../models/Alert');
const SystemConfig = require('../models/SystemConfig');

// Obtener últimos datos ambientales
const getLatestData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const latestData = await EnvironmentalData.getLatestByDevice(deviceId);
        
        if (!latestData) {
            return res.status(404).json({
                error: 'No se encontraron datos para este dispositivo'
            });
        }

        res.json({
            data: latestData,
            timestamp: latestData.createdAt
        });

    } catch (error) {
        console.error('Error obteniendo datos ambientales:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Obtener datos históricos
const getHistoricalData = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;
        
        let query = { deviceId };
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }
        
        const historicalData = await EnvironmentalData.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({
            data: historicalData,
            count: historicalData.length,
            deviceId,
            filters: {
                startDate,
                endDate,
                limit
            }
        });

    } catch (error) {
        console.error('Error obteniendo datos históricos:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Crear nuevos datos ambientales (para dispositivos IoT)
const createEnvironmentalData = async (req, res) => {
    try {
        const { temperature, humidity, light, ph, deviceId, location } = req.body;

        // Crear el registro de datos ambientales
        const environmentalData = new EnvironmentalData({
            temperature,
            humidity,
            light,
            ph,
            deviceId,
            location: location || undefined
        });

        await environmentalData.save();

        // Verificar umbrales y crear alertas si es necesario
        try {
            const config = await SystemConfig.findOne({ deviceId });
            
            if (config && config.alerts.enabled) {
                const alertsToCreate = config.checkThresholds({
                    temperature,
                    humidity,
                    light,
                    ph
                });

                // Crear alertas
                for (const alertData of alertsToCreate) {
                    const alert = new Alert({
                        title: `${alertData.type.toUpperCase()} fuera de rango`,
                        description: `${alertData.type} = ${alertData.value}. Rango: ${alertData.threshold.min} - ${alertData.threshold.max}`,
                        severity: alertData.severity,
                        type: alertData.type,
                        value: alertData.value,
                        threshold: alertData.threshold,
                        deviceId,
                        environmentalDataId: environmentalData._id
                    });
                    
                    await alert.save();
                }
            }
        } catch (alertError) {
            console.error('Error creando alertas:', alertError);
            // No bloquear la respuesta si falla la creación de alertas
        }

        res.status(201).json({
            message: 'Datos ambientales registrados exitosamente',
            data: environmentalData
        });

    } catch (error) {
        console.error('Error creando datos ambientales:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas resumidas
const getDataSummary = async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { period = '24h' } = req.query;

        // Calcular fecha de inicio basada en el período
        const now = new Date();
        let startDate;
        
        switch (period) {
            case '1h':
                startDate = new Date(now.getTime() - (60 * 60 * 1000));
                break;
            case '6h':
                startDate = new Date(now.getTime() - (6 * 60 * 60 * 1000));
                break;
            case '24h':
                startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
                break;
            case '7d':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            default:
                startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
        }

        const data = await EnvironmentalData.find({
            deviceId,
            createdAt: { $gte: startDate }
        });

        if (data.length === 0) {
            return res.json({
                summary: null,
                message: 'No hay datos disponibles para el período seleccionado'
            });
        }

        // Calcular estadísticas
        const summary = {
            temperature: {
                avg: data.reduce((sum, d) => sum + d.temperature, 0) / data.length,
                min: Math.min(...data.map(d => d.temperature)),
                max: Math.max(...data.map(d => d.temperature))
            },
            humidity: {
                avg: data.reduce((sum, d) => sum + d.humidity, 0) / data.length,
                min: Math.min(...data.map(d => d.humidity)),
                max: Math.max(...data.map(d => d.humidity))
            },
            light: {
                avg: data.reduce((sum, d) => sum + d.light, 0) / data.length,
                min: Math.min(...data.map(d => d.light)),
                max: Math.max(...data.map(d => d.light))
            },
            ph: {
                avg: data.reduce((sum, d) => sum + d.ph, 0) / data.length,
                min: Math.min(...data.map(d => d.ph)),
                max: Math.max(...data.map(d => d.ph))
            },
            dataPoints: data.length,
            period,
            timeRange: {
                start: startDate,
                end: now
            }
        };

        // Redondear promedios a 2 decimales
        Object.keys(summary).forEach(key => {
            if (summary[key].avg) {
                summary[key].avg = Math.round(summary[key].avg * 100) / 100;
            }
        });

        res.json({ summary });

    } catch (error) {
        console.error('Error obteniendo resumen de datos:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Obtener alertas activas
const getActiveAlerts = async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        const alerts = await Alert.getActiveAlerts(deviceId);

        res.json({
            alerts,
            count: alerts.length
        });

    } catch (error) {
        console.error('Error obteniendo alertas:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

// Resolver alerta
const resolveAlert = async (req, res) => {
    try {
        const { alertId } = req.params;
        const alert = await Alert.findById(alertId);
        
        if (!alert) {
            return res.status(404).json({
                error: 'Alerta no encontrada'
            });
        }

        await alert.resolve(req.user._id);

        res.json({
            message: 'Alerta resuelta exitosamente',
            alert
        });

    } catch (error) {
        console.error('Error resolviendo alerta:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getLatestData,
    getHistoricalData,
    createEnvironmentalData,
    getDataSummary,
    getActiveAlerts,
    resolveAlert
};