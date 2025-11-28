-- Script para verificar y corregir el usuario admin
-- Contraseña: admin123

-- Verificar si el usuario admin existe
SELECT id, username, email, role, isActive, LEFT(password, 30) as password_hash 
FROM users 
WHERE username = 'admin';

-- Si el usuario no existe, crearlo
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) 
VALUES ('admin', 'admin@airquality.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Administrador', 'Sistema', 'admin', 1, 1);

-- Actualizar el usuario admin con el hash correcto y asegurarse de que esté activo
UPDATE users 
SET 
    password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm',
    isActive = 1,
    role = 'admin',
    emailVerified = 1
WHERE username = 'admin';

-- Verificar la actualización
SELECT id, username, email, firstName, lastName, role, isActive, emailVerified, LEFT(password, 30) as password_hash 
FROM users 
WHERE username = 'admin';

-- Crear usuario demo si no existe
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) 
VALUES ('demo', 'demo@airquality.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Usuario', 'Demo', 'user', 1, 1);

-- Actualizar usuario demo
UPDATE users 
SET 
    password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm',
    isActive = 1,
    emailVerified = 1
WHERE username = 'demo';

-- Crear usuario test si no existe
INSERT IGNORE INTO users (username, email, password, firstName, lastName, role, isActive, emailVerified) 
VALUES ('test', 'test@airquality.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm', 'Usuario', 'Test', 'user', 1, 1);

-- Actualizar usuario test
UPDATE users 
SET 
    password = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdHhAHxLgE.jOPm',
    isActive = 1,
    emailVerified = 1
WHERE username = 'test';

-- Ver todos los usuarios
SELECT id, username, email, firstName, lastName, role, isActive, emailVerified, createdAt 
FROM users 
ORDER BY id;
