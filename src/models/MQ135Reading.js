const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MQ135Reading = sequelize.define('MQ135Reading', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'devices',
      key: 'id'
    }
  },
  ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment: 'Concentración total en PPM'
  },
  voltage: {
    type: DataTypes.DECIMAL(5, 3),
    allowNull: false,
    comment: 'Voltaje analógico leído'
  },
  resistance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Resistencia del sensor en kΩ'
  },
  airQualityIndex: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Índice de calidad del aire (0-500)'
  },
  airQuality: {
    type: DataTypes.ENUM('excellent', 'good', 'moderate', 'poor', 'hazardous'),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mq135_readings',
  timestamps: false,
  indexes: [
    {
      fields: ['deviceId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['ppm']
    },
    {
      fields: ['airQuality']
    }
  ]
});

module.exports = MQ135Reading;
