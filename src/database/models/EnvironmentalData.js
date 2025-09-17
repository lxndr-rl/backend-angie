const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const EnvironmentalData = sequelize.define('EnvironmentalData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  temperature: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: { args: [-10], msg: 'La temperatura no puede ser menor a -10°C' },
      max: { args: [60], msg: 'La temperatura no puede ser mayor a 60°C' }
    }
  },
  humidity: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La humedad no puede ser menor a 0%' },
      max: { args: [100], msg: 'La humedad no puede ser mayor a 100%' }
    }
  },
  light: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El nivel de luz no puede ser negativo' }
    }
  },
  ph: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El pH no puede ser menor a 0' },
      max: { args: [14], msg: 'El pH no puede ser mayor a 14' }
    }
  },
  deviceId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'El ID del dispositivo es requerido' }
    }
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    defaultValue: null
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    defaultValue: null
  },
  sensorStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'error'),
    defaultValue: 'active',
    allowNull: false
  }
}, {
  tableName: 'environmental_data',
  timestamps: true,
  indexes: [
    {
      fields: ['deviceId', 'createdAt']
    },
    {
      fields: ['deviceId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

// Método estático para obtener el último registro por dispositivo
EnvironmentalData.getLatestByDevice = function(deviceId) {
  return this.findOne({
    where: { deviceId },
    order: [['createdAt', 'DESC']]
  });
};

// Método estático para obtener datos históricos
EnvironmentalData.getHistoricalData = function(deviceId, startDate, endDate, limit = 100) {
  const where = { deviceId };
  
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt[sequelize.Sequelize.Op.gte] = new Date(startDate);
    if (endDate) where.createdAt[sequelize.Sequelize.Op.lte] = new Date(endDate);
  }
  
  return this.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit)
  });
};

module.exports = EnvironmentalData;