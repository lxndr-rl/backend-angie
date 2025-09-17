const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../../../database/models');

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
    const { firstName, lastName, cedula, address, phone, username, password } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username },
          { cedula }
        ]
      }
    });

    if (existingUser) {
      throw new Error(
        existingUser.username === username 
          ? 'El nombre de usuario ya está en uso' 
          : 'La cédula ya está registrada'
      );
    }

    // Crear nuevo usuario
    const user = await User.create({
      firstName,
      lastName,
      cedula,
      address,
      phone,
      username,
      password
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