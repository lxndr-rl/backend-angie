const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
    type: DataTypes.ENUM('thresholds', 'alerts', 'system', 'sensors', 'notification', 'air_quality', 'data_collection'),
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
      model: 'users',
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

module.exports = SystemConfig;
