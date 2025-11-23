require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Importar configuración de base de datos
const db = require('./config/database');

// Importar middleware global
const { errorHandler, notFound } = require('./shared/middleware/errorHandler');

// Importar rutas modulares
const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/users/userRoutes');
const environmentalRoutes = require('./modules/environmental/environmentalRoutes');
const reportsRoutes = require('./modules/reports/reportsRoutes');
const configRoutes = require('./modules/config/configRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE DE SEGURIDAD ============

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting (desactivado en desarrollo)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // Sin límite en desarrollo
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Solo aplicar rate limiting en producción
if (process.env.NODE_ENV !== 'development') {
  app.use(limiter);
}

// Rate limiting específico para autenticación (desactivado en desarrollo)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'development' ? 10000 : 5, // Sin límite en desarrollo
  message: {
    success: false,
    error: 'Demasiados intentos de login, intenta de nuevo en 15 minutos.'
  },
  skipSuccessfulRequests: true,
});

// CORS
app.use(cors({
  origin: true, // Permitir todos los orígenes en desarrollo
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ============ MIDDLEWARE GENERAL ============

// Compresión
app.use(compression());

// Parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// ============ RUTAS ============

// Ruta de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL',
    version: '1.0.0'
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API de Monitoreo de Cacao - Backend',
    version: '1.0.0',
    status: 'Activo',
    documentation: '/api/docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      environmental: '/api/environmental',
      reports: '/api/reports',
      config: '/api/config'
    }
  });
});

// Aplicar rate limiting específico a rutas de autenticación (solo en producción)
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
}

// ============ RUTAS DE API ============
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/config', configRoutes);

// Ruta de información de la API
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'Cacao Monitoring API',
    version: '1.0.0',
    description: 'API REST para sistema de monitoreo de cultivos de cacao',
    modules: {
      auth: {
        description: 'Autenticación y autorización',
        endpoints: ['/api/auth/login', '/api/auth/register', '/api/auth/refresh']
      },
      users: {
        description: 'Gestión de usuarios',
        endpoints: ['/api/users', '/api/users/profile', '/api/users/stats']
      },
      environmental: {
        description: 'Datos ambientales y sensores',
        endpoints: ['/api/environmental/data', '/api/environmental/devices', '/api/environmental/stats']
      },
      reports: {
        description: 'Reportes y análisis',
        endpoints: ['/api/reports/environmental', '/api/reports/alerts', '/api/reports/efficiency']
      },
      config: {
        description: 'Configuración del sistema',
        endpoints: ['/api/config', '/api/config/optimal-cacao', '/api/config/export']
      }
    },
    support: {
      contact: 'support@cacaomonitoring.com',
      documentation: 'https://docs.cacaomonitoring.com'
    }
  });
});

// ============ MANEJO DE ERRORES ============

// Middleware para rutas no encontradas
app.use(notFound);

// Middleware de manejo de errores global
app.use(errorHandler);

// ============ INICIALIZACIÓN DEL SERVIDOR ============

async function startServer() {
  try {
    // Verificar conexión a base de datos
    await db.authenticate();
    console.log('✅ Conexión a MySQL establecida correctamente');
    
    // Sincronizar modelos (crear tablas si no existen)
    await db.sync({ force: false });
    console.log('✅ Modelos sincronizados con la base de datos');

    // Verificar si existe configuración del sistema
    const { SystemConfig } = require('./models');
    const existingConfig = await SystemConfig.findOne();
    if (!existingConfig) {
      const configService = require('./modules/config/configService');
      await configService.createDefaultConfig();
      console.log('✅ Configuración por defecto creada');
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('🚀 SERVIDOR INICIADO EXITOSAMENTE');
      console.log('='.repeat(50));
      console.log(`📍 Puerto: ${PORT}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de datos: ${process.env.DB_NAME || 'cacao_monitoring'}`);
      console.log(`🔐 JWT Secret: ${process.env.JWT_SECRET ? 'Configurado' : 'NO CONFIGURADO'}`);
      console.log('='.repeat(50));
      console.log('📋 ENDPOINTS DISPONIBLES:');
      console.log('   • Health Check: GET /health');
      console.log('   • API Info: GET /api');
      console.log('   • Autenticación: /api/auth/*');
      console.log('   • Usuarios: /api/users/*');
      console.log('   • Datos Ambientales: /api/environmental/*');
      console.log('   • Reportes: /api/reports/*');
      console.log('   • Configuración: /api/config/*');
      console.log('='.repeat(50));
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    console.error('Detalles del error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
}

// Manejar cierre graceful del servidor
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('🔄 Recibida señal SIGTERM, cerrando servidor...');
  await gracefulShutdown();
});

// Para Windows: Solo responder a Ctrl+C del usuario, no a señales HTTP
process.on('SIGINT', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('🔄 Ctrl+C detectado, cerrando servidor...');
  await gracefulShutdown();
});

async function gracefulShutdown() {
  try {
    console.log('⏳ Cerrando conexiones activas...');
    await db.close();
    console.log('✅ Conexión a base de datos cerrada correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al cerrar conexión a base de datos:', error);
    process.exit(1);
  }
}

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
  process.exit(1);
});

// Iniciar servidor
startServer();