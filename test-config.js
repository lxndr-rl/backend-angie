// Test simple de la configuración
require('dotenv').config();
console.log('🔄 Iniciando test de configuración...');

// Test 1: Variables de entorno
console.log('📊 Variables de entorno:');
console.log(`   • DB_HOST: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   • DB_PORT: ${process.env.DB_PORT || 3306}`);
console.log(`   • DB_NAME: ${process.env.DB_NAME || 'cacao_monitoring'}`);
console.log(`   • DB_USER: ${process.env.DB_USER || 'root'}`);
console.log(`   • JWT_SECRET: ${process.env.JWT_SECRET ? 'Configurado' : 'NO CONFIGURADO'}`);
console.log(`   • PORT: ${process.env.PORT || 3000}`);

// Test 2: Dependencias
console.log('\n📦 Verificando dependencias...');
try {
  require('express');
  console.log('   ✅ Express');
} catch (e) {
  console.log('   ❌ Express: ' + e.message);
}

try {
  require('mysql2');
  console.log('   ✅ MySQL2');
} catch (e) {
  console.log('   ❌ MySQL2: ' + e.message);
}

try {
  require('sequelize');
  console.log('   ✅ Sequelize');
} catch (e) {
  console.log('   ❌ Sequelize: ' + e.message);
}

try {
  require('jsonwebtoken');
  console.log('   ✅ JWT');
} catch (e) {
  console.log('   ❌ JWT: ' + e.message);
}

try {
  require('bcryptjs');
  console.log('   ✅ Bcryptjs');
} catch (e) {
  console.log('   ❌ Bcryptjs: ' + e.message);
}

// Test 3: Archivos del proyecto
console.log('\n📁 Verificando estructura de archivos...');
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/server.js',
  'src/config/database.js',
  'src/models/index.js',
  'src/modules/auth/authService.js',
  'src/modules/auth/authController.js',
  'src/modules/auth/authRoutes.js',
  'src/shared/middleware/auth.js',
  'src/shared/middleware/errorHandler.js'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
  }
});

// Test 4: Intentar configuración de base de datos (sin conectar)
console.log('\n🗄️ Verificando configuración de base de datos...');
try {
  const { Sequelize } = require('sequelize');
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'cacao_monitoring',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false
    }
  );
  console.log('   ✅ Configuración de Sequelize creada correctamente');
} catch (e) {
  console.log('   ❌ Error en configuración de Sequelize: ' + e.message);
}

console.log('\n🎉 Test completado. Si todo está en verde, el proyecto está listo.');
console.log('\n💡 Para ejecutar el servidor:');
console.log('   npm run dev (desarrollo)');
console.log('   npm start (producción)');