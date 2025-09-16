# 🌱 Tesis Angie Backend API

Backend RESTful para la aplicación de monitoreo de cacao **Tesis Angie**. Proporciona APIs para gestión de usuarios, datos ambientales, reportes y configuración de dispositivos IoT.

## 🚀 Características

- ✅ Autenticación JWT
- ✅ Gestión de usuarios y roles (admin/user)
- ✅ Monitoreo de datos ambientales (temperatura, humedad, luz, pH)
- ✅ Sistema de alertas automático
- ✅ Generación de reportes (JSON/CSV)
- ✅ Configuración de umbrales por dispositivo
- ✅ Rate limiting y seguridad
- ✅ Validación de datos robusta
- ✅ Base de datos MongoDB con Mongoose

## 📋 Requisitos

- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

## 🛠️ Instalación y Configuración

### 1. Clonar o descargar el proyecto

```bash
cd tesis-angie-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
# Puerto del servidor
PORT=3000

# URL de la base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/tesis_angie

# Clave secreta para JWT (CAMBIAR EN PRODUCCIÓN)
JWT_SECRET=tu_clave_secreta_muy_segura_aqui_2024

# Configuración de desarrollo
NODE_ENV=development

# Configuración de CORS
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000

# Límites de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Ejecutar MongoDB

Asegúrate de que MongoDB esté corriendo:

```bash
# Windows (si MongoDB está instalado como servicio)
net start MongoDB

# macOS/Linux
mongod

# O usando Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Iniciar el servidor

```bash
# Desarrollo (con auto-restart)
npm run dev

# Producción
npm start
```

El servidor se iniciará en `http://localhost:3000`

## 📚 Documentación de la API

### 🔐 Autenticación

#### POST `/api/auth/register`
Registrar nuevo usuario.

**Body:**
```json
{
  \"firstName\": \"Juan\",
  \"lastName\": \"Pérez\",
  \"cedula\": \"12345678\",
  \"address\": \"Calle 123, Ciudad\",
  \"phone\": \"+57300123456\",
  \"username\": \"juanperez\",
  \"password\": \"MiPassword123\"
}
```

#### POST `/api/auth/login`
Iniciar sesión.

**Body:**
```json
{
  \"username\": \"juanperez\",
  \"password\": \"MiPassword123\"
}
```

**Respuesta:**
```json
{
  \"message\": \"Inicio de sesión exitoso\",
  \"token\": \"eyJhbGciOiJIUzI1NiIs...\",
  \"user\": {
    \"id\": \"64a1b2c3d4e5f6789...\",
    \"firstName\": \"Juan\",
    \"lastName\": \"Pérez\",
    \"username\": \"juanperez\",
    \"role\": \"user\"
  }
}
```

#### GET `/api/auth/profile`
Obtener perfil del usuario autenticado. *(Requiere token)*

### 🌡️ Datos Ambientales

#### GET `/api/environmental/{deviceId}/latest`
Obtener los últimos datos de un dispositivo.

#### GET `/api/environmental/{deviceId}/historical`
Obtener datos históricos.

**Query params:**
- `startDate`: Fecha de inicio (ISO 8601)
- `endDate`: Fecha de fin (ISO 8601)
- `limit`: Máximo número de registros (default: 100)

#### POST `/api/environmental/data`
Crear nuevos datos ambientales (para dispositivos IoT).

**Body:**
```json
{
  \"temperature\": 25.5,
  \"humidity\": 65.2,
  \"light\": 800,
  \"ph\": 6.8,
  \"deviceId\": \"cacao_sensor_001\"
}
```

#### GET `/api/environmental/{deviceId}/summary`
Obtener resumen estadístico.

**Query params:**
- `period`: `1h`, `6h`, `24h`, `7d` (default: `24h`)

#### GET `/api/environmental/{deviceId}/alerts`
Obtener alertas activas. *(Requiere token)*

### 📊 Reportes

#### GET `/api/reports/environmental/{deviceId}`
Generar reporte de datos ambientales. *(Requiere token)*

**Query params:**
- `startDate`: Fecha de inicio (obligatorio)
- `endDate`: Fecha de fin (obligatorio) 
- `format`: `json` o `csv` (default: `json`)

#### GET `/api/reports/summary/{deviceId}`
Obtener resumen de reportes disponibles. *(Requiere token)*

### 👥 Gestión de Usuarios *(Solo Admin)*

#### GET `/api/users`
Listar todos los usuarios.

#### GET `/api/users/{id}`
Obtener usuario específico.

#### PUT `/api/users/{id}`
Actualizar usuario.

#### DELETE `/api/users/{id}`
Eliminar usuario.

### ⚙️ Configuración

#### GET `/api/config/{deviceId}`
Obtener configuración de dispositivo. *(Requiere token)*

#### PUT `/api/config/{deviceId}`
Actualizar configuración. *(Solo Admin)*

**Body:**
```json
{
  \"thresholds\": {
    \"temperature\": { \"min\": 18, \"max\": 32 },
    \"humidity\": { \"min\": 40, \"max\": 80 },
    \"light\": { \"min\": 100, \"max\": 1000 },
    \"ph\": { \"min\": 6.0, \"max\": 7.5 }
  },
  \"dataCollection\": {
    \"interval\": 300,
    \"enabled\": true
  },
  \"alerts\": {
    \"enabled\": true,
    \"notificationMethods\": [\"in-app\"]
  }
}
```

## 🔒 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer {token}
```

## 🗂️ Estructura del Proyecto

```
src/
├── config/           # Configuración de BD
├── controllers/      # Lógica de negocio
├── middleware/       # Middlewares (auth, validación)
├── models/           # Modelos de MongoDB
├── routes/           # Definición de rutas
├── utils/            # Utilidades
└── server.js         # Servidor principal
```

## 💾 Modelos de Datos

### User
- `firstName`, `lastName`: Nombres
- `cedula`: Identificación única
- `address`, `phone`: Información de contacto
- `username`, `password`: Credenciales
- `role`: `user` | `admin`
- `isActive`: Estado de la cuenta

### EnvironmentalData
- `temperature`: Temperatura (°C)
- `humidity`: Humedad (%)
- `light`: Nivel de luz (lux)
- `ph`: Nivel de pH (0-14)
- `deviceId`: Identificador del dispositivo
- `location`: Coordenadas GPS
- `timestamps`: Fechas de creación/actualización

### Alert
- `title`, `description`: Información de la alerta
- `severity`: `Info` | `Advertencia` | `Atención` | `Crítico`
- `type`: Tipo de sensor que generó la alerta
- `deviceId`: Dispositivo asociado
- `isActive`: Estado de la alerta

### SystemConfig
- `deviceId`: Identificador del dispositivo
- `thresholds`: Umbrales min/max para cada sensor
- `dataCollection`: Configuración de recolección
- `alerts`: Configuración de notificaciones

## 🧪 Testing

```bash
# Instalar dependencias de testing
npm install --save-dev jest supertest

# Ejecutar tests
npm test
```

## 🚀 Despliegue

### Variables de Entorno para Producción

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://tu-servidor-mongo:27017/tesis_angie
JWT_SECRET=clave_super_secreta_y_larga_para_produccion
CORS_ORIGIN=https://tu-app-frontend.com
```

### Con Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD [\"npm\", \"start\"]
```

```bash
docker build -t tesis-angie-backend .
docker run -p 3000:3000 --env-file .env tesis-angie-backend
```

## 📝 Notas de Desarrollo

### Crear Usuario Admin

Para crear el primer usuario administrador, registra un usuario normal y luego actualiza su rol en la base de datos:

```javascript
// En MongoDB shell
db.users.updateOne(
  { username: \"admin\" },
  { $set: { role: \"admin\" } }
)
```

### Datos de Prueba

Para insertar datos de prueba:

```bash
# Crear datos ambientales de ejemplo
curl -X POST http://localhost:3000/api/environmental/data \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"temperature\": 26.5,
    \"humidity\": 70,
    \"light\": 750,
    \"ph\": 6.5,
    \"deviceId\": \"cacao_test_001\"
  }'
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades, por favor abre un issue en el repositorio.

---

**¡Happy Coding! 🌱**