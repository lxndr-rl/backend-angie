const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título de la alerta es requerido'],
        trim: true,
        maxLength: [100, 'El título no puede exceder 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción de la alerta es requerida'],
        trim: true,
        maxLength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    severity: {
        type: String,
        enum: ['Info', 'Advertencia', 'Atención', 'Crítico'],
        default: 'Info'
    },
    type: {
        type: String,
        enum: ['temperature', 'humidity', 'light', 'ph', 'system', 'connectivity'],
        required: [true, 'El tipo de alerta es requerido']
    },
    value: {
        type: Number,
        required: false // Para alertas de conectividad o sistema, puede no ser necesario
    },
    threshold: {
        min: Number,
        max: Number
    },
    deviceId: {
        type: String,
        required: [true, 'El ID del dispositivo es requerido'],
        trim: true
    },
    environmentalDataId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnvironmentalData',
        required: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    resolvedAt: {
        type: Date,
        default: null
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Índice para consultas eficientes
alertSchema.index({ deviceId: 1, isActive: 1, createdAt: -1 });
alertSchema.index({ severity: 1, isActive: 1 });

// Método para resolver una alerta
alertSchema.methods.resolve = function(userId) {
    this.isActive = false;
    this.resolvedAt = new Date();
    this.resolvedBy = userId;
    return this.save();
};

// Método estático para obtener alertas activas
alertSchema.statics.getActiveAlerts = function(deviceId = null) {
    const query = { isActive: true };
    if (deviceId) query.deviceId = deviceId;
    
    return this.find(query)
        .sort({ severity: 1, createdAt: -1 })
        .populate('resolvedBy', 'firstName lastName username');
};

module.exports = mongoose.model('Alert', alertSchema);