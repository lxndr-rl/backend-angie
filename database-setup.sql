-- ========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Monitoreo de Calidad de Aire - Tesis Angie
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
-- 2. TABLA DEVICES (Dispositivos/Sensores)
-- ========================================
CREATE TABLE devices (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type ENUM('ESP32', 'ESP8266', 'Arduino', 'Raspberry', 'Other') NOT NULL DEFAULT 'ESP32',
    isActive BOOLEAN NOT NULL DEFAULT true,
    lastConnection DATETIME NULL,
    firmwareVersion VARCHAR(50) NULL,
    notes TEXT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_devices_deviceId (deviceId),
    INDEX idx_devices_isActive (isActive),
    INDEX idx_devices_lastConnection (lastConnection)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 3. TABLA DHT22_READINGS (Temperatura y Humedad)
-- ========================================
CREATE TABLE dht22_readings (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId INT NOT NULL,
    temperature DECIMAL(5,2) NOT NULL COMMENT 'Temperatura en °C (-40 a 80°C)',
    humidity DECIMAL(5,2) NOT NULL COMMENT 'Humedad relativa en % (0-100%)',
    heatIndex DECIMAL(5,2) NULL COMMENT 'Índice de calor calculado',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_dht22_deviceId (deviceId),
    INDEX idx_dht22_createdAt (createdAt),
    INDEX idx_dht22_temperature (temperature),
    INDEX idx_dht22_humidity (humidity),
    CONSTRAINT fk_dht22_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 4. TABLA MQ135_READINGS (Calidad del Aire)
-- ========================================
CREATE TABLE mq135_readings (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId INT NOT NULL,
    ppm DECIMAL(8,2) NOT NULL COMMENT 'Concentración total en PPM',
    voltage DECIMAL(5,3) NOT NULL COMMENT 'Voltaje analógico leído',
    resistance DECIMAL(10,2) NULL COMMENT 'Resistencia del sensor en kΩ',
    airQualityIndex INT NULL COMMENT 'Índice de calidad del aire (0-500)',
    airQuality ENUM('excellent', 'good', 'moderate', 'poor', 'hazardous') NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_mq135_deviceId (deviceId),
    INDEX idx_mq135_createdAt (createdAt),
    INDEX idx_mq135_ppm (ppm),
    INDEX idx_mq135_airQuality (airQuality),
    CONSTRAINT fk_mq135_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 5. TABLA MQ7_READINGS (Monóxido de Carbono)
-- ========================================
CREATE TABLE mq7_readings (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId INT NOT NULL,
    co_ppm DECIMAL(8,2) NOT NULL COMMENT 'Concentración de CO en PPM',
    voltage DECIMAL(5,3) NOT NULL COMMENT 'Voltaje analógico leído',
    resistance DECIMAL(10,2) NULL COMMENT 'Resistencia del sensor en kΩ',
    dangerLevel ENUM('safe', 'caution', 'warning', 'danger', 'extreme') NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_mq7_deviceId (deviceId),
    INDEX idx_mq7_createdAt (createdAt),
    INDEX idx_mq7_co_ppm (co_ppm),
    INDEX idx_mq7_dangerLevel (dangerLevel),
    CONSTRAINT fk_mq7_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 6. TABLA MQ4_READINGS (Metano y Gas Natural)
-- ========================================
CREATE TABLE mq4_readings (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId INT NOT NULL,
    ch4_ppm DECIMAL(8,2) NOT NULL COMMENT 'Concentración de CH4 en PPM',
    voltage DECIMAL(5,3) NOT NULL COMMENT 'Voltaje analógico leído',
    resistance DECIMAL(10,2) NULL COMMENT 'Resistencia del sensor en kΩ',
    dangerLevel ENUM('safe', 'caution', 'warning', 'danger', 'extreme') NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_mq4_deviceId (deviceId),
    INDEX idx_mq4_createdAt (createdAt),
    INDEX idx_mq4_ch4_ppm (ch4_ppm),
    INDEX idx_mq4_dangerLevel (dangerLevel),
    CONSTRAINT fk_mq4_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 7. TABLA MQ136_READINGS (Sulfuro de Hidrógeno)
-- ========================================
CREATE TABLE mq136_readings (
    id INT NOT NULL AUTO_INCREMENT,
    deviceId INT NOT NULL,
    h2s_ppm DECIMAL(8,2) NOT NULL COMMENT 'Concentración de H2S en PPM',
    voltage DECIMAL(5,3) NOT NULL COMMENT 'Voltaje analógico leído',
    resistance DECIMAL(10,2) NULL COMMENT 'Resistencia del sensor en kΩ',
    dangerLevel ENUM('safe', 'caution', 'warning', 'danger', 'extreme') NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_mq136_deviceId (deviceId),
    INDEX idx_mq136_createdAt (createdAt),
    INDEX idx_mq136_h2s_ppm (h2s_ppm),
    INDEX idx_mq136_dangerLevel (dangerLevel),
    CONSTRAINT fk_mq136_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 8. TABLA ALERTS
-- ========================================
CREATE TABLE alerts (
    id INT NOT NULL AUTO_INCREMENT,
    type ENUM('temperature', 'humidity', 'co', 'ch4', 'h2s', 'air_quality', 'system', 'maintenance', 'security') NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    isRead BOOLEAN NOT NULL DEFAULT false,
    isResolved BOOLEAN NOT NULL DEFAULT false,
    resolvedAt DATETIME NULL,
    resolvedBy INT NULL,
    userId INT NOT NULL,
    deviceId INT NULL,
    sensorType ENUM('dht22', 'mq135', 'mq7', 'mq4', 'mq136', 'system') NULL,
    readingId INT NULL COMMENT 'ID de la lectura que generó la alerta',
    triggerValue DECIMAL(10,4) NULL,
    thresholdValue DECIMAL(10,4) NULL,
    metadata JSON NULL,
    actions JSON NULL,
    autoResolved BOOLEAN NOT NULL DEFAULT false,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_alerts_userId (userId),
    INDEX idx_alerts_deviceId (deviceId),
    INDEX idx_alerts_type (type),
    INDEX idx_alerts_severity (severity),
    INDEX idx_alerts_isRead (isRead),
    INDEX idx_alerts_isResolved (isResolved),
    INDEX idx_alerts_createdAt (createdAt),
    INDEX idx_alerts_sensorType (sensorType),
    CONSTRAINT fk_alerts_userId FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_resolvedBy FOREIGN KEY (resolvedBy) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_alerts_deviceId FOREIGN KEY (deviceId) REFERENCES devices(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- 9. TABLA SYSTEM_CONFIG
-- ========================================
CREATE TABLE system_config (
    id INT NOT NULL AUTO_INCREMENT,
    configKey VARCHAR(100) NOT NULL UNIQUE,
    configValue JSON NOT NULL,
    description TEXT NULL,
    category ENUM('thresholds', 'alerts', 'system', 'sensors', 'notification', 'air_quality', 'data_collection') NOT NULL DEFAULT 'system',
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
-- 10. DATOS INICIALES
-- ========================================

-- Usuario administrador por defecto
INSERT INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) VALUES 
('admin', 'admin@airquality.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Administrador', 'Sistema', 'admin', true, true);
-- Contraseña: admin123

-- Usuario demo
INSERT INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) VALUES 
('demo', 'demo@airquality.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Usuario', 'Demo', 'user', true, true);
-- Contraseña: admin123

-- Dispositivos de ejemplo
INSERT INTO devices (deviceId, name, type, isActive, firmwareVersion) VALUES
('ESP32_AIR_001', 'Sensor Principal', 'ESP32', true, 'v1.0.0'),
('ESP32_AIR_002', 'Sensor Secundario', 'ESP32', true, 'v1.0.0');

-- Configuraciones del sistema por defecto
INSERT INTO system_config (configKey, configValue, description, category, isActive, isEditable) VALUES
-- Configuración óptima para calidad de aire interior
('air_quality_optimal_conditions', 
 '{"temperature": {"min": 18, "max": 26, "optimal": 22}, "humidity": {"min": 30, "max": 60, "optimal": 45}, "co_ppm": {"max_safe": 9, "warning": 35, "danger": 100}, "ch4_ppm": {"max_safe": 1000, "warning": 5000, "danger": 10000}, "h2s_ppm": {"max_safe": 10, "warning": 50, "danger": 100}, "air_quality_index": {"excellent": 50, "good": 100, "moderate": 150, "poor": 200, "hazardous": 300}}', 
 'Condiciones óptimas para calidad de aire interior', 
 'air_quality', 
 true, 
 true),

-- Umbrales de alertas para sensores de gas
('alert_thresholds', 
 '{"temperature": {"critical_low": 10, "warning_low": 15, "warning_high": 28, "critical_high": 35}, "humidity": {"critical_low": 20, "warning_low": 25, "warning_high": 70, "critical_high": 80}, "co_ppm": {"warning": 35, "critical": 100, "emergency": 400}, "ch4_ppm": {"warning": 5000, "critical": 10000, "emergency": 50000}, "h2s_ppm": {"warning": 10, "critical": 50, "emergency": 100}, "mq135_ppm": {"warning": 1000, "critical": 2000}}', 
 'Umbrales para generación de alertas automáticas de gases y calidad de aire', 
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
 '{"dht22": {"temperature_offset": 0, "humidity_offset": 0, "pin": 27}, "mq135": {"pin": 34, "r0": 10, "voltage_ref": 3.3}, "mq7": {"pin": 35, "r0": 10, "voltage_ref": 3.3, "preheat_time": 60}, "mq4": {"pin": 32, "r0": 10, "voltage_ref": 3.3}, "mq136": {"pin": 33, "r0": 10, "voltage_ref": 3.3}, "adc_resolution": 4096}', 
 'Configuración de calibración de sensores de gas y ambiente', 
 'sensors', 
 true, 
 true);

-- Datos de prueba para DHT22
INSERT INTO dht22_readings (deviceId, temperature, humidity, heatIndex) VALUES
(1, 22.5, 45.2, 21.8),
(1, 23.1, 48.5, 22.6),
(2, 21.8, 42.8, 21.2),
(2, 24.2, 52.3, 24.8);

-- Datos de prueba para MQ-135
INSERT INTO mq135_readings (deviceId, ppm, voltage, resistance, airQualityIndex, airQuality) VALUES
(1, 850.0, 2.45, 8.5, 85, 'good'),
(1, 920.0, 2.52, 9.2, 92, 'good'),
(2, 780.0, 2.38, 7.8, 78, 'excellent'),
(2, 1150.0, 2.68, 11.5, 115, 'moderate');

-- Datos de prueba para MQ-7
INSERT INTO mq7_readings (deviceId, co_ppm, voltage, resistance, dangerLevel) VALUES
(1, 5.2, 1.85, 5.2, 'safe'),
(1, 6.8, 1.92, 6.8, 'safe'),
(2, 4.5, 1.78, 4.5, 'safe'),
(2, 8.2, 2.05, 8.2, 'safe');

-- Datos de prueba para MQ-4
INSERT INTO mq4_readings (deviceId, ch4_ppm, voltage, resistance, dangerLevel) VALUES
(1, 450.0, 1.65, 4.5, 'safe'),
(1, 520.0, 1.72, 5.2, 'safe'),
(2, 380.0, 1.58, 3.8, 'safe'),
(2, 680.0, 1.88, 6.8, 'safe');

-- Datos de prueba para MQ-136
INSERT INTO mq136_readings (deviceId, h2s_ppm, voltage, resistance, dangerLevel) VALUES
(1, 3.5, 1.42, 3.5, 'safe'),
(1, 4.2, 1.48, 4.2, 'safe'),
(2, 2.8, 1.35, 2.8, 'safe'),
(2, 5.8, 1.58, 5.8, 'safe');

-- Alertas de ejemplo
INSERT INTO alerts (type, severity, title, message, userId, deviceId, sensorType, triggerValue, thresholdValue) VALUES
('co', 'high', 'Nivel Alto de Monóxido de Carbono', 'El sensor ESP32_AIR_001 detectó 45 PPM de CO, superando el umbral de seguridad', 1, 1, 'mq7', 45.0, 35.0),
('ch4', 'medium', 'Detección de Metano', 'Niveles elevados de metano detectados en ESP32_AIR_002 (5500 PPM)', 2, 2, 'mq4', 5500.0, 5000.0),
('air_quality', 'medium', 'Calidad de Aire Moderada', 'La calidad del aire ha disminuido a nivel moderado en Sala Principal', 1, 1, 'mq135', 1500.0, 1000.0);

-- ========================================
-- 11. VERIFICACIÓN DE TABLAS CREADAS
-- ========================================
SHOW TABLES;

-- Verificar estructura de cada tabla
DESCRIBE users;
DESCRIBE devices;
DESCRIBE dht22_readings;
DESCRIBE mq135_readings;
DESCRIBE mq7_readings;
DESCRIBE mq4_readings;
DESCRIBE mq136_readings;
DESCRIBE alerts;
DESCRIBE system_config;

-- Verificar datos insertados
SELECT COUNT(*) AS total_users FROM users;
SELECT COUNT(*) AS total_devices FROM devices;
SELECT COUNT(*) AS total_dht22_readings FROM dht22_readings;
SELECT COUNT(*) AS total_mq135_readings FROM mq135_readings;
SELECT COUNT(*) AS total_mq7_readings FROM mq7_readings;
SELECT COUNT(*) AS total_mq4_readings FROM mq4_readings;
SELECT COUNT(*) AS total_mq136_readings FROM mq136_readings;
SELECT COUNT(*) AS total_alerts FROM alerts;
SELECT COUNT(*) AS total_configs FROM system_config;

-- ========================================
-- 12. CONSULTAS DE EJEMPLO PARA VERIFICAR
-- ========================================

-- Ver usuarios
SELECT id, username, email, firstName, lastName, role, isActive, createdAt FROM users;

-- Ver dispositivos
SELECT 
    d.id,
    d.deviceId,
    d.name,
    d.type,
    d.isActive,
    d.lastConnection,
    d.firmwareVersion,
    d.createdAt
FROM devices d;

-- Ver lecturas recientes de todos los sensores (última hora)
SELECT 
    d.deviceId,
    d.name,
    d.isActive,
    dht.temperature,
    dht.humidity,
    mq135.ppm AS air_quality_ppm,
    mq135.airQuality,
    mq7.co_ppm,
    mq4.ch4_ppm,
    mq136.h2s_ppm,
    dht.createdAt
FROM devices d
LEFT JOIN dht22_readings dht ON d.id = dht.deviceId
LEFT JOIN mq135_readings mq135 ON d.id = mq135.deviceId AND mq135.createdAt = dht.createdAt
LEFT JOIN mq7_readings mq7 ON d.id = mq7.deviceId AND mq7.createdAt = dht.createdAt
LEFT JOIN mq4_readings mq4 ON d.id = mq4.deviceId AND mq4.createdAt = dht.createdAt
LEFT JOIN mq136_readings mq136 ON d.id = mq136.deviceId AND mq136.createdAt = dht.createdAt
WHERE dht.createdAt >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
ORDER BY dht.createdAt DESC
LIMIT 10;

-- Ver alertas activas
SELECT 
    a.id,
    a.type,
    a.severity,
    a.title,
    a.sensorType,
    a.isRead,
    a.isResolved,
    d.deviceId,
    d.name AS deviceName,
    u.firstName,
    u.lastName,
    a.createdAt
FROM alerts a
JOIN users u ON a.userId = u.id
LEFT JOIN devices d ON a.deviceId = d.id
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

-- Estadísticas por dispositivo (últimas 24 horas)
SELECT 
    d.deviceId,
    d.name,
    AVG(dht.temperature) AS avg_temperature,
    AVG(dht.humidity) AS avg_humidity,
    AVG(mq7.co_ppm) AS avg_co,
    AVG(mq4.ch4_ppm) AS avg_ch4,
    AVG(mq136.h2s_ppm) AS avg_h2s,
    COUNT(DISTINCT dht.id) AS total_readings
FROM devices d
LEFT JOIN dht22_readings dht ON d.id = dht.deviceId AND dht.createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
LEFT JOIN mq7_readings mq7 ON d.id = mq7.deviceId AND mq7.createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
LEFT JOIN mq4_readings mq4 ON d.id = mq4.deviceId AND mq4.createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
LEFT JOIN mq136_readings mq136 ON d.id = mq136.deviceId AND mq136.createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY d.id, d.deviceId, d.name;

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
-- 5. Las configuraciones están optimizadas para monitoreo de calidad de aire
-- 
-- SENSORES CONFIGURADOS:
-- - DHT22 (GPIO 27): Temperatura y Humedad
-- - MQ-135 (GPIO 34): Calidad del aire (NH3, NOx, alcohol, benceno, humo, CO2)
-- - MQ-7 (GPIO 35): Monóxido de carbono (CO)
-- - MQ-4 (GPIO 32): Metano (CH4) y gas natural
-- - MQ-136 (GPIO 33): Sulfuro de hidrógeno (H2S)
-- 
-- ¡Listo para usar con el backend Node.js y ESP32/ESP8266!
-- ========================================