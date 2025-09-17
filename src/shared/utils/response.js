// Utilidades para formatear respuestas de la API

/**
 * Respuesta exitosa estándar
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos a retornar
 * @param {string} message - Mensaje descriptivo
 * @param {number} statusCode - Código de estado HTTP
 */
const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  const response = {
    success: true,
    message: message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de error estándar
 * @param {Object} res - Objeto response de Express
 * @param {string} error - Mensaje de error
 * @param {number} statusCode - Código de estado HTTP
 * @param {*} details - Detalles adicionales del error
 */
const errorResponse = (res, error = 'Error interno del servidor', statusCode = 500, details = null) => {
  const response = {
    success: false,
    error: error
  };

  if (details !== null) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Respuesta de datos creados
 * @param {Object} res - Objeto response de Express
 * @param {*} data - Datos del recurso creado
 * @param {string} message - Mensaje descriptivo
 */
const createdResponse = (res, data, message = 'Recurso creado exitosamente') => {
  return successResponse(res, data, message, 201);
};

/**
 * Respuesta de datos paginados
 * @param {Object} res - Objeto response de Express
 * @param {Array} data - Array de datos
 * @param {Object} pagination - Información de paginación
 * @param {string} message - Mensaje descriptivo
 */
const paginatedResponse = (res, data, pagination, message = 'Datos obtenidos exitosamente') => {
  return res.status(200).json({
    success: true,
    message: message,
    data: data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrevPage: pagination.page > 1
    }
  });
};

/**
 * Respuesta de no autorizado
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje descriptivo
 */
const unauthorizedResponse = (res, message = 'No autorizado') => {
  return errorResponse(res, message, 401);
};

/**
 * Respuesta de prohibido
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje descriptivo
 */
const forbiddenResponse = (res, message = 'Acceso prohibido') => {
  return errorResponse(res, message, 403);
};

/**
 * Respuesta de no encontrado
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje descriptivo
 */
const notFoundResponse = (res, message = 'Recurso no encontrado') => {
  return errorResponse(res, message, 404);
};

/**
 * Respuesta de conflicto
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje descriptivo
 */
const conflictResponse = (res, message = 'Conflicto con el estado actual del recurso') => {
  return errorResponse(res, message, 409);
};

/**
 * Respuesta de validación fallida
 * @param {Object} res - Objeto response de Express
 * @param {Array} errors - Array de errores de validación
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    error: 'Error de validación',
    details: errors
  });
};

/**
 * Respuesta sin contenido
 * @param {Object} res - Objeto response de Express
 * @param {string} message - Mensaje descriptivo
 */
const noContentResponse = (res, message = 'Operación completada') => {
  return res.status(204).json({
    success: true,
    message: message
  });
};

module.exports = {
  successResponse,
  errorResponse,
  createdResponse,
  paginatedResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  conflictResponse,
  validationErrorResponse,
  noContentResponse
};