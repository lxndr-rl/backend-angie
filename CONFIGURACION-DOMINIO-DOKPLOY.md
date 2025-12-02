# 🌐 Configuración del Dominio jorgelp.cloud en Dokploy

## 📋 Información de tu Servidor

- **Dominio**: https://jorgelp.cloud
- **IP del VPS**: 72.61.73.160
- **Panel Dokploy**: https://jorgelp.cloud (probablemente en puerto 3000)
- **Usuario SSH**: root
- **Contraseña**: -M4.tZEU5lfjgUGy?U1m

---

## 🎯 Configuración del Subdominio para el API

### 1. Configurar DNS del Dominio

Necesitas crear un **registro A** en tu proveedor de DNS (donde compraste jorgelp.cloud):

```
Tipo: A
Nombre: api
Valor: 72.61.73.160
TTL: 3600 (o automático)
```

Esto hará que `api.jorgelp.cloud` apunte a tu servidor.

**Opcional:** También puedes crear un wildcard:
```
Tipo: A
Nombre: *
Valor: 72.61.73.160
TTL: 3600
```

### 2. Verificar Propagación DNS

Espera 5-15 minutos y verifica:

```bash
# En PowerShell
nslookup api.jorgelp.cloud

# O en línea:
# https://dnschecker.org
```

---

## 🚀 Configuración en Dokploy

### Paso 1: Acceder a Dokploy

1. Ve a: **https://jorgelp.cloud/dashboard/projects**
2. Inicia sesión con usuario **root**

### Paso 2: Configurar el Dominio en tu Aplicación

1. Selecciona tu proyecto `backend-cacao-monitoring`
2. Click en el servicio `backend-api`
3. Ve a la pestaña **"Domains"** o **"Settings"**
4. Agrega el dominio:

   ```
   api.jorgelp.cloud
   ```

5. **Importante**: Marca la opción **"Generate SSL Certificate"** o **"Enable SSL"**
6. Dokploy automáticamente:
   - Generará un certificado SSL de Let's Encrypt
   - Configurará HTTPS
   - Redirigirá HTTP a HTTPS

### Paso 3: Configurar Variables de Entorno

En **Environment Variables** de tu aplicación `backend-api`, asegúrate de tener:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://api.jorgelp.cloud

# Base de datos
DB_HOST=mysql-db
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=samus2016

# Seguridad
JWT_SECRET=TU_JWT_SECRET_MUY_SEGURO_2024

# CORS - Permitir tu dominio
CORS_ORIGIN=https://jorgelp.cloud,https://www.jorgelp.cloud,https://api.jorgelp.cloud

# Pool de conexiones
DB_POOL_MAX=20
DB_POOL_MIN=2
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
DB_TIMEZONE=-05:00

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Paso 4: Desplegar

1. Click en **"Deploy"** o **"Redeploy"**
2. Espera a que el despliegue termine
3. Espera 2-3 minutos para que se genere el certificado SSL

---

## ✅ Verificar el Despliegue

### 1. Health Check

```bash
# Con PowerShell
Invoke-WebRequest -Uri "https://api.jorgelp.cloud/health" | Select-Object Content

# Con curl (si lo tienes instalado)
curl https://api.jorgelp.cloud/health
```

### 2. Verificar API Info

```bash
curl https://api.jorgelp.cloud/api
```

### 3. Probar desde el Navegador

Abre: https://api.jorgelp.cloud/health

Deberías ver algo como:
```json
{
  "status": "OK",
  "message": "Servidor funcionando correctamente",
  "timestamp": "2025-12-02T...",
  "environment": "production"
}
```

---

## 🔐 Crear Usuario Administrador

```bash
curl -X POST https://api.jorgelp.cloud/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@jorgelp.cloud",
    "password": "Admin123!Seguro",
    "role": "admin"
  }'
```

---

## 📱 Configurar Apps para Usar el Nuevo API

### Frontend Web (web-cacao-front)

Actualiza el archivo de configuración del API:

**`src/config/api.ts`** o donde esté la URL del API:

```typescript
// Producción
const API_URL = 'https://api.jorgelp.cloud';

// O con variable de entorno
const API_URL = import.meta.env.VITE_API_URL || 'https://api.jorgelp.cloud';
```

### App Móvil (Cacao-toxicityApp)

Actualiza el archivo de configuración:

**`src/config/api.ts`**:

```typescript
const API_URL = 'https://api.jorgelp.cloud';

// O con configuración por ambiente
const config = {
  development: 'http://localhost:3000',
  production: 'https://api.jorgelp.cloud'
};

export const API_URL = __DEV__ ? config.development : config.production;
```

---

## 🎯 URLs Finales

Tu aplicación estará disponible en:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Base** | https://api.jorgelp.cloud | URL base del API |
| **Health Check** | https://api.jorgelp.cloud/health | Estado del servidor |
| **API Docs** | https://api.jorgelp.cloud/api | Documentación |
| **Login** | https://api.jorgelp.cloud/api/auth/login | Login de usuarios |
| **Register** | https://api.jorgelp.cloud/api/auth/register | Registro |
| **Environmental Data** | https://api.jorgelp.cloud/api/environmental/data | Datos sensores |
| **Reports** | https://api.jorgelp.cloud/api/reports/* | Reportes |

---

## 🔥 Troubleshooting

### ❌ Error: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Solución**: El certificado SSL aún se está generando. Espera 2-5 minutos.

### ❌ Error: "DNS_PROBE_FINISHED_NXDOMAIN"

**Solución**: 
1. Verifica que el registro DNS esté correcto
2. Espera la propagación DNS (puede tomar hasta 24h, normalmente 5-15 min)
3. Limpia la caché DNS:
   ```powershell
   ipconfig /flushdns
   ```

### ❌ Error: "CORS policy"

**Solución**: Verifica que `CORS_ORIGIN` en las variables de entorno incluya tu dominio:
```env
CORS_ORIGIN=https://jorgelp.cloud,https://www.jorgelp.cloud,https://api.jorgelp.cloud
```

### ❌ No puedo acceder a Dokploy

**Solución**:
1. Verifica que Dokploy esté corriendo:
   ```bash
   ssh root@72.61.73.160
   docker ps | grep dokploy
   ```

2. Si usas puerto diferente al 80/443, accede directamente:
   ```
   http://72.61.73.160:3000
   ```

---

## 🔒 Seguridad Adicional (Recomendado)

### 1. Cambiar contraseña root del VPS

```bash
ssh root@72.61.73.160
passwd
```

### 2. Configurar Firewall

```bash
# Permitir solo puertos necesarios
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw enable
```

### 3. Configurar Backups Automáticos

En Dokploy:
1. Ve a la configuración del servicio MySQL
2. Habilita **"Automatic Backups"**
3. Configura la frecuencia (diaria recomendada)

---

## 📊 Monitoreo

### Ver Logs en Tiempo Real

En Dokploy:
1. Ve al servicio `backend-api`
2. Click en **"Logs"**
3. Verás los logs en tiempo real

O por SSH:
```bash
ssh root@72.61.73.160
docker logs -f <container-name> --tail 100
```

### Verificar Estado de Servicios

```bash
docker ps
docker stats
```

---

## 🎉 ¡Todo Listo!

Tu backend ahora está disponible en:

✅ **https://api.jorgelp.cloud**

Características habilitadas:
- ✅ SSL/HTTPS automático
- ✅ Dominio personalizado
- ✅ CORS configurado
- ✅ Base de datos MySQL
- ✅ Auto-deploy desde Git
- ✅ Health checks
- ✅ Variables de entorno seguras

### Próximos Pasos:

1. ✅ Actualizar frontend para usar `https://api.jorgelp.cloud`
2. ✅ Actualizar app móvil para usar `https://api.jorgelp.cloud`
3. ✅ Crear usuario administrador
4. ✅ Probar todos los endpoints
5. ✅ Configurar backups automáticos
6. ✅ Monitorear logs y performance

---

**¡Felicidades! Tu backend está en producción** 🚀
