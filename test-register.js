const http = require('http');

const API_URL = 'http://localhost:3000/api';

async function testRegister() {
  return new Promise((resolve, reject) => {
    console.log('🧪 Probando endpoint de registro...\n');

    const testUser = {
      username: 'luis',
      email: 'piguave567@gmail.com',
      password: 'password123',
      firstName: 'Luis',
      lastName: 'Rodriguez',
      phone: '0999999999'
    };

    console.log('📤 Enviando datos:', {
      ...testUser,
      password: '[HIDDEN]'
    });

    const postData = JSON.stringify(testUser);

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('\n📥 Status:', res.statusCode);
        console.log('📥 Respuesta:', data);
        
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('\n✅ Registro exitoso!');
          } else {
            console.log('\n❌ Error en el registro');
          }
          resolve(jsonData);
        } catch (e) {
          console.error('Error parseando JSON:', e);
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      console.error('\n❌ Error de conexión:', error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testRegister();
