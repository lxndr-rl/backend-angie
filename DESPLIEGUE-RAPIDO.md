# 🚀 Despliegue Rápido en Dokploy

## 📝 Información del Servidor

- **Dominio**: https://jorgelp.cloud
- **IP**: 72.61.73.160
- **Panel Dokploy**: https://jorgelp.cloud/dashboard/projects
- **API URL**: https://api.jorgelp.cloud

---

## ⚡ Pasos Rápidos

### 1️⃣ Preparar el repositorio Git

```powershell
# Inicializar Git
cd d:\React\IOT\backend-angie
git init
git add .
git commit -m "Backend listo para Dokploy"

# Conectar a GitHub (crea el repo primero en GitHub)
git remote add origin https://github.com/TU_USUARIO/backend-angie.git
git branch -M main
git push -u origin main
```

### 2️⃣ Acceder a Dokploy

```
URL: https://jorgelp.cloud/dashboard/projects
IP alternativa: http://72.61.73.160:3000
Usuario: root
```

### 3️⃣ Crear Proyecto y Servicios

**En Dokploy UI:**

1. **Crear Proyecto**
   - Nombre: `backend-cacao-monitoring`
   
2. **Agregar MySQL**
   - Tipo: Database → MySQL 8.0
   - Nombre: `mysql-db`
   - Root Password: `samus2016`
   - Database: `cacao_monitoring`

3. **Agregar Backend**
   - Tipo: Application
   - Nombre: `backend-api`
   - Source: Git Repository
   - URL: `https://github.com/TU_USUARIO/backend-angie.git`
   - Branch: `main`
   - Build: Dockerfile
   - Puerto: 3000 → 3000

### 4️⃣ Configurar Dominio

1. En configuración de `backend-api`
2. Ve a **"Domains"**
3. Agrega: `api.jorgelp.cloud`
4. Habilita **SSL** (automático con Let's Encrypt)

### 5️⃣ Variables de Entorno (en Dokploy)

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://api.jorgelp.cloud

DB_HOST=mysql-db
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=samus2016

JWT_SECRET=TU_JWT_SECRET_SEGURO_2024
DB_TIMEZONE=-05:00

CORS_ORIGIN=https://jorgelp.cloud,https://www.jorgelp.cloud,https://api.jorgelp.cloud
```

### 6️⃣ Desplegar

Click en **"Deploy"** en el servicio `backend-api`

### 7️⃣ Verificar

```powershell
# Con dominio (después de configurar DNS)
curl https://api.jorgelp.cloud/health
curl https://api.jorgelp.cloud/api

# Con IP (disponible inmediatamente)
curl http://72.61.73.160:3000/health
curl http://72.61.73.160:3000/api
```

### 8️⃣ Crear Usuario Admin

```powershell
# Con dominio
curl -X POST https://api.jorgelp.cloud/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"email\":\"admin@jorgelp.cloud\",\"password\":\"Admin123!\",\"role\":\"admin\"}'

# Con IP
curl -X POST http://72.61.73.160:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"email\":\"admin@cacao.com\",\"password\":\"Admin123!\",\"role\":\"admin\"}'
```

---

## 🎯 Tu API estará en:

### ⭐ Con Dominio (Recomendado - con SSL):
- **Base URL**: `https://api.jorgelp.cloud`
- **Health**: `https://api.jorgelp.cloud/health`
- **API Docs**: `https://api.jorgelp.cloud/api`
- **Login**: `https://api.jorgelp.cloud/api/auth/login`

### 🔧 Con IP Directa (sin SSL):
- **Base URL**: `http://72.61.73.160:3000`
- **Health**: `http://72.61.73.160:3000/health`
- **API Docs**: `http://72.61.73.160:3000/api`

---

## 📖 Documentación Completa

- **Configuración de Dominio**: Ver `CONFIGURACION-DOMINIO-DOKPLOY.md`
- **Guía Detallada**: Ver `GUIA-DESPLIEGUE-DOKPLOY.md`

---

## 🔥 Comandos Útiles

```powershell
# Ver logs
ssh root@72.61.73.160
docker logs -f backend-api

# Reiniciar servicio
docker restart backend-api

# Ver todos los contenedores
docker ps
```

---

**¡Listo para usar!** 🎉
