const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DHT22Reading = sequelize.define('DHT22Reading', {
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
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Temperatura en °C (-40 a 80°C)',
    validate: {
      min: -40,
      max: 80
    }
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: 'Humedad relativa en % (0-100%)',
    validate: {
      min: 0,
      max: 100
    }
  },
  heatIndex: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Índice de calor calculado'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'dht22_readings',
  timestamps: false,
  indexes: [
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
    }
  ]
});

module.exports = DHT22Reading;
