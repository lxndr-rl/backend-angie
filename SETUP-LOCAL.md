# 🚀 Setup Local - Guía Rápida

## 📋 Requisitos Previos

- ✅ Node.js >= 16
- ✅ MySQL >= 8.0
- ✅ Git

---

## 🔧 Configuración del Backend

### 1. Copiar archivo de configuración local
```bash
cd backend-angie
cp .env.local .env
```

### 2. Editar `.env` si es necesario
```bash
# Abre el archivo .env y ajusta estos valores si tu MySQL es diferente:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root  # ⚠️ Cambiar si tu MySQL tiene otra contraseña
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Crear base de datos MySQL
```bash
# Opción A: Desde línea de comandos
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS cacao_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Opción B: Desde HeidiSQL
# 1. Abrir HeidiSQL
# 2. Conectar a localhost
# 3. Click derecho en el servidor → "Create new" → "Database"
# 4. Nombre: cacao_monitoring
# 5. Charset: utf8mb4
# 6. Collation: utf8mb4_unicode_ci
```

### 5. Iniciar servidor
```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a MySQL establecida correctamente
✅ Modelos sincronizados con la base de datos
🚀 SERVIDOR INICIADO EXITOSAMENTE
📍 Puerto: 3000
🔗 URL: http://localhost:3000
```

### 6. Verificar que funciona
```bash
# En otra terminal
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente",
  "database": "MySQL"
}
```

### 7. Crear usuarios de prueba
```bash
# Opción A: Desde MySQL
mysql -u root -p cacao_monitoring < insert-test-users.sql

# Opción B: Desde HeidiSQL
# 1. Abrir insert-test-users.sql
# 2. Ejecutar el script
```

### 8. Probar login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria.garcia",
    "password": "Maria2024!"
  }'
```

---

## 🌐 Configuración del Frontend

### 1. Copiar archivo de configuración local
```bash
cd web-cacao-front
cp .env.local .env
```

### 2. Verificar configuración
```bash
# Abre .env y verifica que apunte a tu backend local:
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Iniciar servidor de desarrollo
```bash
npm run dev
```

Deberías ver:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5. Abrir en navegador
```
http://localhost:5173
```

### 6. Hacer login
- **Usuario:** maria.garcia
- **Contraseña:** Maria2024!

---

## 📡 Configuración del ESP32

### 1. Obtener tu IP local

**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" (ejemplo: 192.168.1.100)

**Linux/Mac:**
```bash
ifconfig
# o
ip addr show
```

### 2. Actualizar IP en el código ESP32
```cpp
// Editar esp32-sensor-code.ino línea 27
const char* serverHost = "192.168.1.100";  // ⚠️ TU IP AQUI
```

### 3. Cargar código al ESP32
1. Abrir Arduino IDE
2. Abrir `esp32-sensor-code.ino`
3. Verificar WiFi SSID y contraseña
4. Conectar ESP32 por USB
5. Seleccionar puerto correcto
6. Subir código (Ctrl+U)

### 4. Monitorear Serial
Abrir Monitor Serial (Ctrl+Shift+M) a 115200 baudios.

Deberías ver:
```
✅ WiFi conectado!
📡 IP del ESP32: 192.168.1.123
✅ Datos enviados correctamente
```

---

## 🔍 Verificación Completa

### 1. Backend funcionando
```bash
curl http://localhost:3000/health
```
✅ Debe responder con status "OK"

### 2. Frontend funcionando
```
http://localhost:5173
```
✅ Debe cargar la página de login

### 3. Login funciona
- Usuario: maria.garcia
- Password: Maria2024!
✅ Debe entrar al dashboard

### 4. ESP32 enviando datos
Monitor Serial debe mostrar:
```
✅ Datos enviados correctamente
```

### 5. Datos llegando al backend
Logs del backend deben mostrar:
```
📡 Datos recibidos del dispositivo ESP32_AIR_001
✅ DHT22 registrado: 25.5°C, 65.2%
```

### 6. Datos visibles en frontend
Dashboard debe mostrar:
- Temperatura actual
- Humedad actual
- Gráficos actualizándose
- Alertas (si hay valores fuera de rango)

---

## 🗄️ Verificar Base de Datos

### HeidiSQL
1. Conectar a localhost
2. Seleccionar base de datos `cacao_monitoring`
3. Ver tablas:
   - `users` - Usuarios del sistema
   - `devices` - Dispositivos ESP32
   - `dht22_readings` - Lecturas de temperatura/humedad
   - `mq135_readings` - Calidad del aire
   - `mq7_readings` - Monóxido de carbono
   - `mq4_readings` - Metano
   - `mq136_readings` - Sulfuro de hidrógeno
   - `alerts` - Alertas generadas

### Consultas útiles
```sql
-- Ver dispositivos registrados
SELECT * FROM devices;

-- Ver últimas 10 lecturas DHT22
SELECT * FROM dht22_readings 
ORDER BY createdAt DESC 
LIMIT 10;

-- Ver alertas activas
SELECT * FROM alerts 
WHERE isResolved = 0 
ORDER BY createdAt DESC;

-- Contar lecturas por dispositivo
SELECT 
  d.deviceId,
  d.name,
  COUNT(dht.id) as total_lecturas
FROM devices d
LEFT JOIN dht22_readings dht ON d.id = dht.deviceId
GROUP BY d.id;
```

---

## 🚨 Solución de Problemas

### Backend no inicia

**Error: "Access denied for user"**
```bash
# Verificar credenciales MySQL en .env
DB_USER=root
DB_PASSWORD=tu_password_aqui
```

**Error: "Unknown database"**
```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE cacao_monitoring;"
```

**Error: "Port 3000 already in use"**
```bash
# Cambiar puerto en .env
PORT=3001
```

### Frontend no conecta con backend

**Error: "Network Error" o "CORS"**
```bash
# Verificar que backend esté corriendo
curl http://localhost:3000/health

# Verificar CORS en backend/.env
CORS_ORIGIN=http://localhost:5173
```

**Error: "Failed to fetch"**
```bash
# Verificar URL en frontend/.env
VITE_API_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000/api
```

### ESP32 no envía datos

**Error: "WiFi desconectado"**
- Verificar SSID y contraseña
- Verificar que el router esté encendido

**Error: "Código HTTP: -1"**
- Verificar que backend esté corriendo
- Verificar IP correcta en el código
- Desactivar firewall temporalmente
- Verificar que ESP32 y PC estén en la misma red

---

## 📊 Estructura de Puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Frontend Web | 5173 | http://localhost:5173 |
| MySQL | 3306 | localhost:3306 |

---

## 🎯 Checklist de Setup Completo

- [ ] MySQL instalado y corriendo
- [ ] Base de datos `cacao_monitoring` creada
- [ ] Backend: `.env` configurado
- [ ] Backend: `npm install` ejecutado
- [ ] Backend: `npm run dev` corriendo
- [ ] Backend: Usuarios de prueba creados
- [ ] Frontend: `.env` configurado
- [ ] Frontend: `npm install` ejecutado
- [ ] Frontend: `npm run dev` corriendo
- [ ] Frontend: Login funciona
- [ ] ESP32: IP actualizada en código
- [ ] ESP32: WiFi configurado
- [ ] ESP32: Código cargado
- [ ] ESP32: Enviando datos correctamente
- [ ] Dashboard: Mostrando datos en tiempo real
- [ ] Alertas: Generándose automáticamente

---

## 🚀 Comandos Rápidos

### Iniciar todo (3 terminales)

**Terminal 1 - Backend:**
```bash
cd backend-angie
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd web-cacao-front
npm run dev
```

**Terminal 3 - Monitoreo:**
```bash
# Ver logs de MySQL
tail -f /var/log/mysql/error.log

# O monitorear base de datos
watch -n 1 'mysql -u root -p -e "SELECT COUNT(*) FROM cacao_monitoring.dht22_readings"'
```

---

## 📞 Usuarios de Prueba

| Usuario | Password | Rol |
|---------|----------|-----|
| maria.garcia | Maria2024! | admin |
| carlos.mendoza | Carlos2024! | user |
| ana.rodriguez | Ana2024! | user |

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Configuración Local Lista
