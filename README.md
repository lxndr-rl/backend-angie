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

```│   └── config/        # Configuración del sistema

├── shared/           # Utilidades compartidas

5. **Iniciar el servidor**│   ├── middleware/   # Middleware global

```bash│   ├── utils/        # Utilidades comunes

# Desarrollo│   └── constants/    # Constantes del sistema

npm run dev├── models/           # Modelos de base de datos

└── config/           # Configuración de BD y app

# Producción```

npm start

```## 🚀 Instalación



## 📁 Estructura Modular### Prerrequisitos



```- **Node.js** >= 16.0.0

src/- **MySQL** >= 8.0

├── modules/- **HeidiSQL** (recomendado para gestión de BD)

│   ├── auth/          # Autenticación y autorización- **Git**

│   ├── users/         # Gestión de usuarios

│   ├── environmental/ # Datos ambientales y sensores### Pasos de Instalación

│   ├── reports/       # Reportes y análisis

│   └── config/        # Configuración del sistema1. **Clonar el repositorio**

├── shared/           # Utilidades compartidas```bash

│   ├── middleware/   # Middleware globalgit clone https://github.com/usuario/tesis-angie-backend.git

│   ├── utils/        # Utilidades comunescd tesis-angie-backend

│   └── constants/    # Constantes del sistema```

├── models/           # Modelos de base de datos

└── config/           # Configuración de BD y app2. **Instalar dependencias**

``````bash

npm install

## 🔌 API Endpoints```



### Autenticación (`/api/auth`)3. **Configurar variables de entorno**

- `POST /login` - Iniciar sesión```bash

- `POST /register` - Registrar usuariocp .env.example .env

- `POST /refresh` - Renovar token# Editar .env con tus configuraciones

```

### Usuarios (`/api/users`)

- `GET /profile` - Perfil del usuario4. **Crear base de datos MySQL**

- `PUT /profile` - Actualizar perfil```sql

- `GET /stats` - Estadísticas del usuarioCREATE DATABASE cacao_monitoring CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

```

### Datos Ambientales (`/api/environmental`)

- `POST /data` - Registrar datos de sensores5. **Iniciar el servidor**

- `GET /data` - Obtener datos ambientales```bash

- `GET /devices` - Gestión de dispositivos# Desarrollo

npm run dev

### Reportes (`/api/reports`)

- `GET /environmental` - Reportes ambientales# Producción

- `GET /alerts` - Reportes de alertasnpm start

- `GET /efficiency` - Análisis de eficiencia```



### Configuración (`/api/config`)## ⚙️ Configuración

- `GET /` - Obtener configuraciones

- `PUT /` - Actualizar configuración### Variables de Entorno (.env)

- `GET /optimal-cacao` - Configuración óptima para cacao

```env

## 🗄️ Base de Datos MySQL# Base de datos MySQL

DB_HOST=localhost

### Modelos PrincipalesDB_PORT=3306

DB_NAME=cacao_monitoring

- **Users**: Gestión de usuarios y autenticaciónDB_USER=root

- **EnvironmentalData**: Datos de sensores IoT (temperatura, humedad, pH, luz)DB_PASSWORD=tu_password

- **Alerts**: Sistema de alertas automáticas

- **SystemConfig**: Configuración dinámica del sistema# JWT

JWT_SECRET=tu_clave_secreta_muy_segura

### Configuración Óptima para CacaoJWT_EXPIRES_IN=7d



- **Temperatura**: 20-30°C# Servidor

- **Humedad**: 60-80%PORT=3000

- **pH del suelo**: 6.0-7.5NODE_ENV=development

- **Humedad del suelo**: 40-70%FRONTEND_URL=http://localhost:3000

```

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