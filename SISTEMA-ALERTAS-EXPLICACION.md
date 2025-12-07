# 🚨 Sistema de Alertas - Explicación Completa

## ✅ Respuesta Directa a tu Pregunta

**SÍ, las alertas se generan AUTOMÁTICAMENTE cuando el ESP32 envía datos al backend.**

---

## 🔄 Flujo Completo de Alertas

### 1. ESP32 Envía Datos (cada 5 segundos)
```
ESP32 → POST /api/environmental/sensor/data
```

### 2. Backend Procesa y Guarda Datos
```javascript
// environmentalService.js - registerSensorData()

// Guarda lectura DHT22
await DHT22Reading.create({ temperature, humidity, ... });

// ✅ GENERA ALERTAS AUTOMÁTICAMENTE
await this.checkTemperatureHumidityAlerts(deviceId, temperature, humidity);
```

### 3. Sistema Verifica Umbrales
```javascript
// Si temperatura < 20°C o > 32°C
// Si humedad < 70% o > 85%
// Si CO > 9 PPM
// Si CH4 > 1000 PPM
// Si H2S > 0.5 PPM
// etc...

// ✅ CREA ALERTA EN BASE DE DATOS
await Alert.create({
  type: 'temperature',
  severity: 'high',
  title: 'Temperatura Alta',
  message: 'Temperatura muy alta detectada: 35°C',
  userId: 1,
  deviceId: deviceId,
  sensorType: 'dht22',
  triggerValue: 35,
  thresholdValue: 32
});
```

### 4. Alerta Guardada en MySQL
```sql
-- Tabla: alerts
INSERT INTO alerts (
  type, severity, title, message, 
  userId, deviceId, sensorType,
  triggerValue, thresholdValue,
  isRead, isResolved, createdAt
) VALUES (
  'temperature', 'high', 'Temperatura Alta',
  'Temperatura muy alta detectada: 35°C',
  1, 1, 'dht22', 35, 32,
  0, 0, NOW()
);
```

---

## 📊 Endpoints para Consultar Alertas

### 1. **Reporte de Alertas** (Existente)
```http
GET /api/reports/alerts
Authorization: Bearer {token}
```

**Query Parameters:**
- `startDate` - Fecha inicio (ISO 8601)
- `endDate` - Fecha fin (ISO 8601)
- `deviceId` - Filtrar por dispositivo
- `status` - Filtrar por estado (active, resolved)
- `severity` - Filtrar por severidad (low, medium, high, critical)
- `type` - Filtrar por tipo (temperature, humidity, co, ch4, h2s)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/reports/alerts?deviceId=ESP32_AIR_001&severity=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Reporte de alertas generado exitosamente",
  "data": {
    "alerts": [
      {
        "id": 1,
        "type": "temperature",
        "severity": "high",
        "title": "Temperatura Alta",
        "message": "Temperatura muy alta detectada: 35°C",
        "deviceId": 1,
        "sensorType": "dht22",
        "triggerValue": 35,
        "thresholdValue": 32,
        "isRead": false,
        "isResolved": false,
        "createdAt": "2024-12-04T10:30:00.000Z"
      }
    ],
    "summary": {
      "total": 15,
      "byType": {
        "temperature": 5,
        "humidity": 3,
        "co": 2,
        "ch4": 3,
        "h2s": 2
      },
      "bySeverity": {
        "low": 3,
        "medium": 5,
        "high": 5,
        "critical": 2
      },
      "active": 10,
      "resolved": 5
    }
  }
}
```

### 2. **Consulta Directa a Base de Datos**

Puedes consultar directamente con SQL:

```sql
-- Ver todas las alertas
SELECT * FROM alerts 
ORDER BY createdAt DESC 
LIMIT 50;

-- Ver alertas activas (no resueltas)
SELECT * FROM alerts 
WHERE isResolved = 0 
ORDER BY severity DESC, createdAt DESC;

-- Ver alertas por dispositivo
SELECT a.*, d.deviceId, d.name 
FROM alerts a
JOIN devices d ON a.deviceId = d.id
WHERE d.deviceId = 'ESP32_AIR_001'
ORDER BY a.createdAt DESC;

-- Ver alertas críticas
SELECT * FROM alerts 
WHERE severity = 'critical' 
AND isResolved = 0
ORDER BY createdAt DESC;

-- Resumen de alertas por tipo
SELECT 
  type,
  severity,
  COUNT(*) as total,
  SUM(CASE WHEN isResolved = 0 THEN 1 ELSE 0 END) as activas
FROM alerts
GROUP BY type, severity
ORDER BY total DESC;
```

---

## 🎯 Umbrales que Generan Alertas

### Temperatura (DHT22)
```javascript
// ALERTA BAJA
if (temperature < 20°C) {
  severity: temperature < 15°C ? 'critical' : 'high'
  message: "Temperatura muy baja detectada"
}

// ALERTA ALTA
if (temperature > 32°C) {
  severity: temperature > 38°C ? 'critical' : 'high'
  message: "Temperatura muy alta detectada"
}
```

### Humedad (DHT22)
```javascript
// ALERTA BAJA
if (humidity < 70%) {
  severity: humidity < 50% ? 'critical' : 'medium'
  message: "Humedad muy baja detectada"
}

// ALERTA ALTA
if (humidity > 85%) {
  severity: humidity > 95% ? 'critical' : 'medium'
  message: "Humedad muy alta detectada - Riesgo de Moniliasis"
}
```

### Calidad del Aire (MQ-135)
```javascript
if (airQuality === 'poor' || airQuality === 'hazardous') {
  severity: airQuality === 'hazardous' ? 'critical' : 'high'
  message: "Calidad del aire deficiente"
}

// Niveles:
// excellent: < 50 PPM
// good: 50-100 PPM
// moderate: 100-150 PPM
// poor: 150-200 PPM
// hazardous: > 200 PPM
```

### Monóxido de Carbono (MQ-7)
```javascript
if (co_ppm > 9) {
  severity: 
    - extreme (>800 PPM): 'critical'
    - danger (>400 PPM): 'critical'
    - warning (>100 PPM): 'high'
    - caution (>35 PPM): 'medium'
  message: "Monóxido de carbono detectado"
}
```

### Metano (MQ-4)
```javascript
if (ch4_ppm > 1000) {
  severity:
    - extreme (>50000 PPM): 'critical'
    - danger (>25000 PPM): 'critical'
    - warning (>10000 PPM): 'high'
    - caution (>5000 PPM): 'medium'
  message: "Metano detectado"
}
```

### Sulfuro de Hidrógeno (MQ-136)
```javascript
if (h2s_ppm > 0.5) {
  severity:
    - extreme (>500 PPM): 'critical'
    - danger (>100 PPM): 'critical'
    - warning (>50 PPM): 'high'
    - caution (>10 PPM): 'medium'
  message: "Sulfuro de hidrógeno detectado"
}
```

---

## 📱 Cómo Visualizar Alertas

### Opción 1: HeidiSQL (Recomendado)

1. Conectar a MySQL
2. Ejecutar query:
```sql
SELECT 
  a.id,
  a.type,
  a.severity,
  a.title,
  a.message,
  a.triggerValue,
  a.thresholdValue,
  d.deviceId,
  d.name as deviceName,
  a.isResolved,
  a.createdAt
FROM alerts a
LEFT JOIN devices d ON a.deviceId = d.id
ORDER BY a.createdAt DESC
LIMIT 100;
```

### Opción 2: API REST (Postman/Frontend)

```bash
# 1. Login para obtener token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria.garcia",
    "password": "Maria2024!"
  }'

# 2. Obtener alertas
curl -X GET "http://localhost:3000/api/reports/alerts" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Opción 3: Logs del Backend

El backend imprime en consola cuando se crean alertas:
```
🚨 ALERTA CRÍTICA CREADA: Temperatura Alta
```

---

## 🔧 Crear Endpoint Adicional para Alertas

Voy a crear un endpoint más simple para consultar alertas activas:

### Nuevo Endpoint Propuesto

```javascript
// GET /api/environmental/alerts/active
// Obtiene alertas activas sin necesidad de fechas

router.get('/alerts/active',
  authenticate,
  async (req, res) => {
    try {
      const { Alert, Device } = require('../../models');
      
      const alerts = await Alert.findAll({
        where: { isResolved: false },
        include: [{
          model: Device,
          as: 'device',
          attributes: ['id', 'deviceId', 'name']
        }],
        order: [
          ['severity', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: 100
      });

      return res.json({
        success: true,
        data: {
          total: alerts.length,
          alerts: alerts
        }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
);
```

---

## 📊 Estructura de la Tabla Alerts

```sql
CREATE TABLE alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  type ENUM('temperature', 'humidity', 'co', 'ch4', 'h2s', 'air_quality', ...),
  severity ENUM('low', 'medium', 'high', 'critical'),
  title VARCHAR(200),
  message TEXT,
  isRead BOOLEAN DEFAULT 0,
  isResolved BOOLEAN DEFAULT 0,
  resolvedAt DATETIME NULL,
  resolvedBy INT NULL,
  userId INT NOT NULL,
  deviceId INT NULL,
  sensorType ENUM('dht22', 'mq135', 'mq7', 'mq4', 'mq136', 'system'),
  readingId INT NULL,
  triggerValue DECIMAL(10,4) NULL,
  thresholdValue DECIMAL(10,4) NULL,
  metadata JSON NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (deviceId) REFERENCES devices(id),
  FOREIGN KEY (resolvedBy) REFERENCES users(id),
  
  INDEX idx_userId (userId),
  INDEX idx_deviceId (deviceId),
  INDEX idx_type (type),
  INDEX idx_severity (severity),
  INDEX idx_isResolved (isResolved),
  INDEX idx_createdAt (createdAt)
);
```

---

## 🎯 Ejemplo Completo de Flujo

### 1. ESP32 envía datos con temperatura alta
```json
{
  "deviceId": "ESP32_AIR_001",
  "temperature": 35.5,
  "humidity": 65.2,
  ...
}
```

### 2. Backend detecta temperatura > 32°C
```javascript
// environmentalService.js
if (temperature > 32) {
  await Alert.create({
    type: 'temperature',
    severity: 'high',
    title: 'Temperatura Alta',
    message: 'Temperatura muy alta detectada: 35.5°C',
    userId: 1,
    deviceId: 1,
    sensorType: 'dht22',
    triggerValue: 35.5,
    thresholdValue: 32
  });
  console.log('🚨 ALERTA CREADA: Temperatura Alta');
}
```

### 3. Alerta guardada en MySQL
```sql
mysql> SELECT * FROM alerts ORDER BY id DESC LIMIT 1;
+----+-------------+----------+------------------+----------------------------------------+
| id | type        | severity | title            | message                                |
+----+-------------+----------+------------------+----------------------------------------+
| 15 | temperature | high     | Temperatura Alta | Temperatura muy alta detectada: 35.5°C |
+----+-------------+----------+------------------+----------------------------------------+
```

### 4. Frontend/App consulta alertas
```javascript
// GET /api/reports/alerts
const response = await fetch('/api/reports/alerts', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log('Alertas activas:', data.data.summary.active);
```

---

## ✅ Resumen

| Pregunta | Respuesta |
|----------|-----------|
| ¿Se generan alertas automáticamente? | ✅ SÍ |
| ¿Se guardan en base de datos? | ✅ SÍ (tabla `alerts`) |
| ¿Hay endpoint para consultarlas? | ✅ SÍ (`GET /api/reports/alerts`) |
| ¿Funcionan sin autenticación? | ❌ NO (necesitas login) |
| ¿Se pueden ver en tiempo real? | ✅ SÍ (consultar cada X segundos) |
| ¿Se pueden marcar como leídas? | ✅ SÍ (campo `isRead`) |
| ¿Se pueden resolver? | ✅ SÍ (campo `isResolved`) |

---

## 🚀 Próximos Pasos Recomendados

1. ✅ Probar envío de datos desde ESP32
2. ✅ Verificar creación de alertas en MySQL
3. ✅ Consultar alertas vía API
4. 🔄 Crear dashboard para visualizar alertas
5. 🔄 Implementar notificaciones push/email
6. 🔄 Agregar sistema de reconocimiento de alertas

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Sistema de Alertas Funcional
