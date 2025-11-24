# 🔧 Solución: Error "Connection Refused"

## ❌ Error que estás viendo:

```
Error: connection refused
❌ Error al enviar datos. Código: -1
```

---

## ✅ SOLUCIÓN PASO A PASO

### 1️⃣ Verificar que el Backend esté corriendo

**Abrir una terminal/CMD en la carpeta del backend:**

```bash
cd backend-angie
npm run dev
```

**Deberías ver:**
```
✅ Conexión a MySQL establecida correctamente
✅ Modelos sincronizados con la base de datos
🚀 SERVIDOR INICIADO EXITOSAMENTE
📍 Puerto: 3000
🔗 URL: http://localhost:3000
```

⚠️ **Si el servidor NO está corriendo, el ESP32 no podrá conectarse!**

---

### 2️⃣ Obtener la IP correcta de tu PC

El ESP32 necesita la IP de tu PC, NO "localhost" ni "127.0.0.1"

**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" en tu adaptador WiFi (ejemplo: `192.168.100.7`)

**Linux/Mac:**
```bash
ifconfig
# o
ip addr
```

---

### 3️⃣ Actualizar la IP en el código del ESP32

**Editar `esp32-sensor-code.ino`:**

```cpp
// Línea 23 - CAMBIAR ESTA IP
const char* serverHost = "192.168.100.7";  // ⚠️ TU IP AQUÍ
```

**Ejemplo:**
- Si tu IP es `192.168.1.105`, pon: `"192.168.1.105"`
- Si tu IP es `192.168.100.7`, pon: `"192.168.100.7"`
- Si tu IP es `10.0.0.50`, pon: `"10.0.0.50"`

---

### 4️⃣ Verificar que estén en la misma red WiFi

**ESP32 y tu PC deben estar conectados a la MISMA red WiFi**

En el Monitor Serial del ESP32 verás:
```
📡 IP del ESP32: 192.168.100.150
🌐 Gateway: 192.168.100.1
```

Tu PC debe tener una IP similar (mismo rango):
- ✅ ESP32: `192.168.100.150` + PC: `192.168.100.7` → MISMO RANGO
- ❌ ESP32: `192.168.1.150` + PC: `192.168.100.7` → DIFERENTE RANGO

---

### 5️⃣ Desactivar Firewall temporalmente

**Windows:**
1. Buscar "Firewall de Windows Defender"
2. Click en "Activar o desactivar Firewall de Windows Defender"
3. Desactivar para "Redes privadas"
4. Probar de nuevo

**O agregar excepción para el puerto 3000:**
1. Firewall → Configuración avanzada
2. Reglas de entrada → Nueva regla
3. Puerto → TCP → 3000
4. Permitir conexión

---

### 6️⃣ Probar la conexión desde tu PC

**Antes de probar con el ESP32, verifica que el endpoint funcione:**

```bash
curl -X POST http://localhost:3000/api/environmental/sensor/data \
  -H "Content-Type: application/json" \
  -d "{\"deviceId\":\"TEST\",\"temperature\":25,\"humidity\":60,\"mq135_ppm\":100,\"mq135_voltage\":2.5,\"mq7_ppm\":5,\"mq7_voltage\":1.8,\"mq4_ppm\":400,\"mq4_voltage\":1.6}"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Datos de sensores registrados exitosamente"
}
```

---

### 7️⃣ Verificar en el Monitor Serial

**Después de subir el código actualizado, deberías ver:**

```
╔════════════════════════════════════════╗
║    SISTEMA DE MONITOREO ESP32         ║
╚════════════════════════════════════════╝

🆔 Device ID: ESP32_AIR_001
🌐 Servidor: http://192.168.100.7:3000/api/environmental/sensor/data
✅ DHT22 inicializado
✅ WiFi conectado!
📡 IP del ESP32: 192.168.100.150
📶 Señal: -45 dBm
🌐 Gateway: 192.168.100.1

⏳ Precalentando sensores MQ (10 segundos)...
10... 5... 

✅ Sensores precalentados

╔════════════════════════════════════════╗
║  🚀 SISTEMA LISTO                     ║
╠════════════════════════════════════════╣
║  📡 ESP32 IP: 192.168.100.150        ║
║  🌐 Servidor: 192.168.100.7          ║
║  ⏱️  Intervalo: 5 segundos            ║
╚════════════════════════════════════════╝

📤 Enviando datos al servidor...
🌐 URL: http://192.168.100.7:3000/api/environmental/sensor/data
📦 Datos: {"deviceId":"ESP32_AIR_001",...}
✅ Respuesta del servidor (201):
{"success":true,"message":"Datos de sensores registrados exitosamente"}
✅ Datos enviados correctamente
```

---

## 🔍 CHECKLIST DE VERIFICACIÓN

- [ ] Backend corriendo (`npm run dev`)
- [ ] IP correcta en el código del ESP32
- [ ] ESP32 y PC en la misma red WiFi
- [ ] Firewall desactivado o puerto 3000 permitido
- [ ] Endpoint funciona con cURL desde tu PC
- [ ] Monitor Serial muestra "WiFi conectado"
- [ ] IP del ESP32 en el mismo rango que tu PC

---

## 💡 TIPS ADICIONALES

### Si el backend se detiene:
```bash
# Reiniciar el backend
cd backend-angie
npm run dev
```

### Si cambias de red WiFi:
1. Actualizar SSID y password en el código
2. Obtener nueva IP de tu PC
3. Actualizar `serverHost` en el código
4. Subir código al ESP32

### Si el ESP32 no se conecta a WiFi:
- Verificar SSID y password correctos
- Acercarse al router
- Reiniciar el ESP32

### Ver logs del backend:
En la terminal donde corre `npm run dev` verás:
```
📡 Datos recibidos del dispositivo ESP32_AIR_001:
✅ DHT22 registrado: 28.6°C, 65.1%
✅ MQ-135 registrado: 3.86 PPM (good)
✅ MQ-7 registrado: 31 PPM CO (caution)
✅ MQ-4 registrado: 120 PPM CH4 (safe)
```

---

## 🆘 ÚLTIMO RECURSO

Si nada funciona:

1. **Reiniciar todo:**
   - Cerrar backend (Ctrl+C)
   - Reiniciar MySQL
   - Reiniciar backend (`npm run dev`)
   - Reiniciar ESP32 (botón RESET)

2. **Usar IP estática:**
   - Configurar IP fija en tu PC
   - Usar esa IP en el código del ESP32

3. **Probar con otro puerto:**
   - Cambiar `PORT=3001` en `.env`
   - Reiniciar backend
   - Cambiar `serverPort = 3001` en el código ESP32

---

## ✅ CUANDO FUNCIONE

Verás en el Monitor Serial:
```
✅ Respuesta del servidor (201):
{"success":true,"message":"Datos de sensores registrados exitosamente"}
✅ Datos enviados correctamente
```

Y en la base de datos (HeidiSQL):
```sql
SELECT * FROM devices WHERE deviceId = 'ESP32_AIR_001';
SELECT * FROM dht22_readings ORDER BY createdAt DESC LIMIT 5;
SELECT * FROM mq135_readings ORDER BY createdAt DESC LIMIT 5;
```

---

**¡Ahora debería funcionar! 🎉**
