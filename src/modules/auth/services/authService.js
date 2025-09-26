const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../../../models');
const { Op } = require('sequelize');

class AuthService {
  
  // Generar JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  // Verificar token JWT
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido');
    }
  }

  // Registrar nuevo usuario
  async register(userData) {
    const { firstName, lastName, email, phone, username, password } = userData;

    try {
      // Verificar si el username ya existe
      const existingUsername = await User.findOne({
        where: { username }
      });

      if (existingUsername) {
        throw new Error('El nombre de usuario ya está en uso');
      }

      // Verificar si el email ya existe
      const existingEmail = await User.findOne({
        where: { email }
      });

      if (existingEmail) {
        throw new Error('El email ya está registrado');
      }

      // Hash de la contraseña
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear nuevo usuario
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        username,
        password: hashedPassword
      });

      // Generar token
      const token = this.generateToken(user.id);

      return {
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  }

  // Login de usuario
  async login(username, password) {
    // Buscar usuario
    const user = await User.findOne({ where: { username } });
    
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar si la cuenta está activa
    if (!user.isActive) {
      throw new Error('Cuenta desactivada. Contacta al administrador.');
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    // Generar token
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        role: user.role
      }
    };
  }

  // Obtener usuario por ID
  async getUserById(userId) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    if (!user.isActive) {
      throw new Error('Cuenta desactivada');
    }

    return user;
  }

  // Actualizar perfil de usuario
  async updateProfile(userId, updateData) {
    const { firstName, lastName, address, phone } = updateData;

    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    const fieldsToUpdate = {};
    if (firstName) fieldsToUpdate.firstName = firstName;
    if (lastName) fieldsToUpdate.lastName = lastName;
    if (address) fieldsToUpdate.address = address;
    if (phone) fieldsToUpdate.phone = phone;

    await user.update(fieldsToUpdate);
    
    return user;
  }

  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Actualizar contraseña
    await user.update({ password: newPassword });
    
    return { message: 'Contraseña actualizada exitosamente' };
  }
}

module.exports = new AuthService();