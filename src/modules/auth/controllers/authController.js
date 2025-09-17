const authService = require('../services/authService');

class AuthController {

  // Registro de usuario
  async register(req, res) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });

    } catch (error) {
      console.error('Error en registro:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors.map(err => err.message)
        });
      }
      
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          error: 'Usuario o cédula ya registrados'
        });
      }

      res.status(400).json({
        success: false,
        error: error.message || 'Error interno del servidor durante el registro'
      });
    }
  }

  // Login de usuario
  async login(req, res) {
    try {
      const { username, password } = req.body;
      const result = await authService.login(username, password);

      res.json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: result
      });

    } catch (error) {
      console.error('Error en login:', error);
      
      res.status(401).json({
        success: false,
        error: error.message || 'Error interno del servidor durante el login'
      });
    }
  }

  // Obtener perfil del usuario autenticado
  async getProfile(req, res) {
    try {
      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }

  // Actualizar perfil del usuario
  async updateProfile(req, res) {
    try {
      const user = await authService.updateProfile(req.user.id, req.body);

      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Datos de entrada inválidos',
          details: error.errors.map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  // Cambiar contraseña
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Contraseña actual y nueva contraseña son requeridas'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'La nueva contraseña debe tener al menos 6 caracteres'
        });
      }

      const result = await authService.changePassword(
        req.user.id, 
        currentPassword, 
        newPassword
      );

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Error interno del servidor'
      });
    }
  }

  // Verificar token (ruta de validación)
  async verifyToken(req, res) {
    try {
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
      });
    }
  }
}

module.exports = new AuthController();