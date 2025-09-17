-- ========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Monitoreo de Cacao - Tesis Angie
-- Compatible con HeidiSQL
-- ========================================

-- Seleccionar la base de datos
USE cacao_monitoring;

-- Configurar charset para soporte completo de caracteres
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ========================================
-- 1. TABLA USERS
-- ========================================
CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    phone VARCHAR(20) NULL,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    avatar TEXT NULL,
    isActive BOOLEAN NOT NULL DEFAULT true,
    lastLogin DATETIME NULL,
    refreshToken TEXT NULL,
    passwordResetToken VARCHAR(255) NULL,
    passwordResetExpires DATETIME NULL,
    emailVerified BOOLEAN NOT NULL DEFAULT false,
    emailVerificationToken VARCHAR(255) NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email (email),
    INDEX idx_users_username (username),
    INDEX idx_users_role (role),
    INDEX idx_users_isActive (isActive)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 2. TABLA ENVIRONMENTAL_DATA
-- ========================================
CREATE TABLE environmental_data (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId VARCHAR(100) NOT NULL,
    temperature DECIMAL(5,2) NOT NULL,
    humidity DECIMAL(5,2) NOT NULL,
    lightIntensity DECIMAL(8,2) NOT NULL,
    soilPh DECIMAL(4,2) NOT NULL,
    soilMoisture DECIMAL(5,2) NOT NULL,
    rainfall DECIMAL(6,2) DEFAULT 0,
    windSpeed DECIMAL(5,2) DEFAULT 0,
    atmosphericPressure DECIMAL(7,2) NULL,
    latitude DECIMAL(10,8) NULL,
    longitude DECIMAL(11,8) NULL,
    altitude DECIMAL(8,2) NULL,
    userId INT NOT NULL,
    location VARCHAR(200) NULL,
    notes TEXT NULL,
    quality ENUM('excellent', 'good', 'fair', 'poor') NULL,
    batteryLevel DECIMAL(5,2) NULL,
    signalStrength INT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_env_userId (userId),
    INDEX idx_env_deviceId (deviceId),
    INDEX idx_env_createdAt (createdAt),
    INDEX idx_env_temperature (temperature),
    INDEX idx_env_humidity (humidity),
    INDEX idx_env_quality (quality),
    CONSTRAINT fk_env_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. TABLA ALERTS
-- ========================================
CREATE TABLE alerts (
    id INT NOT NULL AUTO_INCREMENT,
    type ENUM('temperature', 'humidity', 'light', 'ph', 'moisture', 'system', 'maintenance', 'security') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT false,
    isResolved BOOLEAN NOT NULL DEFAULT false,
    resolvedAt DATETIME NULL,
    resolvedBy INT NULL,
    userId INT NOT NULL,
    environmentalDataId INT NULL,
    deviceId VARCHAR(100) NULL,
    triggerValue DECIMAL(10,4) NULL,
    thresholdValue DECIMAL(10,4) NULL,
    metadata JSON NULL,
    actions JSON NULL,
    autoResolved BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_alerts_userId (userId),
    INDEX idx_alerts_type (type),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_isRead (isRead),
    INDEX idx_alerts_isResolved (isResolved),
    INDEX idx_alerts_createdAt (createdAt),
    INDEX idx_alerts_environmentalDataId (environmentalDataId),
    CONSTRAINT fk_alerts_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_resolvedBy FOREIGN KEY (resolvedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_environmentalDataId FOREIGN KEY (environmentalDataId) REFERENCES environmental_data(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. TABLA SYSTEM_CONFIG
-- ========================================
CREATE TABLE system_config (
    id INT NOT NULL AUTO_INCREMENT,
    configKey VARCHAR(100) NOT NULL UNIQUE,
    configValue JSON NOT NULL,
    description TEXT NULL,
    category ENUM('thresholds', 'alerts', 'system', 'sensors', 'notification', 'cacao_optimal', 'data_collection') NOT NULL DEFAULT 'system',
    isActive BOOLEAN NOT NULL DEFAULT true,
    isEditable BOOLEAN NOT NULL DEFAULT true,
    lastModifiedBy INT NULL,
    version INT NOT NULL DEFAULT 1,
    validationSchema JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_config_configKey (configKey),
    INDEX idx_config_category (category),
    INDEX idx_config_isActive (isActive),
    INDEX idx_config_lastModifiedBy (lastModifiedBy),
    CONSTRAINT fk_config_lastModifiedBy FOREIGN KEY (lastModifiedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. DATOS INICIALES
-- ========================================

-- Usuario administrador por defecto
INSERT INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) VALUES 
('admin', 'admin@cacaomonitoring.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Administrador', 'Sistema', 'admin', true, true);
-- Contraseña: admin123

-- Usuario demo
INSERT INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) VALUES 
('demo', 'demo@cacaomonitoring.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Usuario', 'Demo', 'user', true, true);
-- Contraseña: admin123

-- Configuraciones del sistema por defecto
INSERT INTO system_config (configKey, configValue, description, category, isActive, isEditable) VALUES
-- Configuración óptima para cacao
('cacao_optimal_conditions', 
 '{"temperature": {"min": 20, "max": 30, "optimal": 25}, "humidity": {"min": 60, "max": 80, "optimal": 70}, "soilPh": {"min": 6.0, "max": 7.5, "optimal": 6.8}, "soilMoisture": {"min": 40, "max": 70, "optimal": 55}, "lightIntensity": {"min": 500, "max": 1200, "optimal": 800}, "altitude": {"min": 200, "max": 800, "optimal": 400}}', 
 'Condiciones óptimas para cultivo de cacao', 
 'cacao_optimal', 
 true, 
 true),

-- Umbrales de alertas
('alert_thresholds', 
 '{"temperature": {"critical_low": 15, "warning_low": 18, "warning_high": 32, "critical_high": 35}, "humidity": {"critical_low": 40, "warning_low": 50, "warning_high": 85, "critical_high": 95}, "soilPh": {"critical_low": 5.0, "warning_low": 5.5, "warning_high": 8.0, "critical_high": 8.5}, "soilMoisture": {"critical_low": 20, "warning_low": 30, "warning_high": 80, "critical_high": 90}}', 
 'Umbrales para generación de alertas automáticas', 
 'thresholds', 
 true, 
 true),

-- Configuración de recolección de datos
('data_collection_settings', 
 '{"interval_minutes": 5, "auto_quality_assessment": true, "store_raw_data": true, "data_retention_days": 365, "backup_enabled": true, "compression_enabled": false}', 
 'Configuración para recolección de datos de sensores', 
 'data_collection', 
 true, 
 true),

-- Configuración de notificaciones
('notification_settings', 
 '{"email_enabled": true, "sms_enabled": false, "push_enabled": true, "alert_cooldown_minutes": 30, "batch_notifications": false, "quiet_hours": {"enabled": true, "start": "22:00", "end": "06:00"}}', 
 'Configuración del sistema de notificaciones', 
 'notification', 
 true, 
 true),

-- Configuración de sensores
('sensor_calibration', 
 '{"temperature_offset": 0, "humidity_offset": 0, "ph_calibration_points": [{"ph": 4.0, "voltage": 3.0}, {"ph": 7.0, "voltage": 2.5}, {"ph": 10.0, "voltage": 2.0}], "moisture_calibration": {"dry": 0, "wet": 100}, "light_multiplier": 1.0}', 
 'Configuración de calibración de sensores', 
 'sensors', 
 true, 
 true);

-- Datos de prueba para environmental_data
INSERT INTO environmental_data (deviceId, temperature, humidity, lightIntensity, soilPh, soilMoisture, rainfall, windSpeed, userId, location, quality) VALUES
('CACAO_SENSOR_001', 25.5, 68.2, 750.0, 6.5, 55.8, 0.0, 2.1, 1, 'Finca La Esperanza - Sector A', 'good'),
('CACAO_SENSOR_001', 26.1, 70.5, 820.0, 6.7, 58.2, 0.0, 1.8, 1, 'Finca La Esperanza - Sector A', 'excellent'),
('CACAO_SENSOR_002', 24.8, 65.8, 680.0, 6.4, 52.1, 2.5, 3.2, 2, 'Finca San José - Sector B', 'good'),
('CACAO_SENSOR_002', 27.2, 72.3, 890.0, 6.9, 60.5, 0.0, 2.7, 2, 'Finca San José - Sector B', 'excellent');

-- Alertas de ejemplo
INSERT INTO alerts (type, severity, title, message, userId, deviceId, triggerValue, thresholdValue) VALUES
('temperature', 'medium', 'Temperatura Alta Detectada', 'La temperatura en el sensor CACAO_SENSOR_001 ha alcanzado 32.1°C, superando el umbral recomendado', 1, 'CACAO_SENSOR_001', 32.1, 30.0),
('humidity', 'low', 'Humedad Baja', 'Los niveles de humedad en CACAO_SENSOR_002 están por debajo del rango óptimo (45%)', 2, 'CACAO_SENSOR_002', 45.0, 60.0);

-- ========================================
-- 6. VERIFICACIÓN DE TABLAS CREADAS
-- ========================================
SHOW TABLES;

-- Verificar estructura de cada tabla
DESCRIBE users;
DESCRIBE environmental_data;
DESCRIBE alerts;
DESCRIBE system_config;

-- Verificar datos insertados
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_environmental_data FROM environmental_data;
SELECT COUNT(*) AS total_alerts FROM alerts;
SELECT COUNT(*) AS total_configs FROM system_config;

-- ========================================
-- 7. CONSULTAS DE EJEMPLO PARA VERIFICAR
-- ========================================

-- Ver usuarios
SELECT id, username, email, firstName, lastName, role, isActive, createdAt FROM users;

-- Ver datos ambientales recientes
SELECT 
    ed.id,
    ed.deviceId,
    ed.temperature,
    ed.humidity,
    ed.soilPh,
    ed.quality,
    ed.location,
    u.firstName,
    u.lastName,
    ed.createdAt
FROM environmental_data ed
JOIN users u ON ed.userId = u.id
ORDER BY ed.createdAt DESC
LIMIT 10;

-- Ver alertas activas
SELECT 
    a.id,
    a.type,
    a.severity,
    a.title,
    a.isRead,
    a.isResolved,
    a.deviceId,
    u.firstName,
    u.lastName,
    a.createdAt
FROM alerts a
JOIN users u ON a.userId = u.id
WHERE a.isResolved = false
ORDER BY a.severity DESC, a.createdAt DESC;

-- Ver configuraciones del sistema
SELECT 
    configKey,
    category,
    description,
    isActive,
    createdAt
FROM system_config
ORDER BY category, configKey;

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================
-- 
-- Instrucciones para usar:
-- 1. Asegúrate de estar en la base de datos 'cacao_monitoring'
-- 2. Ejecuta todo el script de una vez o por secciones
-- 3. Verifica que todas las tablas se crearon correctamente
-- 4. Los usuarios por defecto son:
--    - admin/admin123 (administrador)
--    - demo/admin123 (usuario normal)
-- 5. Las configuraciones están optimizadas para cacao
-- 
-- ¡Listo para usar con el backend Node.js!
-- ========================================