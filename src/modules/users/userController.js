const userService = require('./userService');
const { successResponse, errorResponse, notFoundResponse, forbiddenResponse } = require('../../shared/utils/response');
const { USER_ROLES } = require('../../shared/constants');

class UserController {
  /**
   * Obtiene todos los usuarios (solo admin)
   */
  async getAllUsers(req, res) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      const result = await userService.getAllUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        role,
        status,
        sortBy,
        sortOrder
      });

      return successResponse(
        res,
        result,
        'Usuarios obtenidos exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.getAllUsers:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene un usuario por ID
   */
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;
      const requestingUserRole = req.user.role;

      // Solo admin puede ver otros usuarios, usuarios normales solo pueden ver su propio perfil
      if (requestingUserRole !== USER_ROLES.ADMIN && parseInt(id) !== requestingUserId) {
        return forbiddenResponse(res, 'No tienes permisos para ver este usuario');
      }

      const user = await userService.getUserById(id);

      if (!user) {
        return notFoundResponse(res, 'Usuario no encontrado');
      }

      return successResponse(res, user, 'Usuario obtenido exitosamente');
    } catch (error) {
      console.error('Error en UserController.getUserById:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  async getCurrentUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);

      if (!user) {
        return notFoundResponse(res, 'Usuario no encontrado');
      }

      return successResponse(res, user, 'Perfil obtenido exitosamente');
    } catch (error) {
      console.error('Error en UserController.getCurrentUserProfile:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza el perfil del usuario actual
   */
  async updateCurrentUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await userService.updateUserProfile(userId, updateData);

      return successResponse(
        res,
        updatedUser,
        'Perfil actualizado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.updateCurrentUserProfile:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza el perfil de un usuario específico (solo admin)
   */
  async updateUserProfile(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedUser = await userService.updateUserProfile(id, updateData);

      return successResponse(
        res,
        updatedUser,
        'Usuario actualizado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.updateUserProfile:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return notFoundResponse(res, error.message);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza el estado de un usuario (solo admin)
   */
  async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return errorResponse(res, 'El estado es requerido', 400);
      }

      const updatedUser = await userService.updateUserStatus(id, status);

      return successResponse(
        res,
        updatedUser,
        'Estado del usuario actualizado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.updateUserStatus:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return notFoundResponse(res, error.message);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Actualiza el rol de un usuario (solo admin)
   */
  async updateUserRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role) {
        return errorResponse(res, 'El rol es requerido', 400);
      }

      if (!Object.values(USER_ROLES).includes(role)) {
        return errorResponse(res, 'Rol inválido', 400);
      }

      const updatedUser = await userService.updateUserRole(id, role);

      return successResponse(
        res,
        updatedUser,
        'Rol del usuario actualizado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.updateUserRole:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return notFoundResponse(res, error.message);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Elimina un usuario (solo admin)
   */
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const requestingUserId = req.user.id;

      // No permitir que un admin se elimine a sí mismo
      if (parseInt(id) === requestingUserId) {
        return forbiddenResponse(res, 'No puedes eliminar tu propia cuenta');
      }

      const deleted = await userService.deleteUser(id);

      if (!deleted) {
        return notFoundResponse(res, 'Usuario no encontrado');
      }

      return successResponse(
        res,
        null,
        'Usuario eliminado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.deleteUser:', error);
      
      if (error.message === 'Usuario no encontrado') {
        return notFoundResponse(res, error.message);
      }
      
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Obtiene estadísticas de usuarios (solo admin)
   */
  async getUserStats(req, res) {
    try {
      const stats = await userService.getUserStats();

      return successResponse(
        res,
        stats,
        'Estadísticas de usuarios obtenidas exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.getUserStats:', error);
      return errorResponse(res, error.message, 500);
    }
  }

  /**
   * Busca usuarios por username (solo admin)
   */
  async searchUserByUsername(req, res) {
    try {
      const { username } = req.params;

      if (!username || username.trim().length < 2) {
        return errorResponse(
          res,
          'El username debe tener al menos 2 caracteres',
          400
        );
      }

      const user = await userService.getUserByUsername(username.trim());

      if (!user) {
        return notFoundResponse(res, 'Usuario no encontrado');
      }

      return successResponse(
        res,
        user,
        'Usuario encontrado exitosamente'
      );
    } catch (error) {
      console.error('Error en UserController.searchUserByUsername:', error);
      return errorResponse(res, error.message, 500);
    }
  }
}

module.exports = new UserController();