const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.ENUM('ESP32', 'ESP8266', 'Arduino', 'Raspberry', 'Other'),
    defaultValue: 'ESP32',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastConnection: {
    type: DataTypes.DATE,
    allowNull: true
  },
  firmwareVersion: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'devices',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['deviceId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['lastConnection']
    }
  ]
});

module.exports = Device;
