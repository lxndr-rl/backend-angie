/**
 * Script de prueba para el endpoint de reportes
 * Ejecutar: node test-reports-endpoint.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Configurar token de autenticación (reemplazar con un token válido)
const AUTH_TOKEN = 'TU_TOKEN_AQUI';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testExecutiveSummary() {
  console.log('\n🧪 Probando: GET /reports/summary');
  console.log('='.repeat(50));
  
  try {
    const response = await api.get('/reports/summary', {
      params: { period: 'week' }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Datos recibidos:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Validar estructura
    const summary = response.data.data.summary;
    console.log('\n✅ Validación de estructura:');
    console.log('  - totalReadings:', summary.totalReadings);
    console.log('  - activeAlerts:', summary.activeAlerts);
    console.log('  - uniqueDevices:', summary.uniqueDevices);
    console.log('  - gasLevels:', summary.gasLevels ? '✅ Presente' : '❌ Falta');
    console.log('  - hourlyData:', summary.hourlyData ? `✅ ${summary.hourlyData.length} elementos` : '❌ Falta');
    console.log('  - systemHealth:', summary.systemHealth);
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testEnvironmentalReport() {
  console.log('\n🧪 Probando: GET /reports/environmental');
  console.log('='.repeat(50));
  
  try {
    const response = await api.get('/reports/environmental', {
      params: {
        interval: 'day',
        includeStats: 'true',
        includeAlerts: 'false'
      }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Metadata:');
    console.log('  - Total lecturas:', response.data.data.metadata.totalReadings);
    console.log('  - Por tipo:', response.data.data.metadata.readingsByType);
    
    if (response.data.data.statistics) {
      console.log('📈 Estadísticas:');
      console.log('  - Temperatura:', response.data.data.statistics.temperature);
      console.log('  - CO:', response.data.data.statistics.co);
      console.log('  - CH4:', response.data.data.statistics.ch4);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testAlertsReport() {
  console.log('\n🧪 Probando: GET /reports/alerts');
  console.log('='.repeat(50));
  
  try {
    const response = await api.get('/reports/alerts');
    
    console.log('✅ Status:', response.status);
    console.log('📊 Total alertas:', response.data.data.metadata.totalAlerts);
    console.log('📈 Estadísticas:');
    console.log('  - Por estado:', response.data.data.statistics.byStatus);
    console.log('  - Por severidad:', response.data.data.statistics.bySeverity);
    console.log('  - Por tipo sensor:', response.data.data.statistics.bySensorType);
    console.log('  - Tiempo promedio resolución:', response.data.data.statistics.avgResolutionTime, 'minutos');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testEfficiencyReport() {
  console.log('\n🧪 Probando: GET /reports/efficiency');
  console.log('='.repeat(50));
  
  try {
    const response = await api.get('/reports/efficiency', {
      params: { period: 'week' }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Total dispositivos:', response.data.data.metadata.totalDevices);
    console.log('📈 Resumen:');
    console.log('  - Eficiencia promedio:', response.data.data.summary.efficiency, '%');
    console.log('  - Dispositivos online:', response.data.data.summary.onlineDevices);
    console.log('  - Alertas totales:', response.data.data.summary.totalAlerts);
    
    if (response.data.data.devices.length > 0) {
      console.log('\n📱 Primer dispositivo:');
      const device = response.data.data.devices[0];
      console.log('  - ID:', device.deviceId);
      console.log('  - Nombre:', device.deviceName);
      console.log('  - Lecturas:', device.totalReadings);
      console.log('  - Por tipo:', device.readingsByType);
      console.log('  - Eficiencia:', device.efficiency, '%');
      console.log('  - Estado:', device.status);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function testTrendsReport() {
  console.log('\n🧪 Probando: GET /reports/trends');
  console.log('='.repeat(50));
  
  try {
    const response = await api.get('/reports/trends', {
      params: { metric: 'all' }
    });
    
    console.log('✅ Status:', response.status);
    console.log('📊 Total días:', response.data.data.metadata.totalDays);
    console.log('📈 Tendencias:');
    
    const trends = response.data.data.trends;
    Object.keys(trends).forEach(metric => {
      console.log(`  - ${metric}:`, trends[metric].direction, 
                  `(slope: ${trends[metric].slope}, puntos: ${trends[metric].dataPoints})`);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('\n🚀 Iniciando pruebas de endpoints de reportes...\n');
  
  if (!AUTH_TOKEN || AUTH_TOKEN === 'TU_TOKEN_AQUI') {
    console.error('❌ ERROR: Debes configurar un token de autenticación válido');
    console.log('\n📝 Pasos:');
    console.log('1. Inicia sesión en el sistema');
    console.log('2. Copia el token JWT');
    console.log('3. Reemplaza "TU_TOKEN_AQUI" en este archivo');
    console.log('4. Ejecuta: node test-reports-endpoint.js\n');
    return;
  }
  
  const results = {
    executiveSummary: await testExecutiveSummary(),
    environmentalReport: await testEnvironmentalReport(),
    alertsReport: await testAlertsReport(),
    efficiencyReport: await testEfficiencyReport(),
    trendsReport: await testTrendsReport()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}`);
  });
  
  const totalPassed = Object.values(results).filter(r => r).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`Pruebas exitosas: ${totalPassed}/${totalTests}`);
  console.log('='.repeat(50) + '\n');
}

// Ejecutar pruebas
runAllTests().catch(console.error);
