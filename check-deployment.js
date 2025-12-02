// Script rápido para verificar estado del despliegue
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkDeployment() {
  console.log('🔍 Verificando estado del despliegue...\n');
  
  // 1. Verificar variables de entorno
  console.log('📋 Variables de Entorno:');
  console.log(`   • NODE_ENV: ${process.env.NODE_ENV || 'NO CONFIGURADO'}`);
  console.log(`   • PORT: ${process.env.PORT || '3000'}`);
  console.log(`   • DB_HOST: ${process.env.DB_HOST || 'NO CONFIGURADO'}`);
  console.log(`   • DB_NAME: ${process.env.DB_NAME || 'NO CONFIGURADO'}`);
  console.log(`   • DB_USER: ${process.env.DB_USER || 'NO CONFIGURADO'}`);
  console.log(`   • JWT_SECRET: ${process.env.JWT_SECRET ? 'CONFIGURADO ✅' : 'NO CONFIGURADO ❌'}`);
  console.log('');
  
  // 2. Verificar conexión a MySQL
  try {
    console.log('🔄 Intentando conectar a MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'cacao_monitoring'
    });
    
    console.log('✅ Conexión a MySQL exitosa\n');
    
    // Verificar tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`📊 Tablas encontradas: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   • ${tableName}`);
    });
    console.log('');
    
    // Verificar usuarios
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM User');
    console.log(`👥 Usuarios en base de datos: ${users[0].count}`);
    console.log('');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:');
    console.error(`   ${error.message}`);
    console.log('');
  }
  
  // 3. Estado general
  console.log('📌 Resumen del Estado:');
  console.log(`   • Servidor: ${process.env.NODE_ENV === 'production' ? 'PRODUCCIÓN ✅' : 'DESARROLLO ⚠️'}`);
  console.log(`   • Puerto: ${process.env.PORT || 3000}`);
  console.log(`   • Base de datos: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
  console.log('');
  
  // 4. URLs importantes
  const baseUrl = process.env.BASE_URL || `http://72.61.73.160:${process.env.PORT || 3000}`;
  console.log('🔗 URLs de la API:');
  console.log(`   • Health: ${baseUrl}/health`);
  console.log(`   • API Info: ${baseUrl}/api`);
  console.log(`   • Login: ${baseUrl}/api/auth/login`);
  console.log(`   • Register: ${baseUrl}/api/auth/register`);
  console.log('');
  
  console.log('✨ Verificación completada');
}

checkDeployment().catch(console.error);
