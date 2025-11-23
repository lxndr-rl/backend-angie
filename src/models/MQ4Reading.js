const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MQ4Reading = sequelize.define('MQ4Reading', {
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
  ch4_ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment: 'Concentración de CH4 en PPM'
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
  dangerLevel: {
    type: DataTypes.ENUM('safe', 'caution', 'warning', 'danger', 'extreme'),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'mq4_readings',
  timestamps: false,
  indexes: [
    {
      fields: ['deviceId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['ch4_ppm']
    },
    {
      fields: ['dangerLevel']
    }
  ]
});

module.exports = MQ4Reading;
