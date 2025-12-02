# Solución: Error al Registrar Usuario desde App Móvil

## Problema
La aplicación móvil muestra "Error al registrar usuario. Intenta nuevamente." al intentar crear una cuenta.

## Correcciones Realizadas

### 1. Backend - Respuesta del Endpoint de Registro
**Archivo:** `backend-angie/src/modules/auth/authController.js`

✅ Corregido el formato de respuesta para incluir `accessToken` y `refreshToken`
✅ Agregado logging detallado para debug
✅ Mejorado el manejo de errores

### 2. Backend - Rate Limiter
**Archivo:** `backend-angie/src/modules/auth/authRoutes.js`

✅ Aumentado el límite de intentos de 5 a 20 por ventana de 15 minutos
✅ Esto evita bloqueos durante desarrollo y pruebas

### 3. App Móvil - Manejo de Errores
**Archivo:** `Cacao-toxicityApp/src/services/authService.ts`

✅ Mejorado el manejo de errores con mensajes más descriptivos
✅ Agregado logging detallado para debug
✅ Manejo específico de errores de red y timeout

## Verificación

### El backend funciona correctamente:
```bash
cd backend-angie
node test-register.js
```

✅ **Resultado:** Usuario registrado exitosamente (Status 201)

## Configuración Necesaria para la App Móvil

### 1. Verificar que el Backend esté Corriendo
```bash
cd backend-angie
npm start
```

El servidor debe estar corriendo en el puerto 3000.

### 2. Obtener la IP de tu Computadora

**Windows:**
```cmd
ipconfig
```
Busca "Dirección IPv4" en la sección de tu adaptador de red activo.

**Linux/Mac:**
```bash
ifconfig
# o
ip addr show
```

### 3. Actualizar la Configuración de la App Móvil

**Archivo:** `Cacao-toxicityApp/.env`

```env
EXPO_PUBLIC_API_URL=http://TU_IP_AQUI:3000/api
EXPO_PUBLIC_API_TIMEOUT=10000
```

**Ejemplo:**
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
EXPO_PUBLIC_API_TIMEOUT=10000
```

### 4. Reiniciar la App Móvil

Después de cambiar el `.env`, reinicia completamente la app:

```bash
# Detener el servidor de Expo
Ctrl + C

# Limpiar caché y reiniciar
npx expo start --clear
```

### 5. Verificar Conectividad

Desde tu dispositivo móvil o emulador, abre el navegador y visita:
```
http://TU_IP:3000/api/auth/login
```

Deberías ver un error JSON (es normal, solo estamos verificando conectividad).

## Requisitos Importantes

### ✅ Checklist de Verificación:

- [ ] Backend corriendo en puerto 3000
- [ ] Dispositivo móvil en la misma red WiFi que la computadora
- [ ] IP correcta en el archivo `.env`
- [ ] Firewall permite conexiones en puerto 3000
- [ ] App móvil reiniciada después de cambiar `.env`

### Firewall (Windows)

Si el firewall está bloqueando, ejecuta como administrador:

```powershell
netsh advfirewall firewall add rule name="Node.js Server" dir=in action=allow protocol=TCP localport=3000
```

## Usuarios de Prueba Creados

### Usuario Admin:
- **Username:** admin
- **Password:** admin123
- **Role:** admin

### Usuario Demo:
- **Username:** demo
- **Password:** admin123
- **Role:** user

### Usuario Test:
- **Username:** test
- **Password:** admin123
- **Role:** user

### Usuario Luis (recién creado):
- **Username:** luis
- **Email:** piguave567@gmail.com
- **Password:** password123
- **Role:** user

## Prueba de Registro desde la App

1. Abre la app móvil
2. Ve a "Crear Cuenta"
3. Llena el formulario:
   - Nombre: Test
   - Apellido: Usuario
   - Usuario: testuser
   - Email: test@example.com
   - Teléfono: 0999999999 (opcional)
   - Contraseña: password123
   - Confirmar: password123
4. Presiona "Crear Cuenta"

### Logs Esperados en la Consola de la App:

```
📝 Intentando registrar usuario: { username: 'testuser', email: 'test@example.com', ... }
✅ Respuesta del servidor: { success: true, ... }
```

### Logs Esperados en el Backend:

```
📝 Registro de usuario - Datos recibidos: { username: 'testuser', ... }
🔄 AuthService.register - Datos recibidos: { username: 'testuser', ... }
✅ Usuario creado exitosamente: testuser
```

## Solución de Problemas Comunes

### Error: "Network Error" o "Error de conexión"
- Verifica que el backend esté corriendo
- Verifica que la IP sea correcta
- Verifica que estés en la misma red WiFi

### Error: "Timeout" o "Tiempo de espera agotado"
- El servidor puede estar sobrecargado
- Aumenta el timeout en `.env`: `EXPO_PUBLIC_API_TIMEOUT=30000`

### Error: "Ya existe un usuario con este email/username"
- El usuario ya fue registrado anteriormente
- Usa un username y email diferentes

### Error: "Demasiados intentos de autenticación"
- Espera 15 minutos o reinicia el servidor backend
- El rate limiter se resetea al reiniciar

## Contacto y Soporte

Si el problema persiste después de seguir estos pasos:

1. Verifica los logs del backend (terminal donde corre `npm start`)
2. Verifica los logs de la app móvil (consola de Expo)
3. Comparte los logs para diagnóstico adicional

---

**Última actualización:** 2025-11-29
**Estado:** ✅ Backend funcionando correctamente
