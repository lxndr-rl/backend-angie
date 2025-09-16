const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const User = require('../models/User');

// Obtener todos los usuarios (solo admin)
router.get('/', auth, adminAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const query = search 
            ? {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } },
                    { cedula: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });

    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener un usuario específico (solo admin)
router.get('/:id', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ user });

    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar usuario (solo admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
    try {
        const { firstName, lastName, address, phone, role, isActive } = req.body;
        
        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (address) updateData.address = address;
        if (phone) updateData.phone = phone;
        if (role) updateData.role = role;
        if (typeof isActive === 'boolean') updateData.isActive = isActive;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({
            message: 'Usuario actualizado exitosamente',
            user
        });

    } catch (error) {
        console.error('Error actualizando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar usuario (solo admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // No permitir que el admin se elimine a sí mismo
        if (user._id.equals(req.user._id)) {
            return res.status(400).json({ 
                error: 'No puedes eliminar tu propia cuenta' 
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'Usuario eliminado exitosamente' });

    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;