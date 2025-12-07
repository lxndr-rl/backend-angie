-- ========================================
-- SCRIPT PARA INSERTAR 3 USUARIOS DE PRUEBA
-- Sistema de Monitoreo de Calidad de Aire - Tesis Angie
-- ========================================

USE cacao_monitoring;

-- ========================================
-- INSERTAR 3 USUARIOS DE PRUEBA
-- ========================================

-- Usuario 1: María García (Administradora)
-- Username: maria.garcia
-- Email: maria.garcia@cacaomonitor.com
-- Password: Maria2024!
-- Hash generado con bcrypt (12 rounds)
INSERT INTO users (
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    role, 
    isActive, 
    emailVerified,
    createdAt,
    updatedAt
) VALUES (
    'maria.garcia',
    'maria.garcia@cacaomonitor.com',
    '$2b$12$k6C6Yj6tTNcdznRIckSbw.pT8ezCnIg8AFO/3TD5FsLZBmrwPB9FK',
    'María',
    'García',
    '+593987654321',
    'admin',
    1,
    1,
    NOW(),
    NOW()
);

-- Usuario 2: Carlos Mendoza (Usuario Regular)
-- Username: carlos.mendoza
-- Email: carlos.mendoza@cacaomonitor.com
-- Password: Carlos2024!
-- Hash generado con bcrypt (12 rounds)
INSERT INTO users (
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    role, 
    isActive, 
    emailVerified,
    createdAt,
    updatedAt
) VALUES (
    'carlos.mendoza',
    'carlos.mendoza@cacaomonitor.com',
    '$2b$12$I9VsUpwyLzGypOcR3zfcZ.IiHs5PFHl8Tf6A2B7/yp4VF1dzEUpTO',
    'Carlos',
    'Mendoza',
    '+593998765432',
    'user',
    1,
    1,
    NOW(),
    NOW()
);

-- Usuario 3: Ana Rodríguez (Usuario Regular)
-- Username: ana.rodriguez
-- Email: ana.rodriguez@cacaomonitor.com
-- Password: Ana2024!
-- Hash generado con bcrypt (12 rounds)
INSERT INTO users (
    username, 
    email, 
    password, 
    firstName, 
    lastName, 
    phone, 
    role, 
    isActive, 
    emailVerified,
    createdAt,
    updatedAt
) VALUES (
    'ana.rodriguez',
    'ana.rodriguez@cacaomonitor.com',
    '$2b$12$tb/JQuZ3vUYIPu2yBgXg5ubaDroD0IJeiubCR1J7sC7SV.7809cPG',
    'Ana',
    'Rodríguez',
    '+593976543210',
    'user',
    1,
    1,
    NOW(),
    NOW()
);

-- ========================================
-- VERIFICAR USUARIOS INSERTADOS
-- ========================================

SELECT 
    id,
    username,
    email,
    firstName,
    lastName,
    phone,
    role,
    isActive,
    emailVerified,
    createdAt
FROM users
WHERE username IN ('maria.garcia', 'carlos.mendoza', 'ana.rodriguez')
ORDER BY id;

-- ========================================
-- INFORMACIÓN DE CREDENCIALES
-- ========================================

/*
USUARIOS CREADOS:

1. María García (Administradora)
   - Username: maria.garcia
   - Email: maria.garcia@cacaomonitor.com
   - Password: Maria2024!
   - Role: admin
   - Phone: +593987654321

2. Carlos Mendoza (Usuario Regular)
   - Username: carlos.mendoza
   - Email: carlos.mendoza@cacaomonitor.com
   - Password: Carlos2024!
   - Role: user
   - Phone: +593998765432

3. Ana Rodríguez (Usuario Regular)
   - Username: ana.rodriguez
   - Email: ana.rodriguez@cacaomonitor.com
   - Password: Ana2024!
   - Role: user
   - Phone: +593976543210

NOTA: Todos los usuarios están activos y con email verificado.
*/
