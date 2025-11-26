const PDFDocument = require('pdfkit');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

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

  /**
   * Genera un PDF profesional con datos y gráficas
   */
  async generateEnvironmentalPDF(reportData, metadata) {
    const doc = new PDFDocument({ 
      size: 'A4', 
      margin: 50,
      bufferPages: true,
      info: {
        Title: 'Reporte Ambiental - Cacao Monitoring',
        Author: 'Sistema de Monitoreo',
        Subject: 'Reporte de Sensores Ambientales'
      }
    });

    // Header
    this.addHeader(doc);
    
    // Información del reporte
    this.addReportInfo(doc, metadata);
    
    // Resumen ejecutivo
    doc.moveDown();
    this.addExecutiveSummary(doc, reportData);
    
    // Nueva página para gráficas
    doc.addPage();
    
    // Gráfica de Temperatura
    if (reportData.dht22 && reportData.dht22.length > 0) {
      await this.addTemperatureChart(doc, reportData.dht22);
      doc.moveDown(2);
    }
    
    // Gráfica de Humedad
    if (reportData.dht22 && reportData.dht22.length > 0) {
      await this.addHumidityChart(doc, reportData.dht22);
    }
    
    // Nueva página para gases
    if ((reportData.mq7 && reportData.mq7.length > 0) || 
        (reportData.mq4 && reportData.mq4.length > 0)) {
      doc.addPage();
      
      // Gráfica de CO
      if (reportData.mq7 && reportData.mq7.length > 0) {
        await this.addCOChart(doc, reportData.mq7);
        doc.moveDown(2);
      }
      
      // Gráfica de CH4
      if (reportData.mq4 && reportData.mq4.length > 0) {
        await this.addCH4Chart(doc, reportData.mq4);
      }
    }
    
    // Nueva página para calidad del aire
    if (reportData.mq135 && reportData.mq135.length > 0) {
      doc.addPage();
      await this.addAirQualityChart(doc, reportData.mq135);
    }
    
    // Nueva página para tabla de datos
    doc.addPage();
    this.addDataTable(doc, reportData);
    
    // Agregar footer a todas las páginas
    const range = doc.bufferedPageRange();
    const totalPages = range.count;
    
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      
      // Guardar posición actual
      const oldBottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      
      doc
        .fontSize(8)
        .fillColor('#95a5a6')
        .text(
          `Página ${i - range.start + 1} de ${totalPages} | Generado por Sistema de Monitoreo de Cacao`,
          50,
          doc.page.height - 50,
          { 
            align: 'center',
            lineBreak: false
          }
        );
      
      // Restaurar margen
      doc.page.margins.bottom = oldBottomMargin;
    }
    
    return doc;
  }

  /**
   * Agrega el header del PDF
   */
  addHeader(doc) {
    doc
      .fontSize(24)
      .fillColor('#2c3e50')
      .text('Reporte Ambiental', { align: 'center' })
      .fontSize(14)
      .fillColor('#7f8c8d')
      .text('Sistema de Monitoreo de Cacao', { align: 'center' })
      .moveDown();
    
    // Línea separadora
    doc
      .strokeColor('#3498db')
      .lineWidth(2)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke();
    
    doc.moveDown();
  }

  /**
   * Agrega información del reporte
   */
  addReportInfo(doc, metadata) {
    const startDate = new Date(metadata.dateRange.start).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const endDate = new Date(metadata.dateRange.end).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc
      .fontSize(10)
      .fillColor('#34495e')
      .text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}`, { align: 'left' })
      .text(`Período: ${startDate} - ${endDate}`, { align: 'left' })
      .text(`Total de lecturas: ${metadata.totalReadings}`, { align: 'left' });
  }

  /**
   * Agrega resumen ejecutivo
   */
  addExecutiveSummary(doc, reportData) {
    doc
      .fontSize(16)
      .fillColor('#2c3e50')
      .text('Resumen Ejecutivo', { underline: true })
      .moveDown(0.5);
    
    const summary = this.calculateSummary(reportData);
    
    doc
      .fontSize(10)
      .fillColor('#34495e')
      .text(`• Lecturas DHT22 (Temp/Hum): ${summary.dht22Count}`, { indent: 20 })
      .text(`• Lecturas MQ7 (CO): ${summary.mq7Count}`, { indent: 20 })
      .text(`• Lecturas MQ4 (CH4): ${summary.mq4Count}`, { indent: 20 })
      .text(`• Lecturas MQ135 (Calidad Aire): ${summary.mq135Count}`, { indent: 20 })
      .moveDown()
      .text(`• Temperatura promedio: ${summary.avgTemp}°C`, { indent: 20 })
      .text(`• Humedad promedio: ${summary.avgHum}%`, { indent: 20 })
      .text(`• CO promedio: ${summary.avgCO} ppm`, { indent: 20 })
      .text(`• CH4 promedio: ${summary.avgCH4} ppm`, { indent: 20 });
  }

  /**
   * Calcula resumen de datos
   */
  calculateSummary(reportData) {
    const summary = {
      dht22Count: reportData.dht22?.length || 0,
      mq7Count: reportData.mq7?.length || 0,
      mq4Count: reportData.mq4?.length || 0,
      mq135Count: reportData.mq135?.length || 0,
      avgTemp: 0,
      avgHum: 0,
      avgCO: 0,
      avgCH4: 0
    };
    
    if (reportData.dht22 && reportData.dht22.length > 0) {
      const temps = reportData.dht22.map(d => parseFloat(d.temperature) || 0);
      const hums = reportData.dht22.map(d => parseFloat(d.humidity) || 0);
      summary.avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
      summary.avgHum = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1);
    }
    
    if (reportData.mq7 && reportData.mq7.length > 0) {
      const cos = reportData.mq7.map(d => parseFloat(d.co_ppm) || 0);
      summary.avgCO = (cos.reduce((a, b) => a + b, 0) / cos.length).toFixed(1);
    }
    
    if (reportData.mq4 && reportData.mq4.length > 0) {
      const ch4s = reportData.mq4.map(d => parseFloat(d.ch4_ppm) || 0);
      summary.avgCH4 = (ch4s.reduce((a, b) => a + b, 0) / ch4s.length).toFixed(0);
    }
    
    return summary;
  }

  /**
   * Agrega gráfica de temperatura
   */
  async addTemperatureChart(doc, data) {
    doc
      .fontSize(14)
      .fillColor('#2c3e50')
      .text('Temperatura (°C)', { align: 'center' })
      .moveDown(0.5);
    
    const chartData = this.prepareChartData(data, 'temperature');
    const configuration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Temperatura (°C)',
          data: chartData.values,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    };
    
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    doc.image(imageBuffer, 50, doc.y, { width: 500 });
  }

  /**
   * Agrega gráfica de humedad
   */
  async addHumidityChart(doc, data) {
    doc
      .fontSize(14)
      .fillColor('#2c3e50')
      .text('Humedad (%)', { align: 'center' })
      .moveDown(0.5);
    
    const chartData = this.prepareChartData(data, 'humidity');
    const configuration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Humedad (%)',
          data: chartData.values,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            max: 100
          }
        }
      }
    };
    
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    doc.image(imageBuffer, 50, doc.y, { width: 500 });
  }

  /**
   * Agrega gráfica de CO
   */
  async addCOChart(doc, data) {
    doc
      .fontSize(14)
      .fillColor('#2c3e50')
      .text('Monóxido de Carbono (ppm)', { align: 'center' })
      .moveDown(0.5);
    
    const chartData = this.prepareChartData(data, 'co_ppm');
    const configuration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'CO (ppm)',
          data: chartData.values,
          backgroundColor: '#f39c12',
          borderColor: '#e67e22',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    doc.image(imageBuffer, 50, doc.y, { width: 500 });
  }

  /**
   * Agrega gráfica de CH4
   */
  async addCH4Chart(doc, data) {
    doc
      .fontSize(14)
      .fillColor('#2c3e50')
      .text('Metano (ppm)', { align: 'center' })
      .moveDown(0.5);
    
    const chartData = this.prepareChartData(data, 'ch4_ppm');
    const configuration = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'CH4 (ppm)',
          data: chartData.values,
          backgroundColor: '#9b59b6',
          borderColor: '#8e44ad',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    doc.image(imageBuffer, 50, doc.y, { width: 500 });
  }

  /**
   * Agrega gráfica de calidad del aire
   */
  async addAirQualityChart(doc, data) {
    doc
      .fontSize(14)
      .fillColor('#2c3e50')
      .text('Calidad del Aire (ppm)', { align: 'center' })
      .moveDown(0.5);
    
    const chartData = this.prepareChartData(data, 'ppm');
    const configuration = {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Calidad del Aire (ppm)',
          data: chartData.values,
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    };
    
    const imageBuffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
    doc.image(imageBuffer, 50, doc.y, { width: 500 });
  }

  /**
   * Prepara datos para gráficas
   */
  prepareChartData(data, field) {
    // Limitar a últimas 20 lecturas para que sea legible
    const limitedData = data.slice(-20);
    
    return {
      labels: limitedData.map((item, index) => {
        const date = new Date(item.createdAt || item.timestamp);
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      }),
      values: limitedData.map(item => parseFloat(item[field]) || 0)
    };
  }

  /**
   * Agrega tabla de datos
   */
  addDataTable(doc, reportData) {
    doc
      .fontSize(16)
      .fillColor('#2c3e50')
      .text('Datos Detallados', { underline: true })
      .moveDown();
    
    const tableTop = doc.y;
    const itemHeight = 20;
    let currentY = tableTop;
    
    // Headers
    doc
      .fontSize(9)
      .fillColor('#ffffff')
      .rect(50, currentY, 500, itemHeight)
      .fill('#3498db');
    
    doc
      .fillColor('#ffffff')
      .text('Fecha/Hora', 55, currentY + 5, { width: 100 })
      .text('Sensor', 160, currentY + 5, { width: 60 })
      .text('Valor', 225, currentY + 5, { width: 80 })
      .text('Dispositivo', 310, currentY + 5, { width: 120 })
      .text('Estado', 435, currentY + 5, { width: 110 });
    
    currentY += itemHeight;
    
    // Datos (limitar a 30 registros)
    const allData = [
      ...(reportData.dht22 || []).slice(-10).map(d => ({
        date: d.createdAt,
        sensor: 'DHT22',
        value: `${d.temperature}°C / ${d.humidity}%`,
        device: d.device?.name || 'N/A',
        status: 'Normal'
      })),
      ...(reportData.mq7 || []).slice(-10).map(d => ({
        date: d.createdAt,
        sensor: 'MQ7',
        value: `${d.co_ppm} ppm`,
        device: d.device?.name || 'N/A',
        status: d.dangerLevel || 'N/A'
      })),
      ...(reportData.mq4 || []).slice(-10).map(d => ({
        date: d.createdAt,
        sensor: 'MQ4',
        value: `${d.ch4_ppm} ppm`,
        device: d.device?.name || 'N/A',
        status: d.dangerLevel || 'N/A'
      }))
    ].slice(-30);
    
    allData.forEach((item, index) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }
      
      const bgColor = index % 2 === 0 ? '#ecf0f1' : '#ffffff';
      doc
        .rect(50, currentY, 500, itemHeight)
        .fill(bgColor);
      
      const date = new Date(item.date);
      doc
        .fillColor('#2c3e50')
        .fontSize(8)
        .text(date.toLocaleString('es-ES', { 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit' 
        }), 55, currentY + 5, { width: 100 })
        .text(item.sensor, 160, currentY + 5, { width: 60 })
        .text(item.value, 225, currentY + 5, { width: 80 })
        .text(item.device, 310, currentY + 5, { width: 120 })
        .text(item.status, 435, currentY + 5, { width: 110 });
      
      currentY += itemHeight;
    });
  }

}

module.exports = new PDFGenerator();
