# 🚀 Guía Rápida: Conectar ESP32 al Backend

## 📋 Resumen

Tu backend ahora tiene un endpoint público para recibir datos de sensores ESP32 sin necesidad de autenticación JWT.

**Endpoint:** `POST /api/environmental/sensor/data`

---

## ⚡ Inicio Rápido

### 1️⃣ Configurar el Backend

El backend ya está listo. Solo asegúrate de que esté corriendo:

```bash
cd backend-angie
npm install
npm run dev
```

El servidor debería estar en: `http://localhost:3000`

---

### 2️⃣ Configurar el ESP32

1. **Abrir Arduino IDE**

2. **Instalar librerías necesarias:**
   - DHT sensor library (Adafruit)
   - ArduinoJson (Benoit Blanchon)

3. **Abrir el archivo:** `esp32-sensor-code.ino`

4. **Configurar WiFi y Servidor:**

```cpp
// Cambiar estos valores
const char* ssid = "TU_WIFI";              // Tu red WiFi
const char* password = "TU_PASSWORD";       // Tu contraseña WiFi
const char* serverUrl = "http://192.168.1.100:3000/api/environmental/sensor/data";  // IP de tu PC
const char* deviceId = "ESP32_AIR_001";     // ID único del dispositivo
```

**¿Cómo obtener la IP de tu PC?**

Windows:
```bash
ipconfig
```
Busca "Dirección IPv4" en tu adaptador WiFi

Linux/Mac:
```bash
ifconfig
```

5. **Subir el código al ESP32**

---

### 3️⃣ Conexiones de Hardware

```
ESP32          Sensor
─────────────────────────────
GPIO 27   →    DHT22 (Data)
GPIO 34   →    MQ-135 (Analog Out)
GPIO 39   →    MQ-7 (Analog Out)
GPIO 36   →    MQ-4 (Analog Out)
GPIO 33   →    MQ-136 (Analog Out) [Opcional]

3.3V      →    DHT22 (VCC)
5V        →    MQ-135, MQ-7, MQ-4, MQ-136 (VCC)
GND       →    Todos los sensores (GND)
```

**Notas importantes:**
- DHT22 usa 3.3V
- Sensores MQ usan 5V
- Agregar resistencia pull-up de 10kΩ entre Data y VCC del DHT22

---

### 4️⃣ Probar la Conexión

1. **Abrir Monitor Serial** (115200 baud)

2. **Deberías ver:**
```
╔════════════════════════════════════════╗
║    SISTEMA DE MONITOREO ESP32         ║
║    Calidad de Aire - Tesis Angie      ║
╚════════════════════════════════════════╝

🆔 Device ID: ESP32_AIR_001
🌐 Servidor: http://192.168.1.100:3000/api/environmental/sensor/data
✅ DHT22 inicializado
✅ WiFi conectado!
📡 IP: 192.168.1.150
📶 Señal: -45 dBm
⏳ Precalentando sensores MQ (60 segundos)...
```

3. **Después de 60 segundos:**
```
╔════════════════════════════════════════╗
║       LECTURAS DE SENSORES            ║
╠════════════════════════════════════════╣
║ 🌡️  Temperatura :   22.5 °C          ║
║ 💧 Humedad      :   65.3 %           ║
╠════════════════════════════════════════╣
║ 🌫️  MQ-135 (CO2):    850 PPM (2.45V) ║
║ ☠️  MQ-7   (CO) :      5 PPM (1.85V) ║
║ 🔥 MQ-4   (CH4) :    450 PPM (1.65V) ║
║ 💨 MQ-136 (H2S) :      3 PPM (1.42V) ║
╚════════════════════════════════════════╝

📤 Enviando datos al servidor...
✅ Respuesta del servidor (201):
{"success":true,"message":"Datos de sensores registrados exitosamente"}
✅ Datos enviados correctamente
```

---

## 🧪 Probar sin ESP32 (usando cURL)

Si no tienes el ESP32 listo, puedes probar el endpoint con cURL:

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

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Datos de sensores registrados exitosamente",
  "data": {
    "success": true,
    "deviceId": "ESP32_TEST_001",
    "deviceDbId": 1,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "readings": {
      "dht22": { ... },
      "mq135": { ... },
      "mq7": { ... },
      "mq4": { ... },
      "mq136": { ... }
    }
  }
}
```

---

## 📊 Ver los Datos en la Base de Datos

### Opción 1: HeidiSQL

1. Abrir HeidiSQL
2. Conectar a tu base de datos MySQL
3. Seleccionar base de datos: `cacao_monitoring`
4. Ver tablas:
   - `devices` - Dispositivos registrados
   - `dht22_readings` - Temperatura y humedad
   - `mq135_readings` - Calidad del aire
   - `mq7_readings` - Monóxido de carbono
   - `mq4_readings` - Metano
   - `mq136_readings` - Sulfuro de hidrógeno
   - `alerts` - Alertas generadas

### Opción 2: MySQL Command Line

```sql
USE cacao_monitoring;

-- Ver dispositivos
SELECT * FROM devices;

-- Ver últimas lecturas DHT22
SELECT * FROM dht22_readings ORDER BY createdAt DESC LIMIT 10;

-- Ver últimas lecturas MQ-135
SELECT * FROM mq135_readings ORDER BY createdAt DESC LIMIT 10;

-- Ver alertas activas
SELECT * FROM alerts WHERE isResolved = 0 ORDER BY createdAt DESC;
```

---

## 🔔 Sistema de Alertas

El backend genera alertas automáticamente cuando detecta valores peligrosos:

### Ejemplos de Alertas:

**CO Peligroso (MQ-7):**
```
⚠️ Alerta Critical: Monóxido de Carbono Detectado
Nivel de CO danger: 150 PPM
```

**Metano Detectado (MQ-4):**
```
⚠️ Alerta High: Metano Detectado
Nivel de metano warning: 7500 PPM
```

**Calidad del Aire Pobre (MQ-135):**
```
⚠️ Alerta High: Calidad del Aire Deficiente
Calidad del aire poor: 180 PPM
```

Las alertas se guardan en la tabla `alerts` y pueden consultarse desde el frontend.

---

## 🔧 Solución de Problemas

### ❌ Error: "WiFi desconectado"

**Solución:**
1. Verificar SSID y contraseña en el código
2. Verificar que el ESP32 esté cerca del router
3. Reiniciar el ESP32

---

### ❌ Error: "Error al enviar datos. Código: -1"

**Solución:**
1. Verificar que el backend esté corriendo (`npm run dev`)
2. Verificar la IP del servidor en el código
3. Verificar que no haya firewall bloqueando el puerto 3000
4. Probar con: `http://IP:3000/api/environmental/sensor/data`

---

### ❌ DHT22 devuelve NaN

**Solución:**
1. Verificar conexión del pin Data (GPIO 27)
2. Verificar alimentación (3.3V)
3. Agregar resistencia pull-up de 10kΩ entre Data y VCC
4. Esperar 2 segundos después de inicializar

---

### ❌ Lecturas de sensores MQ incorrectas

**Solución:**
1. **Precalentar**: Los sensores MQ necesitan 24-48 horas de precalentamiento inicial
2. **Calibrar**: Ajustar valores R0 en aire limpio
3. **Alimentación**: Verificar que tengan 5V estables
4. **Ventilación**: Los sensores deben estar en área ventilada

---

### ❌ Backend responde 400 Bad Request

**Solución:**
1. Verificar que `deviceId` esté presente en el JSON
2. Verificar que `temperature` y `humidity` estén presentes
3. Verificar formato JSON correcto
4. Ver logs del backend para más detalles

---

## 📈 Próximos Pasos

1. **Calibrar sensores MQ** para obtener lecturas precisas
2. **Configurar alertas** personalizadas en el backend
3. **Crear dashboard** en el frontend para visualizar datos
4. **Agregar más dispositivos** con diferentes IDs
5. **Implementar notificaciones** por email/SMS cuando haya alertas

---

## 📚 Archivos Importantes

- `esp32-sensor-code.ino` - Código para el ESP32
- `API-SENSORES.md` - Documentación completa de la API
- `database-setup.sql` - Script de creación de base de datos
- `src/modules/environmental/` - Código del módulo de sensores

---

## 🆘 Soporte

Si tienes problemas:

1. Revisar logs del backend (consola donde corre `npm run dev`)
2. Revisar Monitor Serial del ESP32
3. Verificar base de datos con HeidiSQL
4. Probar endpoint con cURL primero

---

**¡Listo! Tu sistema de monitoreo de calidad de aire está funcionando! 🎉**
