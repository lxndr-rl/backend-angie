const mongoose = require('mongoose');

const environmentalDataSchema = new mongoose.Schema({
    temperature: {
        type: Number,
        required: [true, 'La temperatura es requerida'],
        min: [-10, 'La temperatura no puede ser menor a -10°C'],
        max: [60, 'La temperatura no puede ser mayor a 60°C']
    },
    humidity: {
        type: Number,
        required: [true, 'La humedad es requerida'],
        min: [0, 'La humedad no puede ser menor a 0%'],
        max: [100, 'La humedad no puede ser mayor a 100%']
    },
    light: {
        type: Number,
        required: [true, 'La luz es requerida'],
        min: [0, 'El nivel de luz no puede ser negativo']
    },
    ph: {
        type: Number,
        required: [true, 'El pH es requerido'],
        min: [0, 'El pH no puede ser menor a 0'],
        max: [14, 'El pH no puede ser mayor a 14']
    },
    deviceId: {
        type: String,
        required: [true, 'El ID del dispositivo es requerido'],
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0] // [longitude, latitude]
        }
    },
    sensorStatus: {
        type: String,
        enum: ['active', 'inactive', 'error'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Índice geoespacial para búsquedas por ubicación
environmentalDataSchema.index({ location: '2dsphere' });

// Índice compuesto para consultas eficientes por dispositivo y fecha
environmentalDataSchema.index({ deviceId: 1, createdAt: -1 });

// Método estático para obtener el último registro por dispositivo
environmentalDataSchema.statics.getLatestByDevice = function(deviceId) {
    return this.findOne({ deviceId }).sort({ createdAt: -1 });
};

// Método estático para obtener datos históricos
environmentalDataSchema.statics.getHistoricalData = function(deviceId, startDate, endDate) {
    const query = { deviceId };
    
    if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = new Date(startDate);
        if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    return this.find(query).sort({ createdAt: -1 });
};

module.exports = mongoose.model('EnvironmentalData', environmentalDataSchema);