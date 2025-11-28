const bcrypt = require('bcryptjs');
const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function createAdminUser() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Sincronizar modelos
    await sequelize.sync();
    console.log('✅ Modelos sincronizados');

    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Contraseña hasheada:', hashedPassword);

    // Verificar si el usuario admin existe
    let adminUser = await User.findOne({ where: { username: 'admin' } });

    if (adminUser) {
      console.log('⚠️  Usuario admin ya existe, actualizando...');
      await adminUser.update({
        password: hashedPassword,
        isActive: true,
        role: 'admin',
        emailVerified: true,
        email: 'admin@airquality.com',
        firstName: 'Administrador',
        lastName: 'Sistema'
      });
      console.log('✅ Usuario admin actualizado');
    } else {
      console.log('🔨 Creando usuario admin...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@airquality.com',
        password: hashedPassword,
        firstName: 'Administrador',
        lastName: 'Sistema',
        role: 'admin',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Usuario admin creado');
    }

    // Verificar el usuario
    const verifyUser = await User.findOne({ 
      where: { username: 'admin' },
      attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified']
    });
    console.log('📋 Usuario admin:', JSON.stringify(verifyUser, null, 2));

    // Probar login
    console.log('\n🔐 Probando login...');
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    console.log('✅ Contraseña válida:', isPasswordValid);

    // Crear usuario demo si no existe
    let demoUser = await User.findOne({ where: { username: 'demo' } });
    if (!demoUser) {
      console.log('\n🔨 Creando usuario demo...');
      demoUser = await User.create({
        username: 'demo',
        email: 'demo@airquality.com',
        password: hashedPassword,
        firstName: 'Usuario',
        lastName: 'Demo',
        role: 'user',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Usuario demo creado');
    } else {
      await demoUser.update({
        password: hashedPassword,
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Usuario demo actualizado');
    }

    // Crear usuario test si no existe
    let testUser = await User.findOne({ where: { username: 'test' } });
    if (!testUser) {
      console.log('\n🔨 Creando usuario test...');
      testUser = await User.create({
        username: 'test',
        email: 'test@airquality.com',
        password: hashedPassword,
        firstName: 'Usuario',
        lastName: 'Test',
        role: 'user',
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Usuario test creado');
    } else {
      await testUser.update({
        password: hashedPassword,
        isActive: true,
        emailVerified: true
      });
      console.log('✅ Usuario test actualizado');
    }

    console.log('\n✅ Proceso completado exitosamente');
    console.log('\n📋 Credenciales:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    console.log('\n   Username: demo');
    console.log('   Password: admin123');
    console.log('   Role: user');
    console.log('\n   Username: test');
    console.log('   Password: admin123');
    console.log('   Role: user');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createAdminUser();
