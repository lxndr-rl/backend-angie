const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// ============ IMPORTAR MODELOS ============
const User = require('./User');
const Device = require('./Device');
const DHT22Reading = require('./DHT22Reading');
const MQ135Reading = require('./MQ135Reading');
const MQ7Reading = require('./MQ7Reading');
const MQ4Reading = require('./MQ4Reading');
const MQ136Reading = require('./MQ136Reading');
const SystemConfig = require('./SystemConfig');

// ============ MODELO ALERT (actualizado) ============
const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('temperature', 'humidity', 'co', 'ch4', 'h2s', 'air_quality', 'system', 'maintenance', 'security'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  sensorType: {
    type: DataTypes.ENUM('dht22', 'mq135', 'mq7', 'mq4', 'mq136', 'system'),
    allowNull: true
  },
  readingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID de la lectura que generó la alerta'
  },
  triggerValue: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  thresholdValue: {
    type: DataTypes.DECIMAL(10, 4),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  },
  actions: {
    type: DataTypes.JSON,
    allowNull: true
  },
  autoResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['isRead']
    },
    {
      fields: ['isResolved']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['sensorType']
    }
  ]
});

// ============ RELACIONES ============

// Device -> Readings (One to Many)
Device.hasMany(DHT22Reading, {
  foreignKey: 'deviceId',
  as: 'dht22Readings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
DHT22Reading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(MQ135Reading, {
  foreignKey: 'deviceId',
  as: 'mq135Readings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
MQ135Reading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(MQ7Reading, {
  foreignKey: 'deviceId',
  as: 'mq7Readings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
MQ7Reading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(MQ4Reading, {
  foreignKey: 'deviceId',
  as: 'mq4Readings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
MQ4Reading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

Device.hasMany(MQ136Reading, {
  foreignKey: 'deviceId',
  as: 'mq136Readings',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
MQ136Reading.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

// User -> Alert (One to Many)
User.hasMany(Alert, {
  foreignKey: 'userId',
  as: 'alerts',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Alert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User -> Alert (Resolved By) (One to Many)
User.hasMany(Alert, {
  foreignKey: 'resolvedBy',
  as: 'resolvedAlerts',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
Alert.belongsTo(User, {
  foreignKey: 'resolvedBy',
  as: 'resolver'
});

// Device -> Alert (One to Many)
Device.hasMany(Alert, {
  foreignKey: 'deviceId',
  as: 'alerts',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});
Alert.belongsTo(Device, {
  foreignKey: 'deviceId',
  as: 'device'
});

// User -> SystemConfig (Last Modified By) (One to Many)
User.hasMany(SystemConfig, {
  foreignKey: 'lastModifiedBy',
  as: 'modifiedConfigs',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
SystemConfig.belongsTo(User, {
  foreignKey: 'lastModifiedBy',
  as: 'modifier'
});

// ============ HOOKS ============

// Hook para Alert - log de alertas críticas
Alert.addHook('afterCreate', (alert, options) => {
  if (alert.severity === 'critical') {
    console.log(`🚨 ALERTA CRÍTICA CREADA: ${alert.title}`);
  }
});

// Hook para SystemConfig - log de cambios de configuración
SystemConfig.addHook('afterUpdate', (config, options) => {
  console.log(`Configuración actualizada: ${config.configKey}`);
});

// ============ MÉTODOS DE INSTANCIA ============

// Método para Alert - marcar como resuelto
Alert.prototype.resolve = async function(resolvedBy) {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  return await this.save();
};

// ============ MÉTODOS DE CLASE ============

// Método para Alert - buscar no resueltas
Alert.findUnresolved = function() {
  return this.findAll({
    where: { isResolved: false },
    order: [['severity', 'DESC'], ['createdAt', 'DESC']]
  });
};

// Método para SystemConfig - obtener por categoría
SystemConfig.findByCategory = function(category) {
  return this.findAll({
    where: { 
      category: category,
      isActive: true 
    }
  });
};

// ============ EXPORTACIONES ============
module.exports = {
  sequelize,
  User,
  Device,
  DHT22Reading,
  MQ135Reading,
  MQ7Reading,
  MQ4Reading,
  MQ136Reading,
  Alert,
  SystemConfig
};
