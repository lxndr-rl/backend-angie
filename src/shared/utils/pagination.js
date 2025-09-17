// Utilidades para paginación de datos

/**
 * Calcula los parámetros de paginación basados en la consulta
 * @param {Object} query - Query parameters de la request
 * @returns {Object} Objeto con limit, offset y page
 */
const getPaginationParams = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = Math.min(parseInt(query.limit) || 20, 100); // Máximo 100 por página
  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset
  };
};

/**
 * Crea el objeto de respuesta paginada para Sequelize
 * @param {Object} data - Resultado de findAndCountAll de Sequelize
 * @param {number} page - Página actual
 * @param {number} limit - Límite por página
 * @returns {Object} Objeto con datos y metadata de paginación
 */
const createPaginatedResponse = (data, page, limit) => {
  const { count: total, rows: items } = data;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    }
  };
};

/**
 * Valida los parámetros de paginación
 * @param {number} page - Número de página
 * @param {number} limit - Límite por página
 * @returns {Object} Objeto con isValid y errors
 */
const validatePaginationParams = (page, limit) => {
  const errors = [];

  if (page < 1) {
    errors.push('El número de página debe ser mayor a 0');
  }

  if (limit < 1) {
    errors.push('El límite debe ser mayor a 0');
  }

  if (limit > 100) {
    errors.push('El límite no puede ser mayor a 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Genera URLs para navegación de páginas
 * @param {string} baseUrl - URL base
 * @param {Object} query - Query parameters actuales
 * @param {Object} pagination - Información de paginación
 * @returns {Object} URLs de navegación
 */
const generatePaginationUrls = (baseUrl, query, pagination) => {
  const { page, hasNextPage, hasPrevPage, totalPages } = pagination;
  
  const createUrl = (pageNum) => {
    const params = new URLSearchParams(query);
    params.set('page', pageNum);
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    first: createUrl(1),
    last: createUrl(totalPages),
    prev: hasPrevPage ? createUrl(page - 1) : null,
    next: hasNextPage ? createUrl(page + 1) : null,
    self: createUrl(page)
  };
};

/**
 * Construye las opciones de paginación para Sequelize
 * @param {Object} query - Query parameters de la request
 * @param {Object} additionalOptions - Opciones adicionales para Sequelize
 * @returns {Object} Opciones completas para Sequelize
 */
const buildSequelizePaginationOptions = (query, additionalOptions = {}) => {
  const { page, limit, offset } = getPaginationParams(query);
  
  const validation = validatePaginationParams(page, limit);
  if (!validation.isValid) {
    throw new Error(`Parámetros de paginación inválidos: ${validation.errors.join(', ')}`);
  }

  return {
    limit,
    offset,
    ...additionalOptions
  };
};

/**
 * Procesa una consulta paginada completa
 * @param {Object} model - Modelo de Sequelize
 * @param {Object} query - Query parameters de la request
 * @param {Object} options - Opciones adicionales para la consulta
 * @returns {Promise<Object>} Resultado paginado
 */
const executePaginatedQuery = async (model, query, options = {}) => {
  const { page, limit } = getPaginationParams(query);
  const sequelizeOptions = buildSequelizePaginationOptions(query, options);
  
  const result = await model.findAndCountAll(sequelizeOptions);
  
  return createPaginatedResponse(result, page, limit);
};

/**
 * Middleware para validar parámetros de paginación
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
const validatePaginationMiddleware = (req, res, next) => {
  const { page, limit } = getPaginationParams(req.query);
  const validation = validatePaginationParams(page, limit);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros de paginación inválidos',
      details: validation.errors
    });
  }
  
  req.pagination = { page, limit };
  next();
};

module.exports = {
  getPaginationParams,
  createPaginatedResponse,
  validatePaginationParams,
  generatePaginationUrls,
  buildSequelizePaginationOptions,
  executePaginatedQuery,
  validatePaginationMiddleware
};