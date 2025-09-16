const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Acceso denegado. Token no proporcionado.' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                error: 'Token inválido. Usuario no encontrado.' 
            });
        }

        if (!user.isActive) {
            return res.status(401).json({ 
                error: 'Cuenta desactivada. Contacta al administrador.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Token inválido.' 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expirado. Inicia sesión nuevamente.' 
            });
        }
        
        console.error('Error en middleware de autenticación:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor en autenticación.' 
        });
    }
};

// Middleware para verificar rol de administrador
const adminAuth = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Se requieren permisos de administrador.' 
        });
    }
    next();
};

// Middleware opcional de autenticación (para rutas públicas con funcionalidad extra para usuarios autenticados)
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (user && user.isActive) {
                req.user = user;
            }
        }
        
        next();
    } catch (error) {
        // Continúa sin autenticación si hay error
        next();
    }
};

module.exports = {
    auth,
    adminAuth,
    optionalAuth
};