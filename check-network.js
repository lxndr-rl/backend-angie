const os = require('os');
const http = require('http');

console.log('🔍 Diagnóstico de Red para App Móvil\n');
console.log('=' .repeat(60));

// 1. Obtener todas las interfaces de red
console.log('\n📡 Interfaces de Red Disponibles:\n');

const interfaces = os.networkInterfaces();
const validIPs = [];

Object.keys(interfaces).forEach((interfaceName) => {
  const interfaceInfo = interfaces[interfaceName];
  
  interfaceInfo.forEach((details) => {
    if (details.family === 'IPv4' && !details.internal) {
      console.log(`✅ ${interfaceName}:`);
      console.log(`   IP: ${details.address}`);
      console.log(`   Máscara: ${details.netmask}`);
      validIPs.push(details.address);
    }
  });
});

if (validIPs.length === 0) {
  console.log('\n❌ No se encontraron interfaces de red activas');
  console.log('   Verifica que estés conectado a una red WiFi o Ethernet');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('\n📋 Configuración Recomendada:\n');

validIPs.forEach((ip, index) => {
  console.log(`Opción ${index + 1}:`);
  console.log(`   EXPO_PUBLIC_API_URL=http://${ip}:3000/api`);
  console.log('');
});

console.log('=' .repeat(60));
console.log('\n🔧 Pasos para Configurar:\n');
console.log('1. Copia una de las URLs de arriba');
console.log('2. Edita el archivo: Cacao-toxicityApp/.env');
console.log('3. Pega la URL en EXPO_PUBLIC_API_URL');
console.log('4. Guarda el archivo');
console.log('5. Reinicia la app móvil (Ctrl+C y luego npx expo start --clear)');

console.log('\n' + '='.repeat(60));
console.log('\n🧪 Verificando si el servidor está corriendo...\n');

// Verificar si el servidor está corriendo
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/api/auth/login', (res) => {
      console.log('✅ Servidor backend está corriendo en puerto 3000');
      console.log(`   Status: ${res.statusCode}`);
      resolve(true);
    });

    req.on('error', (error) => {
      console.log('❌ Servidor backend NO está corriendo');
      console.log('   Error:', error.message);
      console.log('\n   Para iniciar el servidor:');
      console.log('   cd backend-angie');
      console.log('   npm start');
      resolve(false);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      console.log('❌ Timeout al conectar con el servidor');
      resolve(false);
    });
  });
};

checkServer().then((isRunning) => {
  console.log('\n' + '='.repeat(60));
  
  if (isRunning && validIPs.length > 0) {
    console.log('\n✅ Todo listo para conectar la app móvil!');
    console.log('\n📱 Desde tu dispositivo móvil, prueba abrir en el navegador:');
    validIPs.forEach((ip) => {
      console.log(`   http://${ip}:3000/api/auth/login`);
    });
    console.log('\n   Si ves un error JSON, la conexión funciona correctamente.');
  } else {
    console.log('\n⚠️  Hay problemas que debes resolver primero.');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Consejos Adicionales:\n');
  console.log('• Asegúrate de que tu dispositivo móvil esté en la misma red WiFi');
  console.log('• Desactiva temporalmente el firewall si tienes problemas');
  console.log('• Si usas un emulador Android, usa 10.0.2.2:3000 en lugar de localhost');
  console.log('• Si usas un emulador iOS, usa localhost:3000');
  console.log('\n');
});
