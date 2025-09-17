const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El título de la alerta es requerido' },
      len: { args: [1, 100], msg: 'El título no puede exceder 100 caracteres' }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'La descripción de la alerta es requerida' },
      len: { args: [1, 500], msg: 'La descripción no puede exceder 500 caracteres' }
    }
  },
  severity: {
    type: DataTypes.ENUM('Info', 'Advertencia', 'Atención', 'Crítico'),
    defaultValue: 'Info',
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('temperature', 'humidity', 'light', 'ph', 'system', 'connectivity'),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El tipo de alerta es requerido' }
    }
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  thresholdMin: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  thresholdMax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  deviceId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El ID del dispositivo es requerido' }
    }
  },
  environmentalDataId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'environmental_data',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  indexes: [
    {
      fields: ['deviceId', 'isActive', 'createdAt']
    },
    {
      fields: ['severity', 'isActive']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Método de instancia para resolver una alerta
Alert.prototype.resolve = async function(userId) {
  this.isActive = false;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  return await this.save();
};

// Método estático para obtener alertas activas
Alert.getActiveAlerts = function(deviceId = null) {
  const where = { isActive: true };
  if (deviceId) where.deviceId = deviceId;
  
  return this.findAll({
    where,
    order: [
      [sequelize.Sequelize.literal("FIELD(severity, 'Crítico', 'Atención', 'Advertencia', 'Info')")],
      ['createdAt', 'DESC']
    ],
    include: [
      {
        model: sequelize.models.User,
        as: 'resolver',
        attributes: ['id', 'firstName', 'lastName', 'username'],
        required: false
      }
    ]
  });
};

module.exports = Alert;