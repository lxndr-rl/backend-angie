// Test de conexión a MySQL con las credenciales actualizadas
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('🔄 Probando conexión a MySQL...');
console.log('📊 Configuración:');
console.log(`   • Host: ${process.env.DB_HOST}`);
console.log(`   • Puerto: ${process.env.DB_PORT}`);
console.log(`   • Base de datos: ${process.env.DB_NAME}`);
console.log(`   • Usuario: ${process.env.DB_USER}`);
console.log(`   • Contraseña: ${process.env.DB_PASSWORD ? '****** (configurada)' : 'NO CONFIGURADA'}`);

async function testConnection() {
  try {
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
      }
    );

    console.log('\n🔄 Intentando conectar...');
    await sequelize.authenticate();
    console.log('✅ ¡CONEXIÓN EXITOSA! MySQL está funcionando correctamente');
    
    console.log('\n📋 Verificando tablas...');
    const [results] = await sequelize.query('SHOW TABLES');
    console.log(`✅ Tablas encontradas: ${results.length}`);
    
    if (results.length > 0) {
      console.log('📝 Tablas:');
      results.forEach(table => {
        const tableName = Object.values(table)[0];
        console.log(`   • ${tableName}`);
      });
    } else {
      console.log('⚠️  No se encontraron tablas. Ejecuta el script SQL en HeidiSQL.');
    }

    await sequelize.close();
    console.log('\n🎉 Test completado. La conexión funciona perfectamente.');
    
  } catch (error) {
    console.error('❌ Error de conexión:');
    console.error(`   • Tipo: ${error.name}`);
    console.error(`   • Mensaje: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Posibles soluciones:');
      console.log('   1. Verifica que MySQL esté ejecutándose');
      console.log('   2. Confirma que el puerto 3306 esté disponible');
      console.log('   3. Revisa las credenciales en .env');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Error de credenciales:');
      console.log('   1. Verifica el usuario y contraseña');
      console.log('   2. Confirma que el usuario tenga permisos');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 Base de datos no encontrada:');
      console.log('   1. Crea la base de datos "cacao_monitoring" en HeidiSQL');
      console.log('   2. Ejecuta: CREATE DATABASE cacao_monitoring;');
    }
  }
}

testConnection();