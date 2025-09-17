const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');

class AuthService {
  async register(userData) {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({
        where: {
          $or: [
            { email: userData.email },
            { username: userData.username }
          ]
        }
      });

      if (existingUser) {
        const field = existingUser.email === userData.email ? 'email' : 'username';
        throw new Error(`Ya existe un usuario con este ${field}`);
      }

      // Hash de la contraseña
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Crear usuario
      const user = await User.create({
        ...userData,
        password: hashedPassword
      });

      // Generar tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Guardar refresh token
      await user.update({ refreshToken });

      // Retornar datos sin contraseña
      const { password, refreshToken: _, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error en AuthService.register:', error);
      throw error;
    }
  }

  async login(username, password) {
    try {
      // Buscar usuario
      const user = await User.findOne({
        where: {
          $or: [
            { username: username },
            { email: username }
          ],
          isActive: true
        }
      });

      if (!user) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
      }

      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const error = new Error('Credenciales inválidas');
        error.statusCode = 401;
        throw error;
      }

      // Generar tokens
      const { accessToken, refreshToken } = this.generateTokens(user);

      // Actualizar último login y refresh token
      await user.update({
        lastLogin: new Date(),
        refreshToken
      });

      // Retornar datos sin contraseña
      const { password: _, refreshToken: __, ...userWithoutPassword } = user.toJSON();

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      };
    } catch (error) {
      console.error('Error en AuthService.login:', error);
      throw error;
    }
  }

  async logout(userId) {
    try {
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );
      return true;
    } catch (error) {
      console.error('Error en AuthService.logout:', error);
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      // Verificar token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Buscar usuario
      const user = await User.findOne({
        where: {
          id: decoded.id,
          refreshToken: refreshToken,
          isActive: true
        }
      });

      if (!user) {
        const error = new Error('Token de actualización inválido');
        error.statusCode = 401;
        throw error;
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(user);

      // Actualizar refresh token
      await user.update({ refreshToken: tokens.refreshToken });

      return tokens;
    } catch (error) {
      console.error('Error en AuthService.refreshToken:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        error.statusCode = 401;
        error.message = 'Token de actualización inválido o expirado';
      }
      throw error;
    }
  }

  async getProfile(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Error en AuthService.getProfile:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      // Verificar email único si se está actualizando
      if (updateData.email && updateData.email !== user.email) {
        const existingUser = await User.findOne({
          where: { email: updateData.email, id: { $ne: userId } }
        });

        if (existingUser) {
          const error = new Error('Ya existe un usuario con este email');
          error.statusCode = 400;
          throw error;
        }
      }

      await user.update(updateData);

      // Retornar usuario actualizado sin contraseña
      const { password, refreshToken, ...userWithoutPassword } = user.toJSON();
      return userWithoutPassword;
    } catch (error) {
      console.error('Error en AuthService.updateProfile:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);

      if (!user) {
        const error = new Error('Usuario no encontrado');
        error.statusCode = 404;
        throw error;
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        const error = new Error('Contraseña actual incorrecta');
        error.statusCode = 400;
        throw error;
      }

      // Hash nueva contraseña
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      await user.update({ password: hashedNewPassword });

      return true;
    } catch (error) {
      console.error('Error en AuthService.changePassword:', error);
      throw error;
    }
  }

  generateTokens(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!user || !user.isActive) {
        const error = new Error('Token inválido');
        error.statusCode = 401;
        throw error;
      }

      return user;
    } catch (error) {
      console.error('Error en AuthService.verifyToken:', error);
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        error.statusCode = 401;
        error.message = 'Token inválido o expirado';
      }
      throw error;
    }
  }
}

module.exports = new AuthService();