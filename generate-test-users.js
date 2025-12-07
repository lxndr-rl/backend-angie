/**
 * Script para generar usuarios de prueba con contraseñas hasheadas
 * Ejecutar con: node generate-test-users.js
 */

const bcrypt = require('bcryptjs');

// Configuración de usuarios de prueba
const testUsers = [
  {
    username: 'maria.garcia',
    email: 'maria.garcia@cacaomonitor.com',
    password: 'Maria2024!',
    firstName: 'María',
    lastName: 'García',
    phone: '+593987654321',
    role: 'admin'
  },
  {
    username: 'carlos.mendoza',
    email: 'carlos.mendoza@cacaomonitor.com',
    password: 'Carlos2024!',
    firstName: 'Carlos',
    lastName: 'Mendoza',
    phone: '+593998765432',
    role: 'user'
  },
  {
    username: 'ana.rodriguez',
    email: 'ana.rodriguez@cacaomonitor.com',
    password: 'Ana2024!',
    firstName: 'Ana',
    lastName: 'Rodríguez',
    phone: '+593976543210',
    role: 'user'
  }
];

async function generateSQL() {
  console.log('🔐 Generando hashes de contraseñas...\n');
  
  const saltRounds = 12;
  const sqlStatements = [];

  for (const user of testUsers) {
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    
    console.log(`✅ Usuario: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Hash: ${hashedPassword}`);
    console.log(`   Role: ${user.role}\n`);

    const sql = `INSERT INTO users (username, email, password, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt) 
VALUES ('${user.username}', '${user.email}', '${hashedPassword}', '${user.firstName}', '${user.lastName}', '${user.phone}', '${user.role}', 1, 1, NOW(), NOW());`;
    
    sqlStatements.push(sql);
  }

  console.log('\n' + '='.repeat(80));
  console.log('📋 SCRIPT SQL COMPLETO:');
  console.log('='.repeat(80) + '\n');
  
  console.log('USE cacao_monitoring;\n');
  console.log(sqlStatements.join('\n\n'));
  
  console.log('\n' + '='.repeat(80));
  console.log('✅ Script generado exitosamente');
  console.log('='.repeat(80));
  
  console.log('\n📝 CREDENCIALES DE ACCESO:\n');
  testUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.firstName} ${user.lastName} (${user.role.toUpperCase()})`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log(`   Phone: ${user.phone}\n`);
  });
}

// Ejecutar
generateSQL().catch(console.error);
