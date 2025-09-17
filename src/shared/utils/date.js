// Utilidades para manejo de fechas

/**
 * Obtiene la fecha actual en formato ISO
 * @returns {string} Fecha actual en formato ISO
 */
const getCurrentDate = () => {
  return new Date().toISOString();
};

/**
 * Convierte una fecha a formato ISO
 * @param {Date|string} date - Fecha a convertir
 * @returns {string} Fecha en formato ISO
 */
const toISOString = (date) => {
  return new Date(date).toISOString();
};

/**
 * Valida si una fecha es válida
 * @param {*} date - Fecha a validar
 * @returns {boolean} True si es válida, false si no
 */
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date);
};

/**
 * Convierte string a Date
 * @param {string} dateString - String de fecha
 * @returns {Date|null} Objeto Date o null si es inválido
 */
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

/**
 * Obtiene el inicio del día para una fecha
 * @param {Date|string} date - Fecha
 * @returns {Date} Fecha al inicio del día (00:00:00)
 */
const getStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Obtiene el fin del día para una fecha
 * @param {Date|string} date - Fecha
 * @returns {Date} Fecha al final del día (23:59:59.999)
 */
const getEndOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Agrega días a una fecha
 * @param {Date|string} date - Fecha base
 * @param {number} days - Número de días a agregar
 * @returns {Date} Nueva fecha
 */
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Resta días a una fecha
 * @param {Date|string} date - Fecha base
 * @param {number} days - Número de días a restar
 * @returns {Date} Nueva fecha
 */
const subtractDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
};

/**
 * Obtiene el rango de fechas para los últimos N días
 * @param {number} days - Número de días hacia atrás
 * @returns {Object} Objeto con startDate y endDate
 */
const getLastDaysRange = (days) => {
  const endDate = new Date();
  const startDate = subtractDays(endDate, days);
  
  return {
    startDate: getStartOfDay(startDate),
    endDate: getEndOfDay(endDate)
  };
};

/**
 * Obtiene el rango de fechas para la semana actual
 * @returns {Object} Objeto con startDate y endDate
 */
const getCurrentWeekRange = () => {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Domingo
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
  
  return {
    startDate: getStartOfDay(startOfWeek),
    endDate: getEndOfDay(endOfWeek)
  };
};

/**
 * Obtiene el rango de fechas para el mes actual
 * @returns {Object} Objeto con startDate y endDate
 */
const getCurrentMonthRange = () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return {
    startDate: getStartOfDay(startOfMonth),
    endDate: getEndOfDay(endOfMonth)
  };
};

/**
 * Formatea una fecha para mostrar
 * @param {Date|string} date - Fecha a formatear
 * @param {string} locale - Idioma (por defecto 'es-ES')
 * @param {Object} options - Opciones de formato
 * @returns {string} Fecha formateada
 */
const formatDate = (date, locale = 'es-ES', options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota' // Colombia timezone
  };
  
  return new Date(date).toLocaleDateString(locale, { ...defaultOptions, ...options });
};

/**
 * Calcula la diferencia en minutos entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en minutos
 */
const getMinutesDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.abs(d1 - d2) / (1000 * 60);
};

/**
 * Calcula la diferencia en horas entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en horas
 */
const getHoursDifference = (date1, date2) => {
  return getMinutesDifference(date1, date2) / 60;
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {number} Diferencia en días
 */
const getDaysDifference = (date1, date2) => {
  return getHoursDifference(date1, date2) / 24;
};

module.exports = {
  getCurrentDate,
  toISOString,
  isValidDate,
  parseDate,
  getStartOfDay,
  getEndOfDay,
  addDays,
  subtractDays,
  getLastDaysRange,
  getCurrentWeekRange,
  getCurrentMonthRange,
  formatDate,
  getMinutesDifference,
  getHoursDifference,
  getDaysDifference
};