const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MQ7Reading = sequelize.define('MQ7Reading', {
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
  co_ppm: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    comment: 'Concentración de CO en PPM'
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
  tableName: 'mq7_readings',
  timestamps: false,
  indexes: [
    {
      fields: ['deviceId']
    },
    {
      fields: ['createdAt']
    },
    {
      fields: ['co_ppm']
    },
    {
      fields: ['dangerLevel']
    }
  ]
});

module.exports = MQ7Reading;
