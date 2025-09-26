# start-dev.ps1 - automatiza levantar el stack con Docker en Windows (PowerShell)

param(
  [switch]$ForceEnv
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

$envFile = Join-Path $root '.env'
$envTemplate = @'
# Ejemplo de .env para uso con docker-compose
DB_HOST=db
DB_PORT=3306
DB_NAME=cacao_monitoring
DB_USER=root
DB_PASSWORD=root
PORT=3000
JWT_SECRET=tu_jwt_secret
'@

if (-Not (Test-Path $envFile) -or $ForceEnv) {
  Write-Host "Creando .env (si no existe) en $envFile"
  $envTemplate | Out-File -Encoding UTF8 -FilePath $envFile -Force
} else {
  Write-Host ".env ya existe. Use -ForceEnv para sobreescribir." -ForegroundColor Yellow
}

Write-Host "Construyendo y levantando contenedores con docker-compose..."
docker-compose up -d --build

Write-Host "Esperando 6 segundos para que los servicios inicien..."
Start-Sleep -Seconds 6

Write-Host "Estado de contenedores:"
docker ps --filter "name=angie-" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "Logs recientes del backend (últimas 200 líneas):"
docker logs angie-backend --tail 200

Write-Host "Si quieres importar un dump SQL coloca el archivo en el directorio y usa el script de importación (no existe aún)."

Write-Host "Hecho. Si el backend no conecta a la BD, revisa que en .env DB_HOST=db y reinicia con: docker-compose down; docker-compose up -d --build"
