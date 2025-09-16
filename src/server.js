const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');

// Importar rutas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const environmentalRoutes = require('./routes/environmental');
const reportsRoutes = require('./routes/reports');
const configRoutes = require('./routes/config');

const app = express();

// Conectar a la base de datos
connectDB();

// Middlewares de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // límite de requests por ventana de tiempo
    message: {
        error: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde.'
    }
});

app.use(limiter);

// CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true
}));

// Logger
app.use(morgan('combined'));

// Parser de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de salud del servidor
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Tesis Angie Backend API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/environmental', environmentalRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/config', configRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a Tesis Angie Backend API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users',
            environmental: '/api/environmental',
            reports: '/api/reports',
            config: '/api/config'
        }
    });
});

// Middleware de manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint no encontrado',
        message: `La ruta ${req.originalUrl} no existe`
    });
});

// Middleware de manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        error: error.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    console.log(`📋 API disponible en: http://localhost:${PORT}`);
    console.log(`💾 Entorno: ${process.env.NODE_ENV || 'development'}`);
});