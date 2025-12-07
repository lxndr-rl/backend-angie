# 🚨 Guía Rápida - Endpoints de Alertas

## ✅ Respuesta a tu Pregunta

**SÍ, las alertas se generan automáticamente y se pueden consultar mediante endpoints.**

---

## 🚀 Nuevos Endpoints Creados

### 1. **Alertas Activas** (Más Usado)
```http
GET /api/alerts/active
Authorization: Bearer {token}
```

**Descripción:** Obtiene todas las alertas que NO han sido resueltas.

**Query Parameters (opcionales):**
- `deviceId` - Filtrar por dispositivo (ej: "ESP32_AIR_001")
- `severity` - Filtrar por severidad (low, medium, high, critical)
- `limit` - Límite de resultados (default: 100)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/alerts/active?deviceId=ESP32_AIR_001&severity=high" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Alertas activas obtenidas exitosamente",
  "data": {
    "alerts": [
      {
        "id": 15,
        "type": "temperature",
        "severity": "high",
        "title": "Temperatura Alta",
        "message": "Temperatura muy alta detectada: 35.5°C",
        "isRead": false,
        "isResolved": false,
        "triggerValue": 35.5,
        "thresholdValue": 32,
        "sensorType": "dht22",
        "createdAt": "2024-12-04T10:30:00.000Z",
        "device": {
          "id": 1,
          "deviceId": "ESP32_AIR_001",
          "name": "Sensor ESP32_AIR_001",
          "type": "ESP32"
        }
      }
    ],
    "summary": {
      "total": 5,
      "bySeverity": {
        "critical": 1,
        "high": 2,
        "medium": 1,
        "low": 1
      },
      "byType": {
        "temperature": 2,
        "humidity": 1,
        "co": 1,
        "ch4": 1
      }
    }
  }
}
```

---

### 2. **Alertas Recientes**
```http
GET /api/alerts/recent
Authorization: Bearer {token}
```

**Descripción:** Obtiene alertas de las últimas X horas.

**Query Parameters:**
- `hours` - Horas hacia atrás (default: 24)
- `deviceId` - Filtrar por dispositivo (opcional)

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/alerts/recent?hours=12" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. **Resumen de Alertas**
```http
GET /api/alerts/summary/stats
Authorization: Bearer {token}
```

**Descripción:** Obtiene estadísticas generales de alertas.

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/alerts/summary/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "active": 25,
    "critical": 3,
    "last24h": 45,
    "byType": {
      "temperature": 10,
      "humidity": 5,
      "co": 3,
      "ch4": 4,
      "h2s": 3
    },
    "bySeverity": {
      "critical": 3,
      "high": 8,
      "medium": 10,
      "low": 4
    }
  }
}
```

---

### 4. **Obtener Alerta Específica**
```http
GET /api/alerts/:id
Authorization: Bearer {token}
```

**Ejemplo:**
```bash
curl -X GET "http://localhost:3000/api/alerts/15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 5. **Marcar Alerta como Leída**
```http
PATCH /api/alerts/:id/read
Authorization: Bearer {token}
```

**Ejemplo:**
```bash
curl -X PATCH "http://localhost:3000/api/alerts/15/read" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. **Resolver Alerta**
```http
PATCH /api/alerts/:id/resolve
Authorization: Bearer {token}
```

**Ejemplo:**
```bash
curl -X PATCH "http://localhost:3000/api/alerts/15/resolve" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 7. **Eliminar Alerta** (Solo Admin)
```http
DELETE /api/alerts/:id
Authorization: Bearer {token}
```

**Ejemplo:**
```bash
curl -X DELETE "http://localhost:3000/api/alerts/15" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔑 Cómo Obtener el Token

### 1. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "maria.garcia",
    "password": "Maria2024!"
  }'
```

### 2. Copiar el accessToken de la respuesta
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

### 3. Usar el token en las peticiones
```bash
curl -X GET "http://localhost:3000/api/alerts/active" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 📊 Ejemplo Completo con Postman

### Paso 1: Login
- **Método:** POST
- **URL:** `http://localhost:3000/api/auth/login`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "username": "maria.garcia",
  "password": "Maria2024!"
}
```

### Paso 2: Copiar Token
Copia el `accessToken` de la respuesta.

### Paso 3: Consultar Alertas Activas
- **Método:** GET
- **URL:** `http://localhost:3000/api/alerts/active`
- **Headers:** 
  - `Authorization: Bearer {TU_TOKEN_AQUI}`

### Paso 4: Ver Resultados
Verás todas las alertas activas con su información completa.

---

## 🔄 Flujo Completo

```
1. ESP32 envía datos cada 5 segundos
   ↓
2. Backend detecta valores fuera de rango
   ↓
3. Backend crea alerta en tabla 'alerts'
   ↓
4. Frontend/App consulta alertas activas
   GET /api/alerts/active
   ↓
5. Usuario ve alertas en dashboard
   ↓
6. Usuario marca alerta como leída
   PATCH /api/alerts/:id/read
   ↓
7. Usuario resuelve el problema
   PATCH /api/alerts/:id/resolve
```

---

## 📱 Ejemplo de Integración en Frontend

### React/React Native
```javascript
// 1. Login
const login = async () => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'maria.garcia',
      password: 'Maria2024!'
    })
  });
  const data = await response.json();
  const token = data.data.accessToken;
  localStorage.setItem('token', token);
  return token;
};

// 2. Obtener alertas activas
const getActiveAlerts = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/alerts/active', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  return data.data.alerts;
};

// 3. Resolver alerta
const resolveAlert = async (alertId) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000/api/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// 4. Uso en componente
useEffect(() => {
  const fetchAlerts = async () => {
    const alerts = await getActiveAlerts();
    setAlerts(alerts);
  };
  
  // Actualizar cada 10 segundos
  const interval = setInterval(fetchAlerts, 10000);
  fetchAlerts();
  
  return () => clearInterval(interval);
}, []);
```

---

## 🗄️ Consulta Directa en MySQL

Si prefieres consultar directamente la base de datos:

```sql
-- Ver alertas activas
SELECT 
  a.id,
  a.type,
  a.severity,
  a.title,
  a.message,
  a.triggerValue,
  a.thresholdValue,
  d.deviceId,
  d.name as deviceName,
  a.createdAt
FROM alerts a
LEFT JOIN devices d ON a.deviceId = d.id
WHERE a.isResolved = 0
ORDER BY 
  FIELD(a.severity, 'critical', 'high', 'medium', 'low'),
  a.createdAt DESC;

-- Contar alertas por severidad
SELECT 
  severity,
  COUNT(*) as total
FROM alerts
WHERE isResolved = 0
GROUP BY severity;

-- Alertas de las últimas 24 horas
SELECT COUNT(*) as total
FROM alerts
WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 HOUR);
```

---

## ✅ Verificación Rápida

### 1. Iniciar Backend
```bash
cd backend-angie
npm run dev
```

### 2. Verificar que el módulo de alertas está cargado
Deberías ver en la consola:
```
📋 ENDPOINTS DISPONIBLES:
   • Alertas: /api/alerts/*
```

### 3. Probar endpoint sin autenticación (debe fallar)
```bash
curl http://localhost:3000/api/alerts/active
```

Respuesta esperada:
```json
{
  "success": false,
  "error": "Token de acceso requerido"
}
```

### 4. Login y obtener token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"maria.garcia","password":"Maria2024!"}'
```

### 5. Usar token para obtener alertas
```bash
curl http://localhost:3000/api/alerts/active \
  -H "Authorization: Bearer {TOKEN_AQUI}"
```

---

## 🎯 Resumen de Endpoints

| Endpoint | Método | Descripción | Auth |
|----------|--------|-------------|------|
| `/api/alerts/active` | GET | Alertas no resueltas | ✅ |
| `/api/alerts/recent` | GET | Alertas recientes | ✅ |
| `/api/alerts/summary/stats` | GET | Estadísticas | ✅ |
| `/api/alerts/:id` | GET | Alerta específica | ✅ |
| `/api/alerts/:id/read` | PATCH | Marcar como leída | ✅ |
| `/api/alerts/:id/resolve` | PATCH | Resolver alerta | ✅ |
| `/api/alerts/:id` | DELETE | Eliminar alerta | ✅ Admin |

---

## 🚀 Próximos Pasos

1. ✅ Iniciar backend: `npm run dev`
2. ✅ Hacer login para obtener token
3. ✅ Probar endpoint `/api/alerts/active`
4. ✅ Integrar en tu frontend/app móvil
5. 🔄 Crear dashboard de alertas
6. 🔄 Implementar notificaciones push

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** ✅ Endpoints de Alertas Listos
