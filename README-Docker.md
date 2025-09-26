Este README explica cómo ejecutar el backend (Node.js + MySQL) en tu máquina de casa usando Docker y docker-compose.

Requisitos
- Docker Desktop instalado y funcionando en Windows
- (Opcional) Git para clonar el repositorio si no está ya en la máquina

Archivos añadidos
- docker-compose.yml: orquesta dos servicios: `db` (MySQL 8.0) y `backend` (tu app Node)
- Dockerfile: ya existe en la raíz del repo

Pasos rápidos
1) Copia tu fichero .env al directorio del repositorio (tesis-angie-backend/.env). Asegúrate de que contiene al menos:

DB_HOST=db
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=tu_password_root
PORT=3000
JWT_SECRET=algosecreto

2) Construir y levantar los contenedores
- Abre PowerShell como Administrador (recomendado en Windows)
- Sitúate en el directorio del proyecto: cd C:\Users\Usuario\AndroidStudioProjects\tesis-angie-backend
- Ejecuta: docker-compose up -d --build

3) Verificar que los servicios están arriba
- docker ps
  Deberías ver contenedores `angie-mysql` y `angie-backend` corriendo.
- docker logs angie-backend --tail 200  (verás los logs del servidor Node)

Migrar datos desde la máquina de trabajo (opcional)
Si tienes una copia SQL en la máquina del trabajo y quieres importarla al contenedor MySQL de casa, sigue estos pasos.

A) Crear volcado en la máquina de trabajo
- mysqldump -u root -p cacao_monitoring > cacao_monitoring_dump.sql

B) Copiar el volcado al equipo de casa (por ejemplo, usando scp/rsync/OneDrive/USB)

C) Importar el volcado al contenedor
- Copia el archivo dentro del contenedor:
  docker cp cacao_monitoring_dump.sql angie-mysql:/cacao_monitoring_dump.sql
- Conéctate al contenedor y restaura:
  docker exec -i angie-mysql mysql -u root -p${DB_PASSWORD} ${DB_NAME} < /cacao_monitoring_dump.sql

Probar desde Android Emulator
- Si usas el emulador de Android Studio, la URL para alcanzar el host es http://10.0.2.2:3000
- Si ejecutas la app en un dispositivo físico en la misma red, usa la IP del host (por ejemplo, 192.168.68.7:3000)

Notas de seguridad
- No subas tu .env ni contraseñas al repositorio.
- Para producción, usa redes privadas, bind addresses y credenciales seguras.

Solución de problemas
- Contenedor MySQL no arranca: revisa docker logs angie-mysql
- Backend muestra fallos de conexión: verifica .env y que `DB_HOST` esté puesto a "db" en el .env cuando uses docker-compose

Si quieres, creo un script PowerShell que automatice crear el .env (plantilla), levantar los contenedores y comprobar el estado.
