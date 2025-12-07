#!/bin/bash
# Script para insertar usuarios directamente en MySQL desde la terminal de Dokploy

# Conectarse a MySQL y ejecutar los INSERT
mysql -u mysql -p cacao_monitoring << 'EOF'

-- Usuario 1: María García (Administradora)
INSERT INTO users (username, email, password, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt) 
VALUES ('maria.garcia', 'maria.garcia@cacaomonitor.com', '$2b$12$k6C6Yj6tTNcdznRIckSbw.pT8ezCnIg8AFO/3TD5FsLZBmrwPB9FK', 'María', 'García', '+593987654321', 'admin', 1, 1, NOW(), NOW());

-- Usuario 2: Carlos Mendoza (Usuario Regular)
INSERT INTO users (username, email, password, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt) 
VALUES ('carlos.mendoza', 'carlos.mendoza@cacaomonitor.com', '$2b$12$I9VsUpwyLzGypOcR3zfcZ.IiHs5PFHl8Tf6A2B7/yp4VF1dzEUpTO', 'Carlos', 'Mendoza', '+593998765432', 'user', 1, 1, NOW(), NOW());

-- Usuario 3: Ana Rodríguez (Usuario Regular)
INSERT INTO users (username, email, password, firstName, lastName, phone, role, isActive, emailVerified, createdAt, updatedAt) 
VALUES ('ana.rodriguez', 'ana.rodriguez@cacaomonitor.com', '$2b$12$tb/JQuZ3vUYIPu2yBgXg5ubaDroD0IJeiubCR1J7sC7SV.7809cPG', 'Ana', 'Rodríguez', '+593976543210', 'user', 1, 1, NOW(), NOW());

-- Verificar usuarios insertados
SELECT id, username, email, firstName, lastName, role FROM users WHERE username IN ('maria.garcia', 'carlos.mendoza', 'ana.rodriguez');

EOF

echo "✅ Usuarios insertados correctamente"
