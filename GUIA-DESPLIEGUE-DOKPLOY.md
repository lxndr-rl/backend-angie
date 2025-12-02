# 🚀 Guía de Despliegue del Backend en Dokploy

## 📋 Información del Servidor

- **IP del Servidor**: 72.61.73.160
- **Usuario**: root
- **Panel Dokploy**: http://72.61.73.160:3000/dashboard
- **Contraseña root**: -M4.tZEU5lfjgUGy?U1m

---

## 🔧 Pre-requisitos

1. ✅ Dokploy instalado y funcionando
2. ✅ Acceso SSH al servidor VPS
3. ✅ Git configurado en el servidor
4. ✅ Repositorio del backend subido a GitHub/GitLab

---

## 📦 PASO 1: Preparar el repositorio

### 1.1 Inicializar Git (si no está hecho)

```bash
cd d:\React\IOT\backend-angie
git init
git add .
git commit -m "Preparar backend para despliegue en Dokploy"
```

### 1.2 Subir a GitHub

```bash
# Crear un nuevo repositorio en GitHub
# Luego conectar y subir:
git remote add origin https://github.com/TU_USUARIO/backend-angie.git
git branch -M main
git push -u origin main
```

---

## 🌐 PASO 2: Conectarse a Dokploy

1. Abre tu navegador y ve a: **http://72.61.73.160:3000/dashboard**
2. Inicia sesión con tus credenciales

---

## 🎯 PASO 3: Crear el Proyecto en Dokploy

### 3.1 Crear nuevo proyecto

1. Click en **"+ Create Project"** (botón morado arriba a la derecha)
2. **Nombre del proyecto**: `backend-cacao-monitoring`
3. **Descripción**: Backend API para monitoreo de cacao
4. Click en **"Create"**

### 3.2 Configurar el Servicio (Application)

1. Dentro del proyecto, click en **"Add Service"**
2. Selecciona **"Application"**
3. Configuración:
   - **Name**: `backend-api`
   - **Source Type**: **Git Repository**
   - **Repository URL**: `https://github.com/TU_USUARIO/backend-angie.git`
   - **Branch**: `main` o `master`
   - **Build Type**: **Dockerfile**
   - **Dockerfile Path**: `/Dockerfile`

---

## 🗄️ PASO 4: Configurar la Base de Datos MySQL

### 4.1 Agregar MySQL al proyecto

1. En el mismo proyecto, click en **"Add Service"**
2. Selecciona **"Database"**
3. Selecciona **"MySQL"**
4. Configuración:
   - **Name**: `mysql-db`
   - **MySQL Version**: `8.0`
   - **Root Password**: `samus2016`
   - **Database Name**: `cacao_monitoring`
   - **Port**: `3306` (interno)

---

## ⚙️ PASO 5: Configurar Variables de Entorno

En la configuración del servicio `backend-api`, ve a la sección **"Environment Variables"** y agrega:

```env
NODE_ENV=production
PORT=3000
DB_HOST=mysql-db
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=samus2016
JWT_SECRET=TU_JWT_SECRET_MUY_SEGURO_2024
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_TIMEZONE=-05:00
CORS_ORIGIN=*
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**💡 TIP**: En Dokploy, `DB_HOST` debe ser el nombre del servicio MySQL (`mysql-db`) porque están en la misma red Docker.

---

## 🔗 PASO 6: Configurar Puertos y Red

### 6.1 Configurar puerto del backend

1. En la configuración de `backend-api`
2. Ve a **"Ports"**
3. Agrega mapeo de puerto:
   - **Container Port**: `3000`
   - **Host Port**: `3000` (o el puerto que prefieras, ej: `4000`)

### 6.2 Configurar dominio (Opcional)

Si tienes un dominio:
1. Ve a **"Domains"**
2. Agrega tu dominio: `api.tudominio.com`
3. Dokploy configurará automáticamente SSL con Let's Encrypt

---

## 🚀 PASO 7: Desplegar la Aplicación

1. Verifica que todos los servicios estén configurados:
   - ✅ `backend-api` (Application)
   - ✅ `mysql-db` (Database)

2. Click en **"Deploy"** en el servicio `backend-api`

3. Espera a que el despliegue termine (verás los logs en tiempo real)

---

## 🔍 PASO 8: Verificar el Despliegue

### 8.1 Verificar logs

1. En Dokploy, ve a los logs de `backend-api`
2. Deberías ver:
   ```
   ✅ Conexión a MySQL establecida correctamente
   ✅ Modelos sincronizados con la base de datos
   🚀 SERVIDOR INICIADO EXITOSAMENTE
   ```

### 8.2 Probar endpoints

```bash
# Health check
curl http://72.61.73.160:3000/health

# Info API
curl http://72.61.73.160:3000/api

# Root
curl http://72.61.73.160:3000/
```

---

## 🗄️ PASO 9: Inicializar la Base de Datos

### 9.1 Conectarse a la base de datos

Opción A: **Desde Dokploy (recomendado)**
1. Ve al servicio `mysql-db`
2. Click en **"Terminal"** o **"Console"**
3. Ejecuta:
```bash
mysql -u root -p
# Contraseña: samus2016
```

Opción B: **Desde tu computadora local**
```bash
ssh root@72.61.73.160
# Contraseña: -M4.tZEU5lfjgUGy?U1m

# Luego conectar a MySQL del contenedor
docker exec -it <mysql-container-id> mysql -u root -p
```

### 9.2 Ejecutar script SQL

```sql
USE cacao_monitoring;

-- Verificar tablas
SHOW TABLES;

-- Las tablas se crean automáticamente por Sequelize al iniciar el servidor
-- Si necesitas datos de ejemplo, ejecuta tu script database-setup.sql
```

---

## 🔐 PASO 10: Crear Usuario Administrador

Usa uno de estos métodos:

### Método A: Desde la API (Registro normal)
```bash
curl -X POST http://72.61.73.160:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@cacao.com",
    "password": "Admin123!",
    "role": "admin"
  }'
```

### Método B: Usando script create-admin-user.js
```bash
# SSH al servidor
ssh root@72.61.73.160

# Ejecutar en el contenedor
docker exec -it <backend-container-id> node create-admin-user.js
```

---

## 🔄 Actualizaciones Futuras

Para desplegar cambios:

1. Haz commit y push de tus cambios:
```bash
git add .
git commit -m "Actualización del backend"
git push origin main
```

2. En Dokploy:
   - Ve al servicio `backend-api`
   - Click en **"Redeploy"**
   - Dokploy hará pull del nuevo código y reconstruirá la imagen

---

## 🛠️ Comandos Útiles

### Ver logs en tiempo real
```bash
# En Dokploy UI, o por SSH:
docker logs -f <backend-container-id>
```

### Reiniciar servicio
```bash
docker restart <backend-container-id>
```

### Ver todos los contenedores
```bash
docker ps
```

### Ejecutar comandos en el contenedor
```bash
docker exec -it <backend-container-id> sh
```

---

## 🔥 Troubleshooting

### ❌ Error: Cannot connect to database

**Solución**: Verifica que:
1. El servicio MySQL esté corriendo en Dokploy
2. `DB_HOST` en las variables de entorno sea `mysql-db` (nombre del servicio)
3. La contraseña de MySQL sea correcta

### ❌ Error: Port already in use

**Solución**: 
- Cambia el puerto host en la configuración de Dokploy (ej: usar 4000 en lugar de 3000)

### ❌ Error: JWT_SECRET not configured

**Solución**:
- Asegúrate de haber configurado `JWT_SECRET` en las variables de entorno

### ❌ No puedo acceder al API desde mi app móvil

**Solución**:
1. Verifica que el puerto esté expuesto correctamente
2. Configura CORS correctamente en las variables de entorno
3. Si usas firewall, abre el puerto: `ufw allow 3000/tcp`

---

## 🎉 ¡Listo!

Tu backend debería estar corriendo en:
- **API**: http://72.61.73.160:3000
- **Health**: http://72.61.73.160:3000/health
- **Docs**: http://72.61.73.160:3000/api

### Próximos pasos:
1. ✅ Configurar tu aplicación móvil para usar la nueva URL
2. ✅ Configurar tu frontend web para usar la nueva URL
3. ✅ Configurar certificado SSL (si tienes dominio)
4. ✅ Configurar backups automáticos de la base de datos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Dokploy
2. Verifica la sección de Troubleshooting
3. Contacta al equipo de desarrollo

---

**Desarrollado con ❤️ para el sistema de monitoreo de cacao**
