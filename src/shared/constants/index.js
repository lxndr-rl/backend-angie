// Constantes globales de la aplicación

// Roles de usuario
const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

// Estados de usuario
const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Tipos de alertas
const ALERT_TYPES = {
  TEMPERATURE_HIGH: 'temperature_high',
  TEMPERATURE_LOW: 'temperature_low',
  HUMIDITY_HIGH: 'humidity_high',
  HUMIDITY_LOW: 'humidity_low',
  LIGHT_HIGH: 'light_high',
  LIGHT_LOW: 'light_low',
  PH_HIGH: 'ph_high',
  PH_LOW: 'ph_low',
  DEVICE_OFFLINE: 'device_offline',
  SYSTEM_ERROR: 'system_error'
};

// Severidad de alertas
const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Estados de alertas
const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved'
};

// Intervalos de tiempo para reportes
const TIME_INTERVALS = {
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year'
};

// Configuraciones por defecto del sistema
const DEFAULT_CONFIG = {
  // Rangos de temperatura (°C)
  TEMPERATURE_MIN: 20,
  TEMPERATURE_MAX: 30,
  TEMPERATURE_OPTIMAL_MIN: 22,
  TEMPERATURE_OPTIMAL_MAX: 28,

  // Rangos de humedad (%)
  HUMIDITY_MIN: 60,
  HUMIDITY_MAX: 85,
  HUMIDITY_OPTIMAL_MIN: 65,
  HUMIDITY_OPTIMAL_MAX: 80,

  // Rangos de luz (lux)
  LIGHT_MIN: 1000,
  LIGHT_MAX: 3000,
  LIGHT_OPTIMAL_MIN: 1500,
  LIGHT_OPTIMAL_MAX: 2500,

  // Rangos de pH
  PH_MIN: 5.5,
  PH_MAX: 7.0,
  PH_OPTIMAL_MIN: 6.0,
  PH_OPTIMAL_MAX: 6.5,

  // Intervalos de recolección de datos (segundos)
  DATA_COLLECTION_INTERVAL: 300, // 5 minutos
  MIN_INTERVAL: 60, // 1 minuto
  MAX_INTERVAL: 3600, // 1 hora

  // Configuraciones de alertas
  ALERT_COOLDOWN: 900, // 15 minutos entre alertas del mismo tipo
  MAX_ALERTS_PER_DAY: 100,

  // Configuraciones de reportes
  MAX_REPORT_DAYS: 365,
  DEFAULT_REPORT_LIMIT: 1000
};

// Estados de dispositivos
const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  ERROR: 'error'
};

// Tipos de sensores
const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  LIGHT: 'light',
  PH: 'ph'
};

// Códigos de error personalizados
const ERROR_CODES = {
  // Errores de autenticación
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_CREDENTIALS_INVALID: 'AUTH_CREDENTIALS_INVALID',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  AUTH_USER_INACTIVE: 'AUTH_USER_INACTIVE',

  // Errores de validación
  VALIDATION_REQUIRED_FIELD: 'VALIDATION_REQUIRED_FIELD',
  VALIDATION_INVALID_FORMAT: 'VALIDATION_INVALID_FORMAT',
  VALIDATION_OUT_OF_RANGE: 'VALIDATION_OUT_OF_RANGE',
  VALIDATION_DUPLICATE_ENTRY: 'VALIDATION_DUPLICATE_ENTRY',

  // Errores de base de datos
  DB_CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
  DB_QUERY_ERROR: 'DB_QUERY_ERROR',
  DB_RECORD_NOT_FOUND: 'DB_RECORD_NOT_FOUND',
  DB_CONSTRAINT_VIOLATION: 'DB_CONSTRAINT_VIOLATION',

  // Errores de dispositivos
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  DEVICE_OFFLINE: 'DEVICE_OFFLINE',
  DEVICE_SENSOR_ERROR: 'DEVICE_SENSOR_ERROR',

  // Errores del sistema
  SYSTEM_CONFIG_ERROR: 'SYSTEM_CONFIG_ERROR',
  SYSTEM_OVERLOAD: 'SYSTEM_OVERLOAD',
  SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE'
};

// Configuraciones de paginación
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_PAGE: 1
};

// Configuraciones de rate limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutos
  MAX_REQUESTS: 100, // Máximo 100 requests por ventana
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15 minutos para auth
  AUTH_MAX_REQUESTS: 5 // Máximo 5 intentos de login por ventana
};

// Configuraciones de archivos
const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: './uploads'
};

// Configuraciones de email (para futuras notificaciones)
const EMAIL_CONFIG = {
  FROM_NAME: 'Sistema de Monitoreo de Cacao',
  FROM_EMAIL: 'noreply@cacaomonitoring.com',
  TEMPLATES: {
    ALERT: 'alert',
    REPORT: 'report',
    WELCOME: 'welcome'
  }
};

// Configuraciones de logs
const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly'
};

module.exports = {
  USER_ROLES,
  USER_STATUS,
  ALERT_TYPES,
  ALERT_SEVERITY,
  ALERT_STATUS,
  TIME_INTERVALS,
  DEFAULT_CONFIG,
  DEVICE_STATUS,
  SENSOR_TYPES,
  ERROR_CODES,
  PAGINATION,
  RATE_LIMIT,
  FILE_CONFIG,
  EMAIL_CONFIG,
  LOG_LEVELS
};