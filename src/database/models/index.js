const { sequelize } = require('../connection');

// Importar todos los modelos
const User = require('./User');
const EnvironmentalData = require('./EnvironmentalData');
const Alert = require('./Alert');
const SystemConfig = require('./SystemConfig');

// Definir relaciones entre modelos

// User tiene muchas AlertasResueltas
User.hasMany(Alert, {
  foreignKey: 'resolvedBy',
  as: 'resolvedAlerts'
});

Alert.belongsTo(User, {
  foreignKey: 'resolvedBy',
  as: 'resolver'
});

// User puede actualizar SystemConfig
User.hasMany(SystemConfig, {
  foreignKey: 'updatedBy',
  as: 'configUpdates'
});

SystemConfig.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater'
});

// EnvironmentalData puede generar Alerts
EnvironmentalData.hasMany(Alert, {
  foreignKey: 'environmentalDataId',
  as: 'alerts'
});

Alert.belongsTo(EnvironmentalData, {
  foreignKey: 'environmentalDataId',
  as: 'environmentalData'
});

// Sincronizar modelos (crear tablas si no existen)
const syncModels = async (force = false) => {
  try {
    // Orden de sincronización respetando dependencias
    await User.sync({ force });
    await EnvironmentalData.sync({ force });
    await SystemConfig.sync({ force });
    await Alert.sync({ force });
    
    console.log('✅ Modelos sincronizados correctamente');
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  EnvironmentalData,
  Alert,
  SystemConfig,
  syncModels
};