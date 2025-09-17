require('dotenv').config();
const { Sequelize } = require('sequelize');

// Configuración de la base de datos MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'cacao_monitoring',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    
    // Pool de conexiones
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
    
    // Configuraciones específicas de MySQL
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      useUTC: false, // Para manejo de fechas locales
      dateStrings: true,
      typeCast: true
    },
    
    // Timezone
    timezone: process.env.DB_TIMEZONE || '-05:00', // UTC-5 para Colombia
    
    // Configuraciones adicionales
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    
    // Configuraciones de rendimiento
    benchmark: process.env.NODE_ENV === 'development',
    
    // Configuraciones de seguridad
    ssl: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: false
    } : false,
    
    // Configuraciones de retry
    retry: {
      max: 3
    }
  }
);

// Función para verificar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
    return false;
  }
};

// Función para cerrar la conexión
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✅ Conexión a MySQL cerrada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al cerrar conexión MySQL:', error);
    return false;
  }
};

// Función para sincronizar modelos
const syncDatabase = async (options = {}) => {
  try {
    const defaultOptions = {
      force: false, // No eliminar tablas existentes
      alter: false, // No alterar tablas existentes
      logging: process.env.NODE_ENV === 'development'
    };
    
    const syncOptions = { ...defaultOptions, ...options };
    
    await sequelize.sync(syncOptions);
    console.log('✅ Base de datos sincronizada correctamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error al sincronizar base de datos:', error);
    throw error;
  }
};

// Función para crear la base de datos si no existe
const createDatabaseIfNotExists = async () => {
  const mysql = require('mysql2/promise');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });
    
    const databaseName = process.env.DB_NAME || 'cacao_monitoring';
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`✅ Base de datos '${databaseName}' verificada/creada`);
    
    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Error al crear base de datos:', error);
    throw error;
  }
};

// Función de inicialización completa
const initializeDatabase = async () => {
  try {
    // Crear base de datos si no existe
    await createDatabaseIfNotExists();
    
    // Verificar conexión
    await testConnection();
    
    // Sincronizar modelos
    await syncDatabase();
    
    console.log('🎉 Base de datos inicializada completamente');
    return true;
  } catch (error) {
    console.error('❌ Error en inicialización de base de datos:', error);
    throw error;
  }
};

// Event listeners para la conexión
sequelize.addHook('beforeConnect', async (config) => {
  console.log('🔄 Estableciendo conexión a MySQL...');
});

sequelize.addHook('afterConnect', async (connection, config) => {
  console.log(`✅ Conectado a MySQL: ${config.database}@${config.host}:${config.port}`);
});

sequelize.addHook('beforeDisconnect', async (connection) => {
  console.log('🔄 Cerrando conexión a MySQL...');
});

// Exportaciones
module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.closeConnection = closeConnection;
module.exports.syncDatabase = syncDatabase;
module.exports.createDatabaseIfNotExists = createDatabaseIfNotExists;
module.exports.initializeDatabase = initializeDatabase;

// Información de la configuración (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Configuración de Base de Datos:');
  console.log(`   • Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   • Puerto: ${process.env.DB_PORT || 3306}`);
  console.log(`   • Base de datos: ${process.env.DB_NAME || 'cacao_monitoring'}`);
  console.log(`   • Usuario: ${process.env.DB_USER || 'root'}`);
  console.log(`   • Pool máximo: ${process.env.DB_POOL_MAX || 10}`);
  console.log(`   • Timezone: ${process.env.DB_TIMEZONE || '-05:00'}`);
}