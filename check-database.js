const { User } = require('./src/models');
const sequelize = require('./src/config/database');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando Base de Datos y Tabla de Usuarios\n');
    console.log('=' .repeat(60));

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida\n');

    // Sincronizar modelos
    await sequelize.sync();
    console.log('✅ Modelos sincronizados\n');

    // Obtener información de la tabla users
    console.log('📋 Estructura de la tabla users:\n');
    const [results] = await sequelize.query('DESCRIBE users');
    
    console.table(results.map(col => ({
      Campo: col.Field,
      Tipo: col.Type,
      Nulo: col.Null,
      Clave: col.Key,
      Default: col.Default
    })));

    // Contar usuarios
    const userCount = await User.count();
    console.log(`\n👥 Total de usuarios en la base de datos: ${userCount}\n`);

    // Listar usuarios
    if (userCount > 0) {
      console.log('📋 Usuarios registrados:\n');
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified', 'createdAt']
      });

      console.table(users.map(u => ({
        ID: u.id,
        Username: u.username,
        Email: u.email,
        Nombre: `${u.firstName} ${u.lastName}`,
        Rol: u.role,
        Activo: u.isActive ? 'Sí' : 'No',
        Verificado: u.emailVerified ? 'Sí' : 'No',
        Creado: u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : 'N/A'
      })));
    }

    // Verificar índices
    console.log('\n📊 Índices de la tabla users:\n');
    const [indexes] = await sequelize.query('SHOW INDEX FROM users');
    
    const uniqueIndexes = indexes.filter(idx => idx.Non_unique === 0);
    console.log('Índices únicos:');
    uniqueIndexes.forEach(idx => {
      console.log(`  • ${idx.Key_name} en columna: ${idx.Column_name}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Verificación completada exitosamente\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

checkDatabase();
