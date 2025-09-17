# 🌱 Tesis Angie Backend - API de Monitoreo de Cacao# 🌱 Tesis Angie Backend - API de Monitoreo de Cacao



Backend API REST para el sistema de monitoreo de cultivos de cacao con arquitectura modular y base de datos MySQL.Backend API REST para el sistema de monitoreo de cultivos de cacao con arquitectura modular y base de datos MySQL.



## ✨ Características## 📋 Tabla de Contenidos



- 🏗️ **Arquitectura Modular**: Cada funcionalidad organizada en su propio módulo- [Características](#características)

- 🗄️ **MySQL + Sequelize ORM**: Base de datos relacional con ORM robusto- [Arquitectura](#arquitectura)

- 🔐 **Autenticación JWT**: Sistema completo de autenticación y autorización- [Instalación](#instalación)

- 📊 **Monitoreo Ambiental**: Gestión de datos de sensores IoT- [Configuración](#configuración)

- 🚨 **Sistema de Alertas**: Notificaciones automáticas por umbrales- [Estructura del Proyecto](#estructura-del-proyecto)

- 📈 **Reportes y Analytics**: Generación de reportes ambientales- [API Endpoints](#api-endpoints)

- ⚙️ **Configuración Dinámica**: Sistema de configuración flexible- [Base de Datos](#base-de-datos)

- 🛡️ **Seguridad Avanzada**: Rate limiting, CORS, Helmet, validaciones- [Desarrollo](#desarrollo)

- 📱 **Compatible con HeidiSQL**: Optimizado para gestión con HeidiSQL- [Seguridad](#seguridad)

- [Contribución](#contribución)

## 🚀 Instalación

## ✨ Características

### Prerrequisitos

- 🏗️ **Arquitectura Modular**: Cada funcionalidad organizada en su propio módulo

- **Node.js** >= 16.0.0- 🗄️ **MySQL + Sequelize ORM**: Base de datos relacional con ORM robusto

- **MySQL** >= 8.0- 🔐 **Autenticación JWT**: Sistema completo de autenticación y autorización

- **HeidiSQL** (recomendado para gestión de BD)- 📊 **Monitoreo Ambiental**: Gestión de datos de sensores IoT

- 🚨 **Sistema de Alertas**: Notificaciones automáticas por umbrales

### Pasos de Instalación- 📈 **Reportes y Analytics**: Generación de reportes ambientales

- ⚙️ **Configuración Dinámica**: Sistema de configuración flexible

1. **Clonar el repositorio**- 🛡️ **Seguridad Avanzada**: Rate limiting, CORS, Helmet, validaciones

```bash- 📱 **Compatible con HeidiSQL**: Optimizado para gestión con HeidiSQL

git clone https://github.com/usuario/tesis-angie-backend.git

cd tesis-angie-backend## 🏗️ Arquitectura

```

### Estructura Modular

2. **Instalar dependencias**

```bashCada ventana/funcionalidad tiene su propia carpeta con:

npm install- **Service**: Lógica de negocio

```- **Controller**: Manejo de requests HTTP

- **Routes**: Definición de endpoints

3. **Configurar variables de entorno**

```bash```

# Editar .env con tus configuraciones MySQLsrc/

```├── modules/

│   ├── auth/          # Autenticación y autorización

4. **Crear base de datos MySQL**│   ├── users/         # Gestión de usuarios

```sql│   ├── environmental/ # Datos ambientales y sensores

CREATE DATABASE cacao_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;│   ├── reports/       # Reportes y análisis

<!-- README actualizado: MySQL + Sequelize -->

# 🌱 Tesis Angie Backend - API de Monitoreo de Cacao

Backend RESTful para la aplicación de monitoreo de cacao "Tesis Angie".
Arquitectura modular basada en Node.js + Express y base de datos relacional MySQL gestionada con Sequelize.

---

## 📋 Resumen

- Base: Node.js + Express
- ORM: Sequelize
- Base de datos: MySQL (compatible con HeidiSQL)
- Autenticación: JWT + bcrypt
- Organización: módulos por funcionalidad (auth, users, environmental, reports, config)

---

## � Requisitos

- Node.js >= 16
- npm >= 8
- MySQL (local o remoto) >= 5.7 (recomendado >= 8.0)
- HeidiSQL (opcional, recomendado para gestionar la BD)

---

## 🚀 Instalación rápida

1. Clona el repositorio

```bash
git clone https://github.com/Jorgeplr/backend-angie.git
cd backend-angie
```

2. Instala dependencias

```bash
npm install
```

3. Crea la base de datos MySQL (ejemplo)

```sql
CREATE DATABASE cacao_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. Crea archivo `.env` (puedes copiar `.env.example`) y configura variables:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=tu_password
JWT_SECRET=una_clave_segura
PORT=3000
NODE_ENV=development
```

5. Inicia en modo desarrollo

```bash
npm run dev
```

---

## 📦 Características principales

- Autenticación JWT
- Gestión de usuarios y roles (admin/user)
- Monitoreo de datos ambientales (temperatura, humedad, luz, pH)
- Sistema de alertas automático por umbrales
- Reportes exportables (JSON/CSV)
- Configuración de umbrales por dispositivo
- Seguridad: rate limiting, Helmet, CORS, validación de entradas

---

## 🔌 Endpoints (resumen)

- `/api/auth/*` — login / register / refresh
- `/api/users/*` — gestión de usuarios y perfil
- `/api/environmental/*` — registro y consulta de datos de sensores
- `/api/reports/*` — generación y exportación de reportes
- `/api/config/*` — configuración del sistema

---

## 🗄️ Base de datos

El proyecto usa MySQL + Sequelize. Al iniciar, Sequelize sincroniza los modelos y crea las tablas si no existen.

Modelos principales:

- `Users`
- `EnvironmentalData`
- `Alerts`
- `SystemConfig`

Relaciones principales:

- User → EnvironmentalData (1:N)
- User → Alerts (1:N)
- EnvironmentalData → Alerts (1:N)
- User → SystemConfig (1:N)

---

## 🛠️ Scripts útiles

```bash
# Desarrollo con nodemon / watch
npm run dev

# Producción
npm start

# Instalar dependencias
npm install
```

---

## 📝 Notas

- El proyecto está preparado para usarse con herramientas como HeidiSQL para administrar la base de datos MySQL.
- Si necesitas ayuda para importar el script de creación de tablas o poblar datos de ejemplo, dime y te genero un script SQL listo para importar.

---

**Desarrollado con ❤️ para el monitoreo sostenible de cultivos de cacao**

## 🔒 Seguridad

### Configuración de HeidiSQL

- **Helmet.js**: Headers de seguridad

- **Rate Limiting**: 100 requests/15min1. Crear nueva conexión:

- **CORS**: Control de origen cruzado   - **Tipo**: MySQL

- **JWT**: Tokens seguros con bcrypt   - **Hostname**: localhost

- **Validación**: Input validation completa   - **Puerto**: 3306

   - **Usuario**: root

## 📱 HeidiSQL   - **Base de datos**: cacao_monitoring



La base de datos está optimizada para HeidiSQL:2. El servidor creará automáticamente las tablas al iniciar

- Charset UTF8MB4

- Indexes apropiados## 📁 Estructura del Proyecto

- Relaciones bien definidas

```

## 🛠️ Scriptstesis-angie-backend/

├── src/

```bash│   ├── modules/

npm run dev    # Desarrollo con auto-reload│   │   ├── auth/

npm start      # Producción│   │   │   ├── authService.js      # Lógica de autenticación

npm install    # Instalar dependencias│   │   │   ├── authController.js   # Controlador de auth

```│   │   │   └── authRoutes.js       # Rutas de auth

│   │   ├── users/

## 📄 Licencia│   │   │   ├── userService.js      # Gestión de usuarios

│   │   │   ├── userController.js   # Controlador de usuarios

ISC License│   │   │   └── userRoutes.js       # Rutas de usuarios

│   │   ├── environmental/

---│   │   │   ├── environmentalService.js

│   │   │   ├── environmentalController.js

**Desarrollado con ❤️ para el monitoreo sostenible de cultivos de cacao**│   │   │   └── environmentalRoutes.js
│   │   ├── reports/
│   │   │   ├── reportsService.js
│   │   │   ├── reportsController.js
│   │   │   └── reportsRoutes.js
│   │   └── config/
│   │       ├── configService.js
│   │       ├── configController.js
│   │       └── configRoutes.js
│   ├── shared/
│   │   ├── middleware/
│   │   │   ├── auth.js            # Middleware de autenticación
│   │   │   ├── errorHandler.js    # Manejo de errores
│   │   │   └── validation.js      # Validaciones
│   │   ├── utils/
│   │   │   ├── responseHelper.js  # Helpers de respuesta
│   │   │   ├── dateUtils.js       # Utilidades de fecha
│   │   │   └── pagination.js      # Paginación
│   │   └── constants/
│   │       └── index.js           # Constantes del sistema
│   ├── models/
│   │   └── index.js              # Modelos Sequelize
│   ├── config/
│   │   └── database.js           # Configuración MySQL
│   └── server.js                 # Punto de entrada
├── .env                          # Variables de entorno
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `POST /register` - Registrar usuario
- `POST /refresh` - Renovar token
- `POST /logout` - Cerrar sesión

### Usuarios (`/api/users`)
- `GET /profile` - Perfil del usuario
- `PUT /profile` - Actualizar perfil
- `GET /stats` - Estadísticas del usuario
- `GET /` - Listar usuarios (admin)

### Datos Ambientales (`/api/environmental`)
- `POST /data` - Registrar datos de sensores
- `GET /data` - Obtener datos ambientales
- `GET /devices` - Gestión de dispositivos
- `GET /stats` - Estadísticas ambientales

### Reportes (`/api/reports`)
- `GET /environmental` - Reportes ambientales
- `GET /alerts` - Reportes de alertas
- `GET /efficiency` - Análisis de eficiencia
- `POST /export` - Exportar reportes

### Configuración (`/api/config`)
- `GET /` - Obtener configuraciones
- `PUT /` - Actualizar configuración
- `GET /optimal-cacao` - Configuración óptima para cacao
- `POST /export` - Exportar configuración
- `POST /import` - Importar configuración

## 🗄️ Base de Datos

### Modelos Principales

#### Users
- Gestión de usuarios y autenticación
- Roles: admin, user
- Autenticación JWT

#### EnvironmentalData
- Datos de sensores IoT
- Temperatura, humedad, pH, luminosidad
- Geolocalización GPS

#### Alerts
- Sistema de alertas automáticas
- Severidad: low, medium, high, critical
- Estados: activa, resuelta, leída

#### SystemConfig
- Configuración dinámica del sistema
- Umbrales configurables
- Configuración óptima para cacao

### Relaciones
- User → EnvironmentalData (1:N)
- User → Alerts (1:N)
- EnvironmentalData → Alerts (1:N)
- User → SystemConfig (1:N)

## 🛠️ Desarrollo

### Scripts Disponibles

```bash
# Desarrollo con auto-reload
npm run dev

# Producción
npm start

# Instalar dependencias
npm install

# Verificar vulnerabilidades
npm audit
```

### Debugging

El servidor incluye logs detallados:
- Conexiones de base de datos
- Requests HTTP
- Errores y excepciones
- Cambios de configuración

### Testing

```bash
# Verificar salud del servidor
GET /health

# Información de la API
GET /api
```

## 🔒 Seguridad

### Medidas Implementadas

- **Helmet.js**: Headers de seguridad
- **Rate Limiting**: Limitación de requests
- **CORS**: Control de origen cruzado
- **JWT**: Tokens seguros
- **Bcrypt**: Hash de contraseñas
- **Validación**: Input validation
- **SQL Injection**: Protección con Sequelize

### Configuración de Seguridad

- Rate limiting: 100 requests/15min
- Auth rate limiting: 5 intentos/15min
- JWT expiration: 7 días
- Bcrypt rounds: 12

## 🎯 Configuración Óptima para Cacao

El sistema incluye configuraciones predefinidas para cultivos de cacao:

- **Temperatura**: 20-30°C
- **Humedad**: 60-80%
- **pH del suelo**: 6.0-7.5
- **Humedad del suelo**: 40-70%
- **Altitud recomendada**: 200-800m

## 📱 Compatibilidad con HeidiSQL

La base de datos está optimizada para HeidiSQL:
- Charset UTF8MB4
- Indexes apropiados
- Nombres de tablas claros
- Relaciones bien definidas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver `LICENSE` para más detalles.

## 📞 Soporte

- **Email**: support@cacaomonitoring.com
- **Documentación**: [docs.cacaomonitoring.com](https://docs.cacaomonitoring.com)
- **Issues**: [GitHub Issues](https://github.com/usuario/tesis-angie-backend/issues)

---

**Desarrollado con ❤️ para el monitoreo sostenible de cultivos de cacao**