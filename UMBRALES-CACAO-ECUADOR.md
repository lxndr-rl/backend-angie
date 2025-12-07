# 🌱 Umbrales de Monitoreo para Cultivo de Cacao en Ecuador

## 📊 Rangos Óptimos para *Theobroma cacao*

Este documento detalla los umbrales configurados en el sistema de monitoreo IoT para el cultivo de cacao en Ecuador, basados en investigaciones agronómicas y normas de seguridad industrial.

---

## 🌡️ TEMPERATURA

### Rangos para Cacao
| Nivel | Rango (°C) | Descripción | Acción Recomendada |
|-------|------------|-------------|-------------------|
| **Óptimo** | 24-28°C | Crecimiento ideal | Mantener condiciones |
| **Ideal** | 20-32°C | Crecimiento aceptable | Monitorear |
| **Alerta Baja** | 15-20°C | Crecimiento lento | Proteger del frío |
| **Alerta Alta** | 32-38°C | Estrés térmico | Aumentar ventilación/sombra |
| **Crítico Bajo** | <15°C | Daño foliar | Protección urgente |
| **Crítico Alto** | >38°C | Marchitez severa | Riego y sombra urgente |

### Justificación Científica
- El cacao es una planta tropical que requiere temperaturas cálidas constantes
- Temperaturas <15°C causan daño celular y detienen el crecimiento
- Temperaturas >35°C causan estrés hídrico y reducen fotosíntesis
- El rango óptimo 24-28°C maximiza la producción de mazorcas

### Fuentes
- INIAP (Instituto Nacional de Investigaciones Agropecuarias) Ecuador
- ANECACAO (Asociación Nacional de Exportadores de Cacao)
- FAO - Guía de cultivo de cacao

---

## 💧 HUMEDAD RELATIVA

### Rangos para Cacao
| Nivel | Rango (%) | Descripción | Acción Recomendada |
|-------|-----------|-------------|-------------------|
| **Óptimo** | 75-85% | Condiciones ideales | Mantener |
| **Ideal** | 70-90% | Aceptable | Monitorear |
| **Alerta Baja** | 50-70% | Estrés hídrico leve | Aumentar riego/nebulización |
| **Alerta Alta** | 85-95% | Riesgo de hongos | Mejorar ventilación |
| **Crítico Bajo** | <50% | Deshidratación | Riego urgente |
| **Crítico Alto** | >95% | Alto riesgo de Moniliasis | Fungicidas preventivos |

### Justificación Científica
- El cacao requiere alta humedad ambiental (origen: sotobosque tropical)
- Humedad <50% causa cierre estomático y reduce fotosíntesis
- Humedad >90% favorece enfermedades fúngicas:
  - **Moniliasis** (*Moniliophthora roreri*) - principal enfermedad del cacao
  - **Escoba de bruja** (*Moniliophthora perniciosa*)
  - **Mazorca negra** (*Phytophthora palmivora*)

### Contexto Ecuador
- Costa ecuatoriana: 70-90% HR (ideal para cacao)
- Época lluviosa: Riesgo de Moniliasis aumenta con HR >90%
- Época seca: Necesidad de riego cuando HR <60%

---

## 🌫️ CALIDAD DEL AIRE (CO₂) - MQ-135

### Rangos
| Nivel | Rango (PPM) | Descripción | Acción Recomendada |
|-------|-------------|-------------|-------------------|
| **Normal** | 300-600 | Aire fresco | Ninguna |
| **Aceptable** | 600-1000 | Ventilación adecuada | Monitorear |
| **Alerta** | 1000-2000 | Ventilación deficiente | Mejorar ventilación |
| **Crítico** | >2000 | Riesgo para trabajadores | Evacuar y ventilar |

### Contexto en Cultivo de Cacao
- **Plantaciones al aire libre**: CO₂ atmosférico normal (400 PPM)
- **Invernaderos/secaderos**: Puede acumularse CO₂
- **Áreas de fermentación**: Proceso anaeróbico genera CO₂
- **Almacenes cerrados**: Ventilación crítica

### Efectos en Humanos
- 1000 PPM: Somnolencia, aire viciado
- 2000 PPM: Dolor de cabeza, fatiga
- 5000 PPM: Náuseas, mareos
- >40,000 PPM: Asfixia

---

## ☠️ MONÓXIDO DE CARBONO (CO) - MQ-7

### Rangos de Seguridad
| Nivel | Rango (PPM) | Tiempo de Exposición | Síntomas | Acción |
|-------|-------------|---------------------|----------|--------|
| **Seguro** | 0-9 | 8 horas | Ninguno | Ninguna |
| **Precaución** | 9-35 | 8 horas | Ninguno | Ventilar |
| **Alerta** | 35-100 | 1-2 horas | Dolor de cabeza leve | Evacuar área |
| **Peligro** | 100-400 | 30 min - 1 hora | Náuseas, mareos | Evacuar urgente |
| **Crítico** | 400-800 | 15-30 min | Pérdida de conciencia | Emergencia médica |
| **Mortal** | >800 | <15 min | Muerte | Evacuación inmediata |

### Fuentes de CO en Cultivo de Cacao

#### 1. **Secado de Granos**
- Secadores a gas o leña mal ventilados
- Combustión incompleta de biomasa
- **Riesgo**: Trabajadores en áreas cerradas

#### 2. **Fermentación**
- Proceso anaeróbico genera pequeñas cantidades
- Normalmente no peligroso al aire libre
- **Riesgo**: Fermentadores cerrados

#### 3. **Maquinaria**
- Motores diésel/gasolina
- Generadores eléctricos
- **Riesgo**: Uso en espacios cerrados

### Normas de Seguridad
- **OSHA (USA)**: 50 PPM máximo (8 horas)
- **NIOSH**: 35 PPM máximo (8 horas)
- **Ecuador**: Seguir normas OSHA/OIT

---

## 🔥 METANO (CH₄) - MQ-4

### Rangos de Seguridad
| Nivel | Rango (PPM) | % Vol | Descripción | Acción |
|-------|-------------|-------|-------------|--------|
| **Seguro** | 0-1,000 | 0-0.1% | Normal | Ninguna |
| **Precaución** | 1,000-5,000 | 0.1-0.5% | Detectable | Ventilar |
| **Alerta** | 5,000-10,000 | 0.5-1% | Acumulación | Eliminar fuentes de ignición |
| **Peligro** | 10,000-25,000 | 1-2.5% | Riesgo de explosión | Evacuar |
| **Crítico** | 25,000-50,000 | 2.5-5% | Alto riesgo | Emergencia |
| **Explosivo** | >50,000 | >5% | LEL alcanzado | Evacuación inmediata |

### LEL (Lower Explosive Limit)
- **LEL del Metano**: 5% en volumen (50,000 PPM)
- **UEL (Upper Explosive Limit)**: 15% en volumen
- **Rango explosivo**: 5-15% en aire

### Fuentes de CH₄ en Cultivo de Cacao

#### 1. **Fermentación de Granos**
- Proceso anaeróbico genera CH₄
- Fermentadores tradicionales (cajas de madera)
- **Riesgo**: Acumulación en espacios cerrados

#### 2. **Descomposición de Materia Orgánica**
- Cáscaras de mazorca en descomposición
- Pulpa de cacao fermentada
- Compost de residuos

#### 3. **Aguas Residuales**
- Tratamiento anaeróbico de efluentes
- Lagunas de sedimentación

### Prevención
- Ventilación adecuada en áreas de fermentación
- No fumar cerca de fermentadores
- Evitar chispas y llamas abiertas
- Monitoreo continuo en espacios cerrados

---

## 💨 SULFURO DE HIDRÓGENO (H₂S) - MQ-136

### Rangos de Seguridad
| Nivel | Rango (PPM) | Tiempo | Síntomas | Acción |
|-------|-------------|--------|----------|--------|
| **Seguro** | 0-0.5 | Continuo | Ninguno | Ninguna |
| **Detectable** | 0.5-10 | Continuo | Olor a huevo podrido | Monitorear |
| **Precaución** | 10-50 | 1 hora | Irritación ojos/garganta | Ventilar |
| **Alerta** | 50-100 | 30 min | Tos, irritación severa | Evacuar |
| **Peligro** | 100-500 | 5-10 min | Pérdida de olfato, edema pulmonar | Emergencia |
| **Mortal** | >500 | Inmediato | Parálisis respiratoria | Muerte inmediata |

### Características del H₂S
- **Olor**: Huevo podrido (detectable a 0.5 PPM)
- **Paradoja**: A >100 PPM paraliza el olfato (no se detecta)
- **Densidad**: Más pesado que el aire (se acumula en zonas bajas)
- **Toxicidad**: Más tóxico que el CO

### Fuentes de H₂S en Cultivo de Cacao

#### 1. **Fermentación Anaeróbica**
- Principal fuente en procesamiento de cacao
- Bacterias sulfato-reductoras generan H₂S
- **Riesgo máximo**: Fermentadores cerrados o mal ventilados

#### 2. **Descomposición de Pulpa**
- Pulpa de cacao rica en azúcares
- Descomposición anaeróbica genera H₂S
- Acumulación en pilas de residuos

#### 3. **Aguas Residuales**
- Efluentes del lavado de granos
- Lagunas de tratamiento anaeróbico
- Alcantarillas y drenajes

### Prevención Crítica
- **NUNCA** entrar a espacios confinados sin detector
- Ventilación forzada en fermentadores
- Monitoreo continuo en áreas de riesgo
- Capacitación en primeros auxilios
- Equipos de respiración autónoma disponibles

### Primeros Auxilios
1. Evacuar a la víctima al aire fresco
2. Llamar emergencias (911)
3. RCP si es necesario
4. Oxígeno suplementario
5. Traslado urgente a hospital

---

## 📋 TABLA RESUMEN DE UMBRALES

### Parámetros Ambientales (Cultivo)
| Parámetro | Mín. Crítico | Mín. Ideal | Óptimo | Máx. Ideal | Máx. Crítico |
|-----------|--------------|------------|--------|------------|--------------|
| Temperatura | 15°C | 20°C | 24-28°C | 32°C | 38°C |
| Humedad | 50% | 70% | 75-85% | 85% | 95% |

### Gases Tóxicos (Seguridad)
| Gas | Seguro | Precaución | Alerta | Peligro | Crítico |
|-----|--------|------------|--------|---------|---------|
| CO₂ | <600 PPM | 600-1000 | 1000-2000 | >2000 | >5000 |
| CO | <9 PPM | 9-35 | 35-100 | 100-400 | >400 |
| CH₄ | <1000 PPM | 1000-5000 | 5000-10000 | 10000-25000 | >25000 |
| H₂S | <0.5 PPM | 0.5-10 | 10-50 | 50-100 | >100 |

---

## 🚨 PROTOCOLO DE RESPUESTA A ALERTAS

### Nivel 1: Precaución (Amarillo)
- **Acción**: Monitorear de cerca
- **Tiempo**: Revisar en 15 minutos
- **Notificación**: Log del sistema

### Nivel 2: Alerta (Naranja)
- **Acción**: Intervención preventiva
- **Tiempo**: Actuar en 5 minutos
- **Notificación**: SMS/Email al supervisor

### Nivel 3: Peligro (Rojo)
- **Acción**: Intervención inmediata
- **Tiempo**: Actuar de inmediato
- **Notificación**: Llamada telefónica + alarma

### Nivel 4: Crítico/Emergencia (Rojo Parpadeante)
- **Acción**: Evacuación y emergencia
- **Tiempo**: Inmediato
- **Notificación**: Alarma general + 911

---

## 📚 REFERENCIAS

### Cultivo de Cacao
1. INIAP Ecuador - "Manual del Cultivo de Cacao"
2. ANECACAO - "Guía de Buenas Prácticas Agrícolas"
3. FAO - "Cocoa Guide"
4. CATIE - "Manual Técnico de Cacao"

### Seguridad Industrial
1. OSHA - Occupational Safety Standards
2. NIOSH - Pocket Guide to Chemical Hazards
3. ACGIH - Threshold Limit Values (TLVs)
4. EPA - Air Quality Standards

### Normas Ecuatorianas
1. Ministerio de Trabajo - Reglamento de Seguridad
2. INEN - Normas Técnicas Ecuatorianas
3. Ministerio de Agricultura - Guías de Producción

---

## 📞 CONTACTOS DE EMERGENCIA

### Ecuador
- **Emergencias**: 911
- **Bomberos**: 102
- **Cruz Roja**: 131
- **Centro de Información Toxicológica**: 1800-836-476

### Instituciones de Apoyo
- **INIAP**: (02) 3006-000
- **ANECACAO**: (04) 2680-802
- **Ministerio de Agricultura**: 1800-224-372

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0  
**Autor**: Sistema de Monitoreo IoT - Tesis Angie
