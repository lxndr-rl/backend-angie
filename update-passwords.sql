-- Actualizar contraseñas de usuarios con hashes correctos de bcrypt
-- Contraseña para todos: admin123

UPDATE users SET password = '$2b$12$89g9dSCN3QfwTTYS6HGNnOfnFQMr8kLnUpyAkTfRwSaRnPra4LFj6' WHERE username = 'admin';
UPDATE users SET password = '$2b$12$89g9dSCN3QfwTTYS6HGNnOfnFQMr8kLnUpyAkTfRwSaRnPra4LFj6' WHERE username = 'demo';
UPDATE users SET password = '$2b$12$89g9dSCN3QfwTTYS6HGNnOfnFQMr8kLnUpyAkTfRwSaRnPra4LFj6' WHERE username = 'test';

-- Verificar actualización
SELECT id, username, email, LEFT(password, 20) as password_hash, role FROM users;
