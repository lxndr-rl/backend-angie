const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { validateSystemConfig } = require('../middleware/validation');
const SystemConfig = require('../models/SystemConfig');

// Obtener configuración de un dispositivo
router.get('/:deviceId', auth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        let config = await SystemConfig.findOne({ deviceId });
        
        // Si no existe configuración, crear una por defecto
        if (!config) {
            config = new SystemConfig({ deviceId });
            await config.save();
        }

        res.json({ config });

    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Actualizar configuración de un dispositivo (solo admin)
router.put('/:deviceId', auth, adminAuth, validateSystemConfig, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const updateData = { ...req.body, updatedBy: req.user._id };

        const config = await SystemConfig.findOneAndUpdate(
            { deviceId },
            updateData,
            { 
                new: true, 
                upsert: true, 
                runValidators: true 
            }
        );

        res.json({
            message: 'Configuración actualizada exitosamente',
            config
        });

    } catch (error) {
        console.error('Error actualizando configuración:', error);
        
        if (error.message.includes('debe ser menor que')) {
            return res.status(400).json({ error: error.message });
        }
        
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Obtener todas las configuraciones (solo admin)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const configs = await SystemConfig.find()
            .populate('updatedBy', 'firstName lastName username')
            .sort({ lastUpdate: -1 });

        res.json({
            configs,
            count: configs.length
        });

    } catch (error) {
        console.error('Error obteniendo configuraciones:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Resetear configuración a valores por defecto (solo admin)
router.post('/:deviceId/reset', auth, adminAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;

        const defaultConfig = new SystemConfig({ deviceId, updatedBy: req.user._id });
        
        const config = await SystemConfig.findOneAndUpdate(
            { deviceId },
            defaultConfig.toObject(),
            { 
                new: true, 
                upsert: true 
            }
        );

        res.json({
            message: 'Configuración resetada a valores por defecto',
            config
        });

    } catch (error) {
        console.error('Error reseteando configuración:', error);
        res.status(500).json({
            error: 'Error interno del servidor'
        });
    }
});

// Validar configuración sin guardar
router.post('/:deviceId/validate', auth, validateSystemConfig, async (req, res) => {
    try {
        const { deviceId } = req.params;
        
        // Crear un objeto temporal para validación
        const tempConfig = new SystemConfig({
            deviceId,
            ...req.body
        });

        // Validar sin guardar
        await tempConfig.validate();

        res.json({
            message: 'Configuración válida',
            isValid: true
        });

    } catch (error) {
        console.error('Error validando configuración:', error);
        res.status(400).json({
            error: 'Configuración inválida',
            details: error.message
        });
    }
});

module.exports = router;