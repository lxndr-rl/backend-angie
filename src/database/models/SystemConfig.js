const { DataTypes } = require('sequelize');
const { sequelize } = require('../connection');

const SystemConfig = sequelize.define('SystemConfig', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  deviceId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      name: 'unique_device_config',
      msg: 'Ya existe configuración para este dispositivo'
    },
    validate: {
      notEmpty: { msg: 'El ID del dispositivo es requerido' }
    }
  },
  // Umbrales de temperatura
  temperatureMin: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La temperatura mínima no puede ser negativa' }
    }
  },
  temperatureMax: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 32.00,
    allowNull: false,
    validate: {
      max: { args: [60], msg: 'La temperatura máxima no puede exceder 60°C' }
    }
  },
  // Umbrales de humedad
  humidityMin: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 40.00,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La humedad mínima no puede ser negativa' },
      max: { args: [100], msg: 'La humedad mínima no puede exceder 100%' }
    }
  },
  humidityMax: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 80.00,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'La humedad máxima no puede ser negativa' },
      max: { args: [100], msg: 'La humedad máxima no puede exceder 100%' }
    }
  },
  // Umbrales de luz
  lightMin: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 100.00,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El nivel de luz mínimo no puede ser negativo' }
    }
  },
  lightMax: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 1000.00,
    allowNull: false
  },
  // Umbrales de pH
  phMin: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 6.00,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El pH mínimo no puede ser negativo' },
      max: { args: [14], msg: 'El pH mínimo no puede exceder 14' }
    }
  },
  phMax: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 7.50,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'El pH máximo no puede ser negativo' },
      max: { args: [14], msg: 'El pH máximo no puede exceder 14' }
    }
  },
  // Configuración de recolección de datos
  dataCollectionInterval: {
    type: DataTypes.INTEGER,
    defaultValue: 300, // segundos (5 minutos)
    allowNull: false,
    validate: {
      min: { args: [60], msg: 'El intervalo mínimo es de 60 segundos' }
    }
  },
  dataCollectionEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  // Configuración de alertas
  alertsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  notificationMethods: {
    type: DataTypes.JSON,
    defaultValue: ['in-app'],
    allowNull: false
  },
  serverUrl: {
    type: DataTypes.STRING(255),
    defaultValue: 'https://api.cacaomonitor.com',
    allowNull: false
  },
  lastUpdate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'system_configs',
  timestamps: true,
  hooks: {
    beforeSave: async (config) => {
      // Validar que min < max para todos los umbrales
      if (config.temperatureMin >= config.temperatureMax) {
        throw new Error('La temperatura mínima debe ser menor que la máxima');
      }
      if (config.humidityMin >= config.humidityMax) {
        throw new Error('La humedad mínima debe ser menor que la máxima');
      }
      if (config.lightMin >= config.lightMax) {
        throw new Error('El nivel de luz mínimo debe ser menor que el máximo');
      }
      if (config.phMin >= config.phMax) {
        throw new Error('El pH mínimo debe ser menor que el máximo');
      }
      
      config.lastUpdate = new Date();
    }
  }
});

// Método para verificar si un valor está fuera de los umbrales
SystemConfig.prototype.checkThresholds = function(data) {
  const alerts = [];
  
  // Verificar temperatura
  if (data.temperature < this.temperatureMin || data.temperature > this.temperatureMax) {
    alerts.push({
      type: 'temperature',
      severity: data.temperature < this.temperatureMin - 5 || data.temperature > this.temperatureMax + 5 ? 'Crítico' : 'Advertencia',
      value: data.temperature,
      thresholdMin: this.temperatureMin,
      thresholdMax: this.temperatureMax
    });
  }
  
  // Verificar humedad
  if (data.humidity < this.humidityMin || data.humidity > this.humidityMax) {
    alerts.push({
      type: 'humidity',
      severity: data.humidity < this.humidityMin - 10 || data.humidity > this.humidityMax + 10 ? 'Crítico' : 'Advertencia',
      value: data.humidity,
      thresholdMin: this.humidityMin,
      thresholdMax: this.humidityMax
    });
  }
  
  // Verificar luz
  if (data.light < this.lightMin || data.light > this.lightMax) {
    alerts.push({
      type: 'light',
      severity: 'Atención',
      value: data.light,
      thresholdMin: this.lightMin,
      thresholdMax: this.lightMax
    });
  }
  
  // Verificar pH
  if (data.ph < this.phMin || data.ph > this.phMax) {
    alerts.push({
      type: 'ph',
      severity: data.ph < this.phMin - 0.5 || data.ph > this.phMax + 0.5 ? 'Crítico' : 'Advertencia',
      value: data.ph,
      thresholdMin: this.phMin,
      thresholdMax: this.phMax
    });
  }
  
  return alerts;
};

module.exports = SystemConfig;