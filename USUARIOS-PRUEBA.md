# 👥 Usuarios de Prueba - Sistema de Monitoreo de Cacao

Este documento contiene la información de los 3 usuarios de prueba creados para el sistema.

## 📋 Usuarios Disponibles

### 1. María García (Administradora) 👑
- **Username:** `maria.garcia`
- **Email:** `maria.garcia@cacaomonitor.com`
- **Password:** `Maria2024!`
- **Role:** `admin`
- **Phone:** `+593987654321`
- **Estado:** Activo ✅
- **Email Verificado:** Sí ✅

### 2. Carlos Mendoza (Usuario Regular) 👤
- **Username:** `carlos.mendoza`
- **Email:** `carlos.mendoza@cacaomonitor.com`
- **Password:** `Carlos2024!`
- **Role:** `user`
- **Phone:** `+593998765432`
- **Estado:** Activo ✅
- **Email Verificado:** Sí ✅

### 3. Ana Rodríguez (Usuario Regular) 👤
- **Username:** `ana.rodriguez`
- **Email:** `ana.rodriguez@cacaomonitor.com`
- **Password:** `Ana2024!`
- **Role:** `user`
- **Phone:** `+593976543210`
- **Estado:** Activo ✅
- **Email Verificado:** Sí ✅

---

## 🚀 Cómo Insertar los Usuarios en la Base de Datos

### Opción 1: Usando el Script SQL (Recomendado)

1. Conéctate a tu base de datos MySQL en Dokploy
2. Ejecuta el archivo `insert-test-users.sql`:

```bash
mysql -u tu_usuario -p cacao_monitoring < insert-test-users.sql
```

O desde HeidiSQL/phpMyAdmin:
- Abre el archivo `insert-test-users.sql`
- Copia y pega el contenido en el editor SQL
- Ejecuta el script

### Opción 2: Usando el Script Node.js

Si necesitas regenerar los hashes o modificar los usuarios:

```bash
cd backend-angie
node generate-test-users.js
```

Este script generará nuevos hashes bcrypt y mostrará el SQL completo en la consola.

---

## 🔐 Información de Seguridad

- **Algoritmo de Hash:** bcrypt
- **Salt Rounds:** 12
- **Formato de Hash:** `$2b$12$...`
- Las contraseñas están hasheadas de forma segura
- Todos los usuarios tienen email verificado para acceso inmediato

---

## 🧪 Pruebas de Login

### Desde la App Móvil (React Native)

```javascript
// Login con username
{
  "username": "maria.garcia",
  "password": "Maria2024!"
}

// O login con email
{
  "username": "maria.garcia@cacaomonitor.com",
  "password": "Maria2024!"
}
```

### Desde Postman/cURL

```bash
# Login
curl -X POST http://tu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria.garcia",
    "password": "Maria2024!"
  }'
```

### Respuesta Esperada

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 3,
      "username": "maria.garcia",
      "email": "maria.garcia@cacaomonitor.com",
      "firstName": "María",
      "lastName": "García",
      "phone": "+593987654321",
      "role": "admin",
      "isActive": true,
      "emailVerified": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📊 Verificar Usuarios en la Base de Datos

```sql
-- Ver todos los usuarios
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
ORDER BY id;

-- Ver solo los usuarios de prueba
SELECT 
    id,
    username,
    email,
    CONCAT(firstName, ' ', lastName) AS fullName,
    role,
    isActive
FROM users
WHERE username IN ('maria.garcia', 'carlos.mendoza', 'ana.rodriguez');
```

---

## 🔄 Actualizar o Eliminar Usuarios

### Eliminar usuarios de prueba

```sql
DELETE FROM users 
WHERE username IN ('maria.garcia', 'carlos.mendoza', 'ana.rodriguez');
```

### Cambiar contraseña manualmente

Si necesitas cambiar la contraseña de un usuario:

1. Genera un nuevo hash con el script:
```bash
node generate-test-users.js
```

2. Actualiza en la base de datos:
```sql
UPDATE users 
SET password = '$2b$12$NUEVO_HASH_AQUI'
WHERE username = 'maria.garcia';
```

---

## 📝 Notas Importantes

1. **Seguridad:** Estas son contraseñas de prueba. En producción, usa contraseñas más seguras.
2. **Roles:** 
   - `admin`: Acceso completo al sistema
   - `user`: Acceso limitado a funciones de usuario
3. **Login:** Puedes usar tanto el username como el email para iniciar sesión
4. **Tokens:** Los tokens JWT tienen una duración de 7 días (configurable en `.env`)

---

## 🆘 Solución de Problemas

### Error: "Ya existe un usuario con este email/username"

Los usuarios ya están en la base de datos. Puedes:
- Usar los usuarios existentes
- Eliminarlos primero con el SQL de arriba
- Cambiar los usernames/emails en el script

### Error: "Credenciales inválidas"

Verifica que:
1. La contraseña sea exactamente como se muestra (case-sensitive)
2. El usuario esté activo (`isActive = 1`)
3. El hash de la contraseña sea correcto en la BD

### Error de conexión

Verifica que:
1. El backend esté corriendo
2. La base de datos esté accesible
3. Las variables de entorno estén configuradas correctamente

---

## 📞 Contacto

Si tienes problemas con los usuarios de prueba, verifica:
- Los logs del backend: `docker logs nombre-contenedor-backend`
- La conexión a la base de datos
- Las variables de entorno en Dokploy

---

**Última actualización:** Diciembre 2024
