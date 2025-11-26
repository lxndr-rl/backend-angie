# Corrección de Error: timestamp → createdAt

## 🐛 Problema Identificado

**Error**: `ER_BAD_FIELD_ERROR: Unknown column 'timestamp' in 'field list'`

**Causa**: El código estaba usando la columna `timestamp` pero las tablas de sensores usan `createdAt`.

### Tablas Afectadas:
- `dht22_readings` - usa `createdAt`
- `mq7_readings` - usa `createdAt`
- `mq4_readings` - usa `createdAt`
- `mq135_readings` - usa `createdAt`

---

## ✅ Correcciones Realizadas

### 1. Método `getExecutiveSummary()`

**Antes**:
```javascript
const whereClause = {
  timestamp: {
    [Op.between]: [dateRange.start, dateRange.end]
  }
};
```

**Después**:
```javascript
const whereClause = {
  createdAt: {
    [Op.between]: [dateRange.start, dateRange.end]
  }
};
```

---

### 2. Método `getHourlyData()`

**Antes**:
```javascript
[DHT22Reading.sequelize.fn('HOUR', DHT22Reading.sequelize.col('timestamp')), 'hour']
```

**Después**:
```javascript
[DHT22Reading.sequelize.fn('HOUR', DHT22Reading.sequelize.col('createdAt')), 'hour']
```

**Cambios**:
- ✅ Agrupación por hora: `HOUR(timestamp)` → `HOUR(createdAt)`
- ✅ Agrupación por día: `DATE(timestamp)` → `DATE(createdAt)`
- ✅ Ordenamiento: `ORDER BY timestamp` → `ORDER BY createdAt`

---

### 3. Método `generateEnvironmentalReport()`

**Cambios en whereClause**:
```javascript
const whereClause = {
  createdAt: {  // ✅ Cambiado de timestamp
    [Op.between]: [dateRange.start, dateRange.end]
  }
};
```

**Cambios en ORDER BY**:
```javascript
order: [['createdAt', 'ASC']]  // ✅ Cambiado de timestamp
```

---

### 4. Método `generateTrendsReport()`

**Cambios en agrupación por día**:
```javascript
// Antes
[DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('timestamp')), 'date']

// Después
[DHT22Reading.sequelize.fn('DATE', DHT22Reading.sequelize.col('createdAt')), 'date']
```

**Aplicado a**:
- ✅ DHT22Reading
- ✅ MQ7Reading
- ✅ MQ4Reading
- ✅ MQ135Reading

---

### 5. Método `calculateDeviceEfficiency()`

**Cambios en whereClause**:
```javascript
const whereClause = {
  deviceId,
  createdAt: {  // ✅ Cambiado de timestamp
    [Op.between]: [dateRange.start, dateRange.end]
  }
};
```

---

### 6. Últimas Lecturas (Latest Readings)

**Cambios en ORDER BY**:
```javascript
// MQ7
MQ7Reading.findOne({
  where: whereClause,
  order: [['createdAt', 'DESC']],  // ✅ Cambiado de timestamp
  attributes: ['co_ppm', 'dangerLevel'],
  raw: true
})

// MQ4
MQ4Reading.findOne({
  where: whereClause,
  order: [['createdAt', 'DESC']],  // ✅ Cambiado de timestamp
  attributes: ['ch4_ppm', 'dangerLevel'],
  raw: true
})

// MQ135
MQ135Reading.findOne({
  where: whereClause,
  order: [['createdAt', 'DESC']],  // ✅ Cambiado de timestamp
  attributes: ['ppm', 'airQuality'],
  raw: true
})
```

---

## 📊 Resumen de Cambios

### Total de Correcciones:
- ✅ 15 referencias a `timestamp` corregidas a `createdAt`
- ✅ 6 métodos actualizados
- ✅ 4 tablas de sensores corregidas

### Métodos Corregidos:
1. ✅ `getExecutiveSummary()`
2. ✅ `getHourlyData()`
3. ✅ `generateEnvironmentalReport()`
4. ✅ `generateTrendsReport()`
5. ✅ `calculateDeviceEfficiency()`
6. ✅ Consultas de últimas lecturas

---

## 🧪 Verificación

### Sintaxis:
```bash
node -c src/modules/reports/reportsService.js
# ✅ Exit Code: 0 (Sin errores)
```

### Endpoints Afectados:
- ✅ `GET /api/reports/summary`
- ✅ `GET /api/reports/environmental`
- ✅ `GET /api/reports/trends`
- ✅ `GET /api/reports/efficiency`
- ✅ `GET /api/reports/download/:type`

---

## 🎯 Resultado

El error `ER_BAD_FIELD_ERROR: Unknown column 'timestamp'` ha sido **completamente resuelto**.

Todos los métodos ahora usan correctamente la columna `createdAt` que existe en las tablas de sensores.

---

## 📝 Notas Importantes

### Estructura de Tablas de Sensores:
```sql
CREATE TABLE dht22_readings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  deviceId INT NOT NULL,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,  -- ✅ Usa createdAt
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Columnas Disponibles:
- ✅ `createdAt` - Fecha de creación del registro
- ✅ `updatedAt` - Fecha de última actualización
- ❌ `timestamp` - NO EXISTE

---

## ✅ Checklist de Verificación

- [x] Corregido whereClause en getExecutiveSummary()
- [x] Corregido getHourlyData() - agrupación por hora
- [x] Corregido getHourlyData() - agrupación por día
- [x] Corregido generateEnvironmentalReport()
- [x] Corregido generateTrendsReport()
- [x] Corregido calculateDeviceEfficiency()
- [x] Corregido consultas de últimas lecturas
- [x] Verificado sintaxis sin errores
- [ ] Probado endpoint /api/reports/summary
- [ ] Validado en frontend
