/*
 * ESP32 - Sistema de Monitoreo de Calidad de Aire
 * Envía datos de sensores al backend cada 5 segundos
 * 
 * Sensores:
 * - DHT22 (GPIO 27): Temperatura y Humedad
 * - MQ-135 (GPIO 34): Calidad del aire (CO2, NH3, NOx, etc.)
 * - MQ-7 (GPIO 39): Monóxido de Carbono (CO)
 * - MQ-4 (GPIO 36): Metano (CH4)
 * - MQ-136 (GPIO 33): Sulfuro de Hidrógeno (H2S) - Opcional
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// ============ CONFIGURACIÓN WiFi ============
const char* ssid = "CLARO_PIGUAVE";           // Tu WiFi
const char* password = "AME199914";           // Tu contraseña WiFi

// ============ CONFIGURACIÓN DEL SERVIDOR ============
// IMPORTANTE: Cambiar por la IP de tu PC donde corre el backend
// Para obtener tu IP:
// - Windows: ipconfig (buscar "Dirección IPv4")
// - Linux/Mac: ifconfig o ip addr
const char* serverHost = "72.61.73.160";  // ⚠️ CAMBIAR POR TU IP
const int serverPort = 3000;
const char* serverPath = "/api/environmental/sensor/data";
const char* deviceId = "ESP32_AIR_001";  // ID único de este dispositivo

// ============ CONFIGURACIÓN DE PINES ============
#define MQ135_PIN   34
#define MQ7_PIN     39
#define MQ4_PIN     36
#define MQ136_PIN   33  // Opcional
#define DHT_PIN     27
#define DHT_TYPE    DHT22

// ============ CONFIGURACIÓN DE SENSORES ============
#define RL_VALUE 10.0  // Resistencia de carga en kΩ

// Valores R0 (calibrar en aire limpio)
#define R0_MQ135 10.0
#define R0_MQ7   10.0
#define R0_MQ4   10.0
#define R0_MQ136 10.0

// ============ UMBRALES PARA CULTIVO DE CACAO EN ECUADOR ============

// Temperatura (°C) - Theobroma cacao
#define TEMP_MIN_IDEAL    20.0   // Mínimo ideal para cacao
#define TEMP_MAX_IDEAL    32.0   // Máximo ideal para cacao
#define TEMP_MIN_CRITICO  15.0   // Daño a planta
#define TEMP_MAX_CRITICO  38.0   // Estrés severo

// Humedad Relativa (%)
#define HUM_MIN_IDEAL     70.0   // Mínimo ideal
#define HUM_MAX_IDEAL     85.0   // Máximo ideal
#define HUM_MIN_CRITICO   50.0   // Estrés hídrico
#define HUM_MAX_CRITICO   95.0   // Riesgo de hongos (Moniliasis)

// Calidad del Aire - CO2 (PPM)
#define CO2_MAX_NORMAL    600    // Nivel aceptable
#define CO2_MAX_ALERTA    1000   // Ventilación deficiente
#define CO2_MAX_CRITICO   2000   // Riesgo para trabajadores

// Monóxido de Carbono - CO (PPM)
#define CO_SAFE           9      // Nivel seguro (OSHA 8h)
#define CO_CAUTION        35     // Precaución
#define CO_WARNING        100    // Síntomas leves
#define CO_DANGER         400    // Síntomas graves
#define CO_EXTREME        800    // Mortal

// Metano - CH4 (PPM)
#define CH4_SAFE          1000   // Nivel seguro
#define CH4_CAUTION       5000   // Precaución
#define CH4_WARNING       10000  // 1% LEL
#define CH4_DANGER        25000  // 2.5% LEL
#define CH4_EXTREME       50000  // 5% LEL - Inflamable

// Sulfuro de Hidrógeno - H2S (PPM)
#define H2S_SAFE          0.5    // Nivel seguro
#define H2S_CAUTION       10     // Olor detectable
#define H2S_WARNING       50     // Irritación
#define H2S_DANGER        100    // Pérdida de olfato
#define H2S_EXTREME       500    // Mortal

// ============ CONFIGURACIÓN DE TIEMPO ============
#define SEND_INTERVAL 5000     // Enviar datos cada 5 segundos
#define WIFI_TIMEOUT 10000     // Timeout de conexión WiFi
#define HTTP_TIMEOUT 5000      // Timeout de petición HTTP
#define PREHEAT_TIME 10        // Precalentamiento en segundos (reducido a 10)

// ============ OBJETOS ============
DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastSendTime = 0;
int failedAttempts = 0;

// ============ FUNCIONES DE CONVERSIÓN A PPM ============

float getMQ135PPM(float voltage) {
  if (voltage <= 0) return 0;
  float RS = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
  if (RS <= 0) return 0;
  float ratio = RS / R0_MQ135;
  float ppm = 116.6020682 * pow(ratio, -2.769034857);
  return ppm;
}

float getMQ7PPM(float voltage) {
  if (voltage <= 0) return 0;
  float RS = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
  if (RS <= 0) return 0;
  float ratio = RS / R0_MQ7;
  float ppm = 99.042 * pow(ratio, -1.518);
  return ppm;
}

float getMQ4PPM(float voltage) {
  if (voltage <= 0) return 0;
  float RS = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
  if (RS <= 0) return 0;
  float ratio = RS / R0_MQ4;
  float ppm = 1012.7 * pow(ratio, -2.786);
  return ppm;
}

float getMQ136PPM(float voltage) {
  if (voltage <= 0) return 0;
  float RS = ((3.3 * RL_VALUE) / voltage) - RL_VALUE;
  if (RS <= 0) return 0;
  float ratio = RS / R0_MQ136;
  float ppm = 27.288 * pow(ratio, -1.22);
  return ppm;
}

// ============ FUNCIÓN DE CONEXIÓN WiFi ============

void connectWiFi() {
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║  Conectando a WiFi...                 ║");
  Serial.println("╚════════════════════════════════════════╝");
  Serial.print("SSID: ");
  Serial.println(ssid);
  
  WiFi.begin(ssid, password);
  
  unsigned long startAttemptTime = millis();
  
  while (WiFi.status() != WL_CONNECTED && 
         millis() - startAttemptTime < WIFI_TIMEOUT) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println();
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi conectado!");
    Serial.print("📡 IP del ESP32: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Señal: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
    Serial.print("🌐 Gateway: ");
    Serial.println(WiFi.gatewayIP());
    failedAttempts = 0;
  } else {
    Serial.println("❌ Error: No se pudo conectar a WiFi");
    Serial.println("Verifica:");
    Serial.println("  - SSID correcto");
    Serial.println("  - Contraseña correcta");
    Serial.println("  - Router encendido");
  }
}

// ============ FUNCIÓN PARA ENVIAR DATOS AL SERVIDOR ============

bool sendDataToServer(float temp, float hum, float mq135_ppm, float mq135_v, 
                      float mq7_ppm, float mq7_v, float mq4_ppm, float mq4_v,
                      float mq136_ppm, float mq136_v) {
  
  // Verificar conexión WiFi
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi desconectado. Reconectando...");
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) {
      return false;
    }
  }
  
  // Crear JSON con los datos
  StaticJsonDocument<512> doc;
  doc["deviceId"] = deviceId;
  doc["temperature"] = temp;
  doc["humidity"] = hum;
  doc["mq135_ppm"] = mq135_ppm;
  doc["mq135_voltage"] = mq135_v;
  doc["mq7_ppm"] = mq7_ppm;
  doc["mq7_voltage"] = mq7_v;
  doc["mq4_ppm"] = mq4_ppm;
  doc["mq4_voltage"] = mq4_v;
  
  // Agregar MQ-136 solo si está conectado
  if (mq136_ppm > 0) {
    doc["mq136_ppm"] = mq136_ppm;
    doc["mq136_voltage"] = mq136_v;
  }
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n📤 Enviando datos al servidor...");
  Serial.print("🌐 URL: http://");
  Serial.print(serverHost);
  Serial.print(":");
  Serial.print(serverPort);
  Serial.println(serverPath);
  Serial.print("📦 Datos: ");
  Serial.println(jsonString);
  
  // Configurar HTTPClient
  HTTPClient http;
  
  // Construir URL completa
  String url = "http://" + String(serverHost) + ":" + String(serverPort) + String(serverPath);
  
  // Iniciar conexión
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(HTTP_TIMEOUT);
  
  // Enviar POST
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.print("✅ Respuesta del servidor (");
    Serial.print(httpResponseCode);
    Serial.println("):");
    Serial.println(response);
    http.end();
    failedAttempts = 0;
    return true;
  } else {
    failedAttempts++;
    Serial.print("❌ Error al enviar datos. Código HTTP: ");
    Serial.println(httpResponseCode);
    
    // Mostrar error específico
    if (httpResponseCode == -1) {
      Serial.println("\n💡 POSIBLES CAUSAS:");
      Serial.println("   1. El servidor backend NO está corriendo");
      Serial.println("      → Ejecuta: npm run dev");
      Serial.println();
      Serial.print("   2. La IP del servidor es INCORRECTA (actual: ");
      Serial.print(serverHost);
      Serial.println(")");
      Serial.println("      → Obtén tu IP:");
      Serial.println("        Windows: ipconfig");
      Serial.println("        Linux/Mac: ifconfig");
      Serial.println();
      Serial.println("   3. Firewall bloqueando el puerto 3000");
      Serial.println("      → Desactiva temporalmente el firewall");
      Serial.println();
      Serial.println("   4. ESP32 y servidor en REDES DIFERENTES");
      Serial.println("      → Ambos deben estar en la misma WiFi");
      Serial.println();
      Serial.println("🔍 INFORMACIÓN DE RED:");
      Serial.print("   - ESP32 IP: ");
      Serial.println(WiFi.localIP());
      Serial.print("   - Gateway: ");
      Serial.println(WiFi.gatewayIP());
      Serial.print("   - Servidor esperado: http://");
      Serial.print(serverHost);
      Serial.print(":");
      Serial.println(serverPort);
      Serial.println();
      Serial.print("   - Intentos fallidos: ");
      Serial.println(failedAttempts);
      
      if (failedAttempts >= 10) {
        Serial.println("\n⚠️  Demasiados intentos fallidos. Reiniciando en 10 segundos...");
        delay(10000);
        ESP.restart();
      }
    } else {
      Serial.print("   Error: ");
      Serial.println(http.errorToString(httpResponseCode));
    }
    
    http.end();
    return false;
  }
}

// ============ SETUP ============

void setup() {
  Serial.begin(115200);
  delay(2000);
  
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║    SISTEMA DE MONITOREO ESP32         ║");
  Serial.println("║    Calidad de Aire - Tesis Angie      ║");
  Serial.println("╚════════════════════════════════════════╝\n");
  
  Serial.print("🆔 Device ID: ");
  Serial.println(deviceId);
  Serial.print("🌐 Servidor: http://");
  Serial.print(serverHost);
  Serial.print(":");
  Serial.print(serverPort);
  Serial.println(serverPath);
  
  // Inicializar DHT22
  dht.begin();
  Serial.println("✅ DHT22 inicializado");
  
  // Conectar a WiFi
  connectWiFi();
  
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ No se pudo conectar a WiFi. Reiniciando en 5 segundos...");
    delay(5000);
    ESP.restart();
  }
  
  // Precalentar sensores MQ (reducido a 10 segundos)
  Serial.print("\n⏳ Precalentando sensores MQ (");
  Serial.print(PREHEAT_TIME);
  Serial.println(" segundos)...");
  
  for (int i = PREHEAT_TIME; i > 0; i--) {
    Serial.print(i);
    Serial.print("... ");
    if (i % 5 == 0) Serial.println();
    delay(1000);
  }
  
  Serial.println("\n✅ Sensores precalentados");
  Serial.println("\n╔════════════════════════════════════════╗");
  Serial.println("║  🚀 SISTEMA LISTO                     ║");
  Serial.println("╠════════════════════════════════════════╣");
  Serial.print("║  📡 ESP32 IP: ");
  Serial.print(WiFi.localIP());
  Serial.println("        ║");
  Serial.print("║  🌐 Servidor: ");
  Serial.print(serverHost);
  Serial.println("       ║");
  Serial.println("║  ⏱️  Intervalo: 5 segundos            ║");
  Serial.println("╚════════════════════════════════════════╝\n");
  
  delay(1000);
}

// ============ LOOP ============

void loop() {
  unsigned long currentTime = millis();
  
  // Enviar datos cada SEND_INTERVAL
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = currentTime;
    
    // Leer voltajes de sensores MQ
    float v135 = analogRead(MQ135_PIN) * (3.3 / 4095.0);
    float v7 = analogRead(MQ7_PIN) * (3.3 / 4095.0);
    float v4 = analogRead(MQ4_PIN) * (3.3 / 4095.0);
    float v136 = analogRead(MQ136_PIN) * (3.3 / 4095.0);
    
    // Convertir a PPM
    float ppm135 = getMQ135PPM(v135);
    float ppm7 = getMQ7PPM(v7);
    float ppm4 = getMQ4PPM(v4);
    float ppm136 = getMQ136PPM(v136);
    
    // Leer temperatura y humedad
    float temp = dht.readTemperature();
    float hum = dht.readHumidity();
    
    // Mostrar datos en Serial
    Serial.println("╔════════════════════════════════════════╗");
    Serial.println("║       LECTURAS DE SENSORES            ║");
    Serial.println("╠════════════════════════════════════════╣");
    
    if (!isnan(temp) && !isnan(hum)) {
      Serial.printf("║ 🌡️  Temperatura : %6.1f °C          ║\n", temp);
      Serial.printf("║ 💧 Humedad      : %6.1f %%           ║\n", hum);
    } else {
      Serial.println("║ ❌ DHT22: Error de lectura            ║");
    }
    
    Serial.println("╠════════════════════════════════════════╣");
    Serial.printf("║ 🌫️  MQ-135 (CO2): %7.0f PPM (%4.2fV) ║\n", ppm135, v135);
    Serial.printf("║ ☠️  MQ-7   (CO) : %7.0f PPM (%4.2fV) ║\n", ppm7, v7);
    Serial.printf("║ 🔥 MQ-4   (CH4) : %7.0f PPM (%4.2fV) ║\n", ppm4, v4);
    Serial.printf("║ 💨 MQ-136 (H2S) : %7.0f PPM (%4.2fV) ║\n", ppm136, v136);
    Serial.println("╚════════════════════════════════════════╝");
    
    // ============ SISTEMA DE ALERTAS PARA CACAO ============
    Serial.println();
    
    // Alertas de Temperatura
    if (temp < TEMP_MIN_CRITICO) {
      Serial.println("🚨 CRÍTICO: Temperatura muy baja - Riesgo de daño a planta");
    } else if (temp < TEMP_MIN_IDEAL) {
      Serial.println("⚠️  ALERTA: Temperatura baja - Crecimiento lento");
    } else if (temp > TEMP_MAX_CRITICO) {
      Serial.println("🚨 CRÍTICO: Temperatura muy alta - Estrés severo");
    } else if (temp > TEMP_MAX_IDEAL) {
      Serial.println("⚠️  ALERTA: Temperatura alta - Aumentar ventilación");
    }
    
    // Alertas de Humedad
    if (hum < HUM_MIN_CRITICO) {
      Serial.println("🚨 CRÍTICO: Humedad muy baja - Estrés hídrico");
    } else if (hum < HUM_MIN_IDEAL) {
      Serial.println("⚠️  ALERTA: Humedad baja - Aumentar riego/nebulización");
    } else if (hum > HUM_MAX_CRITICO) {
      Serial.println("🚨 CRÍTICO: Humedad muy alta - Riesgo de Moniliasis");
    } else if (hum > HUM_MAX_IDEAL) {
      Serial.println("⚠️  ALERTA: Humedad alta - Mejorar ventilación");
    }
    
    // Alertas de CO2 (Calidad del Aire)
    if (ppm135 > CO2_MAX_CRITICO) {
      Serial.println("🚨 CRÍTICO: CO2 muy elevado - Riesgo para trabajadores");
    } else if (ppm135 > CO2_MAX_ALERTA) {
      Serial.println("⚠️  ALERTA: CO2 elevado - Mejorar ventilación");
    }
    
    // Alertas de CO (Monóxido de Carbono)
    if (ppm7 > CO_EXTREME) {
      Serial.println("🚨🚨 EMERGENCIA: CO MORTAL - EVACUAR INMEDIATAMENTE");
    } else if (ppm7 > CO_DANGER) {
      Serial.println("🚨 CRÍTICO: CO peligroso - Síntomas graves");
    } else if (ppm7 > CO_WARNING) {
      Serial.println("⚠️  ALERTA: CO detectado - Revisar combustión");
    } else if (ppm7 > CO_CAUTION) {
      Serial.println("⚠️  PRECAUCIÓN: CO elevado - Ventilar área");
    }
    
    // Alertas de CH4 (Metano)
    if (ppm4 > CH4_EXTREME) {
      Serial.println("🚨🚨 EMERGENCIA: CH4 INFLAMABLE - Riesgo de explosión");
    } else if (ppm4 > CH4_DANGER) {
      Serial.println("🚨 CRÍTICO: CH4 peligroso - Eliminar fuentes de ignición");
    } else if (ppm4 > CH4_WARNING) {
      Serial.println("⚠️  ALERTA: CH4 elevado - Revisar fermentación");
    } else if (ppm4 > CH4_CAUTION) {
      Serial.println("⚠️  PRECAUCIÓN: CH4 detectado - Ventilar área");
    }
    
    // Alertas de H2S (Sulfuro de Hidrógeno)
    if (ppm136 > H2S_EXTREME) {
      Serial.println("🚨🚨 EMERGENCIA: H2S MORTAL - EVACUAR INMEDIATAMENTE");
    } else if (ppm136 > H2S_DANGER) {
      Serial.println("🚨 CRÍTICO: H2S peligroso - Parálisis respiratoria");
    } else if (ppm136 > H2S_WARNING) {
      Serial.println("⚠️  ALERTA: H2S elevado - Irritación severa");
    } else if (ppm136 > H2S_CAUTION) {
      Serial.println("⚠️  PRECAUCIÓN: H2S detectado - Revisar fermentación");
    }
    
    // Mensaje de condiciones óptimas
    if (temp >= TEMP_MIN_IDEAL && temp <= TEMP_MAX_IDEAL &&
        hum >= HUM_MIN_IDEAL && hum <= HUM_MAX_IDEAL &&
        ppm135 <= CO2_MAX_NORMAL &&
        ppm7 <= CO_SAFE &&
        ppm4 <= CH4_SAFE &&
        ppm136 <= H2S_SAFE) {
      Serial.println("✅ CONDICIONES ÓPTIMAS para cultivo de cacao");
    }
    
    Serial.println();
    
    // Enviar datos al servidor
    if (!isnan(temp) && !isnan(hum)) {
      bool success = sendDataToServer(temp, hum, ppm135, v135, ppm7, v7, 
                                      ppm4, v4, ppm136, v136);
      
      if (success) {
        Serial.println("✅ Datos enviados correctamente\n");
      } else {
        Serial.println("❌ Error al enviar datos\n");
      }
    } else {
      Serial.println("❌ No se enviaron datos (error DHT22)\n");
    }
  }
  
  // Pequeño delay para no saturar el loop
  delay(100);
}
