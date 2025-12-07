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
  // Alertas ambientales
  TEMPERATURE_HIGH: 'temperature_high',
  TEMPERATURE_LOW: 'temperature_low',
  TEMPERATURE_CRITICAL_HIGH: 'temperature_critical_high',
  TEMPERATURE_CRITICAL_LOW: 'temperature_critical_low',
  HUMIDITY_HIGH: 'humidity_high',
  HUMIDITY_LOW: 'humidity_low',
  HUMIDITY_CRITICAL_HIGH: 'humidity_critical_high',
  HUMIDITY_CRITICAL_LOW: 'humidity_critical_low',
  
  // Alertas de gases tóxicos
  CO2_HIGH: 'co2_high',
  CO2_CRITICAL: 'co2_critical',
  CO_DETECTED: 'co_detected',
  CO_DANGER: 'co_danger',
  CO_EXTREME: 'co_extreme',
  CH4_DETECTED: 'ch4_detected',
  CH4_DANGER: 'ch4_danger',
  CH4_EXTREME: 'ch4_extreme',
  H2S_DETECTED: 'h2s_detected',
  H2S_DANGER: 'h2s_danger',
  H2S_EXTREME: 'h2s_extreme',
  
  // Alertas de calidad del aire
  AIR_QUALITY_POOR: 'air_quality_poor',
  AIR_QUALITY_HAZARDOUS: 'air_quality_hazardous',
  
  // Alertas antiguas (mantener compatibilidad)
  LIGHT_HIGH: 'light_high',
  LIGHT_LOW: 'light_low',
  PH_HIGH: 'ph_high',
  PH_LOW: 'ph_low',
  
  // Alertas de sistema
  DEVICE_OFFLINE: 'device_offline',
  SYSTEM_ERROR: 'system_error',
  
  // Alertas de cultivo
  FUNGAL_RISK: 'fungal_risk',           // Riesgo de hongos (Moniliasis)
  WATER_STRESS: 'water_stress',         // Estrés hídrico
  HEAT_STRESS: 'heat_stress',           // Estrés por calor
  FERMENTATION_ISSUE: 'fermentation_issue' // Problema en fermentación
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

// Configuraciones por defecto del sistema - CULTIVO DE CACAO EN ECUADOR
const DEFAULT_CONFIG = {
  // ============ TEMPERATURA (°C) - Theobroma cacao ============
  TEMPERATURE_MIN_IDEAL: 20,      // Mínimo ideal para cacao
  TEMPERATURE_MAX_IDEAL: 32,      // Máximo ideal para cacao
  TEMPERATURE_MIN_CRITICAL: 15,   // Daño a planta
  TEMPERATURE_MAX_CRITICAL: 38,   // Estrés severo
  // Compatibilidad con código antiguo
  TEMPERATURE_MIN: 20,
  TEMPERATURE_MAX: 32,
  TEMPERATURE_OPTIMAL_MIN: 24,
  TEMPERATURE_OPTIMAL_MAX: 28,

  // ============ HUMEDAD RELATIVA (%) ============
  HUMIDITY_MIN_IDEAL: 70,         // Mínimo ideal
  HUMIDITY_MAX_IDEAL: 85,         // Máximo ideal
  HUMIDITY_MIN_CRITICAL: 50,      // Estrés hídrico
  HUMIDITY_MAX_CRITICAL: 95,      // Riesgo de hongos (Moniliasis)
  // Compatibilidad con código antiguo
  HUMIDITY_MIN: 70,
  HUMIDITY_MAX: 85,
  HUMIDITY_OPTIMAL_MIN: 75,
  HUMIDITY_OPTIMAL_MAX: 85,

  // ============ CALIDAD DEL AIRE - CO2 (PPM) ============
  CO2_MAX_NORMAL: 600,            // Nivel aceptable
  CO2_MAX_ALERT: 1000,            // Ventilación deficiente
  CO2_MAX_CRITICAL: 2000,         // Riesgo para trabajadores

  // ============ MONÓXIDO DE CARBONO - CO (PPM) ============
  CO_SAFE: 9,                     // Nivel seguro (OSHA 8h)
  CO_CAUTION: 35,                 // Precaución
  CO_WARNING: 100,                // Síntomas leves
  CO_DANGER: 400,                 // Síntomas graves
  CO_EXTREME: 800,                // Mortal

  // ============ METANO - CH4 (PPM) ============
  CH4_SAFE: 1000,                 // Nivel seguro
  CH4_CAUTION: 5000,              // Precaución
  CH4_WARNING: 10000,             // 1% LEL
  CH4_DANGER: 25000,              // 2.5% LEL
  CH4_EXTREME: 50000,             // 5% LEL - Inflamable

  // ============ SULFURO DE HIDRÓGENO - H2S (PPM) ============
  H2S_SAFE: 0.5,                  // Nivel seguro
  H2S_CAUTION: 10,                // Olor detectable
  H2S_WARNING: 50,                // Irritación
  H2S_DANGER: 100,                // Pérdida de olfato
  H2S_EXTREME: 500,               // Mortal

  // ============ RANGOS ANTIGUOS (mantener compatibilidad) ============
  // Rangos de luz (lux) - para futuras implementaciones
  LIGHT_MIN: 1000,
  LIGHT_MAX: 3000,
  LIGHT_OPTIMAL_MIN: 1500,
  LIGHT_OPTIMAL_MAX: 2500,

  // Rangos de pH del suelo
  PH_MIN: 5.5,
  PH_MAX: 7.5,
  PH_OPTIMAL_MIN: 6.0,
  PH_OPTIMAL_MAX: 7.0,

  // ============ INTERVALOS Y CONFIGURACIONES ============
  // Intervalos de recolección de datos (segundos)
  DATA_COLLECTION_INTERVAL: 5,    // 5 segundos (ESP32)
  MIN_INTERVAL: 5,                // 5 segundos mínimo
  MAX_INTERVAL: 3600,             // 1 hora máximo

  // Configuraciones de alertas
  ALERT_COOLDOWN: 300,            // 5 minutos entre alertas del mismo tipo
  MAX_ALERTS_PER_DAY: 500,        // Aumentado por frecuencia de lecturas

  // Configuraciones de reportes
  MAX_REPORT_DAYS: 365,
  DEFAULT_REPORT_LIMIT: 1000,

  // Tiempo para considerar dispositivo offline (minutos)
  DEVICE_OFFLINE_THRESHOLD: 15    // 15 minutos sin datos
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