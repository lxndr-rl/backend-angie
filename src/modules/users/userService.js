const db = require('../../config/database');
const { successResponse, errorResponse, notFoundResponse } = require('../../shared/utils/response');
const { User } = require('../../models');
const { Op } = require('sequelize');

class UserService {
  /**
   * Obtiene todos los usuarios con paginación y filtros
   * @param {Object} options - Opciones de consulta
   * @returns {Object} Lista de usuarios paginada
   */
  async getAllUsers(options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        search = '',
        role = '',
        status = '',
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = options;

      const offset = (page - 1) * limit;

      // Construir filtros
      const whereClause = {};
      
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { username: { [Op.like]: `%${search}%` } },
          { cedula: { [Op.like]: `%${search}%` } }
        ];
      }

      if (role) {
        whereClause.role = role;
      }

      if (status) {
        whereClause.status = status;
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ['password'] }, // Excluir password
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, sortOrder.toUpperCase()]],
        raw: false
      });

      return {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      console.error('Error en UserService.getAllUsers:', error);
      throw new Error('Error al obtener usuarios');
    }
  }

  /**
   * Obtiene un usuario por ID
   * @param {number} userId - ID del usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  async getUserById(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return user;
    } catch (error) {
      console.error('Error en UserService.getUserById:', error);
      throw new Error('Error al obtener usuario');
    }
  }

  /**
   * Obtiene un usuario por username
   * @param {string} username - Username del usuario
   * @returns {Object|null} Usuario encontrado o null
   */
  async getUserByUsername(username) {
    try {
      const user = await User.findOne({
        where: { username },
        attributes: { exclude: ['password'] }
      });

      return user;
    } catch (error) {
      console.error('Error en UserService.getUserByUsername:', error);
      throw new Error('Error al obtener usuario por username');
    }
  }

  /**
   * Actualiza el perfil de un usuario
   * @param {number} userId - ID del usuario
   * @param {Object} updateData - Datos a actualizar
   * @returns {Object} Usuario actualizado
   */
  async updateUserProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Campos permitidos para actualizar
      const allowedFields = ['firstName', 'lastName', 'address', 'phone'];
      const filteredData = {};

      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });

      await user.update(filteredData);

      // Retornar usuario sin password
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error en UserService.updateUserProfile:', error);
      throw error;
    }
  }

  /**
   * Actualiza el estado de un usuario (solo admin)
   * @param {number} userId - ID del usuario
   * @param {string} status - Nuevo estado
   * @returns {Object} Usuario actualizado
   */
  async updateUserStatus(userId, status) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await user.update({ status });

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error en UserService.updateUserStatus:', error);
      throw error;
    }
  }

  /**
   * Actualiza el rol de un usuario (solo admin)
   * @param {number} userId - ID del usuario
   * @param {string} role - Nuevo rol
   * @returns {Object} Usuario actualizado
   */
  async updateUserRole(userId, role) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      await user.update({ role });

      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password'] }
      });

      return updatedUser;
    } catch (error) {
      console.error('Error en UserService.updateUserRole:', error);
      throw error;
    }
  }

  /**
   * Elimina un usuario (soft delete)
   * @param {number} userId - ID del usuario
   * @returns {boolean} True si se eliminó correctamente
   */
  async deleteUser(userId) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        throw new Error('Usuario no encontrado');
      }

      // Cambiar estado a inactivo en lugar de eliminar
      await user.update({ status: 'inactive' });

      return true;
    } catch (error) {
      console.error('Error en UserService.deleteUser:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de usuarios
   * @returns {Object} Estadísticas de usuarios
   */
  async getUserStats() {
    try {
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });
      const adminUsers = await User.count({ where: { role: 'admin' } });
      const regularUsers = await User.count({ where: { role: 'user' } });

      // Usuarios registrados en los últimos 30 días
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentUsers = await User.count({
        where: {
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });

      return {
        total: totalUsers,
        active: activeUsers,
        admins: adminUsers,
        users: regularUsers,
        recentRegistrations: recentUsers,
        inactiveUsers: totalUsers - activeUsers
      };
    } catch (error) {
      console.error('Error en UserService.getUserStats:', error);
      throw new Error('Error al obtener estadísticas de usuarios');
    }
  }

  /**
   * Verifica si un username o cédula ya existe
   * @param {string} username - Username a verificar
   * @param {string} cedula - Cédula a verificar
   * @param {number} excludeUserId - ID del usuario a excluir (para updates)
   * @returns {Object} Resultado de la verificación
   */
  async checkUserExists(username, cedula, excludeUserId = null) {
    try {
      const whereClause = {
        [Op.or]: [
          { username },
          { cedula }
        ]
      };

      if (excludeUserId) {
        whereClause.id = { [Op.ne]: excludeUserId };
      }

      const existingUser = await User.findOne({
        where: whereClause,
        attributes: ['id', 'username', 'cedula']
      });

      if (existingUser) {
        const conflictField = existingUser.username === username ? 'username' : 'cedula';
        return {
          exists: true,
          field: conflictField,
          message: `Ya existe un usuario con ese ${conflictField === 'username' ? 'nombre de usuario' : 'número de cédula'}`
        };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error en UserService.checkUserExists:', error);
      throw new Error('Error al verificar usuario existente');
    }
  }
}

module.exports = new UserService();