#!/bin/bash

# Script de inicialización de base de datos para Dokploy
# Este script crea las tablas y datos iniciales necesarios

echo "🔄 Iniciando configuración de base de datos..."

# Variables de entorno
DB_HOST=${DB_HOST:-"mysql-db"}
DB_PORT=${DB_PORT:-3306}
DB_NAME=${DB_NAME:-"cacao_monitoring"}
DB_USER=${DB_USER:-"root"}
DB_PASSWORD=${DB_PASSWORD:-"samus2016"}

# Esperar a que MySQL esté listo
echo "⏳ Esperando a que MySQL esté listo..."
for i in {1..30}; do
  if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ MySQL está listo"
    break
  fi
  echo "Intento $i/30 - Esperando MySQL..."
  sleep 2
done

# Verificar si la base de datos existe
echo "📊 Verificando base de datos..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

if [ $? -eq 0 ]; then
  echo "✅ Base de datos '$DB_NAME' lista"
else
  echo "❌ Error al crear base de datos"
  exit 1
fi

# Verificar conexión
echo "🔍 Verificando conexión..."
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SELECT 1;"

if [ $? -eq 0 ]; then
  echo "✅ Conexión exitosa a la base de datos"
else
  echo "❌ Error de conexión a la base de datos"
  exit 1
fi

echo "🎉 Base de datos configurada correctamente"
echo "📝 Las tablas se crearán automáticamente cuando el servidor Node.js inicie"
echo "💡 El servidor usará Sequelize para sincronizar los modelos"

exit 0
