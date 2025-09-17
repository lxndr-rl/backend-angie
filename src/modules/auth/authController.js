const { validationResult } = require('express-validator');
const authService = require('./authService');
const { successResponse, errorResponse } = require('../../shared/utils/response');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Datos de entrada inválidos', 400, errors.array());
      }

      const { username, email, password, firstName, lastName, phone } = req.body;
      const result = await authService.register({
        username,
        email,
        password,
        firstName,
        lastName,
        phone
      });

      return successResponse(res, 'Usuario registrado exitosamente', result, 201);
    } catch (error) {
      console.error('Error en register:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errorResponse(res, 'Credenciales inválidas', 400, errors.array());
      }

      const { username, password } = req.body;
      const result = await authService.login(username, password);

      return successResponse(res, 'Inicio de sesión exitoso', result);
    } catch (error) {
      console.error('Error en login:', error);
      return errorResponse(res, error.message, error.statusCode || 401);
    }
  }

  async logout(req, res) {
    try {
      await authService.logout(req.user.id);
      return successResponse(res, 'Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      
      if (!refreshToken) {
        return errorResponse(res, 'Token de actualización requerido', 400);
      }

      const result = await authService.refreshToken(refreshToken);
      return successResponse(res, 'Token actualizado exitosamente', result);
    } catch (error) {
      console.error('Error en refreshToken:', error);
      return errorResponse(res, error.message, error.statusCode || 401);
    }
  }

  async getProfile(req, res) {
    try {
      const profile = await authService.getProfile(req.user.id);
      return successResponse(res, 'Perfil obtenido exitosamente', profile);
    } catch (error) {
      console.error('Error en getProfile:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, email } = req.body;
      const updatedProfile = await authService.updateProfile(req.user.id, {
        firstName,
        lastName,
        phone,
        email
      });

      return successResponse(res, 'Perfil actualizado exitosamente', updatedProfile);
    } catch (error) {
      console.error('Error en updateProfile:', error);
      return errorResponse(res, error.message, error.statusCode || 500);
    }
  }

  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return errorResponse(res, 'Contraseña actual y nueva son requeridas', 400);
      }

      await authService.changePassword(req.user.id, currentPassword, newPassword);
      return successResponse(res, 'Contraseña cambiada exitosamente');
    } catch (error) {
      console.error('Error en changePassword:', error);
      return errorResponse(res, error.message, error.statusCode || 400);
    }
  }
}

module.exports = new AuthController();