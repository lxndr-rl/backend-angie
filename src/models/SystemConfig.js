const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: [true, 'El ID del dispositivo es requerido'],
        unique: true,
        trim: true
    },
    thresholds: {
        temperature: {
            min: {
                type: Number,
                default: 18,
                min: [0, 'La temperatura mínima no puede ser negativa']
            },
            max: {
                type: Number,
                default: 32,
                max: [60, 'La temperatura máxima no puede exceder 60°C']
            }
        },
        humidity: {
            min: {
                type: Number,
                default: 40,
                min: [0, 'La humedad mínima no puede ser negativa']
            },
            max: {
                type: Number,
                default: 80,
                max: [100, 'La humedad máxima no puede exceder 100%']
            }
        },
        light: {
            min: {
                type: Number,
                default: 100,
                min: [0, 'El nivel de luz mínimo no puede ser negativo']
            },
            max: {
                type: Number,
                default: 1000
            }
        },
        ph: {
            min: {
                type: Number,
                default: 6.0,
                min: [0, 'El pH mínimo no puede ser negativo']
            },
            max: {
                type: Number,
                default: 7.5,
                max: [14, 'El pH máximo no puede exceder 14']
            }
        }
    },
    dataCollection: {
        interval: {
            type: Number,
            default: 300, // segundos (5 minutos por defecto)
            min: [60, 'El intervalo mínimo es de 60 segundos']
        },
        enabled: {
            type: Boolean,
            default: true
        }
    },
    alerts: {
        enabled: {
            type: Boolean,
            default: true
        },
        notificationMethods: {
            type: [String],
            enum: ['email', 'sms', 'push', 'in-app'],
            default: ['in-app']
        }
    },
    serverUrl: {
        type: String,
        default: 'https://api.cacaomonitor.com',
        trim: true
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    }
}, {
    timestamps: true
});

// Validación personalizada para asegurar que min < max
systemConfigSchema.pre('save', function(next) {
    const { temperature, humidity, light, ph } = this.thresholds;
    
    if (temperature.min >= temperature.max) {
        return next(new Error('La temperatura mínima debe ser menor que la máxima'));
    }
    if (humidity.min >= humidity.max) {
        return next(new Error('La humedad mínima debe ser menor que la máxima'));
    }
    if (light.min >= light.max) {
        return next(new Error('El nivel de luz mínimo debe ser menor que el máximo'));
    }
    if (ph.min >= ph.max) {
        return next(new Error('El pH mínimo debe ser menor que el máximo'));
    }
    
    this.lastUpdate = new Date();
    next();
});

// Método para verificar si un valor está fuera de los umbrales
systemConfigSchema.methods.checkThresholds = function(data) {
    const alerts = [];
    const { temperature, humidity, light, ph } = this.thresholds;
    
    if (data.temperature < temperature.min || data.temperature > temperature.max) {
        alerts.push({
            type: 'temperature',
            severity: data.temperature < temperature.min - 5 || data.temperature > temperature.max + 5 ? 'Crítico' : 'Advertencia',
            value: data.temperature,
            threshold: temperature
        });
    }
    
    if (data.humidity < humidity.min || data.humidity > humidity.max) {
        alerts.push({
            type: 'humidity',
            severity: data.humidity < humidity.min - 10 || data.humidity > humidity.max + 10 ? 'Crítico' : 'Advertencia',
            value: data.humidity,
            threshold: humidity
        });
    }
    
    if (data.light < light.min || data.light > light.max) {
        alerts.push({
            type: 'light',
            severity: 'Atención',
            value: data.light,
            threshold: light
        });
    }
    
    if (data.ph < ph.min || data.ph > ph.max) {
        alerts.push({
            type: 'ph',
            severity: data.ph < ph.min - 0.5 || data.ph > ph.max + 0.5 ? 'Crítico' : 'Advertencia',
            value: data.ph,
            threshold: ph
        });
    }
    
    return alerts;
};

module.exports = mongoose.model('SystemConfig', systemConfigSchema);