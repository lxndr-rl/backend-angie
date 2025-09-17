const jwt = require('jsonwebtoken');
const authService = require('../services/authService');

// Middleware para verificar JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Acceso denegado. Token no proporcionado.' 
      });
    }

    const decoded = authService.verifyToken(token);
    const user = await authService.getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido. Usuario no encontrado.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token inválido.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expirado. Inicia sesión nuevamente.' 
      });
    }
    
    console.error('Error en middleware de autenticación:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error interno del servidor en autenticación.' 
    });
  }
};

// Middleware para verificar rol de administrador
const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Acceso denegado. Se requieren permisos de administrador.' 
    });
  }
  next();
};

// Middleware opcional de autenticación
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await authService.getUserById(decoded.userId);
        
        if (user) {
          req.user = user;
        }
      } catch (error) {
        // Continúa sin autenticación si hay error
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