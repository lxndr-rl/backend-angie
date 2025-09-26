const { DataTypes, Op } = require('sequelize');
const sequelize = require('../config/database');

// ============ MODELO USER ============
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: [2, 50],
      notEmpty: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: [7, 20]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user',
    allowNull: false
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.TINYINT(1),
    defaultValue: 1,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailVerified: {
    type: DataTypes.TINYINT(1),
    defaultValue: 0,
    allowNull: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false, // Manejamos manualmente createdAt y updatedAt
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['role']
    },
    {
      fields: ['isActive']
    }
  ]
});

// ============ MODELO ENVIRONMENTAL DATA ============
const EnvironmentalData = sequelize.define('EnvironmentalData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: -50,
      max: 100
    }
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  lightIntensity: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  soilPh: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 14
    }
  },
  soilMoisture: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  rainfall: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  windSpeed: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  atmosphericPressure: {
    type: DataTypes.DECIMAL(7, 2),
    allowNull: true,
    validate: {
      min: 800,
      max: 1200
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  altitude: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  location: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  quality: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor'),
    allowNull: true
  },
  batteryLevel: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  signalStrength: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: -120,
      max: 0
    }
  }
}, {
  tableName: 'environmental_data',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['temperature']
    },
    {
      fields: ['humidity']
    },
    {
      fields: ['quality']
    }
  ]
});

// ============ MODELO ALERT ============
const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('temperature', 'humidity', 'light', 'ph', 'moisture', 'system', 'maintenance', 'security'),
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
      model: User,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  environmentalDataId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: EnvironmentalData,
      key: 'id'
    }
  },
  deviceId: {
    type: DataTypes.STRING(100),
    allowNull: true
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
      fields: ['environmentalDataId']
    }
  ]
});

// ============ MODELO SYSTEM CONFIG ============
const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  configKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  configValue: {
    type: DataTypes.JSON,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('thresholds', 'alerts', 'system', 'sensors', 'notification', 'cacao_optimal', 'data_collection'),
    allowNull: false,
    defaultValue: 'system'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  isEditable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastModifiedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    }
  },
  version: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  validationSchema: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'system_config',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['configKey']
    },
    {
      fields: ['category']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['lastModifiedBy']
    }
  ]
});

// ============ RELACIONES ============

// User -> EnvironmentalData (One to Many)
User.hasMany(EnvironmentalData, {
  foreignKey: 'userId',
  as: 'environmentalData',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

EnvironmentalData.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
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

// EnvironmentalData -> Alert (One to Many)
EnvironmentalData.hasMany(Alert, {
  foreignKey: 'environmentalDataId',
  as: 'alerts',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Alert.belongsTo(EnvironmentalData, {
  foreignKey: 'environmentalDataId',
  as: 'environmentalData'
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

// Hook para User - actualizar lastLogin
User.addHook('afterUpdate', (user, options) => {
  if (user.changed('lastLogin')) {
    console.log(`Usuario ${user.username} actualizó su último login`);
  }
});

// Hook para EnvironmentalData - log de nuevos datos
EnvironmentalData.addHook('afterCreate', (data, options) => {
  console.log(`Nuevos datos ambientales registrados para dispositivo ${data.deviceId}`);
});

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

// Método para User - obtener nombre completo
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Método para User - verificar si es admin
User.prototype.isAdmin = function() {
  return this.role === 'admin';
};

// Método para EnvironmentalData - verificar si está dentro de rangos óptimos
EnvironmentalData.prototype.isWithinOptimalRange = function() {
  const optimal = {
    temperature: { min: 20, max: 30 },
    humidity: { min: 60, max: 80 },
    soilPh: { min: 6.0, max: 7.5 },
    soilMoisture: { min: 40, max: 70 }
  };
  
  return (
    this.temperature >= optimal.temperature.min && this.temperature <= optimal.temperature.max &&
    this.humidity >= optimal.humidity.min && this.humidity <= optimal.humidity.max &&
    this.soilPh >= optimal.soilPh.min && this.soilPh <= optimal.soilPh.max &&
    this.soilMoisture >= optimal.soilMoisture.min && this.soilMoisture <= optimal.soilMoisture.max
  );
};

// Método para Alert - marcar como resuelto
Alert.prototype.resolve = async function(resolvedBy) {
  this.isResolved = true;
  this.resolvedAt = new Date();
  this.resolvedBy = resolvedBy;
  return await this.save();
};

// ============ MÉTODOS DE CLASE ============

// Método para User - buscar activos
User.findActive = function() {
  return this.findAll({
    where: { isActive: true }
  });
};

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
  EnvironmentalData,
  Alert,
  SystemConfig
};