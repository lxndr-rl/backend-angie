const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de la base de datos MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'tesis_angie',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    timezone: '-05:00', // Zona horaria de Colombia
  }
);

// Función para conectar a la base de datos
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📂 Base de datos: ${process.env.DB_NAME || 'tesis_angie'}`);
      console.log(`🏠 Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    }
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    process.exit(1);
  }
};

// Función para sincronizar modelos (solo en desarrollo)
const syncDatabase = async (force = false) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ force });
      console.log('🔄 Modelos sincronizados con la base de datos');
    }
  } catch (error) {
    console.error('❌ Error sincronizando modelos:', error.message);
    throw error;
  }
};

// Función para cerrar la conexión
const closeDB = async () => {
  try {
    await sequelize.close();
    console.log('🔐 Conexión a MySQL cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error.message);
  }
};

module.exports = {
  sequelize,
  connectDB,
  syncDatabase,
  closeDB
};