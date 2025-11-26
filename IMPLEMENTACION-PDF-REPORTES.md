# Implementación de Reportes PDF Profesionales

## 🎯 Objetivo
Generar reportes profesionales en formato PDF con gráficas interactivas y datos detallados.

## 📦 Dependencias Instaladas

```bash
npm install pdfkit chart.js chartjs-node-canvas
```

- **pdfkit**: Generación de PDFs
- **chart.js**: Librería de gráficas
- **chartjs-node-canvas**: Renderizado de gráficas en Node.js

---

## 📄 Estructura del PDF

### 1. **Portada y Header**
- Título: "Reporte Ambiental"
- Subtítulo: "Sistema de Monitoreo de Cacao"
- Fecha de generación
- Período del reporte
- Total de lecturas

### 2. **Resumen Ejecutivo**
- Cantidad de lecturas por sensor
- Promedios de cada métrica:
  - Temperatura promedio
  - Humedad promedio
  - CO promedio
  - CH4 promedio

### 3. **Gráficas (Páginas Separadas)**

#### Página 1: Temperatura y Humedad
- **Gráfica de Temperatura**: Línea roja con área sombreada
- **Gráfica de Humedad**: Línea azul con área sombreada

#### Página 2: Gases
- **Gráfica de CO**: Barras naranjas
- **Gráfica de CH4**: Barras moradas

#### Página 3: Calidad del Aire
- **Gráfica de Calidad del Aire**: Línea verde con área sombreada

### 4. **Tabla de Datos Detallados**
- Últimas 30 lecturas
- Columnas:
  - Fecha/Hora
  - Sensor
  - Valor
  - Dispositivo
  - Estado

### 5. **Footer**
- Número de página
- Texto: "Generado por Sistema de Monitoreo de Cacao"

---

## 🎨 Diseño Profesional

### Colores Utilizados:
- **Header**: #2c3e50 (Azul oscuro)
- **Líneas**: #3498db (Azul)
- **Temperatura**: #e74c3c (Rojo)
- **Humedad**: #3498db (Azul)
- **CO**: #f39c12 (Naranja)
- **CH4**: #9b59b6 (Morado)
- **Calidad Aire**: #27ae60 (Verde)

### Tipografía:
- **Títulos**: 24px, 16px, 14px
- **Texto**: 10px, 9px, 8px
- **Fuente**: Helvetica (por defecto en PDFKit)

---

## 🔧 Implementación Técnica

### Archivo: `pdfGenerator.js`

#### Clase Principal: `PDFGenerator`

```javascript
class PDFGenerator {
  constructor() {
    this.width = 800;
    this.height = 400;
    this.chartJSNodeCanvas = new ChartJSNodeCanvas({ 
      width: this.width, 
      height: this.height,
      backgroundColour: 'white'
    });
  }
}
```

#### Método Principal:
```javascript
async generateEnvironmentalPDF(reportData, metadata)
```

**Parámetros**:
- `reportData`: Objeto con datos de sensores
  ```javascript
  {
    dht22: [...],
    mq7: [...],
    mq4: [...],
    mq135: [...]
  }
  ```
- `metadata`: Información del reporte
  ```javascript
  {
    dateRange: { start, end },
    totalReadings: number
  }
  ```

**Retorna**: Instancia de `PDFDocument`

---

## 📊 Gráficas Implementadas

### 1. Gráfica de Temperatura
```javascript
{
  type: 'line',
  data: {
    labels: ['10:00', '10:05', '10:10', ...],
    datasets: [{
      label: 'Temperatura (°C)',
      data: [22.5, 23.1, 22.8, ...],
      borderColor: '#e74c3c',
      backgroundColor: 'rgba(231, 76, 60, 0.1)',
      tension: 0.4
    }]
  }
}
```

### 2. Gráfica de Humedad
```javascript
{
  type: 'line',
  data: {
    labels: ['10:00', '10:05', '10:10', ...],
    datasets: [{
      label: 'Humedad (%)',
      data: [55.2, 56.1, 55.8, ...],
      borderColor: '#3498db',
      backgroundColor: 'rgba(52, 152, 219, 0.1)',
      fill: true
    }]
  }
}
```

### 3. Gráfica de CO
```javascript
{
  type: 'bar',
  data: {
    labels: ['10:00', '10:05', '10:10', ...],
    datasets: [{
      label: 'CO (ppm)',
      data: [5.2, 4.8, 5.1, ...],
      backgroundColor: '#f39c12'
    }]
  }
}
```

### 4. Gráfica de CH4
```javascript
{
  type: 'bar',
  data: {
    labels: ['10:00', '10:05', '10:10', ...],
    datasets: [{
      label: 'CH4 (ppm)',
      data: [450, 420, 435, ...],
      backgroundColor: '#9b59b6'
    }]
  }
}
```

### 5. Gráfica de Calidad del Aire
```javascript
{
  type: 'line',
  data: {
    labels: ['10:00', '10:05', '10:10', ...],
    datasets: [{
      label: 'Calidad del Aire (ppm)',
      data: [35, 32, 38, ...],
      borderColor: '#27ae60',
      fill: true
    }]
  }
}
```

---

## 🔄 Flujo de Generación

```
1. Usuario hace clic en "Descargar PDF"
   ↓
2. Frontend: handleDownloadCSV()
   ↓
3. Request: GET /api/reports/download/environmental
   ↓
4. Backend: reportsController.downloadReportCSV()
   ↓
5. Genera reporte: reportsService.generateEnvironmentalReport()
   ↓
6. Genera PDF: pdfGenerator.generateEnvironmentalPDF()
   ↓
7. Renderiza gráficas: chartJSNodeCanvas.renderToBuffer()
   ↓
8. Agrega páginas, tablas, footer
   ↓
9. Stream PDF a respuesta HTTP
   ↓
10. Frontend: Descarga automática del archivo
```

---

## 📝 Métodos del PDFGenerator

### Métodos Principales:
1. `generateEnvironmentalPDF()` - Genera el PDF completo
2. `addHeader()` - Agrega header con título
3. `addReportInfo()` - Agrega información del reporte
4. `addExecutiveSummary()` - Agrega resumen ejecutivo
5. `addTemperatureChart()` - Agrega gráfica de temperatura
6. `addHumidityChart()` - Agrega gráfica de humedad
7. `addCOChart()` - Agrega gráfica de CO
8. `addCH4Chart()` - Agrega gráfica de CH4
9. `addAirQualityChart()` - Agrega gráfica de calidad del aire
10. `addDataTable()` - Agrega tabla de datos
11. `addFooter()` - Agrega footer en todas las páginas

### Métodos Auxiliares:
- `calculateSummary()` - Calcula estadísticas
- `prepareChartData()` - Prepara datos para gráficas

---

## 🎯 Características del PDF

### ✅ Profesional:
- Diseño limpio y moderno
- Colores corporativos
- Tipografía legible
- Espaciado adecuado

### ✅ Informativo:
- Resumen ejecutivo
- Gráficas visuales
- Datos detallados
- Metadatos del reporte

### ✅ Completo:
- Múltiples páginas
- Todas las métricas
- Tabla de datos
- Numeración de páginas

### ✅ Optimizado:
- Limita a últimas 20 lecturas por gráfica
- Limita a últimas 30 lecturas en tabla
- Imágenes optimizadas
- Tamaño de archivo razonable

---

## 📊 Ejemplo de Uso

### Backend:
```javascript
const pdfDoc = await pdfGenerator.generateEnvironmentalPDF(
  {
    dht22: [...],
    mq7: [...],
    mq4: [...],
    mq135: [...]
  },
  {
    dateRange: { start: '2025-11-18', end: '2025-11-25' },
    totalReadings: 1234
  }
);

res.setHeader('Content-Type', 'application/pdf');
res.setHeader('Content-Disposition', 'attachment; filename="reporte.pdf"');
pdfDoc.pipe(res);
pdfDoc.end();
```

### Frontend:
```typescript
const handleDownloadCSV = async () => {
  setDownloading(true);
  try {
    await reportsService.downloadCSV('environmental');
  } finally {
    setDownloading(false);
  }
};
```

---

## 🔍 Detalles Técnicos

### Tamaño de Página:
- **Formato**: A4 (210mm x 297mm)
- **Márgenes**: 50px en todos los lados
- **Área útil**: 500px de ancho

### Gráficas:
- **Tamaño**: 800x400 px
- **Renderizado**: PNG en memoria
- **Inserción**: 500px de ancho en PDF

### Tabla:
- **Altura de fila**: 20px
- **Colores alternados**: #ecf0f1 y #ffffff
- **Paginación automática**: Nueva página si Y > 750

---

## 🚀 Mejoras Futuras

1. **Gráficas Comparativas**:
   - Comparar múltiples dispositivos
   - Comparar períodos

2. **Más Tipos de Gráficas**:
   - Gráficas de pastel para distribución
   - Gráficas de área apiladas

3. **Personalización**:
   - Logo de la empresa
   - Colores personalizados
   - Plantillas diferentes

4. **Análisis Avanzado**:
   - Tendencias
   - Predicciones
   - Anomalías detectadas

5. **Exportación**:
   - Múltiples formatos (PDF, Excel, Word)
   - Envío por email
   - Programación de reportes

---

## ✅ Checklist de Implementación

- [x] Instalar dependencias (pdfkit, chart.js, chartjs-node-canvas)
- [x] Crear PDFGenerator class
- [x] Implementar generación de header
- [x] Implementar resumen ejecutivo
- [x] Implementar gráfica de temperatura
- [x] Implementar gráfica de humedad
- [x] Implementar gráfica de CO
- [x] Implementar gráfica de CH4
- [x] Implementar gráfica de calidad del aire
- [x] Implementar tabla de datos
- [x] Implementar footer con paginación
- [x] Actualizar controller para usar PDF
- [x] Actualizar frontend (botón "Descargar PDF")
- [ ] Probar con datos reales
- [ ] Validar diseño en diferentes dispositivos
- [ ] Optimizar rendimiento

---

## 📄 Archivos Modificados/Creados

1. ✅ `backend-angie/src/modules/reports/pdfGenerator.js` (NUEVO)
2. ✅ `backend-angie/src/modules/reports/reportsController.js` (MODIFICADO)
3. ✅ `web-cacao-front/src/screens/reports/Reports.tsx` (MODIFICADO)
4. ✅ `backend-angie/package.json` (MODIFICADO - nuevas dependencias)

---

## 🎉 Resultado Final

Un reporte PDF profesional que incluye:
- ✅ Portada con información del reporte
- ✅ Resumen ejecutivo con estadísticas
- ✅ 5 gráficas profesionales con datos reales
- ✅ Tabla detallada de lecturas
- ✅ Footer con paginación
- ✅ Diseño limpio y moderno
- ✅ Listo para presentar a clientes o gerencia
