# 📡 API de Sensores IoT - ESP32

## Endpoint para Envío de Datos de Sensores

### POST `/api/environmental/sensor/data`

Endpoint público (sin autenticación) para que dispositivos IoT (ESP32) envíen datos de sensores.

---

## 📋 Request

### Headers
```
Content-Type: application/json
```

### Body (JSON)

```json
{
  "deviceId": "ESP32_AIR_001",
  "temperature": 22.5,
  "humidity": 65.3,
  "mq135_ppm": 850.0,
  "mq135_voltage": 2.45,
  "mq7_ppm": 5.2,
  "mq7_voltage": 1.85,
  "mq4_ppm": 450.0,
  "mq4_voltage": 1.65,
  "mq136_ppm": 3.5,
  "mq136_voltage": 1.42,
  "latitude": 4.6097,
  "longitude": -74.0817
}
```

### Parámetros

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `deviceId` | string | ✅ Sí | ID único del dispositivo ESP32 |
| `temperature` | number | ✅ Sí | Temperatura del DHT22 en °C |
| `humidity` | number | ✅ Sí | Humedad del DHT22 en % |
| `mq135_ppm` | number | ❌ No | Lectura del MQ-135 (CO2/calidad aire) en PPM |
| `mq135_voltage` | number | ❌ No | Voltaje del MQ-135 |
| `mq7_ppm` | number | ❌ No | Lectura del MQ-7 (CO) en PPM |
| `mq7_voltage` | number | ❌ No | Voltaje del MQ-7 |
| `mq4_ppm` | number | ❌ No | Lectura del MQ-4 (Metano) en PPM |
| `mq4_voltage` | number | ❌ No | Voltaje del MQ-4 |
| `mq136_ppm` | number | ❌ No | Lectura del MQ-136 (H2S) en PPM |
| `mq136_voltage` | number | ❌ No | Voltaje del MQ-136 |
| `latitude` | number | ❌ No | Latitud GPS |
| `longitude` | number | ❌ No | Longitud GPS |

---

## ✅ Response Success (201 Created)

```json
{
  "success": true,
  "message": "Datos de sensores registrados exitosamente",
  "data": {
    "success": true,
    "deviceId": "ESP32_AIR_001",
    "deviceDbId": 1,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "readings": {
      "dht22": {
        "id": 123,
        "deviceId": 1,
        "temperature": 22.5,
        "humidity": 65.3,
        "heatIndex": 21.8,
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "mq135": {
        "id": 456,
        "deviceId": 1,
        "ppm": 850.0,
        "voltage": 2.45,
        "resistance": 8.5,
        "airQualityIndex": 85,
        "airQuality": "good",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "mq7": {
        "id": 789,
        "deviceId": 1,
        "co_ppm": 5.2,
        "voltage": 1.85,
        "resistance": 5.2,
        "dangerLevel": "safe",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "mq4": {
        "id": 101,
        "deviceId": 1,
        "ch4_ppm": 450.0,
        "voltage": 1.65,
        "resistance": 4.5,
        "dangerLevel": "safe",
        "createdAt": "2024-01-15T10:30:00.000Z"
      },
      "mq136": {
        "id": 102,
        "deviceId": 1,
        "h2s_ppm": 3.5,
        "voltage": 1.42,
        "resistance": 3.5,
        "dangerLevel": "safe",
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    }
  }
}
```

---

## ❌ Response Error (400 Bad Request)

```json
{
  "success": false,
  "error": "El deviceId es requerido"
}
```

```json
{
  "success": false,
  "error": "Temperatura y humedad son requeridos"
}
```

---

## 🔔 Sistema de Alertas Automáticas

El backend genera alertas automáticamente cuando los valores están fuera de rango:

### Alertas de Temperatura
- **Baja crítica**: < 10°C (severity: critical)
- **Baja**: < 18°C (severity: high)
- **Alta**: > 35°C (severity: high)
- **Alta crítica**: > 40°C (severity: critical)

### Alertas de Humedad
- **Baja crítica**: < 20% (severity: critical)
- **Baja**: < 30% (severity: medium)
- **Alta**: > 80% (severity: medium)
- **Alta crítica**: > 90% (severity: critical)

### Alertas de Calidad del Aire (MQ-135)
- **Excelente**: < 50 PPM
- **Buena**: 50-100 PPM
- **Moderada**: 100-150 PPM
- **Pobre**: 150-200 PPM (genera alerta high)
- **Peligrosa**: > 200 PPM (genera alerta critical)

### Alertas de CO (MQ-7)
- **Seguro**: < 9 PPM
- **Precaución**: 9-35 PPM (genera alerta medium)
- **Advertencia**: 35-100 PPM (genera alerta high)
- **Peligro**: 100-400 PPM (genera alerta critical)
- **Extremo**: > 400 PPM (genera alerta critical)

### Alertas de Metano (MQ-4)
- **Seguro**: < 1000 PPM
- **Precaución**: 1000-5000 PPM (genera alerta medium)
- **Advertencia**: 5000-10000 PPM (genera alerta high)
- **Peligro**: 10000-50000 PPM (genera alerta critical)
- **Extremo**: > 50000 PPM (genera alerta critical)

### Alertas de H2S (MQ-136)
- **Seguro**: < 10 PPM
- **Precaución**: 10-50 PPM (genera alerta medium)
- **Advertencia**: 50-100 PPM (genera alerta high)
- **Peligro**: 100-500 PPM (genera alerta critical)
- **Extremo**: > 500 PPM (genera alerta critical)

---

## 📊 Datos Almacenados

Los datos se almacenan en las siguientes tablas:

1. **devices** - Información del dispositivo
2. **dht22_readings** - Lecturas de temperatura y humedad
3. **mq135_readings** - Lecturas de calidad del aire
4. **mq7_readings** - Lecturas de monóxido de carbono
5. **mq4_readings** - Lecturas de metano
6. **mq136_readings** - Lecturas de sulfuro de hidrógeno
7. **alerts** - Alertas generadas automáticamente

---

## 🔧 Configuración del ESP32

### 1. Instalar Librerías Necesarias

En Arduino IDE, instalar:
- **DHT sensor library** by Adafruit
- **ArduinoJson** by Benoit Blanchon
- **WiFi** (incluida en ESP32)
- **HTTPClient** (incluida en ESP32)

### 2. Configurar el Código

Editar en `esp32-sensor-code.ino`:

```cpp
// WiFi
const char* ssid = "TU_WIFI_SSID";
const char* password = "TU_WIFI_PASSWORD";

// Servidor (cambiar por la IP de tu servidor)
const char* serverUrl = "http://192.168.1.100:3000/api/environmental/sensor/data";

// Device ID único
const char* deviceId = "ESP32_AIR_001";
```

### 3. Calibrar Sensores MQ

Los valores R0 deben calibrarse en aire limpio:

```cpp
#define R0_MQ135 10.0  // Ajustar después de calibrar
#define R0_MQ7   10.0  // Ajustar después de calibrar
#define R0_MQ4   10.0  // Ajustar después de calibrar
#define R0_MQ136 10.0  // Ajustar después de calibrar
```

**Proceso de calibración:**
1. Dejar los sensores en aire limpio por 24-48 horas
2. Leer el valor de RS en el monitor serial
3. Ese valor es tu R0
4. Actualizar los valores en el código

---

## 🧪 Pruebas con cURL

### Enviar datos de prueba:

```bash
curl -X POST http://localhost:3000/api/environmental/sensor/data \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "ESP32_TEST_001",
    "temperature": 23.5,
    "humidity": 60.2,
    "mq135_ppm": 920.0,
    "mq135_voltage": 2.52,
    "mq7_ppm": 6.8,
    "mq7_voltage": 1.92,
    "mq4_ppm": 520.0,
    "mq4_voltage": 1.72,
    "mq136_ppm": 4.2,
    "mq136_voltage": 1.48
  }'
```

### Respuesta esperada:

```json
{
  "success": true,
  "message": "Datos de sensores registrados exitosamente",
  "data": {
    "success": true,
    "deviceId": "ESP32_TEST_001",
    "deviceDbId": 1,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "readings": { ... }
  }
}
```

---

## 🔍 Consultar Datos Registrados

### Obtener últimos datos de un dispositivo:

```bash
curl -X GET "http://localhost:3000/api/environmental/devices/ESP32_AIR_001/latest" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Obtener estadísticas:

```bash
curl -X GET "http://localhost:3000/api/environmental/stats?deviceId=ESP32_AIR_001&period=day" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📝 Notas Importantes

1. **Precalentamiento**: Los sensores MQ requieren 24-48 horas de precalentamiento inicial y 60 segundos antes de cada uso
2. **Calibración**: Los valores R0 deben calibrarse en aire limpio para obtener lecturas precisas
3. **Frecuencia**: Se recomienda enviar datos cada 5-10 segundos para no saturar el servidor
4. **WiFi**: Asegúrate de que el ESP32 tenga buena señal WiFi
5. **Alimentación**: Los sensores MQ consumen bastante corriente, usa una fuente adecuada
6. **Ventilación**: Los sensores MQ deben estar en un área ventilada

---

## 🆘 Solución de Problemas

### Error: "WiFi desconectado"
- Verificar SSID y contraseña
- Verificar señal WiFi
- Reiniciar el ESP32

### Error: "Error al enviar datos"
- Verificar que el servidor esté corriendo
- Verificar la URL del servidor
- Verificar firewall/puertos

### Lecturas incorrectas
- Calibrar los sensores MQ
- Verificar conexiones de los pines
- Esperar el precalentamiento completo

### DHT22 devuelve NaN
- Verificar conexión del sensor
- Verificar alimentación (3.3V o 5V)
- Agregar resistencia pull-up de 10kΩ

---

## 📚 Referencias

- [Datasheet DHT22](https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf)
- [Datasheet MQ-135](https://www.olimex.com/Products/Components/Sensors/SNS-MQ135/resources/SNS-MQ135.pdf)
- [Datasheet MQ-7](https://www.sparkfun.com/datasheets/Sensors/Biometric/MQ-7.pdf)
- [Datasheet MQ-4](https://www.sparkfun.com/datasheets/Sensors/Biometric/MQ-4.pdf)
- [ESP32 Documentation](https://docs.espressif.com/projects/esp-idf/en/latest/esp32/)
