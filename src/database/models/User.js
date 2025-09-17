const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El nombre es requerido' },
      len: { args: [1, 50], msg: 'El nombre debe tener entre 1 y 50 caracteres' }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El apellido es requerido' },
      len: { args: [1, 50], msg: 'El apellido debe tener entre 1 y 50 caracteres' }
    }
  },
  cedula: {
    type: DataTypes.STRING(15),
    allowNull: false,
    unique: {
      name: 'unique_cedula',
      msg: 'La cédula ya está registrada'
    },
    validate: {
      notEmpty: { msg: 'La cédula es requerida' },
      len: { args: [5, 15], msg: 'La cédula debe tener entre 5 y 15 caracteres' }
    }
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La dirección es requerida' },
      len: { args: [5, 200], msg: 'La dirección debe tener entre 5 y 200 caracteres' }
    }
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El teléfono es requerido' },
      len: { args: [7, 15], msg: 'El teléfono debe tener entre 7 y 15 caracteres' }
    }
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: {
      name: 'unique_username',
      msg: 'El nombre de usuario ya está en uso'
    },
    validate: {
      notEmpty: { msg: 'El nombre de usuario es requerido' },
      len: { args: [3, 30], msg: 'El nombre de usuario debe tener entre 3 y 30 caracteres' }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La contraseña es requerida' },
      len: { args: [6, 255], msg: 'La contraseña debe tener al menos 6 caracteres' }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Método de instancia para comparar contraseñas
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para obtener datos públicos (sin contraseña)
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;